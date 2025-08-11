# Flagged backend


We use [uv](https://docs.astral.sh/uv/getting-started/installation/) for package
management.

Use:

`uv run fastapi dev app/main.py`

or

`uv run python -m app`


To run the fastapi server :


First start docker 


For Fastapi limiter & redis first run:


docker run --name some-redis -d -p 6379:6379 redis 


(on future runs start with : docker start some-redis)

Then run :


uvicorn app.main:app --reload

