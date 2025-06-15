import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/FileUpload";
import { AnalysisLoader } from "@/components/AnalysisLoader";
import { Upload, FileText, Brain } from "lucide-react";
import { motion } from "framer-motion";

const Index = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [offsetY, setOffsetY] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => setOffsetY(window.pageYOffset);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Error",
        description: "Please enter a job description",
        variant: "destructive",
      });
      return;
    }

    if (uploadedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please upload at least one file",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("jobDescription", jobDescription);
      
      // Handle both PDF and ZIP files
      uploadedFiles.forEach((file) => {
        if (file.type === 'application/zip' || file.name.toLowerCase().endsWith('.zip')) {
          formData.append("zipFile", file);
        } else {
          formData.append("files", file);
        }
      });

      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to analyze resumes");
      }

      const results = await response.json();
      localStorage.setItem("analysisResults", JSON.stringify(results));
      localStorage.setItem("jobDescription", jobDescription);

      setIsAnalyzing(false);
      navigate("/results");
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message || "Analysis failed",
        variant: "destructive",
      });
      setIsAnalyzing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
    >
      {/* Parallax Background */}
     

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-3 rounded-full mr-4">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Resume Analysis
            </h1>
          </div>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            AI-Powered Resume Ranking System
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-slate-100 to-blue-50 rounded-t-lg">
                <CardTitle className="text-2xl text-slate-700 flex items-center">
                  <Brain className="mr-3 h-6 w-6 text-indigo-600" />
                  Resume Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {/* Job Description */}
                <div className="space-y-3">
                  <label className="text-lg font-semibold text-slate-700 block">
                    Job Description
                  </label>
                  <Textarea
                    placeholder="Enter the job description here... Example: Looking for a Frontend developer with experience in React and JavaScript..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-32 text-base border-2 border-slate-200 focus:border-indigo-400 transition-colors resize-none"
                    disabled={isAnalyzing}
                  />
                </div>

                {/* File Upload */}
                <div className="space-y-3">
                  <label className="text-lg font-semibold text-slate-700 block">
                    Upload Resumes (PDF)
                  </label>
                  <FileUpload
                    files={uploadedFiles}
                    onFilesChange={setUploadedFiles}
                    disabled={isAnalyzing}
                  />
                </div>

                {/* Analyze Button */}
                <div className="pt-4">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Analyzing...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center ">
                        Analyze Resumes
                      </div>
                    )}
                  </motion.button>
                </div>

                {/* Analysis Loader */}
                {isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AnalysisLoader />
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Index;
