"""
All LLM prompt templates — migrated from utils/prompts.py.
These are used by both the REST endpoints and the WebSocket interview flow.
"""

BASIC_DETAILS_PROMPT = """
Task: Act as an expert resume parser and talent acquisition specialist. Analyze the resume and extract critical information with precision.

Instructions:
1. Name Extraction: Identify the candidate's full name from headers or contact section.
2. Key Highlights: Extract 5-7 most compelling highlights:
   - Quantifiable achievements with metrics
   - Leadership roles
   - Technical skills and certifications
   - Notable projects with measurable impact
   - Awards or standout accomplishments
   - Unique experiences or expertise

Resume Content:
{resume_content}

Output Requirements:
- Respond ONLY in valid JSON format
- No additional text

Response Format:
{{
    "name": "<Full name of the candidate>",
    "resume_highlights": "<Paragraph summary of key highlights from the resume>"
}}
"""

NEXT_QUESTION_PROMPT = """
Task: Act as an expert interviewer. Generate the next interview question based on the conversation so far.

Context:
- Previous Question: {previous_question}
- Candidate Response: {candidate_response}
- Job Description: {job_description}
- Relevant Resume Context: {rag_context}

Generate a natural follow-up question that:
- Builds on the previous answer
- Probes for depth or clarification where needed
- Covers relevant competencies for the role
- Is open-ended and behavioral/situational

Avoid: yes/no questions, repetition, inappropriate topics.

Output Requirements:
- Respond ONLY in valid JSON format

Response Format:
{{
    "next_question": "<A thoughtful, open-ended interview question>"
}}
"""

FEEDBACK_PROMPT = """
Task: Act as an expert interviewer and executive coach. Evaluate the candidate's response.

Assessment Context:
- Interview Question: {question}
- Candidate Response: {candidate_response}
- Job Description: {job_description}
- Relevant Resume Context: {rag_context}

Evaluate across:
1. Relevance — How well does the response address the question?
2. Completeness — Does it cover all aspects?
3. Structure — Is it well-organized (STAR format)?
4. Specificity — Are concrete examples provided?
5. Impact — Are measurable results demonstrated?
6. Professionalism — Is communication clear and confident?

Scoring (1-10):
- 9-10: Exceptional
- 7-8: Strong
- 5-6: Adequate
- 3-4: Below average
- 1-2: Poor

Output Requirements:
- Respond ONLY in valid JSON format

Response Format:
{{
    "feedback": "<Comprehensive feedback in 90 words max>",
    "score": <Numeric 1-10>,
    "criteria_scores": {{
        "relevance": <1-10>,
        "completeness": <1-10>,
        "structure": <1-10>,
        "specificity": <1-10>,
        "impact": <1-10>,
        "professionalism": <1-10>
    }},
    "competency_assessment": {{
        "technical_skills": <1-10>,
        "problem_solving": <1-10>,
        "communication": <1-10>,
        "leadership": <1-10>,
        "cultural_fit": <1-10>,
        "growth_mindset": <1-10>
    }}
}}
"""

GREETING_MESSAGES = [
    "Hi {name}, welcome to your AI interview! I'm {interviewer_name} and I'll be your interviewer today. Let's get started!\n\nCan you tell me a bit about yourself and what you're looking for in a job?",
    "Hello {name}! I'm {interviewer_name}, your AI interviewer. Great to meet you!\n\nCould you give me a quick overview of your background and experience?",
    "Welcome {name}! My name is {interviewer_name} and I'll be conducting your interview today.\n\nCan you begin by introducing yourself and sharing your key achievements and skills?",
]

FAREWELL_MESSAGES = [
    "Thanks for taking the time to chat today, {name}. I really enjoyed our conversation. Wishing you all the best in your career!",
    "It was great speaking with you, {name}. I hope the interview was a valuable experience. Good luck moving forward!",
    "Thank you for the engaging conversation, {name}. I wish you success in your job hunt and future endeavors!",
]
