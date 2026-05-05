import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import {
  Briefcase,
  MapPin,
  Tag,
  DollarSign,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  Save,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function EditJobPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "", // Backend usually expects ID, but serializes objects
    location: "",
    job_type: "",
    salary_min: "",
    salary_max: "",
    experience_level: "Entry Level",
    education_level: "",
    requirements: "",
    responsibilities: "",
    benefits: "",
    is_remote: false,
    status: "active",
  });

  // Options State for dropdowns
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingData(true);
        // Fetch options and job data in parallel
        const [catRes, locRes, typeRes, jobRes] = await Promise.all([
          api.get("jobs/categories/"),
          api.get("jobs/locations/"),
          api.get("jobs/job-types/"),
          api.get(`jobs/listings/${id}/`),
        ]);

        setCategories(catRes.data.results || catRes.data);
        setLocations(locRes.data.results || locRes.data);
        setJobTypes(typeRes.data.results || typeRes.data);

        const job = jobRes.data;
        setFormData({
          title: job.title || "",
          description: job.description || "",
          category: job.category?.id || "",
          location: job.location?.id || "",
          job_type: job.job_type?.id || "",
          salary_min: job.salary_min || "",
          salary_max: job.salary_max || "",
          experience_level: job.experience_level || "Entry Level",
          education_level: job.education_level || "",
          requirements: job.requirements || "",
          responsibilities: job.responsibilities || "",
          benefits: job.benefits || "",
          is_remote: job.is_remote || false,
          status: job.status || "active",
        });
      } catch (err) {
        console.error("Failed to fetch job data", err);
        setError("Failed to load job details. It might have been deleted.");
      } finally {
        setFetchingData(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Create copy of data with renamed keys for backend if needed
      // based on PostJobPage, it used category_id, location_id, job_type_id
      // Let's match that payload structure
      const payload = {
        title: formData.title,
        description: formData.description,
        category_id: formData.category,
        location_id: formData.location,
        job_type_id: formData.job_type,
        salary_min: formData.salary_min,
        salary_max: formData.salary_max,
        experience_level: formData.experience_level,
        requirements: formData.requirements,
        responsibilities: formData.responsibilities,
        benefits: formData.benefits,
        is_remote: formData.is_remote,
        status: formData.status,
      };

      await api.patch(`jobs/listings/${id}/`, payload);
      setSuccess(true);
      setTimeout(() => navigate("/manage-jobs"), 2000);
    } catch (err) {
      console.error("Failed to update job", err);
      setError(
        err.response?.data?.detail ||
          "Failed to update job. Please check all fields.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <Link
          to="/manage-jobs"
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Manage Jobs
        </Link>

        {/* Header */}
        <div className="mb-10 text-left">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Edit <span className="text-primary-600">Listing</span>
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            Current Position:{" "}
            <span className="font-bold">{formData.title}</span>
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-10">
            {/* Success/Error Alerts */}
            {success && (
              <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-2xl border border-green-100 dark:border-green-800 animate-in fade-in slide-in-from-top-4">
                <CheckCircle className="w-6 h-6" />
                <span className="font-bold">
                  Job updated successfully! Redirecting...
                </span>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-800 animate-in fade-in slide-in-from-top-4">
                <AlertCircle className="w-6 h-6" />
                <span className="font-bold">{error}</span>
              </div>
            )}

            {/* Section 1: Basic Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                <Briefcase className="w-5 h-5 text-primary-500" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Job Basics
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                    Job Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="block w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white transition-all shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                      Category
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      <select
                        name="category"
                        required
                        value={formData.category}
                        onChange={handleChange}
                        className="block w-full pl-12 pr-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white appearance-none transition-all shadow-inner"
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                      Job Type
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      <select
                        name="job_type"
                        required
                        value={formData.job_type}
                        onChange={handleChange}
                        className="block w-full pl-12 pr-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white appearance-none transition-all shadow-inner"
                      >
                        <option value="">Select Type</option>
                        {jobTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Location & Salary */}
            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                <MapPin className="w-5 h-5 text-primary-500" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Location & Compensation
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <select
                      name="location"
                      required
                      value={formData.location}
                      onChange={handleChange}
                      className="block w-full pl-12 pr-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white appearance-none transition-all shadow-inner"
                    >
                      <option value="">Select Location</option>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.city}, {loc.country}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_remote"
                      name="is_remote"
                      checked={formData.is_remote}
                      onChange={handleChange}
                      className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    />
                    <label
                      htmlFor="is_remote"
                      className="text-sm font-medium text-gray-600 dark:text-gray-400"
                    >
                      This is a fully remote position
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                    Salary Range (Monthly)
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        name="salary_min"
                        placeholder="Min"
                        value={formData.salary_min}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white transition-all shadow-inner"
                      />
                    </div>
                    <span className="text-gray-300">—</span>
                    <div className="relative flex-1">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        name="salary_max"
                        placeholder="Max"
                        value={formData.salary_max}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white transition-all shadow-inner"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Details */}
            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                <FileText className="w-5 h-5 text-primary-500" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Role Details
                </h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    required
                    rows={6}
                    value={formData.description}
                    onChange={handleChange}
                    className="block w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white transition-all shadow-inner resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                      Key Responsibilities
                    </label>
                    <textarea
                      name="responsibilities"
                      rows={4}
                      value={formData.responsibilities}
                      onChange={handleChange}
                      className="block w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white transition-all shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                      Candidate Requirements
                    </label>
                    <textarea
                      name="requirements"
                      rows={4}
                      value={formData.requirements}
                      onChange={handleChange}
                      className="block w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white transition-all shadow-inner"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-8">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-5 px-4 border border-transparent text-lg font-black rounded-2xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all shadow-xl active:scale-[0.98]"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
