import { Fragment } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import {
  Menu as Bars3Icon,
  X as XIcon,
  Moon as MoonIcon,
  Sun as SunIcon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useUnreadCount } from "../hooks/useUnreadCount";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { unreadCount } = useUnreadCount();
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Simplified toggle for now, assume dark mode logic is in explicit hook or context if complex
  const toggleDarkMode = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  // Check theme on mount
  // Note: Better to do this in a ThemeProvider, but putting here for brevity

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Disclosure
        as="nav"
        className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-all duration-300"
      >
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-20 justify-between items-center">
                {/* Logo Section */}
                <div className="flex flex-shrink-0 items-center">
                  <Link
                    to="/"
                    className="flex items-center gap-3 transition-all hover:opacity-80"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg shadow-blue-500/10 flex items-center justify-center p-1.5 sm:p-2 border border-blue-50/50 dark:border-blue-900/20">
                      <img
                        src="/logo.svg"
                        alt="TalentConnect Logo"
                        className="w-full h-full"
                      />
                    </div>
                    <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                      Talent<span className="text-blue-600">Connect</span>
                    </span>
                  </Link>
                </div>

                {/* Center Nav Links */}
                <div className="hidden lg:flex items-center space-x-10">
                  {user?.user_type === "admin" ? (
                    <>
                      <Link
                        to="/admin-dashboard"
                        className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                      >
                        Control Hub
                      </Link>
                      <Link
                        to="/jobs"
                        className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                      >
                        Jobs
                      </Link>
                    </>
                  ) : user?.user_type === "employer" ? (
                    <>
                      <Link
                        to="/employer-dashboard"
                        className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/manage-jobs"
                        className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                      >
                        Posted Jobs
                      </Link>
                      <Link
                        to="/applications"
                        className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                      >
                        Applicants
                      </Link>
                      <Link
                        to="/post-job"
                        className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                      >
                        Post Job
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/jobs"
                        className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                      >
                        Find Jobs
                      </Link>
                      <Link
                        to="/companies"
                        className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                      >
                        Companies
                      </Link>
                      <Link
                        to="/dashboard"
                        className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                      >
                        Dashboard
                      </Link>
                    </>
                  )}
                  {user && user.user_type !== "admin" && (
                    <Link
                      to="/chat"
                      className={`relative text-sm font-medium transition-colors group ${unreadCount > 0 ? "text-red-500 dark:text-red-400 font-bold" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"}`}
                    >
                      Messages
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-2.5 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 shadow-sm shadow-red-500/50"></span>
                        </span>
                      )}
                    </Link>
                  )}
                </div>

                {/* Right Side Actions */}
                <div className="hidden lg:flex lg:items-center space-x-6">
                  <button
                    onClick={toggleDarkMode}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <span className="sr-only">Toggle Dark Mode</span>
                    <SunIcon className="h-5 w-5 hidden dark:block" />
                    <MoonIcon className="h-5 w-5 block dark:hidden" />
                  </button>

                  {user ? (
                    <Menu as="div" className="relative">
                      <div>
                        <Menu.Button className="relative flex items-center gap-2 rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all hover:bg-gray-200 dark:hover:bg-gray-700">
                          <span className="sr-only">Open user menu</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {user.username}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                user.user_type === "admin"
                                  ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                                  : user.user_type === "employer"
                                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                    : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                              }`}
                            >
                              {user.user_type || "User"}
                            </span>
                          </div>
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-2xl bg-white dark:bg-gray-800 py-2 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100 dark:border-gray-700">
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="/profile"
                                className={classNames(
                                  active ? "bg-gray-50 dark:bg-gray-700" : "",
                                  "block px-4 py-2 text-sm text-gray-700 dark:text-gray-200",
                                )}
                              >
                                Your Profile
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={handleLogout}
                                className={classNames(
                                  active ? "bg-gray-50 dark:bg-gray-700" : "",
                                  "block w-full text-left px-4 py-2 text-sm text-red-600 font-medium",
                                )}
                              >
                                Sign out
                              </button>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  ) : (
                    <div className="flex items-center space-x-4">
                      <Link
                        to="/login"
                        className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                      >
                        Log in
                      </Link>
                      <Link
                        to="/register"
                        className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                      >
                        Sign up
                      </Link>
                    </div>
                  )}
                </div>

                {/* Mobile menu button */}
                <div className="flex items-center lg:hidden">
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-800">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>
            <Transition
              enter="transition duration-200 ease-out"
              enterFrom="opacity-0 -translate-y-4"
              enterTo="opacity-100 translate-y-0"
              leave="transition duration-100 ease-in"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 -translate-y-4"
            >
              <Disclosure.Panel className="lg:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl overflow-hidden">
                <div className="space-y-1 pb-3 pt-2 px-4 text-center sm:text-left">
                  {user?.user_type === "admin" ? (
                    <>
                      <Disclosure.Button
                        as={Link}
                        to="/admin-dashboard"
                        className="block rounded-xl py-3 px-4 text-base font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 transition-colors"
                      >
                        Control Hub
                      </Disclosure.Button>
                      <Disclosure.Button
                        as={Link}
                        to="/jobs"
                        className="block rounded-xl py-3 px-4 text-base font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 transition-colors"
                      >
                        Jobs
                      </Disclosure.Button>
                    </>
                  ) : user?.user_type === "employer" ? (
                    <>
                      <Disclosure.Button
                        as={Link}
                        to="/employer-dashboard"
                        className="block rounded-xl py-3 px-4 text-base font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 transition-colors"
                      >
                        Dashboard
                      </Disclosure.Button>
                      <Disclosure.Button
                        as={Link}
                        to="/manage-jobs"
                        className="block rounded-xl py-3 px-4 text-base font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 transition-colors"
                      >
                        Posted Jobs
                      </Disclosure.Button>
                      <Disclosure.Button
                        as={Link}
                        to="/applications"
                        className="block rounded-xl py-3 px-4 text-base font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 transition-colors"
                      >
                        Applicants
                      </Disclosure.Button>
                      <Disclosure.Button
                        as={Link}
                        to="/post-job"
                        className="block rounded-xl py-3 px-4 text-base font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 transition-colors"
                      >
                        Post Job
                      </Disclosure.Button>
                    </>
                  ) : (
                    <>
                      <Disclosure.Button
                        as={Link}
                        to="/jobs"
                        className="block rounded-xl py-3 px-4 text-base font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 transition-colors"
                      >
                        Find Jobs
                      </Disclosure.Button>
                      <Disclosure.Button
                        as={Link}
                        to="/companies"
                        className="block rounded-xl py-3 px-4 text-base font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 transition-colors"
                      >
                        Companies
                      </Disclosure.Button>
                      <Disclosure.Button
                        as={Link}
                        to="/dashboard"
                        className="block rounded-xl py-3 px-4 text-base font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 transition-colors"
                      >
                        Dashboard
                      </Disclosure.Button>
                    </>
                  )}
                  {user && user.user_type !== "admin" && (
                    <Disclosure.Button
                      as={Link}
                      to="/chat"
                      className={`relative flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-base font-semibold transition-colors ${unreadCount > 0 ? "bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600"}`}
                    >
                      Messages
                      {unreadCount > 0 && (
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                      )}
                    </Disclosure.Button>
                  )}
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pb-6 pt-4 px-4">
                  {user ? (
                    <div className="space-y-4">
                      <div className="flex items-center px-4 py-2">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold uppercase transition-all">
                            {user?.username?.[0] || "U"}
                          </div>
                        </div>
                        <div className="ml-3 text-left">
                          <div className="text-base font-bold text-gray-800 dark:text-white">
                            {user?.username || "User"}
                          </div>
                          <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {user?.email || user?.user_type}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Disclosure.Button
                          as={Link}
                          to="/profile"
                          className="flex items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                        >
                          Profile
                        </Disclosure.Button>
                        <button
                          onClick={handleLogout}
                          className="flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/10 py-3 text-sm font-bold text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <Disclosure.Button
                        as={Link}
                        to="/login"
                        className="flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                      >
                        Log in
                      </Disclosure.Button>
                      <Disclosure.Button
                        as={Link}
                        to="/register"
                        className="flex items-center justify-center rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
                      >
                        Sign up
                      </Disclosure.Button>
                    </div>
                  )}
                  <button
                    onClick={toggleDarkMode}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-100 dark:border-gray-700 py-3 text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                  >
                    <SunIcon className="h-5 w-5 dark:block hidden" />
                    <MoonIcon className="h-5 w-5 dark:hidden block" />
                    <span>Toggle Theme</span>
                  </button>
                </div>
              </Disclosure.Panel>
            </Transition>
          </>
        )}
      </Disclosure>

      <main className={isHomePage ? "" : "py-10"}>
        {isHomePage ? (
          children
        ) : (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        )}
      </main>
    </div>
  );
}
