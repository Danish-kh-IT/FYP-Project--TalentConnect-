import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function CompanyRegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    size: "1-10",
    address: "",
    email: "",
    description: "",
    website: "",
  });
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const industries = [
    "IT/Software",
    "Healthcare",
    "Finance",
    "Education",
    "Manufacturing",
    "Retail",
    "Other",
  ];

  const sizes = ["1-10", "11-50", "51-200", "201-500", "500+"];

  useEffect(() => {
    const fetchExistingCompany = async () => {
      try {
        const response = await api.get("companies/me/");
        if (response.data) {
          setFormData({
            name: response.data.name || "",
            industry: response.data.industry || "",
            size: response.data.size || "1-10",
            address: response.data.address || "",
            email: response.data.email || "",
            description: response.data.description || "",
            website: response.data.website || "",
          });
          if (response.data.logo) {
            setLogoPreview(response.data.logo);
          }
        }
      } catch (err) {
        console.log("No existing company found, starting fresh.");
      }
    };
    fetchExistingCompany();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("industry", formData.industry);
    data.append("size", formData.size);
    data.append("address", formData.address);
    data.append("email", formData.email);
    data.append("description", formData.description);
    data.append("website", formData.website);
    if (logo) {
      data.append("logo", logo);
    }

    // Default is_verified to False handled by backend

    try {
      await api.post("companies/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // On success, redirect to dashboard
      navigate("/employer-dashboard");
    } catch (error) {
      console.error("Failed to register company", error);
      let errorMessage = "Failed to register company. Please try again.";
      if (error.response?.data) {
        if (typeof error.response.data === "object") {
          errorMessage = Object.entries(error.response.data)
            .map(([field, msgs]) => `${field}: ${msgs}`)
            .join("\n");
        } else if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        }
      }
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Register Your Company
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Complete your company profile to start posting jobs.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[40rem]">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Logo Upload */}
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="h-24 w-24 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden mb-2 border border-gray-200 dark:border-gray-600 flex items-center justify-center">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400">Logo</span>
                )}
              </div>
              <label className="cursor-pointer text-sm font-medium text-primary-600 hover:text-primary-500">
                Upload Logo
                <input
                  type="file"
                  name="logo"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Company Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Industry
                </label>
                <select
                  name="industry"
                  required
                  value={formData.industry}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                >
                  <option value="">Select Industry</option>
                  {industries.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Company Size
                </label>
                <select
                  name="size"
                  required
                  value={formData.size}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                >
                  {sizes.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Location / HQ
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. San Francisco, CA"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Contact Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="hr@company.com"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                required
                value={formData.description}
                onChange={handleChange}
                maxLength={1000}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
              />
              <p className="mt-2 text-sm text-gray-500 text-right">
                {formData.description.length}/1000
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Complete Registration"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
