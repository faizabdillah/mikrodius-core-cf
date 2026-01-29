import { Link, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/subscribers', label: 'Subscribers', icon: '👥' },
    { path: '/plans', label: 'Plans', icon: '📋' },
    { path: '/invoices', label: 'Invoices', icon: '💳' },
    { path: '/devices', label: 'Devices', icon: '📱' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
]

export default function Layout() {
    const { user, currentWorkspace, workspaces, setCurrentWorkspace, logout } = useAuth()
    const location = useLocation()

    return (
        <div className="min-h-screen bg-gray-900 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-700">
                    <h1 className="text-xl font-bold text-white">Mikrodius</h1>
                </div>

                {/* Workspace Selector */}
                <div className="p-4 border-b border-gray-700">
                    <label className="block text-xs text-gray-400 mb-1">Workspace</label>
                    <select
                        value={currentWorkspace?.id || ''}
                        onChange={(e) => {
                            const ws = workspaces.find(w => w.id === e.target.value)
                            if (ws) setCurrentWorkspace(ws)
                        }}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                    >
                        {workspaces.map((ws) => (
                            <option key={ws.id} value={ws.id}>{ws.name}</option>
                        ))}
                    </select>
                    {currentWorkspace && (
                        <span className="inline-block mt-2 px-2 py-0.5 bg-blue-600 rounded text-xs text-white">
                            {currentWorkspace.package}
                        </span>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4">
                    <ul className="space-y-1">
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${location.pathname === item.path
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                        }`}
                                >
                                    <span>{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User */}
                <div className="p-4 border-t border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <div className="text-white font-medium truncate">{user?.email}</div>
                        </div>
                        <button
                            onClick={logout}
                            className="text-gray-400 hover:text-white text-sm"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    )
}
