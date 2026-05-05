import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import JobListingPage from "./pages/JobListingPage";
import ProfilePage from "./pages/ProfilePage";
import CompanyRegisterPage from "./pages/CompanyRegisterPage";
import EmployerDashboard from "./pages/EmployerDashboard";
import ApplicationsPage from "./pages/ApplicationsPage";
import ChatPage from "./pages/ChatPage";
import PostJobPage from "./pages/PostJobPage";
import CandidateDashboard from "./pages/CandidateDashboard";
import EmployerJobsPage from "./pages/EmployerJobsPage";
import JobDetailPage from "./pages/JobDetailPage";
import CompanyListingPage from "./pages/CompanyListingPage";
import CandidateListingPage from "./pages/CandidateListingPage";
import EditJobPage from "./pages/EditJobPage";
import CompanyDetailPage from "./pages/CompanyDetailPage";
import AdminDashboard from "./pages/AdminDashboard";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (user?.user_type === "admin") return <Navigate to="/admin-dashboard" />;
  if (user?.user_type === "employer")
    return <Navigate to="/employer-dashboard" />;
  return <Navigate to="/candidate-dashboard" />;
};

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/jobs" element={<JobListingPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/companies" element={<CompanyListingPage />} />
        <Route path="/companies/:id" element={<CompanyDetailPage />} />
        <Route path="/candidates" element={<CandidateListingPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          }
        />
        {/* Protected Routes */}
        <Route
          path="/applications"
          element={
            <ProtectedRoute>
              <ApplicationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post-job"
          element={
            <ProtectedRoute>
              <PostJobPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company-register"
          element={
            <ProtectedRoute>
              <CompanyRegisterPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer-dashboard"
          element={
            <ProtectedRoute>
              <EmployerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate-dashboard"
          element={
            <ProtectedRoute>
              <CandidateDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-jobs"
          element={
            <ProtectedRoute>
              <EmployerJobsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-job/:id"
          element={
            <ProtectedRoute>
              <EditJobPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
