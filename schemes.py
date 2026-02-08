from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Vitals(BaseModel):
    heartRate: Optional[int]
    systolic: Optional[int]
    diastolic: Optional[int]
    oxygenSaturation: Optional[float]
    bmi: Optional[float]

class HealthRecord(BaseModel):
    recordDate: datetime
    vitals: Vitals
    bloodSugar: Optional[float]
    cholesterol: Optional[float]

class AnalyzeRequest(BaseModel):
    patientId: str
    recordData: dict

class LongitudinalRequest(BaseModel):
    patientId: str
    records: List[HealthRecord]
