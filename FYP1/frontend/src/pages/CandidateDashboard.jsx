import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import {
  Briefcase,
  MapPin,
  Clock,
  CheckCircle,
  ChevronRight,
  User,
  MessageSquare,
  Search,
  TrendingUp,
  ExternalLink,
  ArrowUpRight,
  Users,
  Calendar,
} from "lucide-react";

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, appRes] = await Promise.all([
          api.get("users/profile/"),
          api.get("applications/"),
        ]);
        setProfile(profileRes.data[0] || profileRes.data);
        setApplications(appRes.data.results || appRes.data);
      } catch (err) {
        console.error("Dashboard data fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusColor = (status) => {
    const map = {
      applied:
        "text-blue-700 bg-blue-50 border-blue-200/50 shadow-blue-500/10 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
      under_review:
        "text-yellow-700 bg-yellow-50 border-yellow-200/50 shadow-yellow-500/10 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
      shortlisted:
        "text-indigo-700 bg-indigo-50 border-indigo-200/50 shadow-indigo-500/10 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800",
      interview_scheduled:
        "text-purple-700 bg-purple-50 border-purple-200/50 shadow-purple-500/10 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
      selected:
        "text-green-700 bg-green-50 border-green-200/50 shadow-green-500/10 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
      rejected:
        "text-red-700 bg-red-50 border-red-200/50 shadow-red-500/10 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
    };
    return (
      map[status] ||
      "text-gray-700 bg-gray-50 border-gray-200/50 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800"
    );
  };

  const calculateProfileCompletion = () => {
    if (!profile) return 0;
    let score = 0;
    if (profile.bio) score += 20;
    if (profile.skills) score += 20;
    if (profile.education_degree) score += 20;
    if (profile.resume) score += 20;
    if (profile.profile_picture) score += 20;
    return score;
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <TrendingUp className="w-12 h-12 text-primary-600 animate-pulse" />
      </div>
    );

  const activePipelineCount = applications.filter((a) =>
    ["applied", "shortlisted", "under_review", "interview_scheduled"].includes(
      a.status,
    ),
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Welcome back,{" "}
              <span className="text-primary-600">
                {user?.first_name || "Candidate"}
              </span>
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400 text-lg">
              Here's what's happening with your job search today.
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              to="/jobs"
              className="px-6 py-3 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/30 flex items-center gap-2"
            >
              <Search className="w-5 h-5" /> Find Jobs
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <StatCard
                icon={<Briefcase />}
                label="Total Applications"
                value={applications.length}
                trend="Activity: Active"
                color="from-blue-500 to-blue-600"
              />
              <StatCard
                icon={<TrendingUp />}
                label="Active Pipeline"
                value={activePipelineCount}
                trend="Keep searching!"
                color="from-indigo-500 to-indigo-600"
              />
            </div>

            {/* Application Tracker */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 sticky top-0 z-10">
                <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary-500" />{" "}
                  Application Status Tracker
                </h3>
                <Link
                  to="/applications"
                  className="text-primary-600 text-sm font-bold flex items-center gap-1 hover:underline uppercase tracking-widest"
                >
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-3 h-3" />
                          <span>Job Detail</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          <span>Applied Date</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                    {applications.length > 0 ? (
                      applications.slice(0, 5).map((app) => (
                        <tr
                          key={app.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold shrink-0">
                                <Briefcase className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-gray-900 dark:text-white truncate">
                                  {app.job_title}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {app.company_name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-sm font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {new Date(app.applied_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            {(() => {
                              const labels = {
                                applied: "APPLIED",
                                under_review: "UNDER REVIEW",
                                shortlisted: "SHORTLISTED",
                                interview_scheduled: "INTERVIEWING",
                                selected: "HIRED",
                                rejected: "REJECTED",
                              };
                              return (
                                <span
                                  className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg whitespace-nowrap border shadow-sm transition-all ${getStatusColor(app.status)}`}
                                >
                                  {labels[app.status] ||
                                    app.status.replace("_", " ")}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {["shortlisted", "interview_scheduled"].includes(
                                app.status,
                              ) && (
                                <Link
                                  to="/chat"
                                  className="p-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-xl hover:scale-110 transition-transform"
                                >
                                  <MessageSquare className="w-5 h-5" />
                                </Link>
                              )}
                              <Link
                                to={`/jobs/${app.job?.id || app.job}`}
                                className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                              >
                                <ArrowUpRight className="w-5 h-5" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-8 py-10 text-center text-gray-500 italic"
                        >
                          No applications yet. Start your journey by applying to
                          some jobs!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <Link
                  to="/profile"
                  className="text-gray-400 hover:text-primary-600 transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                </Link>
              </div>
              <div className="relative inline-block mb-4">
                {profile?.profile_picture ? (
                  <img
                    src={profile.profile_picture}
                    className="w-24 h-24 rounded-3xl object-cover shadow-xl"
                    alt="Profile"
                  />
                ) : (
                  <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/50 rounded-3xl flex items-center justify-center text-primary-600 text-3xl font-black">
                    {user?.first_name?.[0] || "U"}
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-white dark:border-gray-800 w-8 h-8 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">
                {user?.first_name} {user?.last_name}
              </h3>
              <p className="text-sm text-gray-500 font-medium mb-6">
                {profile?.headline || "Setup your professional headline"}
              </p>

              <div className="space-y-4">
                <div className="flex justify-between text-xs font-black text-gray-400 uppercase tracking-widest">
                  <span>Profile Strength</span>
                  <span>{calculateProfileCompletion()}%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600 transition-all duration-1000 ease-out"
                    style={{ width: `${calculateProfileCompletion()}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 leading-relaxed italic">
                  Complete your profile to increase your chances of being
                  noticed by recruiters!
                </p>
                <Link
                  to="/profile"
                  className="block w-full py-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-bold rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-700"
                >
                  Improve Profile
                </Link>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-8 rounded-3xl text-white shadow-xl shadow-primary-500/20 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
              <h4 className="text-xl font-black mb-4 flex items-center gap-2">
                <User className="w-6 h-6" /> Expert Tip
              </h4>
              <p className="text-primary-50 leading-relaxed font-medium mb-6">
                Candidates with a detailed "Professional Summary" and clear
                "Skills" tags are 3x more likely to be shortlisted.
              </p>
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 font-black text-sm uppercase tracking-widest bg-white text-primary-900 px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors"
              >
                Add Summary <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend, color }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
      <div
        className={`p-4 rounded-2xl bg-gradient-to-br ${color} text-white absolute top-6 right-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
      >
        <div className="w-6 h-6">{icon}</div>
      </div>
      <div className="relative z-10">
        <p className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
          {label}
        </p>
        <p className="text-4xl font-black text-gray-900 dark:text-white mb-3 tracking-tighter">
          {value}
        </p>
        <div className="flex items-center gap-1 text-xs font-bold text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full w-fit">
          <ArrowUpRight className="w-3 h-3" /> {trend}
        </div>
      </div>
    </div>
  );
}
