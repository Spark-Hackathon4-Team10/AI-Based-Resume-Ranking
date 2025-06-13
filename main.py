from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.post("/analyze")
async def analyze_resumes(
    jobDescription: str = Form(...),
    files: List[UploadFile] = File(...)
):
    print("Job Description Received:")
    print(jobDescription)

    print(f"Received {len(files)} files:")
    for i, file in enumerate(files):
        contents = await file.read()
        print(f"File {i+1}: {file.filename}, size: {len(contents)} bytes")

    mock_results = [
        {
            "id": 1,
            "filename": files[0].filename if len(files) > 0 else "resume_1.pdf",
            "matchPercentage": 91,
            "matchingSkills": ["React", "JavaScript", "Node.js", "Git"],
            "languages": ["English"]
        },
        {
            "id": 2,
            "filename": files[1].filename if len(files) > 1 else "resume_2.pdf",
            "matchPercentage": 84,
            "matchingSkills": ["Python", "Django", "SQL"],
            "languages": ["English", "Spanish"]
        },
        {
            "id": 3,
            "filename": files[2].filename if len(files) > 2 else "resume_3.pdf",
            "matchPercentage": 76,
            "matchingSkills": ["C++", "Linux", "Problem Solving"],
            "languages": ["Arabic", "English"]
        }
    ]

    return mock_results

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
