from pydantic import BaseModel
from typing import Optional

class ModuleOut(BaseModel):
    id: int
    course_id: str
    title: str
    category: str
    mandatory: bool
    resource_name: Optional[str]
    platform: Optional[str]
    resource_link: str
    estimated_time: Optional[str]
    module_type: str
    sequence_order: int
    progress_state: str = "not_started"
    percentage: int = 0
    started_at: Optional[str] = None   # first progress event timestamp

class RoadmapOut(BaseModel):
    profile_name: str
    modules: list[ModuleOut]
    total_modules: int
    completed_modules: int
    overall_percentage: int
    profile_start_date: Optional[str] = None
    profile_target_date: Optional[str] = None
