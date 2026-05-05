import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import {
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  ChevronLeft,
  Building2,
  Calendar,
  ShieldCheck,
  Globe,
  Mail,
  FileText,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle,
  Upload,
  X,
} from "lucide-react";
export default function JobDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Application Data
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resume, setResume] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`jobs/listings/${id}/`);
        setJob(response.data);
      } catch (err) {
        console.error("Failed to fetch job", err);
        setError("Job not found or has been removed.");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }

    setApplying(true);
    setError("");

    const formData = new FormData();
    formData.append("job_id", id);
    formData.append("cover_letter", coverLetter);
    if (resume) {
      formData.append("resume", resume);
    }

    try {
      await api.post("applications/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setSuccess(true);
      setShowApplyModal(false);
      // Wait a bit then redirect
      setTimeout(() => navigate("/applications"), 2000);
    } catch (err) {
      console.error("Application failed", err);
      // Extract the most meaningful error message
      const data = err.response?.data;
      let errorMsg = "Failed to submit application. Please try again.";

      if (typeof data === "string") {
        errorMsg = data;
      } else if (data) {
        // Handle DRF dictionary errors
        const firstKey = Object.keys(data)[0];
        const firstError = data[firstKey];
        errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
      }

      setError(errorMsg);
    } finally {
      setApplying(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
      </div>
    );

  if (!job)
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 dark:text-white">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <h2 className="text-2xl font-bold">{error}</h2>
        <Link to="/jobs" className="text-primary-600 font-bold hover:underline">
          Back to Job Listings
        </Link>
      </div>
    );

  const companyName = job.company?.name || "Company";
  const locationName = job.location?.city
    ? `${job.location.city}, ${job.location.country}`
    : "Remote";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary-600 mb-8 transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Listings
        </Link>

        {/* Success Alert */}
        {success && (
          <div className="mb-8 flex items-center gap-3 p-6 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-3xl border border-green-100 dark:border-green-800 animate-in fade-in slide-in-from-top-4">
            <CheckCircle className="w-8 h-8" />
            <div>
              <p className="font-black text-lg">Application Successful!</p>
              <p className="text-sm opacity-80">
                You're one step closer. Redirecting to your applications...
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="flex gap-5 items-center">
                  <div className="w-20 h-20 rounded-2xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-700 shadow-inner">
                    {job.company?.logo ? (
                      <img
                        src={job.company.logo}
                        alt={companyName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Building2 className="w-10 h-10 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">
                      {job.title}
                    </h1>
                    <div className="flex items-center gap-2 mt-2 font-bold text-primary-600">
                      <span>{companyName}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                      <span className="flex items-center gap-1 text-gray-500 text-sm font-medium">
                        <MapPin className="w-4 h-4" /> {locationName}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs font-black uppercase tracking-widest">
                    {job.job_type?.name}
                  </span>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                    Posted {new Date(job.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-10 border-t border-gray-50 dark:border-gray-700">
                <DetailBox
                  icon={<DollarSign />}
                  label="Annual Salary"
                  value={
                    job.salary_min
                      ? `$${job.salary_min / 1000}k - $${job.salary_max / 1000}k`
                      : "Not Disclosed"
                  }
                />
                <DetailBox
                  icon={<Briefcase />}
                  label="Experience"
                  value={job.experience_level || "Entry Level"}
                />
                <DetailBox
                  icon={<Globe />}
                  label="Work Method"
                  value={job.is_remote ? "Remote" : "On-Site"}
                />
                <DetailBox
                  icon={<ShieldCheck />}
                  label="Role Level"
                  value="Entry-Mid"
                />
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6">
                About the Role
              </h3>
              <div className="prose prose-indigo dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                <p className="whitespace-pre-wrap">{job.description}</p>
              </div>

              {job.responsibilities && (
                <>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-10 mb-6">
                    Responsibilities
                  </h3>
                  <ul className="space-y-4">
                    {job.responsibilities.split("\n").map((line, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-gray-600 dark:text-gray-400 font-medium"
                      >
                        <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex-shrink-0 flex items-center justify-center text-primary-600 text-xs font-bold">
                          {i + 1}
                        </span>
                        {line}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {job.requirements && (
                <>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-10 mb-6">
                    Requirements
                  </h3>
                  <ul className="space-y-4">
                    {job.requirements.split("\n").map((line, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-gray-600 dark:text-gray-400 font-medium"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2.5 flex-shrink-0" />
                        {line}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Apply Card - Only for Candidates */}
            {user?.user_type === "candidate" && (
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl shadow-primary-500/10 border-2 border-primary-50 dark:border-primary-900/10">
                <h4 className="text-xl font-black text-gray-900 dark:text-white mb-4">
                  Want to apply?
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 font-medium">
                  Submit your details today and get a response within 48 hours.
                </p>

                <button
                  onClick={() => !job.has_applied && setShowApplyModal(true)}
                  disabled={job.has_applied}
                  className={`w-full py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-2 group shadow-xl ${
                    job.has_applied
                      ? "bg-green-500 text-white cursor-not-allowed shadow-green-500/20"
                      : "bg-primary-600 text-white hover:bg-primary-700 shadow-primary-500/30"
                  }`}
                >
                  {job.has_applied ? (
                    <>
                      Applied already <CheckCircle className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      Apply for this position{" "}
                      <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </button>

                <div className="mt-8 pt-8 border-t border-gray-50 dark:border-gray-700 space-y-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                  <div className="flex justify-between items-start gap-4 text-gray-900 dark:text-white">
                    <span className="shrink-0">Category</span>
                    <span className="text-primary-600 text-right font-black">
                      {job.category?.name || "General"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Open Positions</span>
                    <span>2</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Applications</span>
                    <span>{job.applications_count || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Views</span>
                    <span>{job.views_count || 0}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Company Quick Contact */}
            <div className="bg-gray-900 dark:bg-black rounded-3xl p-8 text-white shadow-xl">
              <h4 className="text-lg font-black mb-6">Company Contact</h4>
              <div className="space-y-5">
                <ContactItem
                  icon={<Globe className="w-4 h-4" />}
                  label="Website"
                  value={job.company?.website || "N/A"}
                  isLink={true}
                />
                <ContactItem
                  icon={<Mail className="w-4 h-4" />}
                  label="Jobs Email"
                  value={job.company?.email || "hr@company.com"}
                />
                <ContactItem
                  icon={<Mail className="w-4 h-4" />}
                  label="Phone"
                  value={job.company?.phone || "N/A"}
                />
              </div>
              <Link
                to={`/companies/${job.company?.id}`}
                className="block mt-8 text-center text-xs font-black uppercase tracking-widest text-primary-400 hover:text-primary-300 transition-colors"
              >
                View Company Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 w-full max-w-2xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="px-6 sm:px-10 py-6 sm:py-8 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 sticky top-0 bg-transparent">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white lowercase tracking-tighter">
                  Apply <span className="text-primary-600 uppercase">Now</span>
                </h2>
                <p className="text-[10px] sm:text-sm font-medium text-gray-500 mt-1">
                  Applying for {job.title}
                </p>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-700 hover:bg-red-50 hover:text-red-500 rounded-xl sm:rounded-2xl transition-all"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <form
              onSubmit={handleApply}
              className="p-6 sm:p-10 space-y-6 sm:space-y-8"
            >
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl text-sm font-bold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" /> {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                  Cover Letter
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Why are you a good fit for this role?"
                  className="w-full px-6 py-5 bg-gray-50 dark:bg-gray-900 border-none rounded-3xl focus:ring-2 focus:ring-primary-500 dark:text-white font-medium shadow-inner resize-none transition-all"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                  Resume / CV (PDF)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    required
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setResume(e.target.files[0])}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label
                    htmlFor="resume-upload"
                    className="flex items-center justify-between w-full px-6 py-5 bg-gray-50 dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary-500 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <Upload className="w-6 h-6 text-gray-400 group-hover:text-primary-600 transition-colors" />
                      <span className="text-sm font-bold text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors truncate max-w-[150px] sm:max-w-none">
                        {resume ? resume.name : "Choose a file to upload"}
                      </span>
                    </div>
                    <span className="text-xs font-black uppercase text-primary-600 tracking-widest">
                      Browse
                    </span>
                  </label>
                </div>
                <p className="mt-3 text-[10px] uppercase font-black tracking-tighter text-gray-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Max size: 5MB. Formats:
                  PDF, DOC, DOCX
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-center gap-3 sm:gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="w-full sm:flex-1 py-4 sm:py-5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-black rounded-2xl hover:bg-gray-100 transition-all opacity-60 sm:opacity-100"
                >
                  Cancel
                </button>
                <button
                  disabled={applying}
                  type="submit"
                  className="w-full sm:flex-[2] py-4 sm:py-5 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-700 transition-all shadow-xl shadow-primary-500/30 flex items-center justify-center gap-2"
                >
                  {applying ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" /> Submit Application
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailBox({ icon, label, value }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400">
        <span className="text-primary-500 opacity-80">{icon}</span> {label}
      </div>
      <div className="text-sm font-bold text-gray-900 dark:text-white truncate">
        {value}
      </div>
    </div>
  );
}

function ContactItem({ icon, label, value, isLink }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-primary-400">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-0.5">
          {label}
        </p>
        {isLink ? (
          <a
            href={value.startsWith("http") ? value : `https://${value}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-bold hover:text-primary-400 transition-colors truncate block max-w-[150px]"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm font-bold truncate block max-w-[150px]">
            {value}
          </p>
        )}
      </div>
    </div>
  );
}
