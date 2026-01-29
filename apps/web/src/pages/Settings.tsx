import { useAuth } from '../contexts/AuthContext'

export default function Settings() {
    const { currentWorkspace, user } = useAuth()

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

            <div className="space-y-6 max-w-2xl">
                {/* Account Info */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h2 className="text-lg font-semibold text-white mb-4">Account</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-700">
                            <span className="text-gray-400">Email</span>
                            <span className="text-white">{user?.email}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-700">
                            <span className="text-gray-400">Name</span>
                            <span className="text-white">{user?.name || '-'}</span>
                        </div>
                    </div>
                </div>

                {/* Workspace Info */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h2 className="text-lg font-semibold text-white mb-4">Current Workspace</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-700">
                            <span className="text-gray-400">Name</span>
                            <span className="text-white">{currentWorkspace?.name}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-700">
                            <span className="text-gray-400">Slug</span>
                            <span className="text-white font-mono">{currentWorkspace?.slug}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-700">
                            <span className="text-gray-400">Package</span>
                            <span className="px-2 py-0.5 bg-blue-600 rounded text-white text-sm">
                                {currentWorkspace?.package}
                            </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-700">
                            <span className="text-gray-400">Status</span>
                            <span className={`px-2 py-0.5 rounded text-sm ${currentWorkspace?.status === 'active'
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-gray-500/20 text-gray-400'
                                }`}>
                                {currentWorkspace?.status}
                            </span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-gray-400">Workspace ID</span>
                            <span className="text-gray-500 font-mono text-sm">{currentWorkspace?.id}</span>
                        </div>
                    </div>
                </div>

                {/* API Keys */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h2 className="text-lg font-semibold text-white mb-4">API Access</h2>
                    <p className="text-gray-400 text-sm mb-4">
                        Use these endpoints for direct RADIUS/ACS integration.
                    </p>
                    <div className="space-y-2 text-sm">
                        <div className="p-3 bg-gray-900 rounded-lg">
                            <span className="text-gray-400">API URL: </span>
                            <code className="text-blue-400">{window.location.origin}/api</code>
                        </div>
                        <div className="p-3 bg-gray-900 rounded-lg">
                            <span className="text-gray-400">Config Endpoint: </span>
                            <code className="text-blue-400">GET /config/packages</code>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
