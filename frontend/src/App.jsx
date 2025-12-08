import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import Home from './pages/Home'
import About from './pages/About'
import Dashboard from './pages/Dashboard'
import UploadReport from './pages/UploadReport'
import ViewReport from './pages/ViewReport'
import Reports from './pages/Reports'
import Doctors from './pages/Doctors'
import Login from './pages/Login'
import Signup from './pages/Signup'
import CompleteProfile from './pages/CompleteProfile'
import UserProfile from './pages/UserProfile'

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>

      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/signup" element={
        <PublicRoute>
          <Signup />
        </PublicRoute>
      } />
      <Route path="/complete-profile" element={
        <ProtectedRoute>
          <CompleteProfile />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <UserProfile />
        </ProtectedRoute>
      } />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/upload" element={
        <ProtectedRoute>
          <UploadReport />
        </ProtectedRoute>
      } />
      <Route path="/reports/:id" element={
        <ProtectedRoute>
          <ViewReport />
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute>
          <Reports />
        </ProtectedRoute>
      } />
      <Route path="/doctors" element={
        <ProtectedRoute>
          <Doctors />
        </ProtectedRoute>
      } />



    </Routes>
  )
}

export default App

