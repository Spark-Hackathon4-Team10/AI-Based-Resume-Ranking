
import { Link, useLocation } from "react-router-dom";
import { FileText } from "lucide-react";

export const Navbar = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <FileText className="h-8 w-8 text-indigo-400" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
              Resume Ranker
            </h1>
          </Link>
          
          <ul className="flex gap-8 text-lg">
            <li>
              <Link 
                to="/" 
                className={`hover:text-indigo-400 transition-colors pb-1 border-b-2 ${
                  isActive('/') ? 'border-indigo-400 text-indigo-400' : 'border-transparent'
                }`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/about" 
                className={`hover:text-indigo-400 transition-colors pb-1 border-b-2 ${
                  isActive('/about') ? 'border-indigo-400 text-indigo-400' : 'border-transparent'
                }`}
              >
                About
              </Link>
            </li>
            <li>
              <Link 
                to="/contact" 
                className={`hover:text-indigo-400 transition-colors pb-1 border-b-2 ${
                  isActive('/contact') ? 'border-indigo-400 text-indigo-400' : 'border-transparent'
                }`}
              >
                Team
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
