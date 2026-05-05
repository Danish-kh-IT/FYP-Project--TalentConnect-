import { useState, useEffect } from "react";
import api from "../api/axios";
import {
  Search,
  MapPin,
  Briefcase,
  Mail,
  Linkedin,
  Github,
} from "lucide-react";

export default function CandidateListingPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      try {
        const response = await api.get("users/candidates/");
        setCandidates(response.data.results || response.data);
      } catch (error) {
        console.error("Failed to fetch candidates", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  const filteredCandidates = candidates.filter(
    (candidate) =>
      candidate.user.username
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (candidate.headline &&
        candidate.headline.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
            Discover Global <span className="text-blue-600">Talent</span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Connect with skilled professionals across various industries. Hire
            the creators, builders, and leaders of tomorrow.
          </p>
        </div>

        <div className="relative max-w-2xl mx-auto mb-16">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-14 pr-6 py-4 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 shadow-xl shadow-blue-500/5 text-gray-900 dark:text-white placeholder-gray-400"
            placeholder="Search candidates by name, role, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-72 bg-gray-200 dark:bg-gray-800 rounded-3xl animate-pulse"
              ></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 p-8 hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 group"
              >
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="h-20 w-20 rounded-full ring-4 ring-blue-50 dark:ring-blue-900/20 bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4 overflow-hidden shadow-inner">
                    {candidate.profile_picture ? (
                      <img
                        src={candidate.profile_picture}
                        alt={candidate.user.username}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{candidate.user.username[0].toUpperCase()}</span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {candidate.user.first_name
                      ? `${candidate.user.first_name} ${candidate.user.last_name}`
                      : candidate.user.username}
                  </h3>
                  <p className="text-sm font-semibold text-primary-600 mt-1 uppercase tracking-wider">
                    {candidate.headline || "Software Professional"}
                  </p>
                </div>

                <div className="space-y-3 mb-8">
                  {candidate.location && (
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{candidate.location}</span>
                    </div>
                  )}
                  {candidate.education_degree && (
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[200px]">
                        {candidate.education_degree}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {candidate.skills_list?.slice(0, 3).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-gray-100 dark:border-gray-600"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-4">
                  <button className="flex-1 px-6 py-3 bg-[#1a1c21] dark:bg-gray-700 text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors shadow-lg active:scale-95">
                    View Profile
                  </button>
                  <div className="flex gap-2">
                    {candidate.linkedin_url && (
                      <a
                        href={candidate.linkedin_url}
                        className="p-3 bg-gray-50 dark:bg-gray-900 text-gray-400 hover:text-blue-600 rounded-xl transition-colors border border-gray-100 dark:border-gray-700"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                    {candidate.github_url && (
                      <a
                        href={candidate.github_url}
                        className="p-3 bg-gray-50 dark:bg-gray-900 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-xl transition-colors border border-gray-100 dark:border-gray-700"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredCandidates.length === 0 && (
          <div className="text-center py-24">
            <p className="text-gray-500">
              No candidates found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
