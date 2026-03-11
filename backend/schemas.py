from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict, Any
from datetime import datetime

class GenerationRequestCreate(BaseModel):
    target_name: str
    urls: List[HttpUrl]
    generation_type: str # "questions", "summary", "research", "benchmark"

class GenerationResponse(BaseModel):
    id: int
    target_name: str
    generation_type: str
    generated_content: str
    created_at: datetime

    class Config:
        from_attributes = True

class ExtractionResult(BaseModel):
    source_url: str
    content: str

class CompanyResearchCreate(BaseModel):
    company_name: str

class CompanyResearchResponse(BaseModel):
    id: int
    company_name: str
    positions: List[str]
    leetcode_questions: List[str]
    previous_questions: List[str]
    interview_process: str
    created_at: datetime

    class Config:
        from_attributes = True

class MockInterviewCreate(BaseModel):
    company_name: str
    role: str

class MockInterviewChat(BaseModel):
    session_id: int
    user_message: str

class BenchmarkingRequest(BaseModel):
    company_a: str
    company_b: str

class ResumeRoastRequest(BaseModel):
    resume_text: str
    job_description: str

class ResumeRoastResponse(BaseModel):
    roast: str
    improvements: str
    match_score: str
    missing_keywords: list[str]

class LiveCodeStartRequest(BaseModel):
    company_name: str
    language: str

class LiveCodeChatRequest(BaseModel):
    session_id: int
    code: str
    language: str
    message: str

class LiveCodeSubmitRequest(BaseModel):
    session_id: int
    code: str
    language: str
