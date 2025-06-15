import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, FileText, Search, Target, Zap, Users } from "lucide-react";
import { motion } from "framer-motion";

const About = () => {
  const features = [
    {
      icon: <Brain className="h-8 w-8 text-indigo-600" />,
      title: "Artificial Intelligence",
      description: "Using Natural Language Processing and BERT models to analyze resumes"
    },
    {
      icon: <Search className="h-8 w-8 text-blue-600" />,
      title: "Accurate Analysis",
      description: "Precise matching of skills and experience with job requirements"
    },
    {
      icon: <Target className="h-8 w-8 text-green-600" />,
      title: "Smart Ranking",
      description: "Ranking candidates by match percentage from highest to lowest"
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: "Fast Results",
      description: "Quick and efficient analysis of dozens of resumes in seconds"
    }
  ];

  const technologies = [
    { name: "React", description: "Interactive user interface" },
    { name: "Tailwind CSS", description: "User interface design" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-4">
            About Resume Ranker Project
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            An intelligent system for classifying and ranking resumes using artificial intelligence and natural language processing
          </p>
        </motion.div>

        {/* Project Description */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card className="mb-12 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-slate-100 to-blue-50">
              <CardTitle className="text-2xl text-slate-700 flex items-center">
                <FileText className="mr-3 h-6 w-6 text-indigo-600" />
                Project Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6 text-slate-700 text-lg leading-relaxed">
                <p>
                  <strong>Resume Ranker</strong> is an innovative web application that uses advanced artificial intelligence techniques to help HR specialists and recruiters analyze and rank resumes accurately and efficiently.
                </p>
                <p>
                  The application relies on Natural Language Processing (NLP) models and text similarity algorithms to compare resumes with the required job description, then calculates the match percentage for each candidate and ranks them from highest to lowest.
                </p>
                <p>
                  The system features an easy-to-use interface in English, with the ability to upload multiple PDF files and display results in a detailed and organized manner.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-center text-slate-700 mb-8">
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Technologies */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-slate-100 to-blue-50">
              <CardTitle className="text-2xl text-slate-700 flex items-center">
                <Users className="mr-3 h-6 w-6 text-indigo-600" />
                Technologies Used
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {technologies.map((tech, index) => (
                  <div key={index} className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
                    <h4 className="font-semibold text-indigo-700 text-lg mb-2">
                      {tech.name}
                    </h4>
                    <p className="text-slate-600 text-sm">
                      {tech.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
