from fastapi import APIRouter
from app.schemas import AnalyzeRequest, LongitudinalRequest
from services.analyzer import analyze_record, analyze_longitudinal

router = APIRouter()

@router.post("/analyze")
def analyze(data: AnalyzeRequest):
    return analyze_record(data.recordData)

@router.post("/longitudinal-analysis")
def longitudinal(data: LongitudinalRequest):
    return analyze_longitudinal(data.records)
