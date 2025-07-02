set -e

DEPLOY_SCRIPT="$(dirname "$(readlink -f "$0")")/deploy.sh"
cd "$(dirname "$DEPLOY_SCRIPT")"

git fetch

LOCAL_HASH=$(git rev-parse HEAD)
REMOTE_HASH=$(git rev-parse origin/master)

if [ "$LOCAL_HASH" != "$REMOTE_HASH" ]; then
  echo "$(date): New deployment detected. Running deploy.sh..."
  bash "$DEPLOY_SCRIPT"
else
  echo "$(date): No new commits. Nothing to do."
fi
