import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FileText, Download, ArrowLeft, Filter, SortAsc, SortDesc, Mail, User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface AnalysisResult {
  id: number;
  filename: string;
  email: string;
  name: string;
  matchPercentage: number;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-green-600";
  if (score >= 50) return "text-yellow-600";
  return "text-red-600";
};

const getScoreBackground = (score: number) => {
  if (score >= 80) return "bg-green-100";
  if (score >= 50) return "bg-yellow-100";
  return "bg-red-100";
};

const Results = () => {
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<AnalysisResult[]>([]);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [minScore, setMinScore] = useState<number>(0);
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedResults = localStorage.getItem("analysisResults");
    const savedJobDescription = localStorage.getItem("jobDescription");

    if (savedResults) {
      const parsedResults = JSON.parse(savedResults);
      parsedResults.sort((a: AnalysisResult, b: AnalysisResult) => b.matchPercentage - a.matchPercentage);
      setResults(parsedResults);
      setFilteredResults(parsedResults);
      if (parsedResults.length > 0) {
        setSelectedResult(parsedResults[0]);
      }
    }

    if (savedJobDescription) {
      setJobDescription(savedJobDescription);
    }
  }, []);

  const handleSort = () => {
    const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newOrder);
    const sorted = [...filteredResults].sort((a, b) => {
      return newOrder === 'desc' 
        ? b.matchPercentage - a.matchPercentage 
        : a.matchPercentage - b.matchPercentage;
    });
    setFilteredResults(sorted);
  };

  const handleFilter = (value: string) => {
    const score = parseInt(value);
    setMinScore(score);
    const filtered = results.filter(result => result.matchPercentage >= score);
    setFilteredResults(filtered);
  };

  const handleBack = () => {
    navigate("/");
  };

  const handleNotesChange = (notes: string) => {
    if (selectedResult) {
      const updatedResult = { ...selectedResult, notes };
      setSelectedResult(updatedResult);
      // Update in the results array
      const updatedResults = results.map(r => 
        r.id === selectedResult.id ? updatedResult : r
      );
      setResults(updatedResults);
      setFilteredResults(updatedResults);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8"
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
          <h1 className="text-4xl font-bold text-indigo-700 mb-2">Analysis Results</h1>
          <p className="text-lg text-slate-700 max-w-3xl mx-auto">
            Job Description: <span className="font-semibold">{jobDescription}</span>
          </p>
          </motion.div>
        </div>

        {/* Results Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-slate-700">Total Resumes Analyzed</h2>
                  <p className="text-3xl font-bold text-indigo-600">{results.length}</p>
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-semibold text-slate-700">Best Match</h2>
                  <p className="text-3xl font-bold text-green-600">
                    {results.length > 0 ? `${results[0].matchPercentage.toFixed(1)}%` : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters and Sort */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-4xl mx-auto mb-6"
        >
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-indigo-600" />
                    <span className="text-sm font-medium text-slate-700">Minimum Score:</span>
                    <Select onValueChange={handleFilter} defaultValue="0">
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Select score" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">All</SelectItem>
                        <SelectItem value="50">50%+</SelectItem>
                        <SelectItem value="70">70%+</SelectItem>
                        <SelectItem value="80">80%+</SelectItem>
                        <SelectItem value="90">90%+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  onClick={handleSort}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {sortOrder === 'desc' ? (
                    <SortDesc className="h-4 w-4" />
                  ) : (
                    <SortAsc className="h-4 w-4" />
                  )}
                  Sort by Score
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Results List */}
          <div className="lg:col-span-2 space-y-6">
            {filteredResults.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-slate-600 text-lg"
              >
                No results match your criteria.
              </motion.p>
            ) : (
              filteredResults.map((result, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                >
                  <Card 
                    className={`bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer ${
                      selectedResult?.id === result.id ? 'ring-2 ring-indigo-500' : ''
                    }`}
                    onClick={() => setSelectedResult(result)}
                  >
                    <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-lg px-6 py-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-full ${getScoreBackground(result.matchPercentage)}`}>
                            <User className={`h-8 w-8 ${getScoreColor(result.matchPercentage)}`} />
                          </div>
                          <div className="space-y-1">
                            <CardTitle className="text-2xl font-bold text-slate-800">
                              {result.name}
                            </CardTitle>
                            <div className="flex items-center text-slate-600">
                              <Mail className="h-5 w-5 mr-2 text-indigo-500" />
                              <span className="text-base">{result.email}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <div className={`text-3xl font-bold ${getScoreColor(result.matchPercentage)}`}>
                            {result.matchPercentage.toFixed(1)}%
                          </div>
                          <div className="text-sm text-slate-500">
                            Match Score
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex justify-end">
                        <Button
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg shadow-sm transition-all duration-300 flex items-center hover:scale-105"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`/uploads/${result.filename}`, '_blank');
                          }}
                        >
                          <Download className="h-5 w-5 mr-2" />
                          Download CV
                        </Button>
                  </div>
                </CardContent>
              </Card>
                </motion.div>
            ))
          )}
        </div>

          {/* Notes Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg sticky top-6">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-lg">
                <CardTitle className="text-2xl font-bold text-slate-800 flex items-center">
                  <FileText className="h-6 w-6 mr-2 text-indigo-600" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {selectedResult ? (
                  <div className="space-y-6">
                    <div className="p-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                      <h3 className="font-bold text-lg text-slate-800 mb-4">Selected Candidate</h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <User className="h-5 w-5 mr-2 text-indigo-600" />
                          <span className="text-slate-700 font-medium">{selectedResult.name}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-5 w-5 mr-2 text-indigo-600" />
                          <span className="text-slate-600">{selectedResult.email}</span>
                        </div>
                        <div className="flex items-center">
                          <div className={`h-5 w-5 mr-2 ${getScoreColor(selectedResult.matchPercentage)}`}>
                            <svg viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z"/>
                            </svg>
                          </div>
                          <span className={`font-semibold ${getScoreColor(selectedResult.matchPercentage)}`}>
                            Match Score: {selectedResult.matchPercentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <Textarea
                      placeholder="Add your notes about this candidate..."
                      value={selectedResult.notes || ''}
                      onChange={(e) => handleNotesChange(e.target.value)}
                      className="min-h-[200px] text-base border-2 border-slate-200 focus:border-indigo-400 transition-colors resize-none"
                    />
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-slate-50 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                      <FileText className="h-8 w-8 text-slate-400 mx-auto" />
                    </div>
                    <p className="text-slate-500 text-lg">
                      Select a candidate to add notes
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 max-w-4xl mx-auto text-center"
        >
          <Button
            onClick={handleBack}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-lg shadow-md transition-colors duration-300 flex items-center mx-auto"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Upload
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Results;
