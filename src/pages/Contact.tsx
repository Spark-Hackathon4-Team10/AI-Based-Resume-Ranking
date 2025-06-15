import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, Github, Linkedin, Code, Database, Palette } from "lucide-react";
import { motion } from "framer-motion";

const Contact = () => {
  const team = [
     {
      name: "Baraa al-sedih",
      role: "Co-mentor",
      photo: "/public/1738871358378.jpg",
      skills: [ "Backend", "Data Science" ,"AI" , "Machine learning"],
      description: "Specialist in developing interactive user interfaces and modern design",
      icon: <Palette className="h-6 w-6 text-pink-600" />,
      linkedin: "https://www.linkedin.com/in/bara-alsedih/"
    },
   
    {
      name: "Fatima Rajab",
      role: "Frontend Developer",
      photo: "/public/fatimaAhmad.jpg",
      skills: ["React", "TypeScript", "Tailwind CSS", "UI/UX"],
      description: "Specialist in developing interactive user interfaces and modern design",
      icon: <Palette className="h-6 w-6 text-pink-600" />,
      linkedin: "https://www.linkedin.com/in/fatima-rajab-497972275/"
    }, {
      name: "Haneen Habash",
      role: "Data Analyst",
      photo: "/public/haneen habash.png",
      skills: ["Python", "Data Analysis", "SQL", "Statistics"],
      description: "Specialist in data analysis and algorithm development",
      icon: <Database className="h-6 w-6 text-green-600" />,
      linkedin: "https://www.linkedin.com/in/haneen-habash-26b226282/"
    },
    {
      name: "Bayan LuLu",
      role: "Frontend Developer",
      photo: "/public/bayan_lulu.jpeg",
      skills: ["React", "TypeScript", "Tailwind CSS", "UI/UX"],
      description: "Specialist in developing interactive user interfaces and modern design",
      icon: <Palette className="h-6 w-6 text-pink-600" />,
      linkedin: "https://www.linkedin.com/in/bayan-lulu/"
    },{
      name: "Diaa Tahboub",
      role: "Machine Learning",
      photo: "/public/picture (1).jpg",
      skills: ["Python", "Machine Learning", "NLP", "BERT"],
      description: "Expert in natural language processing models and artificial intelligence",
      icon: <Code className="h-6 w-6 text-blue-600" />,
      linkedin: "https://www.linkedin.com/in/diaeddintahboub/"
    },
    {
      name: "AbedElAziz Kharobi",
      role: "Machine Learning",
      photo: "/public/1740005634311.jpg",
      skills: ["Python", "Machine Learning", "NLP", "BERT"],
      description: "Expert in natural language processing models and artificial intelligence",
      icon: <Code className="h-6 w-6 text-blue-600" />,
      linkedin: "https://www.linkedin.com/in/abedelaziz-kharobi"
    },
    {
      name: "Momen Shtayeh",
      role: "Machine Learning",
      photo: "/public/1732162771397.jpg",
      skills: ["Python", "Machine Learning", "NLP", "BERT"],
      description: "Expert in natural language processing models and artificial intelligence",
      icon: <Code className="h-6 w-6 text-blue-600" />,
      linkedin: "https://www.linkedin.com/in/momenshtayeh"
    },
    
   
    {
      name: "Nadeen Shabayeh",
      role: "Data Analyst",
      photo: "/public/101283262.jpg",
      skills: ["Python", "Data Analysis", "SQL", "Statistics"],
      description: "Expert in developing backend systems and managing databases",
      icon: <Code className="h-6 w-6 text-purple-600" />,
      linkedin: "https://www.linkedin.com/in/nadeenshabayeh"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-4">
            👥 Development Team
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Meet the creative team behind Resume Ranker project
          </p>
        </motion.div>

        {/* Team Members */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {team.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-8 text-center">
                  <div className="relative mb-6">
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-indigo-200 shadow-lg cursor-pointer"
                      onClick={() => window.open(member.linkedin, "_blank")}
                    />
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-2 shadow-lg cursor-pointer"
                      onClick={() => window.open(member.linkedin, "_blank")}
                    >
                      {member.icon}
                    </div>
                  </div>

                  <h3
                    className="text-xl font-bold text-slate-700 mb-2 cursor-pointer"
                    onClick={() => window.open(member.linkedin, "_blank")}
                  >
                    {member.name}
                  </h3>
                  <p className="text-indigo-600 font-semibold mb-4">
                    {member.role}
                  </p>
                  <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                    {member.description}
                  </p>

                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {member.skills.map((skill, skillIndex) => (
                      <Badge
                        key={skillIndex}
                        variant="secondary"
                        className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-2 text-indigo-600 hover:underline justify-center"
                  >
                    <Linkedin className="h-5 w-5 mr-1" />
                    LinkedIn Profile
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-slate-100 to-blue-50">
              <CardTitle className="text-2xl text-slate-700 flex items-center">
                <Mail className="mr-3 h-6 w-6 text-indigo-600" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 text-center">
              <p className="text-slate-600 text-lg mb-6">
                Have questions about the project or want to collaborate with us?
              </p>
              <div className="flex justify-center space-x-6">
               
                <div className="flex items-center bg-gray-50 px-4 py-2 rounded-lg">
                  <Github className="h-5 w-5 text-gray-600 mr-2" />
                  <span className="text-slate-700">
                    <a href="https://github.com/Spark-Hackathon4-Team10">https://github.com/Spark-Hackathon4-Team10</a>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
