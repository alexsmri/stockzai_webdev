import json
import pandas as pd

def parse_value(value):
    return None if pd.isna(value) else value
    
def parse_json(value):
    if isinstance(value, str) and value.strip().startswith(('{', '[')):
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return parse_value(value)
    return parse_value(value)