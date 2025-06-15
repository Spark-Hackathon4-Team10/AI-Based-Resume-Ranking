from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage
from dotenv import load_dotenv
import pickle as pkl
load_dotenv()
import re
import pickle as pkl
with open("email_data.pkl", "rb") as f:
    email_data = pkl.load(f)
with open("name_data.pkl", "rb") as f:
    name_data = pkl.load(f)
with open("text_data.pkl", "rb") as f:
    resume_data = pkl.load(f)


def extract_paragraphs(text):
    # Regex patterns to capture Description and Required skills
    description_pattern = r"Description:\s*(.+?)(?=Required skills:|$)"
    skills_pattern = r"Required skills:\s*(.+)"

    # Use re.DOTALL so that '.' matches newlines as well
    description_match = re.search(description_pattern, text, re.DOTALL | re.IGNORECASE)
    skills_match = re.search(skills_pattern, text, re.DOTALL | re.IGNORECASE)

    description = description_match.group(1).strip() if description_match else ""
    required_skills = skills_match.group(1).strip() if skills_match else ""

    # Clean up extra whitespace
    description = re.sub(r"\s+", " ", description)
    required_skills = re.sub(r"\s+", " ", required_skills)

    return description, required_skills


def load_vector_db(persist_path):
    embedding_model = OpenAIEmbeddings()
    return FAISS.load_local(persist_path, embeddings=embedding_model, allow_dangerous_deserialization=True)
description_db = load_vector_db("faiss_index_general")
skills_db = load_vector_db("faiss_index_skills")
chat = ChatOpenAI(
    model="gpt-3.5-turbo",   # or "llama3-8b-8192" if you prefer smaller
    temperature=0.7,
)


def summarize_job_description(job_description):
    example = '''
    Description:  
    The Back End Developer Trainee internship offers a hands-on opportunity to contribute to server-side development for real-world applications. The role focuses on building and maintaining server-side logic, APIs, and databases, writing clean and scalable code in languages like Python, Node.js, or Java. The trainee will assist in integrating front-end elements with server-side systems, work with databases such as MySQL, PostgreSQL, or MongoDB, and participate in testing, debugging, and performance tuning. Documentation of code and backend processes is also part of the role. This is a remote internship for 1–3 months, with mentorship and the potential for a full-time opportunity.
    
    Required skills:  
    Candidates should have a solid understanding of one or more backend programming languages (Python, Node.js, or Java), basic knowledge of RESTful API design and development, and familiarity with relational and/or NoSQL databases. Good problem-solving and analytical skills, as well as the ability to work independently in a remote environment, are essential. Experience with Git, backend frameworks (such as Express.js, Django, or Spring Boot), secure coding practices, authentication and authorization concepts, and exposure to Docker, cloud platforms, or CI/CD pipelines are desirable additional skills.
    '''
    messages = [
            SystemMessage(content=(
                "You are a technical HR who is given a task to summarize a job description and include the technical content (no need to mention anything about the job itself, only summarize the technical responsibilities and like that) and don't mention anything about the position or anything about the duration of the job"
            )),
            HumanMessage(content=(
                f"Summarize this resume text:\n{job_description}\n\n"
                f"Your output should be structurally similar to the following example:\n{example}\n\n"
                "P.S. Strictly return only the summarization (General Description abd Skills) as the same way provided in the example. Do not include any introductory line like 'Here is the summary...'."
            ))
        ]
    response = chat.invoke(messages)
    
    desc, skills = extract_paragraphs(response.content)
    return desc, skills


def query_vector_dbs(description_db, skills_db, desc_query, skills_query, k=5):
    """
    Query both description and skills vector DBs, combine scores with weights, and sort.
    """
    # Get top-k results from both
    desc_results = description_db.similarity_search_with_score(desc_query, k=k)
    skills_results = skills_db.similarity_search_with_score(skills_query, k=k)

    # Convert to dict {path: score}
    desc_dict = {doc.metadata["pdf_path"]:  score for doc, score in desc_results}
    skills_dict = {doc.metadata["pdf_path"]:  score for doc, score in skills_results}

    # Merge all unique paths
    all_paths = set(desc_dict.keys()).union(set(skills_dict.keys()))

    # Compute combined weighted score
    combined_results = []
    for path in all_paths:
        desc_score = desc_dict.get(path, 0.0)
        skills_score = skills_dict.get(path, 0.0)
        combined_score = (0.65 * desc_score) + (0.35 * skills_score)
        combined_results.append((path, combined_score))

    # Sort by combined score descending
    combined_results.sort(key=lambda x: x[1])

    return combined_results

def retrieve_best_matches(job_description, k=10, resume_data=resume_data, email_data=email_data, name_data=name_data):
    desc, skills = summarize_job_description(job_description)
    # Query, combine, and sort
    combined_ranked_results = query_vector_dbs(description_db, skills_db, desc, skills, k)
    system_message = SystemMessage(content=("You are a technical HR who is given a task to explain why is a given person is good for job (given its description)"))
    
            
    result_list = []
    # Display results
    for path, score in combined_ranked_results:
        human_message = HumanMessage(content=(f"""Please tell me why this person: \n{resume_data[path]}\n\n is a good match for this job: \n{job_description}\nAnd if the person was not a good match please alert and tell my why too.\nDon't make the output more than 4 lines"""
            ))
        response = chat.invoke([system_message, human_message])
        
        result_list.append({"path": path, "email": email_data[path], "name": name_data[path], "distance": float(score), "notes": response.content})
    return result_list




