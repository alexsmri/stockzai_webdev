set -e

CHECK_SCRIPT="$(dirname "$(readlink -f "$0")")/deploy-check.sh"

chmod +x "$CHECK_SCRIPT"

crontab -l 2>/dev/null > /tmp/current_cron || true

grep -v "$CHECK_SCRIPT" /tmp/current_cron > /tmp/new_cron || true

echo "* * * * * $CHECK_SCRIPT >> /var/log/web-deploy-check.log 2>&1" >> /tmp/new_cron

crontab /tmp/new_cron

rm -f /tmp/current_cron /tmp/new_cron

echo "Cron job installed: checks for new deployments every minute."
