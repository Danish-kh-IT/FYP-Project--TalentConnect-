import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import {
  Briefcase,
  Edit3,
  Eye,
  Trash2,
  PauseCircle,
  PlayCircle,
  Users,
  Search,
  Plus,
  Loader2,
  MoreVertical,
  ChevronRight,
  TrendingUp,
  MapPin,
  Clock,
  ArrowUpRight,
} from "lucide-react";

export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get("jobs/listings/");
      // Ideally backend would have a filter for 'my_jobs'
      // For now we assume we get them all and filter or backend handles it.
      setJobs(response.data.results || response.data);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (jobId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "closed" : "active";
    try {
      await api.patch(`jobs/listings/${jobId}/`, { status: newStatus });
      setJobs(
        jobs.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j)),
      );
    } catch (err) {
      console.error("Failed to update job status", err);
      alert("Failed to update job status");
    }
  };

  const handleDelete = async (jobId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this job listing? This action cannot be undone.",
      )
    )
      return;
    try {
      await api.delete(`jobs/listings/${jobId}/`);
      setJobs(jobs.filter((j) => j.id !== jobId));
    } catch (err) {
      console.error("Failed to delete job", err);
      alert("Failed to delete job");
    }
  };

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 transition-colors duration-300 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Manage <span className="text-primary-600">Company Jobs</span>
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
              Control your job listings and track application performance.
            </p>
          </div>
          <Link
            to="/post-job"
            className="px-8 py-4 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-700 transition-all shadow-xl shadow-primary-500/30 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Create New Listing
          </Link>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <Search className="w-6 h-6 text-gray-400 ml-2" />
          <input
            type="text"
            placeholder="Search your job listings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none focus:ring-0 text-lg font-medium dark:text-white"
          />
        </div>

        {/* Jobs List */}
        <div className="grid grid-cols-1 gap-6">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                className="group bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl hover:border-primary-100 dark:hover:border-primary-900/30 transition-all duration-300"
              >
                <div className="p-8 flex flex-col lg:flex-row lg:items-center gap-8 text-left">
                  {/* Job Identity */}
                  <div className="flex-1 flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 font-black text-2xl">
                      {job.title[0]}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm font-bold text-gray-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />{" "}
                          {job.location?.city || "Remote"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />{" "}
                          {new Date(job.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-8 px-8 border-l border-gray-50 dark:border-gray-700">
                    <div className="text-center">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                        Applicants
                      </p>
                      <p className="text-2xl font-black text-gray-900 dark:text-white">
                        {job.applications_count || 0}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                        Status
                      </p>
                      <span
                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${job.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                      >
                        {job.status}
                      </span>
                    </div>
                    <div className="hidden md:block text-center">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                        Views
                      </p>
                      <p className="text-2xl font-black text-gray-900 dark:text-white">
                        {job.views_count || 0}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 lg:border-l lg:pl-8 border-gray-50 dark:border-gray-700">
                    <button
                      onClick={() => handleStatusToggle(job.id, job.status)}
                      className={`p-3 rounded-2xl transition-all ${job.status === "active" ? "bg-orange-50 text-orange-600 hover:bg-orange-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`}
                      title={
                        job.status === "active"
                          ? "Pause Listing"
                          : "Active Listing"
                      }
                    >
                      {job.status === "active" ? (
                        <PauseCircle className="w-6 h-6" />
                      ) : (
                        <PlayCircle className="w-6 h-6" />
                      )}
                    </button>
                    <Link
                      to={`/edit-job/${job.id}`}
                      className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-all"
                    >
                      <Edit3 className="w-6 h-6" />
                    </Link>
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                    <Link
                      to={`/jobs/${job.id}`}
                      className="p-3 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl hover:bg-gray-100 transition-all"
                    >
                      <ArrowUpRight className="w-6 h-6" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                No active listings
              </h3>
              <p className="text-gray-500 mt-2">
                Start hiring by creating your first job post.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
