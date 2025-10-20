#!/usr/bin/env bash
# Load all environment variables from a .env file into the current shell
# Usage: source ./load-env.sh [.env file path]

# Stop on errors
set -e

# Use .env or first argument
ENV_FILE="${1:-.env}"

# Check that file exists
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ Error: $ENV_FILE not found"
  return 1 2>/dev/null || exit 1
fi

# Read file line by line
while IFS='=' read -r key value; do
  # Skip empty lines and comments
  if [[ -z "$key" || "$key" =~ ^# ]]; then
    continue
  fi

  # Remove quotes and trim whitespace
  value=$(echo "$value" | sed -e 's/^ *//' -e 's/ *$//' -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")

  # Export variable
  export "$key"="$value"
done < "$ENV_FILE"

echo "✅ Loaded environment variables from $ENV_FILE"
