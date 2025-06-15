import os
import time
from google.auth import default
from google.cloud import storage
from google.cloud import documentai_v1 as documentai
from google.api_core.client_options import ClientOptions
import json
from google.auth import default
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage
import zipfile
import shutil
import glob
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_core.documents import Document
from typing import Dict
import pickle
import asyncio
import re
from dotenv import load_dotenv
import pickle as pkl
load_dotenv()
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "pdf-parser-462617-bc17e6173fef.json"
credentials, project_id = default()

LOCATION = "eu"
processor_id = "dbfb2e7f693d85cc"


# Your Google Cloud Storage bucket name
GCS_BUCKET_NAME = "parsing-bucket"

# Local folder containing your resume PDF files
LOCAL_INPUT_FOLDER = "Resumes"

# GCS folder where input PDFs will be temporarily uploaded for processing
GCS_INPUT_PREFIX = "document_ai_temp_input/resumes/"

# GCS folder where Document AI will put the parsed results (full JSON documents)
GCS_OUTPUT_PREFIX = "document_ai_parsed_output/resumes/"

# Local folder where ONLY the extracted text files will be saved
LOCAL_OUTPUT_TEXT_ONLY_FOLDER = "extracted_texts_local"



# ✅ Groq API key and base URL
groq_api_key = "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"

chat = ChatOpenAI(
    model="gpt-3.5-turbo",   # or "llama3-8b-8192" if you prefer smaller
    temperature=0.7,
)

def extract_zipfile(zipfile_path, zip_out_dir):
    """
    Extract zip file and validate its contents
    """
    print(f"\nExtracting {zipfile_path} to {zip_out_dir}")
    
    # Create the directory if it doesn't exist
    os.makedirs(zip_out_dir, exist_ok=True)
    
    # Check if zip file exists
    if not os.path.exists(zipfile_path):
        raise FileNotFoundError(f"Zip file not found: {zipfile_path}")
    
    # Extract contents
    try:
        with zipfile.ZipFile(zipfile_path, 'r') as zip_ref:
            # List contents before extraction
            file_list = zip_ref.namelist()
            print(f"Archive contents: {file_list}")
            
            pdf_files = [f for f in file_list if f.lower().endswith('.pdf')]
            
            if not pdf_files:
                raise ValueError("No PDF files found in the ZIP archive")
                
            print(f"Found {len(pdf_files)} PDF files in archive: {pdf_files}")
            
            # Extract all files
            zip_ref.extractall(zip_out_dir)
            print(f"Successfully extracted files to {zip_out_dir}")
            
            # Verify extraction by checking all subdirectories
            extracted_pdfs = []
            for root, _, files in os.walk(zip_out_dir):
                for file in files:
                    if file.lower().endswith('.pdf'):
                        extracted_pdfs.append(os.path.join(root, file))
            
            if not extracted_pdfs:
                print(f"Warning: No PDF files found in extracted directory: {zip_out_dir}")
                print(f"Directory contents: {os.listdir(zip_out_dir)}")
                raise ValueError("Failed to extract PDF files from archive")
                
            print(f"Verified {len(extracted_pdfs)} PDF files extracted:")
            for pdf in extracted_pdfs:
                print(f"  - {pdf}")
            
            return zip_out_dir
            
    except zipfile.BadZipFile:
        raise ValueError("Invalid or corrupted ZIP file")
    except Exception as e:
        print(f"Error details: {str(e)}")
        print(f"Current directory contents: {os.listdir(zip_out_dir)}")
        raise ValueError(f"Error extracting ZIP file: {str(e)}")

def move_pdfs(source_dir, destination_dir):
    """
    Move PDF files and validate the move operation
    """
    print(f"\nMoving PDFs from {source_dir} to {destination_dir}")
    
    # Ensure destination folder exists
    os.makedirs(destination_dir, exist_ok=True)
    
    # Get list of PDF files
    pdf_files = []
    for root, _, files in os.walk(source_dir):
        for file in files:
            if file.lower().endswith('.pdf'):
                pdf_files.append(os.path.join(root, file))
    
    if not pdf_files:
        print(f"Warning: No PDF files found in {source_dir}")
        print(f"Directory contents: {os.listdir(source_dir)}")
        raise ValueError(f"No PDF files found in {source_dir}")
    
    print(f"Found {len(pdf_files)} PDF files to move:")
    for pdf in pdf_files:
        print(f"  - {pdf}")
    
    # Move files
    moved_files = []
    for source_file in pdf_files:
        try:
            filename = os.path.basename(source_file)
            destination_file = os.path.join(destination_dir, filename)
            
            # Handle duplicate filenames
            counter = 1
            base, ext = os.path.splitext(filename)
            while os.path.exists(destination_file):
                destination_file = os.path.join(destination_dir, f"{base}_{counter}{ext}")
                counter += 1
            
            shutil.move(source_file, destination_file)
            moved_files.append(destination_file)
            print(f"  Moved: {filename} -> {os.path.basename(destination_file)}")
            
        except Exception as e:
            print(f"Warning: Failed to move {source_file}: {str(e)}")
    
    if not moved_files:
        raise ValueError("Failed to move any PDF files")
    
    print(f"Successfully moved {len(moved_files)} PDF files")
    return moved_files


