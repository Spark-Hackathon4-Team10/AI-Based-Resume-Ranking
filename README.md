# AI-Based Resume Ranking System

## Overview
The AI-Based Resume Ranking System is an intelligent tool developed during Spark Hackathon 4 by Team 10. This application automates the resume screening and ranking process using artificial intelligence and natural language processing techniques to match candidate resumes with job descriptions, saving recruiters time and improving hiring efficiency.

## Features
- **Resume Parsing**: Extracts key information from resumes in various formats (PDF, DOCX, etc.)
- **Keyword Analysis**: Identifies relevant skills, qualifications, and experiences from parsed resumes
- **Similarity Matching**: Compares resume content with job descriptions to generate relevance scores
- **Candidate Ranking**: Ranks candidates based on their match scores to the desired position
- **Insights Dashboard**: Provides visual analytics and comparison of top candidates
- **Recommendation Engine**: Suggests improvements for candidates to better match job requirements

## Tech Stack
- **Frontend**: React.js
- **Backend**: Flask/Python
- **NLP Processing**: spaCy, NLTK, Transformers
- **Machine Learning**: scikit-learn
- **Data Storage**: SQLite/PostgreSQL
- **Document Processing**: PyPDF2, python-docx

## Installation

### Prerequisites
- Python 3.8+
- Node.js 14+
- pip
- npm/yarn

### Setup
1. Clone the repository
```bash
git clone https://github.com/Spark-Hackathon4-Team10/AI-Based-Resume-Ranking.git
cd AI-Based-Resume-Ranking
```

2. Set up backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Set up frontend
```bash
cd ../frontend
npm install
```

4. Run the application
```bash
# In the backend directory
python app.py

# In the frontend directory (new terminal)
npm start
```

5. Access the application at `http://localhost:3000`

## Usage
1. **Upload Job Description**: Start by uploading or writing the job description for the position
2. **Upload Resumes**: Upload multiple candidate resumes (PDF, DOCX supported)
3. **View Rankings**: Review the automatically ranked candidates based on relevance scores
4. **Analyze Insights**: Explore detailed candidate comparisons and keyword matching statistics
5. **Export Results**: Download ranking results and analysis in CSV or PDF format

## Project Structure
```
AI-Based-Resume-Ranking/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── models/                # ML model definitions
│   ├── utils/                 # Utility functions
│   │   ├── parser.py          # Resume parsing utilities
│   │   ├── ranking.py         # Ranking algorithm implementation
│   │   └── preprocessor.py    # Text preprocessing functions
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Application pages
│   │   ├── services/          # API service integration
│   │   └── App.js             # Main React application
│   └── package.json           # Node.js dependencies
├── data/                      # Sample data for testing
├── notebooks/                 # Jupyter notebooks for experimentation
└── README.md                  # Project documentation
```

## Future Improvements
- Implement more advanced NLP models (BERT, GPT) for better content understanding
- Add support for more document formats
- Develop custom scoring algorithms for different industry sectors
- Create an API for integration with existing ATS (Applicant Tracking Systems)
- Implement user authentication and role-based access control
- Add multi-language support for international resumes

## Team Members
- You can see them in the organization members for now

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements
- GitHub Spark Hackathon 4 organizers
- All open-source libraries and frameworks used in this project
