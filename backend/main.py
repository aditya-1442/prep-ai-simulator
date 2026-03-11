import os
import io
import PyPDF2
import docx
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import json

from . import models, schemas, scraper, llm, constants
from .database import engine, get_db

# Create DB tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Interview Prep API")

# Setup CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/companies")
def get_top_companies():
    return constants.TOP_COMPANIES

@app.post("/api/research", response_model=schemas.CompanyResearchResponse)
def research_company(request: schemas.CompanyResearchCreate, db: Session = Depends(get_db)):
    """Deep-dive research into a company's interview patterns and compensation."""
    # Build search query for LLM context
    search_query = f"{request.company_name} latest software engineer interview experience leetcode 2024 2025 compensation glassdoor"
    
    # In a real app, we'd call a Search API here. 
    # For now, we'll use our scraper on common search result patterns or use LLM's internal knowledge if URLs are empty.
    # To simulate 'fresh' data, we combine some known high-quality URLs or allow user to provide them.
    
    # Fallback to LLM broad research if no context provided
    try:
        raw_output = llm.generate_content(
            target_name=request.company_name,
            context="Provide latest 2024-2025 context based on your internal training data.",
            generation_type="research"
        )
        
        data = raw_output
        if isinstance(raw_output, str):
            # Clean the Markdown code blocks if any
            json_str = raw_output.strip()
            if "```json" in json_str:
                json_str = json_str.split("```json")[-1].split("```")[0]
            elif "```" in json_str:
                json_str = json_str.split("```")[-1].split("```")[0]
            
            import re
            # Find the first { and last }
            match = re.search(r'\{.*\}', json_str, re.DOTALL)
            if match:
                json_str = match.group()
            data = json.loads(json_str)
        
        db_research = models.CompanyResearch(
            company_name=request.company_name,
            positions=data.get("positions", []),
            leetcode_questions=data.get("leetcode_questions", []),
            previous_questions=data.get("previous_questions", []),
            interview_process=data.get("process", ""),
            raw_content_summary=str(raw_output)
        )
        db.add(db_research)
        db.commit()
        db.refresh(db_research)
        return db_research
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/benchmark")
def benchmark(request: schemas.BenchmarkingRequest):
    """Compare two companies."""
    try:
        comparison = llm.generate_benchmark(
            company_a=request.company_a,
            company_b=request.company_b,
            context_a=f"Latest interview and compensation info for {request.company_a}",
            context_b=f"Latest interview and compensation info for {request.company_b}"
        )
        return {"comparison": comparison}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/interview/roast", response_model=schemas.ResumeRoastResponse)
