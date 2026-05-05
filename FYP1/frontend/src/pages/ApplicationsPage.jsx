import { useState, useEffect, Fragment } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react";
import {
  Briefcase,
  Calendar,
  CheckCircle,
  XCircle,
  FileText,
  Search,
  Filter,
  MoreVertical,
  ExternalLink,
  MessageSquare,
  Clock,
  User,
  PlusCircle,
  ChevronDown,
  X,
  Send,
  Download,
} from "lucide-react";

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "applied", label: "Applied" },
    { value: "under_review", label: "Under Review" },
    { value: "shortlisted", label: "Shortlisted" },
    { value: "interview_scheduled", label: "Interviewing" },
    { value: "selected", label: "Selected" },
    { value: "rejected", label: "Rejected" },
  ];

  const selectedStatus =
    statusOptions.find((o) => o.value === filterStatus) || statusOptions[0];

  // ... rest of the component state ...

  // Modal for scheduling interview
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [currentApp, setCurrentApp] = useState(null);
  const [interviewData, setInterviewData] = useState({
    interview_date: "",
    interview_type: "online",
    location_or_link: "",
    notes: "",
  });

  const isEmployer = user?.user_type === "employer";

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get("applications/");
      setApplications(response.data.results || response.data);
    } catch (err) {
      console.error("Failed to fetch applications", err);
      setError("Failed to load applications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.patch(`applications/${id}/`, { status: newStatus });
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status: newStatus } : app,
        ),
      );
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update status");
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        application: currentApp.id,
        interview_date: interviewData.interview_date,
        interview_type: interviewData.interview_type,
        location_or_link: interviewData.location_or_link,
        notes: interviewData.notes,
        duration_minutes: 30,
      };

      await api.post("interviews/", payload);
      await handleStatusUpdate(currentApp.id, "interview_scheduled");

      setShowInterviewModal(false);
      setInterviewData({
        interview_date: "",
        interview_type: "online",
        location_or_link: "",
        notes: "",
      });
      alert("Interview successfully scheduled and candidate notified!");
    } catch (err) {
      console.error(
        "Failed to schedule interview:",
        err.response?.data || err.message,
      );
      const errorMsg = err.response?.data
        ? JSON.stringify(err.response.data)
        : "Check date and time format.";
      alert("Failed to schedule interview: " + errorMsg);
    }
  };

  const exportData = (format) => {
    const headers = ["Candidate Name", "Job Title", "Status", "Applied At"];
    const rows = filteredApps.map((app) => [
      app.applicant_name,
      app.job_title,
      app.status,
      new Date(app.applied_at).toLocaleDateString(),
    ]);

    if (format === "csv") {
      let csvContent =
        "data:text/csv;charset=utf-8," +
        headers.join(",") +
        "\n" +
        rows.map((e) => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "recruitment_report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === "excel") {
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");
      XLSX.writeFile(workbook, "recruitment_report.xlsx");
    } else if (format === "pdf") {
      const doc = new jsPDF();
      doc.text("Recruitment Report", 14, 15);
      doc.autoTable({
        head: [headers],
        body: rows,
        startY: 20,
        theme: "grid",
        headStyles: { fillStyle: "#2563eb", textColor: 255 },
      });
      doc.save("recruitment_report.pdf");
    }
    setShowExportModal(false);
  };

  const filteredApps = applications.filter((app) => {
    const matchesFilter = filterStatus === "all" || app.status === filterStatus;
    const matchesSearch =
      (app.applicant_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (app.job_title || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-300">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            {isEmployer ? "Talent Pipeline" : "My Career Journey"}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {isEmployer
              ? "Review, shortlist and manage your candidate pool."
              : "Track the progress of your submitted applications."}
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-primary-500 text-sm dark:text-white"
            />
          </div>
          <Listbox value={filterStatus} onChange={setFilterStatus}>
            <div className="relative">
              <ListboxButton className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300 group min-w-[160px] cursor-pointer">
                <Filter className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                <span className="block truncate text-xs font-black uppercase tracking-widest text-gray-600 dark:text-gray-300">
                  {selectedStatus.label}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
              </ListboxButton>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <ListboxOptions
                  anchor="bottom start"
                  className="z-30 mt-2 w-48 max-h-60 overflow-auto rounded-2xl bg-white dark:bg-gray-800 py-2 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100 dark:border-gray-700 [--anchor-gap:8px]"
                >
                  {statusOptions.map((option) => (
                    <ListboxOption
                      key={option.value}
                      value={option.value}
                      className={({ focus }) =>
                        `relative cursor-pointer select-none py-3 px-5 transition-colors ${
                          focus
                            ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                            : "text-gray-700 dark:text-gray-300"
                        }`
                      }
                    >
                      {({ selected }) => (
                        <div className="flex items-center justify-between">
                          <span
                            className={`block truncate text-xs font-black uppercase tracking-widest ${
                              selected
                                ? "text-primary-600 dark:text-primary-400"
                                : ""
                            }`}
                          >
                            {option.label}
                          </span>
                          {selected && (
                            <CheckCircle className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                          )}
                        </div>
                      )}
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </Transition>
            </div>
          </Listbox>
          {isEmployer && (
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-bold rounded-xl hover:bg-primary-200 transition-all text-sm shadow-sm"
            >
              <Download className="w-4 h-4" /> Export
            </button>
          )}
        </div>
      </div>

      {filteredApps.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <Briefcase className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white">
            No applications found
          </h3>
          <p className="mt-2 text-gray-500">
            Try adjusting your filters or search keywords.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="group bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-primary-100 dark:hover:border-primary-900/30 transition-all duration-300"
            >
              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center">
                {/* Candidate Info */}
                <div className="flex-1 flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-black text-2xl shadow-inner">
                    {isEmployer
                      ? app.applicant_name?.[0] || "U"
                      : app.company_name?.[0] || "C"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-xl font-black text-gray-900 dark:text-white truncate">
                        {isEmployer ? app.applicant_name : app.job_title}
                      </h3>
                      <StatusBadge status={app.status} />
                    </div>
                    <p className="text-gray-500 font-medium flex items-center gap-1.5 mt-1">
                      {isEmployer ? (
                        <>
                          for{" "}
                          <span className="text-primary-600 font-bold">
                            {app.job_title}
                          </span>
                        </>
                      ) : (
                        <>
                          at{" "}
                          <span className="font-bold underline">
                            {app.company_name}
                          </span>
                        </>
                      )}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />{" "}
                        {new Date(app.applied_at).toLocaleDateString()}
                      </span>
                      {app.location && (
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" /> {app.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Workflow Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-6 md:pt-0 border-t md:border-t-0 border-gray-50 dark:border-gray-700">
                  {/* Resume Link */}
                  {app.resume && (
                    <a
                      href={app.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-100 transition-colors border border-gray-100 dark:border-gray-700 text-sm"
                    >
                      <FileText className="w-4 h-4" /> View Resume
                    </a>
                  )}

                  {/* Role-Based Actions */}
                  {isEmployer ? (
                    <div className="flex items-center gap-2">
                      <Listbox
                        value={app.status}
                        onChange={(newStatus) =>
                          handleStatusUpdate(app.id, newStatus)
                        }
                      >
                        <div className="relative">
                          <ListboxButton className="flex items-center justify-between gap-3 pl-4 pr-3 py-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl text-sm font-black text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-all min-w-[120px] cursor-pointer">
                            <span className="truncate uppercase tracking-wider">
                              {statusOptions
                                .find((o) => o.value === app.status)
                                ?.label.replace("Status", "")
                                .trim() || app.status}
                            </span>
                            <ChevronDown className="w-4 h-4 text-blue-500" />
                          </ListboxButton>

                          <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                          >
                            <ListboxOptions
                              anchor="bottom end"
                              className="mt-2 w-48 overflow-auto rounded-2xl bg-white dark:bg-gray-800 py-2 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100 dark:border-gray-700 [--anchor-gap:8px]"
                            >
                              {statusOptions
                                .filter((o) => o.value !== "all")
                                .map((option) => (
                                  <ListboxOption
                                    key={option.value}
                                    value={option.value}
                                    className={({ focus }) =>
                                      `relative cursor-pointer select-none py-3 px-5 transition-colors ${
                                        focus
                                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                          : "text-gray-700 dark:text-gray-300"
                                      }`
                                    }
                                  >
                                    {({ selected }) => (
                                      <div className="flex items-center justify-between">
                                        <span
                                          className={`block truncate text-xs font-black uppercase tracking-widest ${
                                            selected
                                              ? "text-blue-600 dark:text-blue-400"
                                              : ""
                                          }`}
                                        >
                                          {option.label}
                                        </span>
                                        {selected && (
                                          <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        )}
                                      </div>
                                    )}
                                  </ListboxOption>
                                ))}
                            </ListboxOptions>
                          </Transition>
                        </div>
                      </Listbox>
                      <button
                        onClick={() => {
                          setCurrentApp(app);
                          setShowInterviewModal(true);
                        }}
                        className="p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all hover:scale-105"
                        title="Schedule Interview"
                      >
                        <Calendar className="w-5 h-5" />
                      </button>
                      <Link
                        to={`/chat?user_id=${app.applicant?.id}&job_id=${app.job?.id}`}
                        className="p-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 shadow-lg shadow-green-500/20 transition-all hover:scale-105"
                      >
                        <MessageSquare className="w-5 h-5" />
                      </Link>
                    </div>
                  ) : (
                    <Link
                      to={`/chat?user_id=${app.job?.company?.user?.id}&job_id=${app.job?.id}`}
                      className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/30 text-sm"
                    >
                      <MessageSquare className="w-4 h-4" /> Message Recruiter
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Export Format Selection Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-700">
            <div className="px-8 py-6 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Export <span className="text-primary-600">Report</span>
              </h2>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8">
              <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium">
                Choose your preferred format to export the recruitment pipeline.
              </p>
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => exportData("pdf")}
                  className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-50 dark:border-gray-700 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all group"
                >
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-xs">
                      PDF Document
                    </div>
                    <div className="text-sm text-gray-500">
                      Best for printing or sharing
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => exportData("excel")}
                  className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-50 dark:border-gray-700 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all group"
                >
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-xs">
                      MS Excel Sheet
                    </div>
                    <div className="text-sm text-gray-500">
                      Best for data analysis
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => exportData("csv")}
                  className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-50 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group"
                >
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                    <Download className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-xs">
                      CSV Plain Text
                    </div>
                    <div className="text-sm text-gray-500">
                      Simple format for compatibility
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interview Scheduling Modal */}
      {showInterviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white lowercase tracking-tight">
                Schedule{" "}
                <span className="text-primary-600 uppercase">Interview</span>
              </h2>
              <button
                onClick={() => setShowInterviewModal(false)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleScheduleInterview} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={interviewData.interview_date}
                  onChange={(e) =>
                    setInterviewData({
                      ...interviewData,
                      interview_date: e.target.value,
                    })
                  }
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white transition-all shadow-inner"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Type
                  </label>
                  <Listbox
                    value={interviewData.interview_type}
                    onChange={(val) =>
                      setInterviewData({
                        ...interviewData,
                        interview_type: val,
                      })
                    }
                  >
                    <div className="relative">
                      <ListboxButton className="w-full flex items-center justify-between gap-3 px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:border-primary-300 transition-all cursor-pointer shadow-inner">
                        <span className="truncate capitalize">
                          {interviewData.interview_type.replace("_", " ")}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </ListboxButton>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <ListboxOptions
                          anchor="bottom start"
                          className="z-[60] mt-2 w-48 overflow-auto rounded-2xl bg-white dark:bg-gray-800 py-2 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100 dark:border-gray-700 [--anchor-gap:8px]"
                        >
                          {[
                            { value: "online", label: "Online" },
                            { value: "in_person", label: "In-Person" },
                          ].map((opt) => (
                            <ListboxOption
                              key={opt.value}
                              value={opt.value}
                              className={({ focus }) =>
                                `relative cursor-pointer select-none py-3 px-5 transition-colors ${
                                  focus
                                    ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                                    : "text-gray-700 dark:text-gray-300"
                                }`
                              }
                            >
                              {({ selected }) => (
                                <div className="flex items-center justify-between">
                                  <span
                                    className={`truncate text-xs font-black uppercase tracking-wider ${
                                      selected ? "text-primary-600" : ""
                                    }`}
                                  >
                                    {opt.label}
                                  </span>
                                  {selected && (
                                    <CheckCircle className="w-4 h-4 text-primary-600" />
                                  )}
                                </div>
                              )}
                            </ListboxOption>
                          ))}
                        </ListboxOptions>
                      </Transition>
                    </div>
                  </Listbox>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Location/Link
                  </label>
                  <input
                    type="text"
                    placeholder="Zoom link or Address"
                    required
                    value={interviewData.location_or_link}
                    onChange={(e) =>
                      setInterviewData({
                        ...interviewData,
                        location_or_link: e.target.value,
                      })
                    }
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white transition-all shadow-inner"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                  Additional Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell the candidate what to prepare..."
                  value={interviewData.notes}
                  onChange={(e) =>
                    setInterviewData({
                      ...interviewData,
                      notes: e.target.value,
                    })
                  }
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white transition-all shadow-inner resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-5 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-black rounded-2xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-xl shadow-primary-500/25 flex items-center justify-center gap-2 group"
              >
                <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                Confirm Schedule
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    applied:
      "bg-blue-50 text-blue-700 border-blue-200/50 shadow-blue-500/10 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
    under_review:
      "bg-yellow-50 text-yellow-700 border-yellow-200/50 shadow-yellow-500/10 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
    shortlisted:
      "bg-indigo-50 text-indigo-700 border-indigo-200/50 shadow-indigo-500/10 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800",
    interview_scheduled:
      "bg-purple-50 text-purple-700 border-purple-200/50 shadow-purple-500/10 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
    selected:
      "bg-green-50 text-green-700 border-green-200/50 shadow-green-500/10 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
    rejected:
      "bg-red-50 text-red-700 border-red-200/50 shadow-red-500/10 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
  };

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
      className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border shadow-sm transition-all ${styles[status] || "bg-gray-100 text-gray-800"}`}
    >
      {labels[status] || status}
    </span>
  );
}
