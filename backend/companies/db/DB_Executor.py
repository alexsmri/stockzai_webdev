from sqlalchemy import create_engine, MetaData, insert, text, Table
from sqlalchemy.exc import OperationalError
from typing import Any, Callable, Dict, Tuple
import os
import logging
import pandas as pd

logger = logging.getLogger(__name__)

class DB_Executor:

    _RECONNECT_ERRNOS = {2006, 2013, 2055}

    def __init__(self, database: str):
        self.database = database
        login_data = self._get_db_login()
        self.engine = create_engine(
            f"mysql+pymysql://{login_data['MYSQL_USERNAME']}:{login_data['MYSQL_PASSWORD']}@"
            f"{login_data['MYSQL_HOST']}/{login_data['MYSQL_DATABASE']}",
            pool_pre_ping=True,
            pool_recycle=3600,
        )
        self.metadata = MetaData()
        self.metadata.reflect(bind=self.engine)

    @staticmethod
    def _get_db_login() -> Dict[str, str]:
        login: Dict[str, str] = {}
        for login_info in ["MYSQL_USERNAME", "MYSQL_PASSWORD", "MYSQL_HOST", "MYSQL_DATABASE"]:
            value = os.getenv(login_info)
            if not value:
                raise ValueError(f"{login_info} environment variable not set.")
            login[login_info] = value
        return login

    def _build_conditions(self, conditions: Dict[str, Any]) -> Tuple[str, Dict[str, Any]]:
        if not conditions:
            return "", {}

        clauses: list[str] = []
        params: Dict[str, Any] = {}

        for idx, (column, value) in enumerate(conditions.items()):
            param_name = f"param_{idx}"

            if isinstance(value, list):
                clauses.append(f"`{column}` IN :{param_name}")
                params[param_name] = tuple(value)

            elif isinstance(value, str) and value.endswith("func"):
                clauses.append(f"`{column}` = {value[:-4]}")

            elif isinstance(value, str) and value[:1] in {">", "<"}:
                operator, cleaned = value[0], value[1:]
                clauses.append(f"`{column}` {operator} :{param_name}")
                params[param_name] = cleaned

            elif value is None:
                clauses.append(f"`{column}` IS NULL")

            else:
                clauses.append(f"`{column}` = :{param_name}")
                params[param_name] = value

        return " WHERE " + " AND ".join(clauses), params

    def dbu_read(self,
                 table_name: str,
                 column_name: str | bool = False,
                 conditions: dict | bool = False,
                 order_by: str | None = None,
                 ascend: bool = False) -> pd.DataFrame:

        column_sql = f"`{column_name}`" if column_name else "*"
        base_sql = f"SELECT {column_sql} FROM `{self.database}`.`{table_name}`"

        where_sql, params = self._build_conditions(conditions or {})
        order_sql = f" ORDER BY {order_by} {'ASC' if ascend else 'DESC'}" if order_by else ""

        query = text(base_sql + where_sql + order_sql)

        try:
            results = self._execute_with_retry(lambda conn: conn.execute(query, params).fetchall())
        except Exception:
            logger.exception("Failed to read from table %s", table_name)
            raise

        if not column_name:
            columns: list[str] = []
            try:
                metadata = MetaData()
                table_columns = Table(table_name, metadata, autoload_with=self.engine).columns
            except Exception:
                logger.warning("Unable to reflect columns for table %s", table_name)
                columns = []
            else:
                columns.extend(column.name for column in table_columns)
        else:
            columns = [column_name]

        df = pd.DataFrame(results, columns=columns)

        return df

    def dbu_read_selectcount(self, table_name: str, column_name: str | bool = False, conditions: dict | bool = False) -> int:
        column_expr = f"`{column_name}`" if column_name else "*"
        base_sql = f"SELECT COUNT({column_expr}) FROM `{self.database}`.`{table_name}`"
        where_sql, params = self._build_conditions(conditions or {})

        query = text(base_sql + where_sql)

        try:
            result = self._execute_with_retry(lambda conn: conn.execute(query, params).scalar())
        except Exception:
            logger.exception("Failed to execute COUNT on table %s", table_name)
            raise

        return int(result or 0)

    def dbu_read_selectdistinct(self, table_name, column_name: str | bool = False, conditions: dict | bool = False):

        column_expr = f"`{column_name}`" if column_name else "*"
        base_sql = f"SELECT DISTINCT {column_expr} FROM `{self.database}`.`{table_name}`"
        where_sql, params = self._build_conditions(conditions or {})
        query = text(base_sql + where_sql)

        try:
            results = self._execute_with_retry(lambda conn: conn.execute(query, params).fetchall())
        except Exception:
            logger.exception("Failed to execute DISTINCT on table %s", table_name)
            raise

        if not column_name:
            columns = []
            try:
                metadata = MetaData()
                table_columns = Table(table_name,
                                      metadata,
                                      autoload_with=self.engine
                                      ).columns
            except Exception:
                logger.warning("Unable to reflect columns for table %s", table_name)
                columns = []
            else:
                columns.extend(column.name for column in table_columns)
        else:
            columns = [column_name]

        df = pd.DataFrame(results, columns=columns)

        return df

    def dbu_read_execute(self, query: str, table_name: str | None = None, params: dict | None = None):

        try:
            results = self._execute_with_retry(
                lambda conn: conn.execute(text(query), parameters=params).fetchall()
            )
        except Exception:
            logger.exception("Failed to execute raw query")
            raise

        if table_name:
            columns = []
            try:
                metadata = MetaData()
                table_columns = Table(table_name,
                                      metadata,
                                      autoload_with=self.engine
                                      ).columns
            except Exception:
                logger.warning("Unable to reflect columns for table %s", table_name)
            else:
                columns.extend(column.name for column in table_columns if query.find(str(column.name)) != -1)

            df = pd.DataFrame(results, columns=columns)
            return df

        return results

    def dbu_write(self, table, value: dict, check=True, check_exclude: list | None = None):

        if not check_exclude:
            check_exclude = []

        table_obj = self.metadata.tables.get(table)

        if table_obj is None:
            raise ValueError(f"Table {table} does not exist in the database schema")

        cleaned_value = {key: (None if value[key] is None or str(value[key]) == "Infinity" else value[key])
                         for key in value}

        existing = self.dbu_read_selectcount(table,
                                             conditions={value: cleaned_value[value] for value in cleaned_value if value not in check_exclude}) \
            if check else False

        if not existing:
            ins = insert(table_obj).values(**cleaned_value)

            self._execute_with_retry(self._write_with_commit(ins))

        return True

    def dbu_write_df(self, table: str, df: pd.DataFrame, check=True, returncheck=True):
        columns = df.columns

        for idx, (_, values) in enumerate(df.iterrows()):
            dic = {}
            for column in columns:
                dic[column] = values[column]
            if check and self.dbu_read_selectcount(table, conditions=dic) != 0:
                continue
            else:
                self.dbu_write(table, dic)

        if returncheck:
            output = pd.DataFrame(columns=columns)
        return output

    def dbu_check_df(self, table, df: pd.DataFrame):
        columns = df.columns
        values_out = []

        for idx, (_, values) in enumerate(df.iterrows()):
            dic = {}
            for column in columns:
                dic[column] = values[column]
            if self.dbu_read_selectcount(table, conditions=dic) != 0:
                continue
            else:
                values_out.append(values)
        output = pd.DataFrame(values_out, columns=columns)
        return output if any(output) else None

    def _execute_with_retry(self, operation: Callable):
        try:
            with self.engine.connect() as conn:
                return operation(conn)
        except OperationalError as exc:
            if self._is_disconnect_error(exc):
                logger.warning("Database connection dropped (%s). Retrying once.", exc)
                self.engine.dispose()
                with self.engine.connect() as conn:
                    return operation(conn)
            raise

    def _write_with_commit(self, statement):
        def _runner(conn):
            conn.execute(statement)
            conn.commit()
        return _runner

    def _is_disconnect_error(self, error: OperationalError) -> bool:
        if getattr(error, "connection_invalidated", False):
            return True

        orig = getattr(error, "orig", None)
        if not orig:
            return False

        args = getattr(orig, "args", ())
        if not args:
            return False

        code = args[0]
        try:
            return int(code) in self._RECONNECT_ERRNOS
        except (ValueError, TypeError):
            return False

