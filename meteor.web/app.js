// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth'; // We will create this
import Layout from './components/layout/Layout'; // We will create this
import HomePage from './pages/HomePage'; // We will create this
import AboutPage from './pages/AboutPage'; // We will create this
import ContactPage from './pages/ContactPage'; // We will create this
import LoginPage from './pages/LoginPage'; // We will create this
import SignUpPage from './pages/SignUpPage'; // We will create this
import OnboardingPage from './pages/OnboardingPage'; // We will create this
import EntrepreneurDashboardPage from './pages/EntrepreneurDashboardPage'; // We will create this
import MentorProfilePage from './pages/MentorProfilePage'; // We will create this
import ChatPage from './pages/ChatPage'; // We will create this
import ApplyMentorPage from './pages/ApplyMentorPage'; // We will create this
import MentorDashboardPage from './pages/MentorDashboardPage'; // We will create this
import AdminDashboardPage from './pages/admin/AdminDashboardPage'; // We will create this
import AdminMentorApplicationsPage from './pages/admin/AdminMentorApplicationsPage'; // We will create this
import AdminUsersPage from './pages/admin/AdminUsersPage'; // We will create this
import AdminMentorshipsPage from './pages/admin/AdminMentorshipsPage'; // We will create this

// Protected Route Component
const ProtectedRoute = ({ children, requiredRoles, redirectPath = '/' }) => {
  const { user, loading, userProfile } = useAuth();

  if (loading) {
    // Or a loading spinner component
    return <div>Loading...</div>;
  }

  if (!user) {
    // Not logged in
    return <Navigate to="/login" replace />;
  }

  if (!userProfile) {
     // Logged in but profile/role not loaded yet, wait for userProfile
     return <div>Loading user profile...</div>;
  }

  // Check if onboarding is complete for entrepreneurs
  if (userProfile.role === 'entrepreneur' && !userProfile.onboardingComplete && window.location.pathname !== '/onboarding') {
       return <Navigate to="/onboarding" replace />;
  }

  // Check roles if required
  if (requiredRoles && requiredRoles.length > 0) {
      if (!requiredRoles.includes(userProfile.role)) {
           // User role does not match required roles
           console.warn(`User with role ${userProfile.role} attempted to access restricted route. Required roles: ${requiredRoles.join(', ')}`);
           return <Navigate to={redirectPath} replace />;
      }
  }


  return children;
};


function App() {
  return (
    <Router>
      <Layout> {/* Layout includes Header, Footer, Mobile Banner */}
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/mentor/:id" element={<MentorProfilePage />} /> {/* Public mentor profile view? Or only for logged in? Assuming public for now */}


          {/* Protected Routes - Base */}
           <Route
             path="/onboarding"
             element={
               <ProtectedRoute requiredRoles={['entrepreneur']}>
                 <OnboardingPage />
               </ProtectedRoute>
             }
           />
          <Route
            path="/apply-mentor"
            element={
              <ProtectedRoute requiredRoles={['entrepreneur', 'mentor', 'pending_mentor', 'rejected_mentor']}> {/* Any logged in user can apply */}
                <ApplyMentorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:mentorshipId"
            element={
              <ProtectedRoute requiredRoles={['entrepreneur', 'mentor']}> {/* Only matched entrepreneur/mentor */}
                <ChatPage />
              </ProtectedRoute>
            }
          />


          {/* Protected Routes - Role Specific */}
          <Route
            path="/dashboard/entrepreneur"
            element={
              <ProtectedRoute requiredRoles={['entrepreneur']}>
                <EntrepreneurDashboardPage />
              </ProtectedRoute>
            }
          />
           <Route
            path="/dashboard/mentor"
            element={
              <ProtectedRoute requiredRoles={['mentor', 'pending_mentor', 'rejected_mentor']}> {/* Mentors and pending/rejected can see their status */}
                <MentorDashboardPage />
              </ProtectedRoute>
            }
          />


          {/* Admin Protected Routes */}
           <Route
             path="/admin"
             element={
               <ProtectedRoute requiredRoles={['admin']} redirectPath="/dashboard/entrepreneur"> {/* Redirect non-admins */}
                 <AdminDashboardPage />
               </ProtectedRoute>
             }
           />
           <Route
             path="/admin/mentor-applications"
             element={
               <ProtectedRoute requiredRoles={['admin']} redirectPath="/dashboard/entrepreneur">
                 <AdminMentorApplicationsPage />
               </ProtectedRoute>
             }
           />
           <Route
             path="/admin/users"
             element={
               <ProtectedRoute requiredRoles={['admin']} redirectPath="/dashboard/entrepreneur">
                 <AdminUsersPage />
               </ProtectedRoute>
             }
           />
            <Route
             path="/admin/mentorships"
             element={
               <ProtectedRoute requiredRoles={['admin']} redirectPath="/dashboard/entrepreneur">
                 <AdminMentorshipsPage />
               </ProtectedRoute>
             }
           />


          {/* Fallback/Catch-all route (Optional) */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
