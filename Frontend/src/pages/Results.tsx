import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface AnalysisResult {
  id: number;
  filename: string;
  matchPercentage: number;
  matchingSkills: string[];
  languages: string[];
}

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-green-600";
  if (score >= 50) return "text-yellow-600";
  return "text-red-600";
};

const Results = () => {
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [jobDescription, setJobDescription] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const savedResults = localStorage.getItem("analysisResults");
    const savedJobDescription = localStorage.getItem("jobDescription");

    if (savedResults) {
      setResults(JSON.parse(savedResults));
    }

    if (savedJobDescription) {
      setJobDescription(savedJobDescription);
    }
  }, []);

  const handleBack = () => {
    navigate("/");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-indigo-700 mb-2">Analysis Results</h1>
          <p className="text-lg text-slate-700 max-w-3xl mx-auto">
            Job Description: <span className="font-semibold">{jobDescription}</span>
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {results.length === 0 ? (
            <p className="text-center text-slate-600">No results available.</p>
          ) : (
            results.map((result, idx) => (
              <Card
                key={idx}
                className="bg-white/90 backdrop-blur-sm border-0 shadow-lg cursor-pointer hover:shadow-2xl transition-shadow duration-300 rounded-lg"
              >
                <CardHeader className="bg-gradient-to-r from-indigo-100 to-blue-100 rounded-t-lg px-6 py-4">
                  <CardTitle className="text-xl font-semibold text-indigo-700 flex justify-between items-center">
                    <span>{result.filename}</span>
                    <span className={`${getScoreColor(result.matchPercentage)} font-bold text-lg`}>
                      {result.matchPercentage.toFixed(2)}%
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 py-4 text-slate-800 space-y-3">
                  <p>
                    <span className="font-semibold text-indigo-600 mr-2">⚡ Skills matched:</span>
                    {result.matchingSkills.length > 0 ? result.matchingSkills.join(", ") : "None"}
                  </p>
                  <p>
                    <span className="font-semibold text-indigo-600 mr-2">🌐 Languages:</span>
                    {result.languages.length > 0 ? result.languages.join(", ") : "None"}
                  </p>
                  <div className="mt-3">
                    <a
                      href={`/uploads/${result.filename}`}
                      download
                      className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-md shadow-sm transition-colors duration-300"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download CV
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="mt-16 max-w-4xl mx-auto text-center">
          <Button
            onClick={handleBack}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-lg shadow-md transition-colors duration-300"
          >
            Back to Upload
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default Results;
