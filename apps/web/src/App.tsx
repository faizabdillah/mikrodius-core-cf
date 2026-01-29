import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'

// Lazy load pages
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const AuthCallback = lazy(() => import('./pages/AuthCallback'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Subscribers = lazy(() => import('./pages/Subscribers'))
const Plans = lazy(() => import('./pages/Plans'))
const Invoices = lazy(() => import('./pages/Invoices'))
const Devices = lazy(() => import('./pages/Devices'))
const Settings = lazy(() => import('./pages/Settings'))

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, isLoading, workspaces } = useAuth()

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (workspaces.length === 0) {
        return <Navigate to="/onboarding" replace />
    }

    return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth()

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>
    }

    if (user) {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}

function App() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>}>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                <Route path="/auth/callback" element={<AuthCallback />} />

                {/* Onboarding (authenticated but no workspace) */}
                <Route path="/onboarding" element={<Onboarding />} />

                {/* Protected Routes with Layout */}
                <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/subscribers" element={<Subscribers />} />
                    <Route path="/plans" element={<Plans />} />
                    <Route path="/invoices" element={<Invoices />} />
                    <Route path="/devices" element={<Devices />} />
                    <Route path="/settings" element={<Settings />} />
                </Route>
            </Routes>
        </Suspense>
    )
}

export default App
