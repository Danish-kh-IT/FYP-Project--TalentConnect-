import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  CheckCircle,
  ArrowRight,
  Users,
  Globe,
  Briefcase,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-32 overflow-hidden bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Content Left */}
            <div className="flex-1 text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-10 border border-blue-100 dark:border-blue-800/50">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                Enterprise Grade Solutions
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold text-[#1a1c21] dark:text-white leading-[1.1] mb-8 tracking-[-0.03em]">
                Empower your hiring with <br />
                <span className="text-blue-600">TalentConnect</span>
              </h1>

              <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
                A premium recruitment intelligence platform designed for modern
                enterprises. Streamline workflows, engage top talent, and build
                high-performing teams with our AI-driven matching engine.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-2">
                <Link
                  to={user ? "/jobs" : "/register"}
                  className="px-8 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2 group"
                >
                  Explore Talent{" "}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Visual Right */}
            <div className="flex-1 relative">
              <div className="relative rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500">
                <img
                  src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=2000"
                  alt="Team collaboration"
                  className="w-full aspect-[4/3.5] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Brands Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] mb-12">
            Empowering the world's most innovative teams
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            {[
              "TECHCORP",
              "DATASTREAM",
              "GLOBALNET",
              "PIXELMIND",
              "NEXUSLAB",
            ].map((brand) => (
              <span
                key={brand}
                className="text-2xl font-black text-gray-800 dark:text-white tracking-tighter"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer implementation will be in components/Footer or handled here for demo */}
      <footer className="pt-24 pb-12 border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-gray-100 dark:border-gray-800 gap-6">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
              © {new Date().getFullYear()} TALENTCONNECT GLOBAL. ALL RIGHTS
              RESERVED.
            </p>
            <div className="flex gap-8 text-xs font-black text-gray-400 uppercase tracking-widest">
              <Link to="/" className="hover:text-primary-600 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/" className="hover:text-primary-600 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
