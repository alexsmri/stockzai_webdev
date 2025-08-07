import json

def parse_json(value):
    if isinstance(value, str) and value.strip().startswith(('{', '[')):
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return value
    return value