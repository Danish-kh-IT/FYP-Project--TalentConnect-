import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function EditProfileModal({
  open,
  onClose,
  profile,
  onProfileUpdate,
}) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    headline: "",
    phone: "",
    location: "",
    bio: "",
    skills: "",
    experience_years: "0-1 Years",
    education_degree: "",
    education_institution: "",
    graduation_year: "",
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
  });
  const [resume, setResume] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (profile && user) {
      setFormData({
        first_name: user?.user?.first_name || "",
        last_name: user?.user?.last_name || "",
        headline: profile.headline || "",
        phone: profile.phone || "",
        location: profile.location || "",
        bio: profile.bio || "",
        skills: profile.skills || "",
        experience_years: profile.experience_years || "0-1 Years",
        education_degree: profile.education_degree || "",
        education_institution: profile.education_institution || "",
        graduation_year: profile.graduation_year || "",
        linkedin_url: profile.linkedin_url || "",
        github_url: profile.github_url || "",
        portfolio_url: profile.portfolio_url || "",
      });
    }
  }, [profile, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Reset error for this field
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (e.target.name === "resume") {
      if (file.type !== "application/pdf") {
        alert("Only PDF files are allowed for resumes.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Resume file size must be less than 5MB.");
        return;
      }
      setResume(file);
    } else if (e.target.name === "profile_picture") {
      if (!file.type.startsWith("image/")) {
        alert("Only image files are allowed for profile pictures.");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert("Profile picture size must be less than 2MB.");
        return;
      }
      setProfilePicture(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.bio.length > 500) {
      alert("Professional summary must be 500 characters or less.");
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      if (resume) data.append("resume", resume);
      if (profilePicture) data.append("profile_picture", profilePicture);

      const response = await api.patch(`users/profile/${profile.id}/`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onProfileUpdate(response.data);
      onClose();
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Failed to update profile. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title
                      as="h3"
                      className="text-base font-semibold leading-6 text-gray-900 dark:text-white"
                    >
                      Edit Profile
                    </Dialog.Title>
                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                      {/* Basic Info */}
                      <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                          <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                            Professional Headline
                          </label>
                          <input
                            type="text"
                            name="headline"
                            value={formData.headline}
                            onChange={handleChange}
                            placeholder="e.g. Senior React Developer"
                            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                            Years of Experience
                          </label>
                          <select
                            name="experience_years"
                            value={formData.experience_years}
                            onChange={handleChange}
                            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                          >
                            <option value="0-1 Years">0-1 Years</option>
                            <option value="1-3 Years">1-3 Years</option>
                            <option value="3-5 Years">3-5 Years</option>
                            <option value="5-10 Years">5-10 Years</option>
                            <option value="10+ Years">10+ Years</option>
                          </select>
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                            Location
                          </label>
                          <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                            Phone Number
                          </label>
                          <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                          />
                        </div>

                        {/* Education Section */}
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                            Degree
                          </label>
                          <input
                            type="text"
                            name="education_degree"
                            value={formData.education_degree}
                            onChange={handleChange}
                            placeholder="BS Computer Science"
                            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                            Institution
                          </label>
                          <input
                            type="text"
                            name="education_institution"
                            value={formData.education_institution}
                            onChange={handleChange}
                            placeholder="University of Example"
                            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                          />
                        </div>

                        <div className="sm:col-span-1">
                          <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                            Year
                          </label>
                          <input
                            type="text"
                            name="graduation_year"
                            value={formData.graduation_year}
                            onChange={handleChange}
                            placeholder="2023"
                            maxLength={4}
                            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                          />
                        </div>

                        <div className="col-span-full">
                          <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                            Professional Summary (Max 500 chars)
                          </label>
                          <div className="mt-2">
                            <textarea
                              name="bio"
                              rows={3}
                              value={formData.bio}
                              onChange={handleChange}
                              maxLength={500}
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                            />
                            <p className="text-xs text-right text-gray-500 mt-1">
                              {formData.bio.length}/500
                            </p>
                          </div>
                        </div>

                        <div className="col-span-full">
                          <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                            Skills (comma separated)
                          </label>
                          <div className="mt-2">
                            <input
                              type="text"
                              name="skills"
                              value={formData.skills}
                              onChange={handleChange}
                              placeholder="React.js, Node.js, Python"
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                            />
                          </div>
                        </div>

                        {/* Files */}
                        <div className="sm:col-span-3">
                          <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                            Profile Picture
                          </label>
                          <input
                            type="file"
                            name="profile_picture"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="mt-2 block w-full text-sm text-gray-900 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                            Resume (PDF)
                          </label>
                          <input
                            type="file"
                            name="resume"
                            accept="application/pdf"
                            onChange={handleFileChange}
                            className="mt-2 block w-full text-sm text-gray-900 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                          />
                        </div>

                        {/* Social Links */}
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                            LinkedIn URL
                          </label>
                          <input
                            type="url"
                            name="linkedin_url"
                            value={formData.linkedin_url}
                            onChange={handleChange}
                            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                            GitHub URL
                          </label>
                          <input
                            type="url"
                            name="github_url"
                            value={formData.github_url}
                            onChange={handleChange}
                            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                            Portfolio URL
                          </label>
                          <input
                            type="url"
                            name="portfolio_url"
                            value={formData.portfolio_url}
                            onChange={handleChange}
                            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                          />
                        </div>
                      </div>

                      <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 sm:col-start-2 disabled:opacity-50"
                        >
                          {loading ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 sm:col-start-1 sm:mt-0"
                          onClick={onClose}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
