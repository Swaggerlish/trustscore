from fastapi import FastAPI
from app.routers import assessment

app=FastAPI()
app.include_router(assessment.router)
