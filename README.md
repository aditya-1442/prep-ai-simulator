# PrepAI: Advanced Simulation Engine 
---<img width="1440" height="720" alt="Screenshot 2026-03-12 at 15 09 24" src="https://github.com/user-attachments/assets/9d109634-ec44-4577-b6a4-03aef7919e56" />
PrepAI is a production-grade interview simulator built for engineers who want to practice in high-stakes environments. It moves past simple chat boxes to provide a full-screen, immersive IDE experience powered by **LLaMA 3.3 70B**.

## 🎯 What it does
*   **Live Code Sandbox**: A LeetCode-style immersive environment. It hides all distractions, tracks your attempts (max 3), and features a savage AI interviewer speaking in Hinglish.
*   **Resume Roaster**: Upload a PDF/DOCX and get your CV torn apart with a "Savage Mode" roast, match scores, and a specific roadmap to bypass ATS.
*   **Dynamic Problem Generation**: Real-time generation of medium-to-hard coding problems tailored to top-tier companies like Meta, Google, and Indian startups.

## 🔥 Why it's different
*   **Hinglish AI Persona**: Unlike robotic global AI, our interviewer acts like a real Senior Engineer, using subtle hints and respect ("Aap"), but brutal honesty ("Bhai ye kya bana rkha hai?").
*   **Zero-Distraction UI**: The interface is designed to disappear. When the interview starts, the navbars and tabs vanish, leaving only you and the code.
*   **LLaMA 3.3 70B Power**: Utilizing the latest high-context logic to evaluate code efficiency (O(N) vs O(N^2)) with staff-engineer level accuracy.

## 🛠️ Tech Stack
*   **Frontend**: Next.js 15, Framer Motion, CodeMirror 6, Lucide.
*   **Backend**: FastAPI, Python, SQLAlchemy.
*   **AI**: LLaMA 3.3 70B via Groq.
*   **Parsers**: PyPDF2, python-docx for native CV analysis.



### 🚦 Quick Start
1.  **Backend**: `cd backend && source venv/bin/activate && uvicorn main:app --reload`
2.  **Frontend**: `cd frontend && npm run dev`
3.  **Env**: Add `GROQ_API_KEY` to your `.env`.

**PrepAI - Stop practicing. Start simulating.**
