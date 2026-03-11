import os
import re
import json
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

def _parse_json(text: str) -> dict:
    """Robustly strips markdown fences and fixes common LLM JSON mistakes."""
    if isinstance(text, dict):
        return text  # Already parsed by LangChain
    
    # 1. Basic Cleaning
    cleaned_text = text.strip()
    
    # 2. Fix unquoted percentages (e.g., : 45% -> : "45%")
    # Matches both : 45% and :45%
    cleaned_text = re.sub(r':\s*(\d+)\s*%', r': "\1%"', cleaned_text)
    
    # 3. Extract the JSON object using the first { and last }
    start = cleaned_text.find('{')
    end = cleaned_text.rfind('}')
    
    if start != -1 and end != -1:
        json_candidate = cleaned_text[start:end+1]
    else:
        # Fallback: just strip markdown fences and hope for the best
        json_candidate = re.sub(r'^```(?:json)?\s*', '', cleaned_text, flags=re.MULTILINE)
        json_candidate = re.sub(r'\s*```\s*$', '', json_candidate, flags=re.MULTILINE)

    try:
        return json.loads(json_candidate)
    except json.JSONDecodeError:
        # 4. Final attempt: Remove trailing commas before closing braces/brackets
        json_candidate = re.sub(r',\s*([\]\}])', r'\1', json_candidate)
        try:
            return json.loads(json_candidate)
        except json.JSONDecodeError as e:
            # If it still fails, raise a helpful error that includes the source text
            raise ValueError(f"Invalid json output: {text}") from e

# Prompts are static, so we can keep them at module level
question_prompt = PromptTemplate.from_template(
    """You are an expert interviewer and researcher preparing for a high-stakes meeting with {target_name}.
    Based on the following scraped context from their recent interviews, articles, websites, or job descriptions, 
    generate 5-7 highly targeted, thought-provoking interview questions. 
    
    IMPORTANT INSTRUCTIONS:
    - If the context looks like a Job Description, focus on generating role-specific targeted questions testing their skills.
    - If the context looks like a Company Website or About Page, focus on generating culture-fit and product-strategy questions.
    - Otherwise, make the questions specific to their work, philosophies, and recent statements.
    
    Context:
    {context}
    
    Targeted Interview Questions:"""
)

summary_prompt = PromptTemplate.from_template(
    """You are an executive assistant preparing a 1-page briefing about {target_name} for your CEO.
    Based on the following scraped context from their recent interviews, articles, and websites, 
    generate a comprehensive but concise 1-page summary. Focus on their background, core philosophies, 
    recent projects, and key talking points.
    
    Context:
    {context}
    
    1-Page Summary:"""
)

research_prompt = PromptTemplate.from_template(
    """You are a specialized recruiter and career coach at {company_name}. 
    Based on the following context about the company:
    {context}
    
    Perform a deep-dive research into:
    1. **Target Position(s)**: Identify the most common software engineering roles and levels for {company_name}.
    2. **LeetCode/Technical Questions**: Extract 10-15 exact question patterns or titles specifically asked in their interviews, mentioning the difficulty for each.
    3. **Previously Asked Questions**: List specific non-LeetCode technical or behavioral questions from their recent interview cycles.
    4. **Interview Process Map**: Summarize the detailed rounds from OA to Bar Raiser/Final.
    
    CRITICAL: Respond with ONLY a raw JSON object. No markdown. No code fences. No explanation. Just the JSON.
    Keys must be:
    "positions": [strings],
    "leetcode_questions": [strings],
    "previous_questions": [strings],
    "process": "string"
    
    JSON Output:"""
)

benchmark_prompt = PromptTemplate.from_template(
    """Compare {company_a} and {company_b} specifically for the **Indian Market**.
    Focus on:
    1. **Interview Difficulty**: LeetCode levels and system design depth.
    2. **Compensation Packages (INR)**: Comparative breakdown in LPA (Lakhs Per Annum).
    3. **Work-Life Balance**: Remote/Hybrid culture in Indian offices.
    4. **Growth Prospects**: Career trajectory in India.
    
    Context A: {context_a}
    Context B: {context_b}
    
    **Strictly provide the comparison in a BEAUTIFUL MARKDOWN TABLE**. Use emojis for readability. Avoid long paragraphs."""
)

