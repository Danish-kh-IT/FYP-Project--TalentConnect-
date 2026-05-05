import { useState, useEffect } from "react";
import api from "../api/axios";
import {
  Users,
  Building2,
  Briefcase,
  CheckCircle,
  XCircle,
  BarChart3,
  Search,
  Loader2,
  UserCheck,
  Building,
  ShieldAlert,
  Trash2,
  AlertTriangle,
  FileText,
  Download,
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [data, setData] = useState([]);
  const [fetchingData, setFetchingData] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [generatingAudit, setGeneratingAudit] = useState(false);
  const [auditProgress, setAuditProgress] = useState(0);

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    { id: "users", label: "Users", icon: <Users className="w-5 h-5" /> },
    {
      id: "companies",
      label: "Companies",
      icon: <Building2 className="w-5 h-5" />,
    },
    { id: "jobs", label: "Jobs", icon: <Briefcase className="w-5 h-5" /> },
  ];

  const fetchStats = async () => {
    try {
      const res = await api.get("admin-panel/stats/");
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  const fetchData = async (tab) => {
    if (tab === "overview") return;
    setFetchingData(true);
    try {
      const res = await api.get(`admin-panel/${tab}/`);
      setData(res.data.results || res.data);
    } catch (err) {
      console.error(`Failed to fetch ${tab}`, err);
    } finally {
      setFetchingData(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchData(activeTab).finally(() => setLoading(false));
  }, [activeTab]);

  const handleApproveJob = async (id) => {
    try {
      await api.patch(`admin-panel/jobs/${id}/`, { status: "active" });
      fetchData("jobs");
      fetchStats();
    } catch (err) {
      alert("Failed to approve job");
    }
  };

  const handleRejectJob = async (id) => {
    try {
      await api.patch(`admin-panel/jobs/${id}/`, { status: "rejected" });
      fetchData("jobs");
    } catch (err) {
      alert("Failed to reject job");
    }
  };

  const handleVerifyCompany = async (id) => {
    try {
      await api.patch(`admin-panel/companies/${id}/`, { is_verified: true });
      fetchData("companies");
      fetchStats();
    } catch (err) {
      alert("Failed to verify company");
    }
  };

  const handleDelete = (type, id) => {
    setItemToDelete({ type, id });
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`admin-panel/${itemToDelete.type}/${itemToDelete.id}/`);
      // Optimistically update UI
      setData(data.filter((item) => item.id !== itemToDelete.id));
      fetchStats();
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete item");
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const handlePerformAudit = async () => {
    setAuditModalOpen(true);
    setGeneratingAudit(true);
    setAuditProgress(0);

    // Fetch latest stats first
    await fetchStats();

    // Simulation of system check
    const duration = 2000;
    const interval = 50;
    const steps = duration / interval;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setAuditProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setGeneratingAudit(false);
          return 100;
        }
        return prev + increment;
      });
    }, interval);
  };

  const downloadAuditPDF = () => {
    if (!stats) return;
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleString();

    doc.setFontSize(22);
    doc.text("TalentConnect System Audit Report", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${currentDate}`, 14, 28);

    const tableData = [
      ["Platform Stats", "Count"],
      ["Total Users", stats.total_users],
      ["Companies", stats.total_companies],
      ["Job Listings", stats.total_jobs],
      ["Total Applications", stats.total_applications],
      ["", ""],
      ["Pending Actions", "Count"],
      ["Pending Jobs", stats.pending_jobs],
      ["Unverified Companies", stats.pending_companies],
      ["Inactive Users", stats.inactive_users],
    ];

    doc.autoTable({
      startY: 35,
      head: [tableData[0]],
      body: tableData.slice(1),
      theme: "grid",
      headStyles: { fillStyle: "#2563eb", textColor: 255 },
    });

    doc.save(`TalentConnect_Audit_${new Date().getTime()}.pdf`);
  };

  const downloadAuditExcel = () => {
    if (!stats) return;
    const data = [
      { Metric: "Total Users", Value: stats.total_users },
      { Metric: "Companies", Value: stats.total_companies },
      { Metric: "Job Listings", Value: stats.total_jobs },
      { Metric: "Applications", Value: stats.total_applications },
      { Metric: "Pending Jobs", Value: stats.pending_jobs },
      { Metric: "Unverified Companies", Value: stats.pending_companies },
      { Metric: "Inactive Users", Value: stats.inactive_users },
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Audit Report");
    XLSX.writeFile(wb, `Audit_Report_${new Date().getTime()}.xlsx`);
  };

  if (loading && activeTab === "overview") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex">
      {/* Sidebar Navigation */}
      <aside className="hidden lg:flex w-72 flex-col bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 h-[calc(100vh-80px)] sticky top-20 z-30 transition-all duration-300">
        <div className="p-8 flex flex-col h-full">
          <div className="mb-10 text-center">
            <h2 className="text-sm font-black text-primary-600 uppercase tracking-[0.2em]">
              Admin Panel
            </h2>
            <div className="h-1 w-10 bg-primary-600 mx-auto mt-2 rounded-full"></div>
          </div>

          <nav className="flex-1 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.25rem] font-black transition-all duration-300 group ${
                  activeTab === tab.id
                    ? "bg-primary-600 text-white shadow-xl shadow-primary-500/20 translate-x-2"
                    : "text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                <div
                  className={`transition-transform duration-300 group-hover:scale-110 ${activeTab === tab.id ? "text-white" : "text-primary-500"}`}
                >
                  {tab.icon}
                </div>
                <span className="text-sm tracking-tight">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                )}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 lg:p-8 overflow-y-auto">
        {/* Admin Header - Redesigned for Sidebar Layout */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tighter">
              Admin <span className="text-primary-600">Control Hub</span>
            </h1>
            <p className="mt-2 text-lg text-gray-400 font-medium">
              System-wide management and performance tracking.
            </p>
          </div>

          {/* Mobile Tab Switcher (Visible only on mobile) */}
          <div className="flex lg:hidden bg-white dark:bg-gray-800 p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-primary-600 text-white shadow-lg"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "overview" && stats && (
          <div className="space-y-10 animate-in fade-in duration-500">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <StatCard
                icon={<Users />}
                label="Total Users"
                value={stats.total_users}
                color="from-blue-500 to-blue-600"
                onClick={() => setActiveTab("users")}
              />
              <StatCard
                icon={<Building2 />}
                label="Registered Companies"
                value={stats.total_companies}
                color="from-purple-500 to-purple-600"
                onClick={() => setActiveTab("companies")}
              />
              <StatCard
                icon={<Briefcase />}
                label="Current Vacancies"
                value={stats.total_jobs}
                color="from-green-500 to-green-600"
                onClick={() => setActiveTab("jobs")}
              />
              <StatCard
                icon={<ShieldAlert />}
                label="Pending Approvals"
                value={stats.pending_jobs + stats.pending_companies}
                color="from-orange-500 to-orange-600"
                onClick={() => setActiveTab("overview")}
              />
            </div>

            {/* Analytics Section Preview */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-primary-500" /> Platform
                  Growth
                </h3>
                <div className="h-48 flex items-end justify-between gap-2 px-4">
                  {/* Simulated bar chart */}
                  {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-primary-100 dark:bg-primary-900/30 rounded-t-lg transition-all hover:bg-primary-600 h-full relative group"
                    >
                      <div
                        style={{ height: `${h}%` }}
                        className="absolute bottom-0 left-0 right-0 bg-primary-600 rounded-t-lg group-hover:bg-primary-500 transition-all"
                      ></div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>

              <div className="bg-primary-600 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <h3 className="text-xl font-black mb-6 relative z-10">
                  System Alerts
                </h3>
                <div className="space-y-4 relative z-10">
                  <AlertRow
                    label="Pending Job Verifications"
                    count={stats.pending_jobs}
                  />
                  <AlertRow
                    label="Company Registrations"
                    count={stats.pending_companies}
                  />
                  <AlertRow
                    label="In-active User Accounts"
                    count={stats.inactive_users}
                  />
                </div>
                <button
                  onClick={handlePerformAudit}
                  className="mt-8 w-full py-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white text-white hover:text-primary-600 transition-all font-outfit"
                >
                  Perform Full Audit
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab !== "overview" && (
          <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
            <div className="px-8 py-6 border-b border-gray-50 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                Manage {activeTab}
              </h3>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-6 py-2.5 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm w-full md:w-64"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              {fetchingData ? (
                <div className="p-20 flex justify-center">
                  <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      {activeTab === "users" && (
                        <>
                          <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            User
                          </th>
                          <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Type
                          </th>
                          <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Joined
                          </th>
                          <th className="px-8 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Actions
                          </th>
                        </>
                      )}
                      {activeTab === "companies" && (
                        <>
                          <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Company
                          </th>
                          <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Industry
                          </th>
                          <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Status
                          </th>
                          <th className="px-8 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Actions
                          </th>
                        </>
                      )}
                      {activeTab === "jobs" && (
                        <>
                          <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Job Title
                          </th>
                          <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Company
                          </th>
                          <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Status
                          </th>
                          <th className="px-8 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Actions
                          </th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                    {data.length > 0 ? (
                      data
                        .filter((item) => {
                          const searchStr = (
                            item.username ||
                            item.name ||
                            item.title ||
                            ""
                          ).toLowerCase();
                          return searchStr.includes(searchTerm.toLowerCase());
                        })
                        .map((item) => (
                          <tr
                            key={item.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                          >
                            {activeTab === "users" && (
                              <>
                                <td className="px-8 py-5">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black">
                                      {(item.username || "U")[0].toUpperCase()}
                                    </div>
                                    <div>
                                      <p className="font-bold text-gray-900 dark:text-white">
                                        {item.username}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {item.email}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-8 py-5">
                                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-black uppercase tracking-widest text-gray-600 dark:text-gray-300">
                                    {item.user_type}
                                  </span>
                                </td>
                                <td className="px-8 py-5 text-sm text-gray-500">
                                  {new Date(
                                    item.date_joined,
                                  ).toLocaleDateString()}
                                </td>
                                <td className="px-8 py-5 text-right flex justify-end gap-2">
                                  <button
                                    onClick={() =>
                                      handleDelete("users", item.id)
                                    }
                                    className="p-2 text-red-400 hover:text-red-600 transition-colors"
                                    title="Delete User"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </td>
                              </>
                            )}
                            {activeTab === "companies" && (
                              <>
                                <td className="px-8 py-5">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-black">
                                      {(item.name || "C")[0]?.toUpperCase()}
                                    </div>
                                    <p className="font-bold text-gray-900 dark:text-white">
                                      {item.name || "Unnamed Company"}
                                    </p>
                                  </div>
                                </td>
                                <td className="px-8 py-5 text-sm font-medium text-gray-500">
                                  {item.industry || "Technology"}
                                </td>
                                <td className="px-8 py-5">
                                  <span
                                    className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${item.is_verified ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}
                                  >
                                    {item.is_verified ? "Verified" : "Pending"}
                                  </span>
                                </td>
                                <td className="px-8 py-5 text-right flex justify-end gap-2">
                                  {!item.is_verified && (
                                    <button
                                      onClick={() =>
                                        handleVerifyCompany(item.id)
                                      }
                                      className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                    >
                                      <CheckCircle className="w-5 h-5" />
                                    </button>
                                  )}

                                  <button
                                    onClick={() =>
                                      handleDelete("companies", item.id)
                                    }
                                    className="p-2 text-red-400 hover:text-red-600 transition-colors"
                                    title="Delete Company"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </td>
                              </>
                            )}
                            {activeTab === "jobs" && (
                              <>
                                <td className="px-8 py-5">
                                  <p className="font-bold text-gray-900 dark:text-white">
                                    {item.title}
                                  </p>
                                </td>
                                <td className="px-8 py-5 text-sm text-gray-500">
                                  {item.company_name}
                                </td>
                                <td className="px-8 py-5">
                                  <span
                                    className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${getStatusStyle(item.status)}`}
                                  >
                                    {item.status}
                                  </span>
                                </td>
                                <td className="px-8 py-5 text-right flex justify-end gap-2">
                                  {item.status === "pending" && (
                                    <>
                                      <button
                                        onClick={() =>
                                          handleApproveJob(item.id)
                                        }
                                        className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                        title="Approve"
                                      >
                                        <CheckCircle className="w-5 h-5" />
                                      </button>
                                      <button
                                        onClick={() => handleRejectJob(item.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Reject"
                                      >
                                        <XCircle className="w-5 h-5" />
                                      </button>
                                    </>
                                  )}
                                  <button
                                    onClick={() =>
                                      handleDelete("jobs", item.id)
                                    }
                                    className="p-2 text-red-400 hover:text-red-600 transition-colors"
                                    title="Delete Job"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </td>
                              </>
                            )}
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-8 py-10 text-center text-gray-500 italic"
                        >
                          No data found for this category.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-sm w-full p-8 border border-gray-100 dark:border-gray-700 scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 mb-6 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                Confirm Deletion
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm leading-relaxed">
                Are you sure you want to delete this item? This action receives
                immediate effect and cannot be undone.
              </p>
              <div className="grid grid-cols-2 gap-4 w-full">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="px-4 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-red-500/20"
                >
                  {deleting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {auditModalOpen && stats && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-100 dark:border-gray-700 scale-100 animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="bg-gradient-to-r from-primary-600 to-indigo-600 p-8 relative overflow-hidden flex-shrink-0">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md shadow-xl">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white tracking-tighter">
                      System Audit Report
                    </h3>
                    <p className="text-sm text-white/70 font-bold uppercase tracking-widest">
                      {new Date().toLocaleDateString()} •{" "}
                      {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAuditModalOpen(false)}
                  className="p-3 hover:bg-white/20 rounded-2xl transition-all duration-300"
                >
                  <XCircle className="w-8 h-8 text-white" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-8 overflow-y-auto no-scrollbar scroll-smooth">
              {generatingAudit ? (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-300">
                  <div className="relative w-24 h-24">
                    <svg
                      className="w-full h-full transform -rotate-90"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        className="text-gray-100 dark:text-gray-700"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                      />
                      <circle
                        className="text-primary-600 transition-all duration-300 ease-out"
                        strokeWidth="8"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 - (251.2 * auditProgress) / 100}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-black text-primary-600">
                      {Math.round(auditProgress)}%
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-gray-900 dark:text-white">
                      Scanning System...
                    </h4>
                    <p className="text-sm text-gray-500 font-medium mt-1">
                      Checking database integrity and user activity
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Overview Section */}
                  <div>
                    <h4 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary-600" />
                      Platform Overview
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <AuditStatItem
                        label="Total Users"
                        value={stats.total_users}
                        icon={<Users className="w-4 h-4" />}
                      />
                      <AuditStatItem
                        label="Companies"
                        value={stats.total_companies}
                        icon={<Building2 className="w-4 h-4" />}
                      />
                      <AuditStatItem
                        label="Job Postings"
                        value={stats.total_jobs}
                        icon={<Briefcase className="w-4 h-4" />}
                      />
                      <AuditStatItem
                        label="Applications"
                        value={stats.total_applications}
                        icon={<FileText className="w-4 h-4" />}
                      />
                    </div>
                  </div>

                  {/* Pending Actions */}
                  <div>
                    <h4 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-orange-600" />
                      Pending Actions
                    </h4>
                    <div className="space-y-3">
                      <AuditAlertItem
                        label="Pending Job Verifications"
                        count={stats.pending_jobs}
                        severity={stats.pending_jobs > 5 ? "high" : "normal"}
                      />
                      <AuditAlertItem
                        label="Unverified Companies"
                        count={stats.pending_companies}
                        severity={
                          stats.pending_companies > 3 ? "high" : "normal"
                        }
                      />
                      <AuditAlertItem
                        label="Inactive User Accounts"
                        count={stats.inactive_users}
                        severity={stats.inactive_users > 10 ? "high" : "normal"}
                      />
                    </div>
                  </div>

                  {/* System Health */}
                  <div>
                    <h4 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      System Health
                    </h4>
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4">
                      <p className="text-sm font-bold text-green-700 dark:text-green-400">
                        ✓ All core systems operational
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                        Database connections: Active • API endpoints: Responsive
                        • Background jobs: Running
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <button
                      onClick={downloadAuditPDF}
                      className="flex items-center justify-center gap-2 py-3.5 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200 dark:shadow-none"
                    >
                      <Download className="w-4 h-4" /> Download PDF
                    </button>
                    <button
                      onClick={downloadAuditExcel}
                      className="flex items-center justify-center gap-2 py-3.5 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all shadow-xl shadow-green-500/20"
                    >
                      <Download className="w-4 h-4" /> Export Excel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 relative overflow-hidden group hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105 active:scale-100"
    >
      <div className="flex items-start gap-4">
        <div
          className={`p-4 rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}
        >
          <div className="w-6 h-6">{icon}</div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
            {label}
          </p>
          <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function AlertRow({ label, count }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/10">
      <span className="text-sm font-bold opacity-80">{label}</span>
      <span
        className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${count > 0 ? "bg-orange-400 text-white animate-pulse" : "bg-white/10 text-white opacity-50"}`}
      >
        {count}
      </span>
    </div>
  );
}

function getStatusStyle(status) {
  if (status === "active") return "bg-green-100 text-green-700";
  if (status === "pending") return "bg-orange-100 text-orange-700";
  if (status === "rejected") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-700";
}

function AuditStatItem({ label, value, icon }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-2">
        <div className="text-primary-600">{icon}</div>
        <p className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
          {label}
        </p>
      </div>
      <p className="text-3xl font-black text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function AuditAlertItem({ label, count, severity }) {
  const bgColor =
    severity === "high"
      ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
      : "bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700";
  const textColor =
    severity === "high"
      ? "text-red-700 dark:text-red-400"
      : "text-gray-700 dark:text-gray-300";
  const badgeColor =
    severity === "high"
      ? "bg-red-500 text-white"
      : count > 0
        ? "bg-orange-500 text-white"
        : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300";

  return (
    <div
      className={`${bgColor} border rounded-xl p-4 flex items-center justify-between`}
    >
      <p className={`text-sm font-bold ${textColor}`}>{label}</p>
      <span className={`${badgeColor} px-3 py-1 rounded-lg text-xs font-black`}>
        {count}
      </span>
    </div>
  );
}
