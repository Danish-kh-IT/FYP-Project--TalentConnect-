import { useState, useEffect } from "react";
import api from "../api/axios";
import JobCard from "../components/JobCard";
import { Search, Filter, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";

export default function JobListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [selectedExperience, setSelectedExperience] = useState([]);

  // Sync searchQuery state with URL param when URL changes (e.g. Navigating from Company page)
  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        const currentSearch = searchParams.get("search") || searchQuery;
        if (currentSearch) params.append("search", currentSearch);

        selectedJobTypes.forEach((type) => params.append("job_type", type));
        selectedExperience.forEach((exp) =>
          params.append("experience_level", exp),
        );

        const response = await api.get(`jobs/listings/?${params.toString()}`);
        setJobs(response.data.results || response.data);
      } catch (error) {
        console.error("Failed to fetch jobs", error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchJobs();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchParams, searchQuery, selectedJobTypes, selectedExperience]);

  const handleJobTypeChange = (type) => {
    setSelectedJobTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const handleExperienceChange = (level) => {
    setSelectedExperience((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level],
    );
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero-like Search Section */}
        <div className="mb-12 text-center lg:text-left">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
            Find Your <span className="text-primary-600">Dream Job</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto lg:mx-0">
            Discover thousands of job opportunities from top companies around
            the world.
          </p>
          <div className="relative max-w-3xl mx-auto lg:mx-0 shadow-xl sm:shadow-2xl rounded-2xl overflow-hidden bg-white dark:bg-gray-800 ring-1 ring-gray-100 dark:ring-gray-800 focus-within:ring-2 focus-within:ring-primary-500 transition-all duration-300">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 sm:h-6 sm:w-6 text-primary-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 sm:pl-12 pr-24 sm:pr-4 py-4 sm:py-5 bg-transparent border-none outline-none focus:ring-0 focus:outline-none text-base sm:text-lg dark:text-white placeholder-gray-400"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-1.5 right-1.5 flex items-center">
              <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-sm sm:text-base font-bold transition-all shadow-lg active:scale-95">
                Search
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24 bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 space-y-10">
              <div>
                <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-6">
                  Job Type
                </h3>
                <div className="space-y-4">
                  {["Full-time", "Part-time", "Contract", "Internship"].map(
                    (type) => (
                      <label
                        key={type}
                        className="flex items-center group cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="h-5 w-5 text-primary-600 border-gray-300 rounded-lg focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 transition-all cursor-pointer"
                          checked={selectedJobTypes.includes(type)}
                          onChange={() => handleJobTypeChange(type)}
                        />
                        <span className="ml-3 text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-primary-600 transition-colors">
                          {type}
                        </span>
                      </label>
                    ),
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-6">
                  Experience
                </h3>
                <div className="space-y-4">
                  {["Entry Level", "Mid Level", "Senior Level"].map((level) => (
                    <label
                      key={level}
                      className="flex items-center group cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="h-5 w-5 text-primary-600 border-gray-300 rounded-lg focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 transition-all cursor-pointer"
                        checked={selectedExperience.includes(level)}
                        onChange={() => handleExperienceChange(level)}
                      />
                      <span className="ml-3 text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-primary-600 transition-colors">
                        {level}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedJobTypes([]);
                    setSelectedExperience([]);
                  }}
                  className="w-full py-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl text-sm font-bold border border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all font-outfit"
                >
                  Reset All
                </button>
              </div>
            </div>
          </aside>

          {/* Mobile Filter Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm text-sm font-bold text-gray-900 dark:text-white sticky top-4 z-10"
            >
              <Filter className="w-5 h-5 text-primary-500" />
              Filter Opportunities
            </button>
          </div>

          {/* Mobile Filter Overlay */}
          {isMobileFiltersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden overflow-y-auto">
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setIsMobileFiltersOpen(false)}
              ></div>
              <div className="relative min-h-screen flex flex-col w-full max-w-sm ml-auto bg-white dark:bg-gray-800 shadow-2xl animate-slide-in-right">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Filters
                  </h2>
                  <button
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-1 p-6 space-y-10 overflow-y-auto pb-24">
                  <div>
                    <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-6">
                      Job Type
                    </h3>
                    <div className="space-y-4">
                      {["Full-time", "Part-time", "Contract", "Internship"].map(
                        (type) => (
                          <label
                            key={type}
                            className="flex items-center group cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              className="h-5 w-5 text-primary-600 border-gray-300 rounded-lg focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 transition-all cursor-pointer"
                              checked={selectedJobTypes.includes(type)}
                              onChange={() => handleJobTypeChange(type)}
                            />
                            <span className="ml-3 text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-primary-600 transition-colors">
                              {type}
                            </span>
                          </label>
                        ),
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-6">
                      Experience
                    </h3>
                    <div className="space-y-4">
                      {["Entry Level", "Mid Level", "Senior Level"].map(
                        (level) => (
                          <label
                            key={level}
                            className="flex items-center group cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              className="h-5 w-5 text-primary-600 border-gray-300 rounded-lg focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 transition-all cursor-pointer"
                              checked={selectedExperience.includes(level)}
                              onChange={() => handleExperienceChange(level)}
                            />
                            <span className="ml-3 text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-primary-600 transition-colors">
                              {level}
                            </span>
                          </label>
                        ),
                      )}
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedJobTypes([]);
                        setSelectedExperience([]);
                        setIsMobileFiltersOpen(false);
                      }}
                      className="flex-1 py-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl text-sm font-bold border border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all font-outfit"
                    >
                      Reset All
                    </button>
                    <button
                      onClick={() => setIsMobileFiltersOpen(false)}
                      className="flex-1 py-4 bg-primary-600 text-white rounded-2xl text-sm font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/25"
                    >
                      Show Results
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results Grid */}
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                  {jobs.length}
                </span>{" "}
                jobs
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"
                  ></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
                {jobs.length === 0 && (
                  <div className="col-span-full py-12 text-center">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                      <Search className="w-full h-full" />
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                      No jobs found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Try adjusting your search or filters to find what you're
                      looking for.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
