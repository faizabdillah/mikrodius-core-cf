import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'

export default function Dashboard() {
    const { currentWorkspace } = useAuth()

    const { data: health } = useQuery({
        queryKey: ['health'],
        queryFn: () => api.getHealth(),
        refetchInterval: 30000,
    })

    const { data: subscribersData } = useQuery({
        queryKey: ['subscribers', currentWorkspace?.id],
        queryFn: () => api.getSubscribers(currentWorkspace!.id),
        enabled: !!currentWorkspace,
    })

    const { data: invoicesData } = useQuery({
        queryKey: ['invoices', currentWorkspace?.id],
        queryFn: () => api.getInvoices(currentWorkspace!.id),
        enabled: !!currentWorkspace,
    })

    const activeSubscribers = subscribersData?.subscribers.filter(s => s.status === 'active').length || 0
    const totalSubscribers = subscribersData?.subscribers.length || 0
    const pendingInvoices = invoicesData?.invoices.filter(i => i.status === 'pending').length || 0
    const totalRevenue = invoicesData?.invoices
        .filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + (i.amount || 0), 0) || 0

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* API Status */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h2 className="text-sm font-medium text-gray-400 mb-2">API Status</h2>
                    <div className="flex items-center gap-2">
                        {health?.status === 'ok' ? (
                            <>
                                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                                <span className="text-green-400 font-semibold text-lg">Online</span>
                            </>
                        ) : (
                            <>
                                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                                <span className="text-red-400 font-semibold text-lg">Offline</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Active Subscribers */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h2 className="text-sm font-medium text-gray-400 mb-2">Active Subscribers</h2>
                    <p className="text-3xl font-bold text-white">{activeSubscribers}</p>
                    <p className="text-sm text-gray-400 mt-1">of {totalSubscribers} total</p>
                </div>

                {/* Pending Invoices */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h2 className="text-sm font-medium text-gray-400 mb-2">Pending Invoices</h2>
                    <p className="text-3xl font-bold text-white">{pendingInvoices}</p>
                </div>

                {/* Total Revenue */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h2 className="text-sm font-medium text-gray-400 mb-2">Total Revenue</h2>
                    <p className="text-3xl font-bold text-green-400">
                        ${(totalRevenue / 100).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-3">
                    <a href="/subscribers" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors">
                        Add Subscriber
                    </a>
                    <a href="/plans" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors">
                        Manage Plans
                    </a>
                    <a href="/invoices" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors">
                        View Invoices
                    </a>
                </div>
            </div>
        </div>
    )
}
