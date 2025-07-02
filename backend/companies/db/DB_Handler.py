from sqlalchemy import create_engine, MetaData, insert, text, Table
from datetime import datetime, date
import pandas as pd
import os


class DB_Handler:

    def __init__(self,
                 database: str):

        def get_db_login():
            login = {}
            for login_info in ["MYSQL_USERNAME", "MYSQL_PASSWORD", "MYSQL_HOST", "MYSQL_DATABASE"]:
                value = os.getenv(login_info)

                if not value:
                    raise ValueError(f"{login_info} environment variable not set.")
                else:
                    login[login_info] = value
            return login

        login_data = get_db_login()
        self.database = database
        self.engine = create_engine(f'mysql+pymysql://{login_data["MYSQL_USERNAME"]}:{login_data["MYSQL_PASSWORD"]}@{login_data["MYSQL_HOST"]}/{login_data["MYSQL_DATABASE"]}')
        self.metadata = MetaData()
        self.metadata.reflect(bind=self.engine)
    
    def dbu_read(self,
             table_name: str,
             column_name: str | bool = False,
             conditions: dict | bool = False,
             order_by: str | None = None,
             ascend: bool = False) \
            -> pd.DataFrame:

        query = f"SELECT * FROM {self.database}.{table_name}"

        if column_name:
            query = f"SELECT `{column_name}` FROM {table_name}"

        if conditions:
            operators = ["<", ">"]
            for idx, condition in enumerate(conditions):
                condition_value = conditions[condition] if conditions[condition] is not None else "NULL"
                func = True if isinstance(condition_value, str) and condition_value[-4:] == 'func' else False
                operator = "=" if not func else ""
                if isinstance(condition_value, list):
                    operator = "IN"
                    condition_value = str(condition_value).replace("[", "(").replace("]", ")")
                    condition_value = eval(condition_value)

                elif isinstance(condition_value, str) and condition_value[0] in operators and not func:
                    operator = condition_value[0]
                    condition_value = condition_value[1:]

                if idx == 0:
                    query = f"{query} WHERE `{condition}` {operator} "

                else:
                    query = f"{query} AND `{condition}` {operator} "

                if isinstance(condition_value, str) and func:
                    query = f"{query}{condition_value[:-4]}"

                elif isinstance(condition_value, str):
                    query = f"{query}'{condition_value}'"

                else:
                    query = f"{query}{condition_value}"

        if order_by:
            query = f"{query} ORDER BY {order_by}"
            if not ascend:
                query = f"{query} DESC"
        with self.engine.connect() as conn:
            results = conn.execute(text(query)).fetchall()

            if not column_name:
                columns = []
                metadata = MetaData()
                table_columns = Table(table_name,
                                      metadata,
                                      autoload_with=self.engine
                                      ).columns
                if table_columns:
                    columns.extend(column.name for column in table_columns)
            else:
                columns = [column_name]

        df = pd.DataFrame(results, columns=columns)

        return df

    def dbu_read_selectcount(self, table_name: str, column_name: str | bool = False, conditions: dict | bool = False) -> int:
        # Base query with parameterized table and column names
        query = f"SELECT COUNT(*) FROM {self.database}.`{table_name}`"
        if column_name:
            query = f"SELECT COUNT(`{column_name}`) FROM {self.database}.`{table_name}`"

        params = {}  # Dictionary to hold query parameters

        if conditions:
            operators = ["<", ">"]
            condition_statements = []

            for idx, (condition, condition_value) in enumerate(conditions.items()):
                operator = "="

                # Check if the condition is using a comparison operator
                if isinstance(condition_value, list):
                    operator = "IN"
                    condition_statements.append(f"`{condition}` {operator} :param{idx}")
                    params[f"param{idx}"] = tuple(condition_value)  # Ensure value is tuple for IN clause

                elif condition_value is None or condition_value == "None":
                    operator = "IS"
                    condition_statements.append(f"`{condition}` {operator} NULL")

                else:
                    if isinstance(condition_value, str):
                        try:
                            # Handle operators like <, > if specified in condition_value
                            if condition_value[0] in operators:
                                operator = condition_value[0]
                                condition_value = condition_value[1:]
                        except ValueError:
                            operator = "="
                        except IndexError:
                            operator = "="

                    condition_statements.append(f"`{condition}` {operator} :param{idx}")
                    params[f"param{idx}"] = condition_value

            # Add WHERE clause with all conditions combined by AND
            query += " WHERE " + " AND ".join(condition_statements)

        # Execute the query safely with parameters
        with self.engine.connect() as conn:
            results = int(conn.execute(text(query), params).scalar())
            conn.close()

        return results

    def dbu_read_selectdistinct(self, table_name, column_name: str | bool = False, conditions: dict | bool = False):

        query = f"SELECT DISTINCT FROM {self.database}.{table_name}"

        if column_name:
            query = f"SELECT DISTINCT (`{column_name}`) FROM {table_name}"

        if conditions:
            operators = ["<", ">"]
            for idx, condition in enumerate(conditions):
                condition_value = conditions[condition]
                if idx == 0:
                    if isinstance(condition_value, str):
                        try:
                            operators.index(condition_value[0])
                            query = f"{query} WHERE {condition} {condition_value[0]} "
                            condition_value = condition_value[1:]
                        except ValueError:
                            query = f"{query} WHERE {condition} = "
                    else:
                        query = f"{query} WHERE {condition} = "

                else:
                    try:
                        operators.index(conditions[condition][0])
                        query = f"{query} AND {condition} {condition_value[0]} "
                        condition_value = condition_value[1:]
                    except ValueError:
                        query = f"{query} AND {condition} = "

                if isinstance(condition_value, str):
                    if condition_value[-4:] == 'func':
                        query = f"{query}{condition_value[:-4]}"

                    else:
                        query = f"{query}'{text(condition_value)}'"
                else:
                    query = f"{query}{condition_value}"

        with self.engine.connect() as conn:
            results = conn.execute(text(query)).fetchall()

            if not column_name:
                columns = []
                metadata = MetaData()
                table_columns = Table(table_name,
                                      metadata,
                                      autoload_with=self.engine
                                      ).columns
                if table_columns:
                    columns.extend(column.name for column in table_columns)
            else:
                columns = [column_name]

        df = pd.DataFrame(results, columns=columns)

        return df

    def dbu_read_execute(self, query: str, table_name: str | None = None, params: list | None = None):

        with self.engine.connect() as conn:
            results = conn.execute(text(query), parameters=params).fetchall()

        if table_name:
            columns = []
            metadata = MetaData()
            table_columns = Table(table_name,
                                  metadata,
                                  autoload_with=self.engine
                                  ).columns
            if table_columns:
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

            with self.engine.connect() as conn:
                conn.execute(ins)
                conn.commit()

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

    def dbq_get_kpi_info(self, kpi):
        kpi_entry: pd.DataFrame = self.dbu_read(table_name="kpi", conditions={"KPI": kpi})

        kpi_id = kpi_entry.iloc[0]["id"]
        kpi_role = kpi_entry.iloc[0]["role"]

        return {"id": kpi_id, "role": kpi_role}
    
    def dbq_get_kpis(self):
        kpis: pd.DataFrame = self.dbu_read(table_name="kpi")
        kpis = kpis.set_index("id").to_dict(orient="index")
        for column in kpis:
            dic = kpis[column]
            for key in dic:
                dic[key] = None if pd.isna(dic[key]) else dic[key]
        return kpis

    def dbq_get_kpi(self, ticker: str, kpi_id, kpi_role, limit: int | None = 1, date: datetime | date | None = None):

        if date is not None:
            conditions = {"SYMBOL": ticker, "KPI": kpi_id, 'date': f"<=TIMESTAMP('{date}')func"}
        else:
            conditions = {"SYMBOL": ticker, "KPI": kpi_id}

        try:
            kpi_entry: pd.DataFrame = self.dbu_read(
                table_name=kpi_role,
                conditions=conditions,
                order_by="date",
                ascend=False)
            if limit == 1:
                latest_entry = kpi_entry.iloc[0]

                value = latest_entry["value"] if latest_entry["value"] != "NULL" else None
                value2 = latest_entry["value2"] if latest_entry["value2"] != "NULL" else None
                return {"value": value, "value2": value2} if any([value, value2]) else None

            elif limit is None:
                return kpi_entry

            else:
                return kpi_entry[:limit]

        except Exception:
            return {"value": None, "value2": None}
        
    def dbq_get_company_data(self, ticker):
        company_intel = {}
        latest_entries = {}
        wanted_roles = ["cashflow_statement", "balance_sheet", "income_statement", "scores", "basics"]
        
        kpis_df = self.dbu_read("kpi")
        kpis = [(row["id"], row["role"], row["KPI"]) for _, row in kpis_df.iterrows()]

        for kpi_id, role, kpi_name in kpis:
            if role in wanted_roles:
                kpi_dictionary = {}
                company_kpis_df = self.dbq_get_kpi(ticker, kpi_id, role, limit=None)

                # store each value by date
                for _, row in company_kpis_df.iterrows():
                    kpi_dictionary[str(row["date"])] = row["value"]

                # store latest entry (most recent date)
                if not company_kpis_df.empty:
                    latest_row = company_kpis_df.sort_values("date", ascending=False).iloc[0]
                    latest_entries[kpi_name] = latest_row["value"]

                company_intel[kpi_name] = kpi_dictionary

        return {"company_intel": company_intel, "latest_entries": latest_entries}
    
    def dbg_get_company_search(self, search_request: str, additional_kpis: list[str] = [], unique: bool = False):
        results = {}

        additional_kpis_info = {kpi: self.dbq_get_kpi_info(kpi) for kpi in additional_kpis}

        if not unique:
            sql_query = ("SELECT b.value AS company_name, b.SYMBOL AS company_ticker "
                        "FROM basics b "
                        "WHERE (b.KPI = 90) AND (b.SYMBOL LIKE :request OR b.value LIKE :request);")
            results_raw = self.dbu_read_execute(sql_query, params={"request": f"%{search_request}%"})
        else:
            sql_query = ("SELECT b.value AS company_name, b.SYMBOL AS company_ticker "
                        "FROM basics b "
                        "WHERE (b.KPI = 90) AND b.SYMBOL = :request;")
            results_raw = self.dbu_read_execute(sql_query, params={"request": search_request})
            print(search_request)
        
        for (name, symbol) in results_raw:
            results_dic = {"name": name}
            for kpi in additional_kpis_info:
                symboL_kpi = self.dbq_get_kpi(symbol, 
                                               additional_kpis_info[kpi]["id"], 
                                               additional_kpis_info[kpi]["role"])["value"]
                print(symboL_kpi)
                if symboL_kpi:
                    results_dic[kpi] = symboL_kpi
            
            results[symbol] = results_dic

        return results
