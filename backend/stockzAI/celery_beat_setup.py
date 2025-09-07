# from .celery import app
# from celery.schedules import crontab

# @app.on_after_configure.connect
# def setup_periodic_tasks(sender, **kwargs):
#     sender.add_periodic_task(
#         crontab(minute="*"),
#         sender.signature("companies.tasks.fetch_company_winners"),
#         name="Fetch Company Winners (*/5min)",
#     )