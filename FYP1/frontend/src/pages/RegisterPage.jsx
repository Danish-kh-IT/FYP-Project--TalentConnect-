import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    confirmPassword: "",
    phone: "",
    user_type: "candidate",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasNumber &&
      hasSpecialChar
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!validatePassword(formData.password)) {
      setError(
        "Password must be at least 8 characters long and include an uppercase letter, a number, and a special character.",
      );
      return;
    }

    try {
      // Exclude confirmPassword from payload
      const { confirmPassword, ...payload } = formData;
      await register(payload);
      if (formData.user_type === "employer") {
        navigate("/company-register");
      } else if (formData.user_type === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/candidate-dashboard");
      }
    } catch (err) {
      // ... existing catch block ...
      console.error("Registration failed:", err);
      if (err.response && err.response.data) {
        // Handle DRF error response
        const errorData = err.response.data;
        if (typeof errorData === "object") {
          const messages = Object.keys(errorData).map((key) => {
            const msgs = Array.isArray(errorData[key])
              ? errorData[key].join(" ")
              : errorData[key];
            return `${key.charAt(0).toUpperCase() + key.slice(1)}: ${msgs}`;
          });
          setError(messages.join("\n"));
        } else {
          setError("Registration failed. Please check your details.");
        }
      } else {
        setError("Registration failed. Server might be down.");
      }
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
          Create a new account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 text-center whitespace-pre-line">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                required
                onChange={handleChange}
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                required
                onChange={handleChange}
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
              Username
            </label>
            <input
              type="text"
              name="username"
              required
              onChange={handleChange}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              onChange={handleChange}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              required
              onChange={handleChange}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
              Password
            </label>
            <div className="mt-2 relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-1.5 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Eye className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
              Confirm Password
            </label>
            <div className="mt-2 relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                required
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-1.5 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Eye className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
              Account Type
            </label>
            <select
              name="user_type"
              onChange={handleChange}
              value={formData.user_type}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700"
            >
              <option value="candidate">Candidate</option>
              <option value="employer">Employer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-primary-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            >
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
