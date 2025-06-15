
import { Card } from "@/components/ui/card";
import { Brain, FileText, Search, CheckCircle } from "lucide-react";

export const AnalysisLoader = () => {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <div className="p-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 absolute top-0"></div>
              <Brain className="h-6 w-6 text-indigo-600 absolute top-5 left-5" />
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-slate-700">
            Analyzing Resumes...
          </h3>
          
          <div className="space-y-3 max-w-md mx-auto">
            <div className="flex items-center text-sm text-slate-600">
              <FileText className="h-4 w-4 mr-2 text-blue-500" />
              Reading and analyzing uploaded files
            </div>
            <div className="flex items-center text-sm text-slate-600">
              <Search className="h-4 w-4 mr-2 text-indigo-500" />
              Comparing skills with job description
            </div>
            <div className="flex items-center text-sm text-slate-600">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              Calculating match scores and ranking results
            </div>
          </div>
          
          <p className="text-blue-600 font-medium">
            Please wait, this may take a few seconds...
          </p>
        </div>
      </div>
    </Card>
  );
};
