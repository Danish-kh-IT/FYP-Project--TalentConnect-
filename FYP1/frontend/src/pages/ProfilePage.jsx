import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import {
  Briefcase,
  GraduationCap,
  MapPin,
  Link as LinkIcon,
  Github,
  Linkedin,
  Mail,
  Phone,
  Pencil,
  Calendar,
} from "lucide-react";
import EditProfileModal from "../components/EditProfileModal";

export default function ProfilePage() {
  const { id } = useParams(); // present when admin views another user's profile
  const { user: currentUser, login } = useAuth();
  const [profileData, setProfileData] = useState(null); // for admin viewing another user
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const isViewingOther = Boolean(id); // admin viewing another user's profile
  const user = isViewingOther ? profileData : currentUser;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (isViewingOther) {
          // Admin: fetch specific user profile by ID
          const profileRes = await api.get(`users/admin-profile/${id}/`);
          setProfileData(profileRes.data);
        } else if (currentUser) {
          // Own profile: fetch education & experience
          const [educationRes, experienceRes] = await Promise.all([
            api.get("users/education/"),
            api.get("users/experience/"),
          ]);
          setEducation(
            Array.isArray(educationRes.data)
              ? educationRes.data
              : educationRes.data.results || [],
          );
          setExperience(
            Array.isArray(experienceRes.data)
              ? experienceRes.data
              : experienceRes.data.results || [],
          );
        }
      } catch (error) {
        console.error("Failed to fetch profile details", error);
      } finally {
        setLoading(false);
      }
    };

    if (isViewingOther || currentUser) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [id, currentUser, isViewingOther]);

  const handleProfileUpdate = (updatedProfile) => {
    // Refresh page to show new data (simplest approach for now)
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading Profile...
      </div>
    );
  }

  if (isViewingOther && !profileData) {
    return (
      <div className="text-center mt-10">Profile not found for this user.</div>
    );
  }

  if (!isViewingOther && !currentUser) {
    return <div className="text-center mt-10">User not found.</div>;
  }

  const { first_name, last_name, email, username } = user.user || {}; // nested user object from serializer

  const {
    bio,
    location,
    phone,
    linkedin_url,
    github_url,
    portfolio_url,
    skills_list = [],
    profile_picture,
  } = user;

  const formatDate = (dateStr) => {
    if (!dateStr) return "Present";
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <EditProfileModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={user}
        onProfileUpdate={handleProfileUpdate}
      />
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="h-32 bg-gradient-to-r from-primary-500 to-primary-700"></div>
        <div className="px-6 pb-6">
          <div className="relative flex items-end -mt-12 mb-4">
            <div className="h-24 w-24 rounded-full ring-4 ring-white dark:ring-gray-800 bg-white dark:bg-gray-700 flex items-center justify-center text-3xl font-bold text-gray-400 overflow-hidden">
              {profile_picture ? (
                <img
                  src={profile_picture}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>
                  {first_name?.[0]}
                  {last_name?.[0]}
                </span>
              )}
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {first_name} {last_name}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    @{username}
                  </p>
                  {user.headline && (
                    <p className="text-md text-primary-600 dark:text-primary-400 font-medium mt-1">
                      {user.headline}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  {!isViewingOther && (
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit Profile
                    </button>
                  )}
                  {user.resume && (
                    <a
                      href={user.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      <LinkIcon className="w-4 h-4" />
                      View Resume
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {/* Bio */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  About
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {bio || "No bio added yet."}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Contact / Info Sidebar */}
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                {location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{location}</span>
                  </div>
                )}
                {email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{email}</span>
                  </div>
                )}
                {phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{phone}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                {linkedin_url && (
                  <a
                    href={linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                )}
                {github_url && (
                  <a
                    href={github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-800 dark:text-gray-200 hover:underline"
                  >
                    <Github className="w-4 h-4" />
                    GitHub
                  </a>
                )}
                {portfolio_url && (
                  <a
                    href={portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-teal-600 hover:text-teal-700"
                  >
                    <LinkIcon className="w-4 h-4" />
                    Portfolio
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Skills
          </h3>
          {/* <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">+ Add Skill</button> */}
        </div>
        {skills_list.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skills_list.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No skills listed yet.</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Experience Section */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Experience
              </h3>
            </div>
            {/* <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">+ Add</button> */}
          </div>
          <div className="space-y-6">
            {experience.map((exp) => (
              <div
                key={exp.id}
                className="relative pl-6 border-l-2 border-gray-200 dark:border-gray-700 last:border-0 pb-6 last:pb-0"
              >
                <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800"></div>
                <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                  {exp.position}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {exp.company}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 mb-2">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {formatDate(exp.start_date)} -{" "}
                    {exp.is_current ? "Present" : formatDate(exp.end_date)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {exp.description}
                </p>
              </div>
            ))}
            {experience.length === 0 && (
              <p className="text-gray-500 italic text-sm">
                No experience added.
              </p>
            )}
          </div>
        </div>

        {/* Education Section */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Education
              </h3>
            </div>
          </div>
          <div className="space-y-6">
            {/* Primary Education from Profile */}
            {(user.education_degree || user.education_institution) && (
              <div className="pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                  {user.education_institution || "Institution"}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {user.education_degree}
                </p>
                {user.graduation_year && (
                  <p className="text-xs text-gray-500 mt-1">
                    Class of {user.graduation_year}
                  </p>
                )}
              </div>
            )}

            {education.map((edu) => (
              <div
                key={edu.id}
                className="relative pl-6 border-l-2 border-gray-200 dark:border-gray-700 last:border-0 pb-6 last:pb-0"
              >
                <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800"></div>
                <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                  {edu.institution}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {edu.degree}
                  {edu.field_of_study ? `, ${edu.field_of_study}` : ""}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 mb-2">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {formatDate(edu.start_date)} -{" "}
                    {edu.is_current ? "Present" : formatDate(edu.end_date)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {edu.description}
                </p>
              </div>
            ))}
            {!user.education_degree && education.length === 0 && (
              <p className="text-gray-500 italic text-sm">
                No education added.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