# ✅ Single resume summarizer
async def summarize_single_resume(chat_model, pdf_path, pdf_text, example):
    pdf_text = pdf_text.strip()

    messages = [
        SystemMessage(content=(
            "You are a technical HR who is given a task to summarize the education, experience, skills, "
            "and everything related to that person, and also extract the email and the name of that person:\n"
        )),
        HumanMessage(content=(
            f"Summarize this resume text:\n{pdf_text}\n\n"
            f"Your output should be structurally similar to the following example:\n{example}\n\n"
            "P.S. Strictly return only the summarization (General Description abd Skills) and the information extracted (Email and Name) as the same way provided in the example. Do not include any introductory line like 'Here is the summary...'."
        ))
    ]

    try:
        response = await chat_model.ainvoke(messages)
        name, email, skills, description = extract_resume_info(response.content)
        return pdf_path, name, email, skills, description
    except Exception as e:
        print(f"❌ Failed to summarize {pdf_path}: {e}")
        return pdf_path, None, None, None, None


async def summarize_pdf_texts_async(pdf_dict, chat_model):
    example = """Name: John Doe
Email: john.doe@example.com

General Description: This candidate is a highly skilled software engineer with 5+ years of experience in full-stack web development. They have worked on large-scale web applications, leading backend and frontend development efforts, and have a strong focus on performance optimization and code quality.

Skills: Python, Django, Flask, JavaScript, React, PostgreSQL, REST APIs, Docker, Git, Agile methodologies
"""

    # Create async tasks
    tasks = [
        summarize_single_resume(chat_model, path, text, example)
        for path, text in pdf_dict.items()
    ]

    # Run all tasks concurrently
    results = await asyncio.gather(*tasks)

    pdf_to_description = {}
    pdf_to_skills = {}
    pdf_to_names = {}
    pdf_to_emails = {}
    
    count = 1

    for pdf_path, name, email, skills, description in results:
        if pdf_path and description and skills and name and email:
            pdf_to_description[pdf_path] = description
            pdf_to_skills[pdf_path] = skills
            pdf_to_names[pdf_path] = name
            pdf_to_emails[pdf_path] = email
            print(f"✅ Processed {count}: {pdf_path}")
        else:
            print(f"⚠️ Skipped: {pdf_path}")
        count += 1
    with open("email_data.pkl", "wb") as f:
        pkl.dump(pdf_to_emails, f)
    with open("name_data.pkl", "wb") as f:
        pkl.dump(pdf_to_names, f)
    return pdf_to_description, pdf_to_skills


    
def build_vector_db(pdf_path_to_text, persist_path):
    # Step 1: Convert dict into LangChain Document objects
    documents = [
        Document(page_content=text, metadata={"pdf_path": path})
        for path, text in pdf_path_to_text.items()
    ]

    # Step 2: Create embeddings
    embedding_model = OpenAIEmbeddings()

    # Step 3: Build FAISS vector store
    vector_db = FAISS.from_documents(documents, embedding_model)

    # Optional: Save FAISS index to disk
    vector_db.save_local(persist_path)

    return vector_db


def load_vector_db(persist_path):
    embedding_model = OpenAIEmbeddings()
    return FAISS.load_local(persist_path, embeddings=embedding_model)

def search_similar_docs(vector_db, query, k=3):
    results = vector_db.similarity_search_with_score(query, k=k)
    return [(doc.metadata['pdf_path'], doc.page_content, score) for doc, score in results]

def load_parsed_text(data_dir):
    parsed_text_dict = {}
    for file_path in glob.glob(data_dir + "/*.txt"):
        key = file_path.split("\\")[1].split("-0")[0] + ".pdf"
        with open(file_path, "r", encoding="utf-8") as f:
            data = f.read()
        parsed_text_dict[key] = data
    with open("text_data.pkl", "wb") as f:
        pkl.dump(parsed_text_dict, f)
    return parsed_text_dict
