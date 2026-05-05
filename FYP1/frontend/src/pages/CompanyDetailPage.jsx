import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import {
  Building2,
  MapPin,
  Globe,
  Users,
  Briefcase,
  Mail,
  Linkedin,
  Twitter,
  ChevronLeft,
  Loader2,
  TrendingUp,
  Clock,
  ExternalLink,
} from "lucide-react";

export default function CompanyDetailPage() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [companyJobs, setCompanyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        const [companyRes, jobsRes] = await Promise.all([
          api.get(`companies/${id}/`),
          api.get(`jobs/listings/?company=${id}`),
        ]);
        setCompany(companyRes.data);
        setCompanyJobs(jobsRes.data.results || jobsRes.data);
      } catch (err) {
        console.error("Failed to fetch company details", err);
        setError("Company not found or failed to load.");
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 text-center">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
          <Building2 className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
          {error || "Company not found"}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
          The company profile you are looking for might have been removed or the
          ID is incorrect.
        </p>
        <Link
          to="/companies"
          className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg"
        >
          Back to Companies
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Navigation */}
        <Link
          to="/companies"
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 mb-8 transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Companies
        </Link>

        {/* Hero Section */}
        <div className="relative mb-10">
          <div className="h-64 sm:h-80 w-full rounded-[2.5rem] bg-gradient-to-r from-blue-600 to-indigo-700 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
            {company.cover_photo && (
              <img
                src={company.cover_photo}
                alt="Cover"
                className="w-full h-full object-cover opacity-60"
              />
            )}
          </div>

          <div className="absolute -bottom-16 left-8 sm:left-12 flex flex-col sm:flex-row items-end sm:items-center gap-6">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-white dark:bg-gray-800 border-8 border-gray-50 dark:border-gray-900 shadow-2xl flex items-center justify-center overflow-hidden">
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-16 h-16 text-gray-200 dark:text-gray-700" />
              )}
            </div>
            <div className="mb-4 sm:mb-2 flex-1">
              <h1 className="text-4xl sm:text-5xl font-black text-white drop-shadow-md">
                {company.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 text-xs font-bold uppercase tracking-widest leading-none">
                  {company.industry || "Technology"}
                </span>
                {company.is_verified && (
                  <span className="flex items-center gap-1 text-blue-100 text-sm font-bold">
                    <TrendingUp className="w-4 h-4" /> Top Employer
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* About Section */}
            <section className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 sm:p-12 shadow-xl border border-gray-100 dark:border-gray-700">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8">
                About <span className="text-blue-600">Our Vision</span>
              </h2>
              <div className="prose prose-blue dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 font-medium leading-relaxed text-lg">
                <p className="whitespace-pre-wrap">
                  {company.description || "No description provided."}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-12 pt-12 border-t border-gray-50 dark:border-gray-700">
                <div className="space-y-1">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    Industry
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {company.industry || "General"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    Company Size
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {company.company_size || "10-50 Employees"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    Founded
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    2018
                  </p>
                </div>
              </div>
            </section>

            {/* Jobs Section */}
            <section className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                  Active <span className="text-blue-600">Opportunities</span>
                </h2>
                <span className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-black rounded-xl text-sm uppercase tracking-widest">
                  {companyJobs.length} Jobs Posted
                </span>
              </div>

              {companyJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {companyJobs.map((job) => (
                    <Link
                      key={job.id}
                      to={`/jobs/${job.id}`}
                      className="group bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-2xl hover:scale-[1.03] transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="text-xl font-black text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                          {job.title}
                        </h4>
                        <ArrowUpRightIcon />
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm font-bold text-gray-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />{" "}
                          {job.location?.city || "Remote"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" /> Full-time
                        </span>
                      </div>
                      <div className="mt-6 font-black text-blue-600 flex items-center justify-between uppercase text-xs tracking-[0.2em]">
                        <span>Apply Now</span>
                        <span className="text-gray-900 dark:text-white text-base tracking-normal lowercase font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                  <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-bold">
                    No active job listings at the moment.
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Contact Card */}
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-xl border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-8 uppercase tracking-widest">
                Connect with Us
              </h3>
              <div className="space-y-6">
                <ContactRow
                  icon={<Globe className="w-5 h-5" />}
                  label="Official Website"
                  value={company.website || "Not Available"}
                  isLink={!!company.website}
                />
                <ContactRow
                  icon={<Mail className="w-5 h-5" />}
                  label="Careers Email"
                  value={company.email || "hr@company.com"}
                />
                <ContactRow
                  icon={<Users className="w-5 h-5" />}
                  label="LinkedIn Talent"
                  value={`linkedin.com/company/${company.name.toLowerCase()}`}
                  isLink={true}
                  color="text-indigo-600"
                />
              </div>

              {company.website && (
                <a
                  href={
                    company.website.startsWith("http")
                      ? company.website
                      : `https://${company.website}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="mt-10 w-full py-4 bg-blue-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
                >
                  Visit Website <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* Stats Card */}
            <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-all"></div>
              <h3 className="text-xl font-black mb-8 relative z-10 uppercase tracking-widest">
                Hiring Overview
              </h3>
              <div className="space-y-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-blue-400 font-black text-xl">
                    {companyJobs.length}
                  </div>
                  <div>
                    <h5 className="font-black text-lg">Active Jobs</h5>
                    <p className="text-xs text-blue-200 uppercase tracking-widest font-bold opacity-60">
                      Posted globally
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-green-400 font-black text-xl">
                    124
                  </div>
                  <div>
                    <h5 className="font-black text-lg">Hired Talents</h5>
                    <p className="text-xs text-green-200 uppercase tracking-widest font-bold opacity-60">
                      In last 12 months
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactRow({ icon, label, value, isLink, color = "text-blue-500" }) {
  return (
    <div className="flex items-start gap-4">
      <div
        className={`w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center ${color}`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">
          {label}
        </p>
        {isLink ? (
          <a
            href={value.startsWith("http") ? value : `https://${value}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-blue-600 truncate block"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300 truncate">
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

function ArrowUpRightIcon() {
  return (
    <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
      <TrendingUp className="w-4 h-4" />
    </div>
  );
}
