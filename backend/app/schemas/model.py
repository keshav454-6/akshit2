from datetime import datetime
from typing import Dict, Any, List
from pydantic import BaseModel

class ConfusionMatrixSchema(BaseModel):
    tn: int
    fp: int
    fn: int
    tp: int

class ModelMetricsResponse(BaseModel):
    model_name: str
    model_type: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    false_positive_rate: float
    false_negative_rate: float
    confusion_matrix: ConfusionMatrixSchema
    feature_importances: Dict[str, float]
    evaluation_date: datetime
    is_active: bool

    class Config:
        from_attributes = True

class ModelInsightSummary(BaseModel):
    active_model: ModelMetricsResponse
    all_models: List[ModelMetricsResponse]
    explanation: str

