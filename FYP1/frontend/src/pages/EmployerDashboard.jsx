import { useState, useEffect } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import ReportExportModal from "../components/ReportExportModal";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  Plus,
  Briefcase,
  Users,
  CheckCircle,
  Calendar,
  TrendingUp,
  AlertTriangle,
  FileText,
  BarChart3,
  ChevronRight,
  ArrowUpRight,
  Clock,
  Loader2,
} from "lucide-react";

export default function EmployerDashboard() {
  const [stats, setStats] = useState({
    active_jobs: 0,
    total_applications: 0,
    shortlisted: 0,
    interviews: 0,
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const [error, setError] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");
        // 1. Fetch Company Info
        const companyRes = await api.get("companies/me/");
        setCompany(companyRes.data);

        // 2. Fetch Jobs to calculate stats
        const jobsRes = await api.get("jobs/listings/");
        // Filter jobs by this company (ideally handled by backend filter set earlier)
        const myJobs = jobsRes.data.results || jobsRes.data;
        const activeJobsCount = myJobs.filter(
          (j) => j.status === "active",
        ).length;

        // 3. Fetch Applications to calculate stats
        const appRes = await api.get("applications/");
        const apps = appRes.data.results || appRes.data;

        const shortlistedCount = apps.filter(
          (a) => a.status === "shortlisted",
        ).length;
        const interviewsCount = apps.filter(
          (a) => a.status === "interview_scheduled",
        ).length;

        setStats({
          active_jobs: activeJobsCount,
          total_applications: apps.length,
          shortlisted: shortlistedCount,
          interviews: interviewsCount,
        });

        setRecentApplications(apps.slice(0, 5));
      } catch (err) {
        console.error("DASHBOARD_ERROR_DETAILS:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          config: err.config?.url,
        });
        const status = err.response?.status;
        setError(
          `Failed to load dashboard data. ${status === 404 ? "Your company profile is not registered yet." : "Server error."} (Code: ${status || "Unknown"})`,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    const isNewEmployer = error.includes("404") || error.includes("registered");

    return (
      <div className="max-w-4xl mx-auto mt-20 p-10 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-blue-100 dark:border-blue-900/30 text-center">
        {isNewEmployer ? (
          <>
            <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-10 h-10 text-primary-600" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
              Welcome to TalentConnect!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
              You're almost there! To start posting jobs and viewing candidates,
              you first need to set up your company profile.
            </p>
            <Link
              to="/company-register"
              className="px-8 py-4 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-all shadow-xl shadow-primary-500/20 inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Setup Company Profile
            </Link>
          </>
        ) : (
          <>
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
              Dashboard Error
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
              {error}
            </p>
          </>
        )}
      </div>
    );
  }

  /* 
  if (!company?.is_verified) {
    return (
      <div className="max-w-4xl mx-auto mt-20 p-10 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-yellow-100 dark:border-yellow-900/30 text-center">
        <div className="w-24 h-24 bg-yellow-50 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-8">
          <Clock className="w-12 h-12 text-yellow-600" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
          Verification Pending
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 leading-relaxed">
          Your company profile for{" "}
          <span className="font-bold text-primary-600">"{company?.name}"</span>{" "}
          is currently under review. You'll be able to post jobs and review
          candidates once an administrator approves your profile.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            Refresh Status
          </button>
        </div>
      </div>
    );
  }
  */

  const conversionRate =
    stats.total_applications > 0
      ? ((stats.shortlisted / stats.total_applications) * 100).toFixed(1)
      : 0;

  const handleGenerateReport = () => {
    setShowExportModal(true);
  };

  const handleExport = (format) => {
    setShowExportModal(false);

    // Prepare Data
    const statsHeaders = ["Metric", "Value"];
    const statsRows = [
      ["Total Jobs Posted", stats.active_jobs],
      ["Total Applications", stats.total_applications],
      ["Shortlisted Candidates", stats.shortlisted],
      ["Interviews Scheduled", stats.interviews],
      ["Shortlist Conversion Rate", `${conversionRate}%`],
    ];

    const appHeaders = [
      "Application ID",
      "Candidate Name",
      "Job Title",
      "Status",
      "Applied At",
    ];
    const appRows = recentApplications.map((app) => [
      app.id,
      app.applicant_name,
      app.job_title,
      app.status,
      new Date(app.applied_at).toLocaleDateString(),
    ]);

    const filename = `TalentConnect_Report_${company.name.replace(/\s+/g, "_")}`;
    const dateStr = new Date().toLocaleDateString();

    if (format === "pdf") {
      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.setTextColor(41, 128, 185); // Primary Blue
      doc.text("TalentConnect Recruitment Report", 14, 22);

      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`Company: ${company.name}`, 14, 32);
      doc.text(`Date: ${dateStr}`, 14, 38);

      // Stats Table
      doc.autoTable({
        head: [statsHeaders],
        body: statsRows,
        startY: 45,
        theme: "striped",
        headStyles: { fillColor: [41, 128, 185] },
      });

      // Pipeline Table
      doc.text("Recent Talent Pipeline", 14, doc.lastAutoTable.finalY + 15);
      doc.autoTable({
        head: [appHeaders],
        body: appRows,
        startY: doc.lastAutoTable.finalY + 20,
        theme: "grid",
        headStyles: { fillColor: [52, 73, 94] },
      });

      doc.save(`${filename}.pdf`);
    } else if (format === "excel" || format === "csv") {
      const wb = XLSX.utils.book_new();

      const ws_data = [
        ["TalentConnect Recruitment Report"],
        [`Company: ${company.name}`],
        [`Date: ${dateStr}`],
        [],
        statsHeaders,
        ...statsRows,
        [],
        ["Recent Talent Pipeline"],
        appHeaders,
        ...appRows,
      ];

      const ws = XLSX.utils.aoa_to_sheet(ws_data);

      // Formatting adjustments could be added here if using full pro version, but basic sheet is fine
      XLSX.utils.book_append_sheet(wb, ws, "Report");

      if (format === "excel") {
        XLSX.writeFile(wb, `${filename}.xlsx`);
      } else {
        XLSX.writeFile(wb, `${filename}.csv`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Premium Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Recruitment{" "}
              <span className="text-primary-600">Command Center</span>
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
              Manage talent for{" "}
              <span className="font-bold">{company.name}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleGenerateReport}
              className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2"
            >
              <BarChart3 className="w-5 h-5" /> Generate Reports
            </button>
            <Link
              to="/post-job"
              className="px-6 py-3 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-all shadow-xl shadow-primary-500/30 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Post New Job
            </Link>
          </div>
        </div>

        {/* Dynamic Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Briefcase />}
            label="Active Listings"
            value={stats.active_jobs}
            trend="+2 this week"
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            icon={<Users />}
            label="Total Applicants"
            value={stats.total_applications}
            trend={`${stats.total_applications > 0 ? "+12%" : "0%"}`}
            color="from-purple-500 to-purple-600"
          />
          <StatCard
            icon={<CheckCircle />}
            label="Shortlisted"
            value={stats.shortlisted}
            trend={`${conversionRate}% conversion`}
            color="from-green-500 to-green-600"
          />
          <StatCard
            icon={<Calendar />}
            label="Interviews"
            value={stats.interviews}
            trend="Next: Tomorrow"
            color="from-orange-500 to-orange-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Applications Section */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 sticky top-0 z-10">
              <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-500" /> Recent
                Talent Pipeline
              </h3>
              <Link
                to="/applications"
                className="text-primary-600 font-bold flex items-center gap-1 hover:underline text-sm uppercase tracking-widest"
              >
                View CRM <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                      Candidate
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                      Target Role
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-8 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {recentApplications.length > 0 ? (
                    recentApplications.map((app) => (
                      <tr
                        key={app.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold">
                              {app.applicant_name?.[0] || "U"}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 dark:text-white">
                                {app.applicant_name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(app.applied_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {app.job_title}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span
                            className={`px-3 py-1 text-xs font-black uppercase tracking-tighter rounded-lg ${getStatusStyle(app.status)}`}
                          >
                            {app.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <Link
                            to="/applications"
                            className="p-2 text-gray-400 hover:text-primary-600 transition-colors inline-block"
                          >
                            <ArrowUpRight className="w-5 h-5" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-8 py-10 text-center text-gray-500 italic"
                      >
                        No applications received yet. Your active jobs will
                        appear here soon.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Hiring Insights Sidebar */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-indigo-600 to-primary-700 p-8 rounded-3xl text-white shadow-2xl shadow-indigo-500/20">
              <h4 className="text-xl font-black mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6" /> Conversion Insight
              </h4>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest opacity-80 mb-2">
                    <span>Shortlist Rate</span>
                    <span>{conversionRate}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-1000"
                      style={{ width: `${conversionRate}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm text-indigo-100 leading-relaxed font-medium">
                  Your current conversion rate is{" "}
                  <span className="font-black text-white">
                    {conversionRate > 20 ? "Above average" : "Below average"}
                  </span>{" "}
                  for the {company.industry} industry. Consider refining your
                  job descriptions.
                </p>
                <Link
                  to="/post-job"
                  className="block w-full text-center py-4 bg-white text-indigo-700 font-bold rounded-2xl hover:bg-indigo-50 transition-all shadow-lg"
                >
                  Manage Job Posts
                </Link>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
              <h4 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-500" /> Compliance &
                Setup
              </h4>
              <ul className="space-y-4">
                <SetupItem done={true} label="Company Profile Created" />
                <SetupItem
                  done={company.is_verified}
                  label="Admin Verification"
                />
                <SetupItem
                  done={stats.active_jobs > 0}
                  label="First Job Posted"
                />
                <SetupItem
                  done={stats.total_applications > 0}
                  label="Review Candidates"
                />
              </ul>
            </div>
          </div>
        </div>
      </div>
      <ReportExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
      />
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

function SetupItem({ done, label }) {
  return (
    <li className="flex items-center gap-3">
      {done ? (
        <CheckCircle className="w-5 h-5 text-green-500" />
      ) : (
        <div className="w-5 h-5 rounded-full border-2 border-gray-200 dark:border-gray-700" />
      )}
      <span
        className={`text-sm font-medium ${done ? "text-gray-900 dark:text-white" : "text-gray-400"}`}
      >
        {label}
      </span>
    </li>
  );
}

function getStatusStyle(status) {
  const map = {
    applied: "bg-blue-100 text-blue-800",
    under_review: "bg-yellow-100 text-yellow-800",
    shortlisted: "bg-indigo-100 text-indigo-800",
    interview_scheduled: "bg-purple-100 text-purple-800",
    selected: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };
  return map[status] || "bg-gray-100 text-gray-800";
}
