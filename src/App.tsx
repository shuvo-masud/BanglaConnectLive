import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import  SignupPage  from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { MentorsPage } from './pages/MentorsPage';
import { MentorProfilePage } from './pages/MentorProfilePage';
import { ProfilePage } from './pages/ProfilePage';
import { MyConnectionsPage } from './pages/MyConnectionsPage';
import { JobsPage } from './pages/JobsPage';
import { BlogsPage } from './pages/BlogsPage';
import { EventsPage } from './pages/EventsPage';
import { ChatPage } from './pages/ChatPage';
import { VaultPage } from './pages/VaultPage';
import { SupportPage } from './pages/SupportPage';
import { AdminPage } from './pages/AdminPage';
import { FeedPage } from './pages/FeedPage';
import { EmergencyAidPage } from './pages/EmergencyAidPage';
import { AuthGate } from './components/AuthGate';
import  CompleteProfilePage from './pages/CompleteProfilePage';
import AuthCallback from "./pages/AuthCallback";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AuthGate>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/complete-profile"
              element={<CompleteProfilePage />}
            />

            <Route
              path="/feed"
              element={
                <ProtectedRoute>
                  <Layout>
                    <FeedPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/chats"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ChatPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/mentors"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MentorsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
             path="/emergency-aid"
             element={
              <ProtectedRoute>
               <Layout>
                <EmergencyAidPage />
              </Layout>
             </ProtectedRoute>
  }
/>


            <Route
              path="/mentors/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MentorProfilePage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProfilePage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/connections"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MyConnectionsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/jobs"
              element={
                <ProtectedRoute>
                  <Layout>
                    <JobsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/jobs/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <JobsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/blogs"
              element={
                <ProtectedRoute>
                  <Layout>
                    <BlogsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/blogs/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <BlogsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <Layout>
                    <EventsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/events/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <EventsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ChatPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/vault"
              element={
                <ProtectedRoute>
                  <Layout>
                    <VaultPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/support"
              element={
                <ProtectedRoute>
                  <Layout>
                    <SupportPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AdminPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/emergency-aid"
              element={
                <ProtectedRoute>
                  <Layout>
                    <EmergencyAidPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthGate>
      </BrowserRouter>
    </AuthProvider>
  );
}