def extract_resume_info(text):
    # Extract email
    email_match = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text)
    email = email_match.group(0) if email_match else "Not found"
    
    # Extract name — here, as an example, assume name appears at top or near 'Name:'
    name_match = re.search(r"(Name\s*[:\-]\s*)([A-Z][a-z]+ [A-Z][a-z]+)", text)
    if name_match:
        name = name_match.group(2)
    else:
        # fallback — maybe first line is the name
        first_line = text.strip().splitlines()[0]
        name = first_line if len(first_line.split()) <= 4 else "Not found"
    
    # Extract skills — look for "skills" section
    skills_match = re.search(r"skills\s*[:\-]\s*(.+)", text, re.IGNORECASE)
    skills = skills_match.group(1).strip() if skills_match else "Not found"
    
    # Extract general description — look for "general description" section
    desc_match = re.search(r"general description\s*[:\-]\s*(.+)", text, re.IGNORECASE)
    description = desc_match.group(1).strip() if desc_match else "Not found"
    
    return name, email, skills, description

def parse_resumes_batch_for_text_only():
    """
    Process PDF files using Google Cloud Document AI
    """
    print("🚀 Initializing Google Cloud clients...")
    opts = ClientOptions(api_endpoint=f"{LOCATION}-documentai.googleapis.com")
    documentai_client = documentai.DocumentProcessorServiceClient(client_options=opts)
    storage_client = storage.Client(project=project_id)
    bucket = storage_client.bucket(GCS_BUCKET_NAME)

    # Ensure local folders exist to avoid errors
    os.makedirs(LOCAL_INPUT_FOLDER, exist_ok=True)
    os.makedirs(LOCAL_OUTPUT_TEXT_ONLY_FOLDER, exist_ok=True)
    print(f"✅ Ensured local input folder: '{LOCAL_INPUT_FOLDER}'")
    print(f"✅ Ensured local text-only output folder: '{LOCAL_OUTPUT_TEXT_ONLY_FOLDER}'")

    # --- Upload Resumes to GCS ---
    print(f"\n⬆️ Uploading resumes from '{LOCAL_INPUT_FOLDER}' to GCS 'gs://{GCS_BUCKET_NAME}/{GCS_INPUT_PREFIX}'...")
    uploaded_count = 0
    pdf_files_to_upload = [f for f in os.listdir(LOCAL_INPUT_FOLDER) if f.lower().endswith(".pdf")]

    if not pdf_files_to_upload:
        print(f"⚠️ WARNING: No PDF files found in the input folder '{LOCAL_INPUT_FOLDER}'. Please check your path and files.")
        return

    for filename in pdf_files_to_upload:
        local_file_path = os.path.join(LOCAL_INPUT_FOLDER, filename)
        gcs_blob_name = GCS_INPUT_PREFIX + filename
        blob = bucket.blob(gcs_blob_name)
        blob.upload_from_filename(local_file_path)
        uploaded_count += 1
        if uploaded_count % 100 == 0:
            print(f"  Uploaded {uploaded_count} files...")
    print(f"🎉 Finished uploading {uploaded_count} resume PDFs to GCS.")

    # --- Prepare Document AI Batch Request ---
    processor_name = documentai_client.processor_path(project_id, LOCATION, processor_id)
    gcs_input_uri = f"gs://{GCS_BUCKET_NAME}/{GCS_INPUT_PREFIX}"
    gcs_output_uri = f"gs://{GCS_BUCKET_NAME}/{GCS_OUTPUT_PREFIX}"

    input_config = documentai.BatchDocumentsInputConfig(
        gcs_prefix=documentai.GcsPrefix(gcs_uri_prefix=gcs_input_uri)
    )
    output_config = documentai.DocumentOutputConfig(
        gcs_output_config=documentai.DocumentOutputConfig.GcsOutputConfig(gcs_uri=gcs_output_uri)
    )

    request = documentai.BatchProcessRequest(
        name=processor_name,
        input_documents=input_config,
        document_output_config=output_config,
    )

    print(f"\n--- 🚀 Submitting batch processing job for resumes in GCS '{gcs_input_uri}' ---")
    operation = documentai_client.batch_process_documents(request)
    print(f"Batch processing operation started: {operation.operation.name}")
    print("⏳ Waiting for operation to complete. This may take a while for many documents...")

    # --- Wait for Job Completion ---
    try:
        operation.result(timeout=7200)  # 2 hours
        print("✅ Batch processing completed successfully!")
    except Exception as e:
        print(f"❌ Batch processing failed: {e}")
        return

    # --- Download Results from GCS and Extract Text ---
    print(f"\n⬇️ Extracting text from parsed results and saving to '{LOCAL_OUTPUT_TEXT_ONLY_FOLDER}'...")
    extracted_text_count = 0
    blobs = storage_client.list_blobs(GCS_BUCKET_NAME, prefix=GCS_OUTPUT_PREFIX)

    for blob in blobs:
        if blob.name.endswith(".json"):
            try:
                document_json_bytes = blob.download_as_bytes()
                document_json = json.loads(document_json_bytes.decode('utf-8'))

                if "text" in document_json:
                    parts = blob.name.split('/')
                    original_filename_base = None
                    for part in reversed(parts):
                        if part.lower().endswith(".pdf.json"):
                            original_filename_base = part[:-len(".pdf.json")]
                            break
                        elif part.lower().endswith(".json"):
                            original_filename_base = part[:-len(".json")]
                            break

                    if original_filename_base:
                        local_text_file_path = os.path.join(
                            LOCAL_OUTPUT_TEXT_ONLY_FOLDER, original_filename_base + ".txt"
                        )
                        with open(local_text_file_path, "w", encoding="utf-8") as text_f:
                            text_f.write(document_json["text"])
                        extracted_text_count += 1
                    else:
                        print(f"  [WARNING] Could not determine original filename from blob: {blob.name}")
                else:
                    print(f"  [WARNING] 'text' field not found in JSON from blob: {blob.name}")
            except json.JSONDecodeError:
                print(f"  [ERROR] Failed to decode JSON from blob: {blob.name}")
            except Exception as e:
                print(f"  [ERROR] Error processing blob {blob.name}: {e}")

            if extracted_text_count % 100 == 0 and extracted_text_count > 0:
                print(f"  Extracted text for {extracted_text_count} files...")

    print(f"🎉 Finished extracting text for {extracted_text_count} documents.")
    print(f"Text-only results saved in '{LOCAL_OUTPUT_TEXT_ONLY_FOLDER}'.")

