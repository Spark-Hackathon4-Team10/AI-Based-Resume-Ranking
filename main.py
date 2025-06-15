
#%%

#%%
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import uvicorn
import zipfile
import io
import os
import tempfile
import re
from datetime import datetime
from setup import setup
from fastapi import HTTPException

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def print_file_info(filename: str, file_size: int):
    print("\n" + "="*50)
    print(f"File Information:")
    print(f"Name: {filename}")
    print(f"Size: {file_size / 1024:.2f} KB")
    print(f"Received at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*50 + "\n")

async def extract_zip_contents(zip_file: UploadFile):
    contents = await zip_file.read()
    extracted_files = []
    
    try:
        with zipfile.ZipFile(io.BytesIO(contents)) as zip_ref:
            with tempfile.TemporaryDirectory() as temp_dir:
                zip_ref.extractall(temp_dir)
                
                for root, _, files in os.walk(temp_dir):
                    for file in files:
                        if file.lower().endswith('.pdf'):
                            file_path = os.path.join(root, file)
                            with open(file_path, 'rb') as f:
                                file_content = f.read()
                                extracted_files.append({
                                    'filename': file,
                                    'content': file_content
                                })
                                print_file_info(file, len(file_content))
    except zipfile.BadZipFile:
        raise ValueError("Invalid ZIP file")
    except Exception as e:
        raise ValueError(f"Error processing ZIP file: {str(e)}")
    
    return extracted_files

def extract_name_from_filename(filename: str) -> str:
    name = filename.replace('.pdf', '').replace('resume_', '').replace('cv_', '')
    name = ' '.join(word.capitalize() for word in name.split('_'))
    return name

def generate_email(name: str) -> str:
    email_name = name.lower().replace(' ', '.')
    return f"{email_name}@example.com"

@app.post("/analyze")
async def analyze_resumes(
    jobDescription: str = Form(...),
    files: List[UploadFile] = File(None),
    zipFile: UploadFile = File(None)
):
    print("\n" + "="*50)
    print("Starting Resume Analysis")
    print("="*50)
    print("\nJob Description Received:")
    print(jobDescription)
    print("\n" + "="*50)

    if zipFile:
        try:
            print("\nProcessing ZIP file from frontend...")
            zip_contents = await zipFile.read()
            temp_zip_path = "temp_upload.zip"
            with open(temp_zip_path, "wb") as f:
                f.write(zip_contents)
            print(f"Saved ZIP file to {temp_zip_path}")
            
            print("Sending ZIP file to setup for processing...")
            try:
                from setup import setup
                await setup(temp_zip_path)
                print("Setup processing completed successfully")
                 
              
                
                from retrieve import retrieve_best_matches
                matches = retrieve_best_matches(jobDescription)
                if not matches:
                    return {"error": "No matches found"}
            
                formatted_results = []
                for i, match in enumerate(matches):
                    match_percentage = int((1 - match['distance']) * 100)
                    
                    formatted_results.append({
                        "id": i + 1,
                        "filename": match['path'],
                        "name": match['name'],
                        "email": match['email'],
                        "matchPercentage": match_percentage,
                        "notes": match['notes']
                    })

                return formatted_results

            except Exception as setup_error:
                print(f"Error in setup processing: {str(setup_error)}")
                raise
            finally:
                if os.path.exists(temp_zip_path):
                    os.remove(temp_zip_path)
                    print("Cleaned up temporary zip file")
            
        except Exception as e:
            print(f"Error processing ZIP file: {str(e)}")
            if os.path.exists(temp_zip_path):
                os.remove(temp_zip_path)
            raise

    elif files:
        all_files = []
        for file in files:
            contents = await file.read()
            all_files.append({
                'filename': file.filename,
                'content': contents
            })
            print_file_info(file.filename, len(contents))
            
        mock_results = []
        for i, file in enumerate(all_files):
            name = extract_name_from_filename(file['filename'])
            email = generate_email(name)
            mock_results.append({
                "id": i + 1,
                "filename": file['filename'],
                "name": name,
                "email": email,
                "matchPercentage": 90 - (i * 5),
            })
            
        return mock_results

    raise ValueError("No valid files were provided")

if __name__ == "__main__":
    print("\n" + "="*50)
    print("Starting Resume Analysis Server")
    print("="*50 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)