interview_prompt = PromptTemplate.from_template(
    """You are an interviewer from {company_name} for the role of {role}. 
    Previous Chat History:
    {chat_history}
    
    Latest User Message: {user_message}
    
    Conduct a realistic technical or behavioral interview. If it's a new session, start with a greeting and a first question. 
    Always stay in character. Be professional but firm."""
)

def generate_content(target_name: str, context: str, generation_type: str) -> any:
    """Uses LangChain and Groq (LLaMA 3) to generate content."""
    llm = ChatGroq(model="llama-3.3-70b-versatile", groq_api_key=os.getenv("GROQ_API_KEY"))
    
    if generation_type == "questions":
        chain = question_prompt | llm | StrOutputParser()
    elif generation_type == "summary":
        chain = summary_prompt | llm | StrOutputParser()
    elif generation_type == "research":
        chain = research_prompt | llm | StrOutputParser()
        raw = chain.invoke({"target_name": target_name, "company_name": target_name, "context": context})
        return _parse_json(raw)
    else:
        raise ValueError("Invalid generation type.")
        
    return chain.invoke({"target_name": target_name, "company_name": target_name, "context": context})

def generate_benchmark(company_a: str, company_b: str, context_a: str, context_b: str) -> str:
    """Handles company benchmarking."""
    llm = ChatGroq(model="llama-3.3-70b-versatile", groq_api_key=os.getenv("GROQ_API_KEY"))
    chain = benchmark_prompt | llm | StrOutputParser()
    return chain.invoke({
        "company_a": company_a,
        "company_b": company_b,
        "context_a": context_a,
        "context_b": context_b
    })

resume_roast_prompt = PromptTemplate.from_template(
    """You are an extremely brutal, savage, and highly experienced Senior Technical Recruiter / Hiring Manager at a top-tier Indian tech startup.
    A candidate has submitted their resume for the following Job Description (if provided):
    
    Job Description:
    {job_description}
    
    Candidate's Resume Text:
    {resume_text}
    
    Your job is to ROAST this resume. Be absolutely savage, sarcastic, and brutally honest. Speak in aggressive Hinglish (Hindi + English mix). Use phrases like "bhai ye kya bana rkha hai?", "bilkul bakwaas", "kya soch ke likha ye?", and "is se achha toh blank paper de dete". 
    
    CRITICAL: Respond with ONLY a raw JSON object. No markdown. No code fences. No preamble. Just valid JSON.
    Required keys:
    "roast": A multi-paragraph savage roast in Hinglish.
    "improvements": An array of strings, each being a specific actionable improvement in savage Hinglish.
    "match_score": A string like "45%" — MUST be a quoted string, not a bare number.
    "missing_keywords": An array of up to 5 critical missing keyword strings.
    
    Example format (follow exactly):
    {{"roast": "Bhai ye kya...", "improvements": ["Fix X", "Add Y"], "match_score": "30%", "missing_keywords": ["Docker", "Kubernetes"]}}
    """
)

live_code_start_prompt = PromptTemplate.from_template(
    """You are a technical interviewer at {company_name}.
    Generate a realistic, medium-to-hard coding interview problem typical for this company.
    
    CRITICAL: Respond with ONLY a raw JSON object. No markdown. No code fences. No explanation. Just valid JSON.
    Required keys:
    "title": The problem name (e.g. "Optimize Meeting Rooms")
    "description": The full markdown description of the problem, including examples and constraints.
    "starting_code": A boilerplate {language} function definition for them to start writing in.
    
    Example format:
    {{"title": "Two Sum Variant", "description": "## Problem\\n...", "starting_code": "def solve(nums):\\n    pass"}}
    """
)

