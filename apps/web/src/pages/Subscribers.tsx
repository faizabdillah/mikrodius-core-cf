import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'

export default function Subscribers() {
    const { currentWorkspace } = useAuth()
    const queryClient = useQueryClient()
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({ username: '', name: '', email: '', whatsapp: '', address: '' })

    const { data, isLoading } = useQuery({
        queryKey: ['subscribers', currentWorkspace?.id],
        queryFn: () => api.getSubscribers(currentWorkspace!.id),
        enabled: !!currentWorkspace,
    })

    const createMutation = useMutation({
        mutationFn: (data: any) => api.createSubscriber(currentWorkspace!.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscribers'] })
            setShowForm(false)
            setFormData({ username: '', name: '', email: '', whatsapp: '', address: '' })
        },
    })

    const suspendMutation = useMutation({
        mutationFn: api.suspendSubscriber,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscribers'] }),
    })

    const activateMutation = useMutation({
        mutationFn: api.activateSubscriber,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscribers'] }),
    })

    const deleteMutation = useMutation({
        mutationFn: api.deleteSubscriber,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscribers'] }),
    })

    const subscribers = data?.subscribers || []

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">Subscribers</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
                >
                    + Add Subscriber
                </button>
            </div>

            {/* Add Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
                        <h2 className="text-lg font-semibold text-white mb-4">Add Subscriber</h2>
                        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData) }} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Username *</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">WhatsApp</label>
                                <input
                                    type="text"
                                    value={formData.whatsapp}
                                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                    placeholder="+62..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Address</label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                    rows={2}
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
                    <thead className="bg-gray-750">
                        <tr className="border-b border-gray-700">
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Username</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Name</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Plan</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Status</th>
                            <th className="text-right px-4 py-3 text-sm font-medium text-gray-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
                        ) : subscribers.length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No subscribers yet</td></tr>
                        ) : (
                            subscribers.map((sub: any) => (
                                <tr key={sub.id} className="border-b border-gray-700 hover:bg-gray-750">
                                    <td className="px-4 py-3 text-white font-medium">{sub.username}</td>
                                    <td className="px-4 py-3 text-gray-300">{sub.name || '-'}</td>
                                    <td className="px-4 py-3 text-gray-300">{sub.plan_name || '-'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${sub.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                            sub.status === 'suspended' ? 'bg-red-500/20 text-red-400' :
                                                'bg-gray-500/20 text-gray-400'
                                            }`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            {sub.status === 'active' ? (
                                                <button
                                                    onClick={() => suspendMutation.mutate(sub.id)}
                                                    className="px-2 py-1 text-xs bg-yellow-600 hover:bg-yellow-700 rounded text-white"
                                                >
                                                    Suspend
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => activateMutation.mutate(sub.id)}
                                                    className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 rounded text-white"
                                                >
                                                    Activate
                                                </button>
                                            )}
                                            <button
                                                onClick={() => { if (confirm('Delete subscriber?')) deleteMutation.mutate(sub.id) }}
                                                className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 rounded text-white"
                                            >
                                                Delete
                                            </button>
                                        </div>
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
