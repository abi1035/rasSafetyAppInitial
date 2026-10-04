import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import SafetyForm from "./pages/framer/SafetyForm";
import MySubmissions from "./pages/framer/MySubmissions";

import Login from "./pages/Login";
import FramerDashboard from "./pages/framer/FramerDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import SubmissionDetails from "./pages/framer/SubmissionDetails";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route
            path="/framer"
            element={
              <ProtectedRoute allowedRole="framer">
                <FramerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/framer/new-submission"
            element={
              <ProtectedRoute allowedRole="framer">
                <SafetyForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/framer/submissions"
            element={
              <ProtectedRoute allowedRole="framer">
                <MySubmissions />
              </ProtectedRoute>
            }
          />

          <Route
            path="/framer/submissions/:id"
            element={
              <ProtectedRoute allowedRole="framer">
                <SubmissionDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
