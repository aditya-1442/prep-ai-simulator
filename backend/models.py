from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class GenerationRequest(Base):
    __tablename__ = "generation_requests"

    id = Column(Integer, primary_key=True, index=True)
    target_name = Column(String, index=True)
    urls = Column(JSON) # Store list of URLs as JSON
    generation_type = Column(String) # 'questions', 'summary', 'research', 'benchmark'
    generated_content = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class CompanyResearch(Base):
    __tablename__ = "company_research"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, index=True)
    positions = Column(JSON) # List of roles
    leetcode_questions = Column(JSON) # List of extracted question titles/patterns
    previous_questions = Column(JSON) # List of non-leetcode questions
    interview_process = Column(Text)
    raw_content_summary = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class MockInterviewSession(Base):
    __tablename__ = "mock_interviews"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String)
    role = Column(String)
    chat_history = Column(JSON) # [{role: 'ai'|'user', content: '...'}]
    feedback_summary = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class LiveCodeSession(Base):
    __tablename__ = "live_code_sessions"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String)
    problem_title = Column(String)
    problem_description = Column(Text)
    current_code = Column(Text)
    chat_history = Column(JSON) # [{role: 'ai'|'user', content: '...'}]
    followups_asked = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ResumeAnalysis(Base):
    __tablename__ = "resume_analysis"
    
    id = Column(Integer, primary_key=True, index=True)
    resume_text = Column(Text)
    job_description = Column(Text)
    roast = Column(Text)
    improvements = Column(Text)
    match_score = Column(String)
    missing_keywords = Column(JSON) # Store list of strings
    created_at = Column(DateTime(timezone=True), server_default=func.now())
