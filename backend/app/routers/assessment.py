from fastapi import APIRouter
from app.services.scoring import calculate_score

router=APIRouter(prefix='/assessment')

@router.post('/score')
def score(data:dict):
 return calculate_score(data)
