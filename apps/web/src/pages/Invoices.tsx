import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'

export default function Invoices() {
    const { currentWorkspace } = useAuth()
    const queryClient = useQueryClient()
    const [filter, setFilter] = useState<string>('')
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({ subscriberId: '', amount: '', dueDate: '' })

    const { data, isLoading } = useQuery({
        queryKey: ['invoices', currentWorkspace?.id, filter],
        queryFn: () => api.getInvoices(currentWorkspace!.id, filter || undefined),
        enabled: !!currentWorkspace,
    })

    const { data: subscribersData } = useQuery({
        queryKey: ['subscribers', currentWorkspace?.id],
        queryFn: () => api.getSubscribers(currentWorkspace!.id),
        enabled: !!currentWorkspace && showForm,
    })

    const createMutation = useMutation({
        mutationFn: (data: any) => api.createInvoice(currentWorkspace!.id, {
            subscriberId: data.subscriberId || null,
            amount: parseInt(data.amount) * 100, // Convert to cents
            dueDate: data.dueDate ? Math.floor(new Date(data.dueDate).getTime() / 1000) : null,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] })
            setShowForm(false)
            setFormData({ subscriberId: '', amount: '', dueDate: '' })
        },
    })

    const payMutation = useMutation({
        mutationFn: api.payInvoice,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
    })

    const cancelMutation = useMutation({
        mutationFn: api.cancelInvoice,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
    })

    const invoices = data?.invoices || []

    const formatDate = (timestamp: number) => {
        if (!timestamp) return '-'
        return new Date(timestamp * 1000).toLocaleDateString()
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">Invoices</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
                >
                    + Create Invoice
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
                {['', 'pending', 'paid', 'cancelled'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${filter === status
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                    >
                        {status || 'All'}
                    </button>
                ))}
            </div>

            {/* Add Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
                        <h2 className="text-lg font-semibold text-white mb-4">Create Invoice</h2>
                        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData) }} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Subscriber (optional)</label>
                                <select
                                    value={formData.subscriberId}
                                    onChange={(e) => setFormData({ ...formData, subscriberId: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                >
                                    <option value="">-- Select --</option>
                                    {subscribersData?.subscribers.map((sub: any) => (
                                        <option key={sub.id} value={sub.id}>{sub.username} - {sub.name || ''}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Amount ($) *</label>
                                <input
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Due Date</label>
                                <input
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white disabled:opacity-50"
                                >
                                    {createMutation.isPending ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-700">
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">ID</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Subscriber</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Amount</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Due Date</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Status</th>
                            <th className="text-right px-4 py-3 text-sm font-medium text-gray-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
                        ) : invoices.length === 0 ? (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No invoices</td></tr>
                        ) : (
                            invoices.map((inv: any) => (
                                <tr key={inv.id} className="border-b border-gray-700 hover:bg-gray-750">
                                    <td className="px-4 py-3 text-white font-mono text-sm">{inv.id.slice(0, 8)}...</td>
                                    <td className="px-4 py-3 text-gray-300">{inv.subscriber_username || '-'}</td>
                                    <td className="px-4 py-3 text-green-400 font-medium">${(inv.amount / 100).toFixed(2)}</td>
                                    <td className="px-4 py-3 text-gray-300">{formatDate(inv.due_date)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${inv.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                                                inv.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-gray-500/20 text-gray-400'
                                            }`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {inv.status === 'pending' && (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => payMutation.mutate(inv.id)}
                                                    className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 rounded text-white"
                                                >
                                                    Mark Paid
                                                </button>
                                                <button
                                                    onClick={() => cancelMutation.mutate(inv.id)}
                                                    className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 rounded text-white"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