async def create_resume_roast(
    file: UploadFile = File(...),
    job_description: str = Form(""),
    db: Session = Depends(get_db)
):
    """Generates a brutal resume roast and saves it."""
    try:
        # Extract text based on file type
        resume_text = ""
        content = await file.read()
        
        if file.filename.endswith('.pdf'):
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
            for page in pdf_reader.pages:
                resume_text += page.extract_text() + "\n"
        elif file.filename.endswith('.docx'):
            doc = docx.Document(io.BytesIO(content))
            for para in doc.paragraphs:
                resume_text += para.text + "\n"
        elif file.filename.endswith('.txt'):
            resume_text = content.decode('utf-8')
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF, DOCX, or TXT.")

        if not resume_text.strip():
             raise HTTPException(status_code=400, detail="Could not extract text from the provided file.")

        roast_data = llm.analyze_resume(resume_text, job_description)
        
        import json
        
        # Ensure improvements is a string
        improvements_val = roast_data.get("improvements", "")
        if isinstance(improvements_val, list):
            improvements_val = "\n".join(f"- {item}" for item in improvements_val)
            
        # Ensure missing_keywords is a list
        missing_kw_val = roast_data.get("missing_keywords", [])
        if isinstance(missing_kw_val, str):
            try:
                missing_kw_val = json.loads(missing_kw_val)
                if not isinstance(missing_kw_val, list):
                    missing_kw_val = [str(missing_kw_val)]
            except:
                missing_kw_val = [missing_kw_val]
        
        db_roast = models.ResumeAnalysis(
            resume_text=resume_text,
            job_description=job_description,
            roast=str(roast_data.get("roast", "")),
            improvements=improvements_val,
            match_score=str(roast_data.get("match_score", "")),
            missing_keywords=missing_kw_val
        )
        db.add(db_roast)
        db.commit()
        db.refresh(db_roast)
        
        return schemas.ResumeRoastResponse(
            roast=db_roast.roast,
            improvements=db_roast.improvements,
            match_score=db_roast.match_score,
            missing_keywords=db_roast.missing_keywords
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/interview/code/start")
def start_live_code(request: schemas.LiveCodeStartRequest, db: Session = Depends(get_db)):
    """Starts a new live coding mock interview session."""
    try:
        problem_data = llm.start_live_code(request.company_name, request.language)
        
        session = models.LiveCodeSession(
            company_name=request.company_name,
            problem_title=problem_data.get("title", ""),
            problem_description=problem_data.get("description", ""),
            current_code=problem_data.get("starting_code", ""),
            chat_history=[]
        )
        
        greeting = f"Hello! Main aapka aaja ka interviewer hoon from {request.company_name}. Chaliye shuru karte hain. Aaj ki problem hai: **{problem_data.get('title', '')}**. Ek baar description padh lijiye, aur please apne initial thoughts bataiye code start karne se pehle."
        
        session.chat_history = [{"role": "ai", "content": greeting}]
        db.add(session)
        db.commit()
        db.refresh(session)
        
        return {
            "session_id": session.id,
            "title": session.problem_title,
            "description": session.problem_description,
            "starting_code": session.current_code,
            "initial_greeting": greeting
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/interview/code/chat")
def chat_live_code(request: schemas.LiveCodeChatRequest, db: Session = Depends(get_db)):
    """Handles an interview turn during live coding."""
    session = db.query(models.LiveCodeSession).filter(models.LiveCodeSession.id == request.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Update current code
    session.current_code = request.code
    
    # Add user message
    history = session.chat_history
    history.append({"role": "user", "content": request.message})
    
    # Generate reply
    reply = llm.generate_live_code_reply(
        company_name=session.company_name,
        problem_title=session.problem_title,
        problem_description=session.problem_description,
        chat_history=json.dumps(history),
        current_code=session.current_code,
        language=request.language,
        user_message=request.message
    )
    
    history.append({"role": "ai", "content": reply})
    session.chat_history = history
    db.commit()
    return {"reply": reply}

@app.post("/api/interview/code/submit")
def submit_live_code(request: schemas.LiveCodeSubmitRequest, db: Session = Depends(get_db)):
    """Judges the submitted code and provides feedback/follow-ups."""
    session = db.query(models.LiveCodeSession).filter(models.LiveCodeSession.id == request.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    session.current_code = request.code
    
    judge_result = llm.judge_live_code(
        problem_title=session.problem_title,
        problem_description=session.problem_description,
        current_code=session.current_code,
        language=request.language,
        followups_asked=session.followups_asked
    )
    
    history = session.chat_history
    history.append({"role": "user", "content": f"I have submitted my code for evaluation in {request.language}."})
    
    if judge_result.get("status") == "Passed":
        if judge_result.get("is_final"):
            ai_response = f"**Code Execution Status: PASSED** 🎉\n\n{judge_result.get('feedback', '')}\n\n**Interview Complete!** Great job."
        else:
            ai_response = f"**Code Execution Status: PASSED** 🎉\n\n{judge_result.get('feedback', '')}\n\n**Follow-up Question:**\n{judge_result.get('follow_up', '')}"
            # Setting the follow up as the new problem description context to keep going
            session.problem_description += "\n\n### Follow Up\n" + judge_result.get('follow_up', '')
            session.followups_asked += 1
    else:
        ai_response = f"**Code Execution Status: FAILED** ❌\n\n{judge_result.get('feedback', '')}\n\nPlease fix the issues and try again."
        
    history.append({"role": "ai", "content": ai_response})
    session.chat_history = history
    db.commit()
    
    return judge_result

@app.post("/api/generate", response_model=schemas.GenerationResponse)
def create_generation(request_data: schemas.GenerationRequestCreate, db: Session = Depends(get_db)):
    # Existing standard generation logic remains
    urls_str = [str(url) for url in request_data.urls]
    extraction_results = scraper.ingest_urls(urls_str)
    combined_context = "\n\n---\n\n".join(
        [f"Source: {res.source_url}\nContent: {res.content}" for res in extraction_results]
    )
    
    if not combined_context.strip():
        # If no URLs provided, use LLM logic for broader research
        combined_context = f"Internal research for {request_data.target_name}"

    try:
        generated_text = llm.generate_content(
            target_name=request_data.target_name,
            context=combined_context,
            generation_type=request_data.generation_type
        )
    except Exception as e:
         raise HTTPException(status_code=500, detail=f"LLM Error: {str(e)}")

    db_generation = models.GenerationRequest(
        target_name=request_data.target_name,
        urls=urls_str,
        generation_type=request_data.generation_type,
        generated_content=generated_text
    )
    db.add(db_generation)
    db.commit()
    db.refresh(db_generation)
    return db_generation

@app.get("/api/generations", response_model=List[schemas.GenerationResponse])
def get_generations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Retrieve history of generations."""
    generations = db.query(models.GenerationRequest).order_by(models.GenerationRequest.created_at.desc()).offset(skip).limit(limit).all()
    return generations
