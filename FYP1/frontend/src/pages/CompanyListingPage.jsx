import { useState, useEffect } from "react";
import api from "../api/axios";
import { Search, MapPin, Globe, Users } from "lucide-react";
import { Link } from "react-router-dom";

import { useNavigate } from "react-router-dom";

export default function CompanyListingPage() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const response = await api.get("companies/");
        setCompanies(response.data.results || response.data);
      } catch (error) {
        console.error("Failed to fetch companies", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
            Top Companies <span className="text-blue-600">Hiring Now</span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Explore and connect with leading organizations. Find the right
            culture and team for your next career move.
          </p>
        </div>

        <div className="relative max-w-2xl mx-auto mb-16 px-4 sm:px-0">
          <div className="absolute inset-y-0 left-0 pl-4 sm:pl-8 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 sm:pl-16 pr-6 py-4 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 shadow-xl shadow-blue-500/5 text-gray-900 dark:text-white placeholder-gray-400"
            placeholder="Search companies by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl animate-pulse"
              ></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCompanies.map((company) => (
              <div
                key={company.id}
                className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 p-8 hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 group"
              >
                <div className="flex items-center gap-6 mb-8">
                  {company.logo ? (
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="w-16 h-16 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-2xl font-black text-blue-600 dark:text-blue-400 uppercase italic">
                      {company.name[0]}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      {company.name}
                    </h3>
                    <p className="text-sm font-semibold text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-wider">
                      {company.industry_name || "Enterprise"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {company.location && (
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 text-gray-300" />
                      <span>{company.location}</span>
                    </div>
                  )}
                  {company.company_size_name && (
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4 text-gray-300" />
                      <span>{company.company_size_name} Employees</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => navigate(`/jobs?search=${company.name}`)}
                      className="flex-1 px-6 py-3 bg-[#1a1c21] dark:bg-gray-700 text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors shadow-lg active:scale-95"
                    >
                      View Jobs
                    </button>
                    <button
                      onClick={() => navigate(`/companies/${company.id}`)}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg active:scale-95"
                    >
                      View Profile
                    </button>
                  </div>
                  {company.website && (
                    <a
                      href={
                        company.website.startsWith("http")
                          ? company.website
                          : `https://${company.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-gray-50 dark:bg-gray-900 text-gray-400 hover:text-blue-600 rounded-xl text-xs font-bold transition-colors border border-gray-100 dark:border-gray-700 flex items-center justify-center gap-2"
                    >
                      <Globe className="w-4 h-4" /> Visit Website
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredCompanies.length === 0 && (
          <div className="text-center py-24">
            <p className="text-gray-500">
              No companies found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