live_code_chat_prompt = PromptTemplate.from_template(
    """You are a Staff Engineer conducting a live coding interview for {company_name}.
    Problem Title: {problem_title}
    Problem Description: {problem_description}
    Language: {language}
    
    Past Interview Chat:
    {chat_history}
    
    Candidate's Current Real-Time Code:
    ```{language}
    {current_code}
    ```
    
    Candidate's Latest Message: {user_message}
    
    CRITICAL RULES:
    1. Your response MUST be extremely short. MAXIMUM 3 sentences.
    2. Do NOT give away the answer or write code for them. Let them struggle and work.
    3. You MUST speak in Hinglish (Hindi + English mix). Maintain the dignity and decorum of a senior interviewer. Use 'Aap' for respect. Example: "Aree nahi, aap aisa sochiye ki agar hum Hash Map use karein toh kya hoga? Ye aise kaam karega." or "Aapki logic theek lag rahi hai, but time complexity O(N^2) hai. Isko thoda aur sochiye."
    """
)

live_code_judge_prompt = PromptTemplate.from_template(
    """You are a Senior Engineer evaluating a candidate in a live coding interview.
    
    Problem Title: {problem_title}
    Problem Description: {problem_description}
    Language: {language}
    Follow-ups Asked So Far: {followups_asked} (Maximum allowed: 2)
    
    Candidate's Submitted Code:
    ```{language}
    {current_code}
    ```
    
    Mentally test their code against edge cases, standard inputs, and optimal time/space constraints.
    
    CRITICAL: Respond with ONLY a raw JSON object. No markdown. No code fences. Just valid JSON.
    Required keys:
    "status": "Passed" if optimal and correct, else "Failed".
    "feedback": Short realistic Hinglish feedback using 'Aap' for respect. Max 2 sentences.
    "follow_up": If "Passed" and followups_asked < 2, a 1-sentence follow-up constraint. Else empty string "".
    "is_final": true if followups_asked >= 2 and "Passed", else false.
    
    Example format:
    {{"status": "Passed", "feedback": "Bahut badhiya kaam kiya aapne.", "follow_up": "Now solve it in O(1) space.", "is_final": false}}
    """
)

def analyze_resume(resume_text: str, job_description: str) -> dict:
    llm = ChatGroq(model="llama-3.3-70b-versatile", groq_api_key=os.getenv("GROQ_API_KEY"))
    chain = resume_roast_prompt | llm | StrOutputParser()
    raw = chain.invoke({
        "resume_text": resume_text,
        "job_description": job_description if job_description else "General Software Engineering Role"
    })
    return _parse_json(raw)

def start_live_code(company_name: str, language: str) -> dict:
    llm = ChatGroq(model="llama-3.3-70b-versatile", groq_api_key=os.getenv("GROQ_API_KEY"))
    chain = live_code_start_prompt | llm | StrOutputParser()
    raw = chain.invoke({
        "company_name": company_name,
        "language": language
    })
    return _parse_json(raw)

def generate_live_code_reply(company_name: str, problem_title: str, problem_description: str, chat_history: str, current_code: str, language: str, user_message: str) -> str:
    llm = ChatGroq(model="llama-3.3-70b-versatile", groq_api_key=os.getenv("GROQ_API_KEY"))
    chain = live_code_chat_prompt | llm | StrOutputParser()
    return chain.invoke({
        "company_name": company_name,
        "problem_title": problem_title,
        "problem_description": problem_description,
        "chat_history": chat_history,
        "current_code": current_code,
        "language": language,
        "user_message": user_message
    })

def judge_live_code(problem_title: str, problem_description: str, current_code: str, language: str, followups_asked: int) -> dict:
    llm = ChatGroq(model="llama-3.3-70b-versatile", groq_api_key=os.getenv("GROQ_API_KEY"))
    chain = live_code_judge_prompt | llm | StrOutputParser()
    raw = chain.invoke({
        "problem_title": problem_title,
        "problem_description": problem_description,
        "current_code": current_code,
        "language": language,
        "followups_asked": followups_asked
    })
    return _parse_json(raw)
