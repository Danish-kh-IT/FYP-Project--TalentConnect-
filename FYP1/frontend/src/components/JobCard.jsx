import { MapPin, Clock, DollarSign, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function JobCard({ job }) {
  const { user } = useAuth();
  const {
    id,
    title,
    company,
    location,
    job_type: jobType,
    salary_min,
    salary_max,
    posted_at,
    created_at,
  } = job;

  // Helper for relative time (e.g. "2 days ago")
  const timeAgo = (date) => {
    if (!date) return "";
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    return "Just now";
  };

  const companyName = company?.name || "Company";
  const logoUrl = company?.logo;
  const locationName = location?.city
    ? `${location.city}, ${location.country}`
    : "Remote";
  const jobTypeName = jobType?.name || "Full-time";

  const jobTypeColors = {
    "Full-time":
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    "Part-time":
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Contract:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    Internship:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  };

  return (
    <div className="group relative flex flex-col justify-between bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 ease-out">
      <div>
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-700 shadow-inner group-hover:border-primary-200 dark:group-hover:border-primary-900 transition-colors">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={companyName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Briefcase className="w-7 h-7 text-gray-400" />
              )}
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary-600 transition-colors">
                {title}
              </h3>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {companyName}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 gap-2.5">
            <div className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-700">
              <MapPin className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
            </div>
            <span>{locationName}</span>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${jobTypeColors[jobTypeName] || "bg-gray-100 text-gray-700"}`}
            >
              {jobTypeName}
            </span>

            {(salary_min || salary_max) && (
              <div className="flex items-center text-sm font-bold text-gray-900 dark:text-white gap-1.5">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span>
                  {salary_min ? `$${Math.floor(salary_min / 1000)}k` : ""}
                  {salary_min && salary_max ? " - " : ""}
                  {salary_max ? `$${Math.floor(salary_max / 1000)}k` : ""}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Posted {timeAgo(posted_at || created_at)}</span>
          </div>
        </div>
      </div>

      <div className="mt-2">
        <Link
          to={`/jobs/${id}`}
          className="block w-full text-center rounded-xl bg-primary-600 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-primary-700 active:scale-95 transition-all duration-200"
        >
          {user?.user_type === "admin" ? "See Job Detail" : "Apply Now"}
        </Link>
      </div>
    </div>
  );
}
