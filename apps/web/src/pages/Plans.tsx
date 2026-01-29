import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'

export default function Plans() {
    const { currentWorkspace } = useAuth()
    const queryClient = useQueryClient()
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        downloadRate: '',
        uploadRate: '',
        price: '',
        validityDays: '30'
    })

    const { data, isLoading } = useQuery({
        queryKey: ['plans', currentWorkspace?.id],
        queryFn: () => api.getPlans(currentWorkspace!.id),
        enabled: !!currentWorkspace,
    })

    const createMutation = useMutation({
        mutationFn: (data: any) => api.createPlan(currentWorkspace!.id, {
            name: data.name,
            downloadRate: parseInt(data.downloadRate) || null,
            uploadRate: parseInt(data.uploadRate) || null,
            price: parseInt(data.price) * 100 || null, // Convert to cents
            validityDays: parseInt(data.validityDays) || 30,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plans'] })
            setShowForm(false)
            setFormData({ name: '', downloadRate: '', uploadRate: '', price: '', validityDays: '30' })
        },
    })

    const deleteMutation = useMutation({
        mutationFn: api.deletePlan,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plans'] }),
    })

    const plans = data?.plans || []

    const formatSpeed = (kbps: number) => {
        if (!kbps) return '-'
        if (kbps >= 1000) return `${kbps / 1000} Mbps`
        return `${kbps} Kbps`
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">Plans</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
                >
                    + Add Plan
                </button>
            </div>

            {/* Add Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
                        <h2 className="text-lg font-semibold text-white mb-4">Add Plan</h2>
                        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData) }} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Plan Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                    placeholder="e.g., Basic 10Mbps"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Download (Kbps)</label>
                                    <input
                                        type="number"
                                        value={formData.downloadRate}
                                        onChange={(e) => setFormData({ ...formData, downloadRate: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                        placeholder="10000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Upload (Kbps)</label>
                                    <input
                                        type="number"
                                        value={formData.uploadRate}
                                        onChange={(e) => setFormData({ ...formData, uploadRate: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                        placeholder="5000"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Price ($)</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                        placeholder="10"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Validity (days)</label>
                                    <input
                                        type="number"
                                        value={formData.validityDays}
                                        onChange={(e) => setFormData({ ...formData, validityDays: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                    />
                                </div>
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

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                    <div className="col-span-full text-center text-gray-400 py-8">Loading...</div>
                ) : plans.length === 0 ? (
                    <div className="col-span-full text-center text-gray-400 py-8">No plans yet. Create your first plan!</div>
                ) : (
                    plans.map((plan: any) => (
                        <div key={plan.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                                <button
                                    onClick={() => { if (confirm('Delete plan?')) deleteMutation.mutate(plan.id) }}
                                    className="text-red-400 hover:text-red-300 text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Download</span>
                                    <span className="text-white">{formatSpeed(plan.download_rate)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Upload</span>
                                    <span className="text-white">{formatSpeed(plan.upload_rate)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Price</span>
                                    <span className="text-green-400 font-medium">
                                        ${plan.price ? (plan.price / 100).toFixed(2) : '0.00'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Validity</span>
                                    <span className="text-white">{plan.validity_days || 30} days</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