async def setup(zipfile_path, zip_out_dir="data", data_dir="Resumes", chat_model=chat):
    """
    Setup function to process uploaded zip files
    """
    try:
        # Check if zip file exists
        if not os.path.exists(zipfile_path):
            raise FileNotFoundError(f"Zip file not found: {zipfile_path}")

        # Extract and move files
        extract_zipfile(zipfile_path, zip_out_dir)
        print("Unzipped the dataset")
        move_pdfs(zip_out_dir, data_dir)
        print("Moved the PDFs")

        # Check if any PDFs were moved
        pdf_files = [f for f in os.listdir(data_dir) if f.lower().endswith('.pdf')]
        if not pdf_files:
            raise ValueError("No PDF files found in the extracted archive")

        # Process PDFs
        parse_resumes_batch_for_text_only()
        pdf_path_to_text_dict = load_parsed_text("extracted_texts_local")
        
        if not pdf_path_to_text_dict:
            raise ValueError("No text content was extracted from PDFs")
            
        print("Got the parsed text")
        
        # Process summaries
        pdf_to_para1, pdf_to_para2 = await summarize_pdf_texts_async(pdf_path_to_text_dict, chat_model)
        
        if not pdf_to_para1 or not pdf_to_para2:
            raise ValueError("Failed to generate summaries from PDFs")
            
        print(f"Processed {len(pdf_to_para1)} documents")
        print("Extracted the skills and general summary")
        
        # Build vector databases only if we have content
        if pdf_to_para1:
            build_vector_db(pdf_to_para1, persist_path="faiss_index_general")
            print("Built general description database")
            
        if pdf_to_para2:
            build_vector_db(pdf_to_para2, persist_path="faiss_index_skills")
            print("Built skills database")
            
        print("Setup completed successfully")
        
    except Exception as e:
        print(f"Error in setup process: {str(e)}")
        raise
    finally:
        # Cleanup temporary files
        if os.path.exists(zipfile_path):
            os.remove(zipfile_path)
        if os.path.exists(zip_out_dir):
            shutil.rmtree(zip_out_dir)

def test_setup():
    """
    Test function to verify setup.py is working correctly
    """
    print("\n" + "="*50)
    print("Testing Setup System")
    print("="*50)
    
    # Test 1: Check if required directories exist
    print("\n1. Checking Required Directories:")
    required_dirs = ["Resumes", "extracted_texts_local"]
    for dir_name in required_dirs:
        if os.path.exists(dir_name):
            print(f"✓ Directory '{dir_name}' exists")
        else:
            print(f"✗ Directory '{dir_name}' not found")
            os.makedirs(dir_name)
            print(f"  → Created directory '{dir_name}'")
    
    # Test 2: Check if required files exist
    print("\n2. Checking Required Files:")
    required_files = ["pdf-parser-462617-bc17e6173fef.json"]
    for file_name in required_files:
        if os.path.exists(file_name):
            print(f"✓ File '{file_name}' exists")
        else:
            print(f"✗ File '{file_name}' not found")
    
    # Test 3: Check if environment variables are loaded
    print("\n3. Checking Environment Variables:")
    if os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
        print("✓ Google credentials path is set")
    else:
        print("✗ Google credentials path is not set")
    
    print("\n" + "="*50)
    print("Setup Test Complete")
    print("="*50 + "\n")

if __name__ == "__main__":
    test_setup()




    
