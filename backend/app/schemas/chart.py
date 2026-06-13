from pydantic import BaseModel
from typing import List

class PowerGenerationSchema(BaseModel):
    year: int
    month: int
    energy_type: str
    generation_gwh: float
    percentage: float

    model_config = {
        "from_attributes": True
    }

class PowerGenerationListResponse(BaseModel):
    data: List[PowerGenerationSchema]

class PowerConsumptionSchema(BaseModel):
    year: int
    month: int
    industry: str
    consumption_gwh: float
    percentage: float

    model_config = {
        "from_attributes": True
    }

class PowerConsumptionListResponse(BaseModel):
    year: int
    month: int
    data: List[PowerConsumptionSchema]

class PowerConsumptionHistoryResponse(BaseModel):
    data: List[PowerConsumptionSchema]
