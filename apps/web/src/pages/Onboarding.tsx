import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'

export default function Onboarding() {
    const { refreshWorkspaces, setCurrentWorkspace } = useAuth()
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [slug, setSlug] = useState('')
    const [error, setError] = useState('')

    const createMutation = useMutation({
        mutationFn: () => api.createWorkspace(name, slug),
        onSuccess: async (data) => {
            await refreshWorkspaces()
            setCurrentWorkspace(data)
            navigate('/')
        },
        onError: (err) => {
            setError(err instanceof Error ? err.message : 'Failed to create workspace')
        },
    })

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        setError('')
        createMutation.mutate()
    }

    const handleNameChange = (value: string) => {
        setName(value)
        setSlug(value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'))
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
                <h1 className="text-2xl font-bold text-white mb-2 text-center">Create Your Workspace</h1>
                <p className="text-gray-400 text-center mb-6">Set up your first ISP workspace</p>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Workspace Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="My ISP"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Slug</label>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                            className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                            placeholder="my-isp"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">Used in URLs and API calls</p>
                    </div>
                    <button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
                    >
                        {createMutation.isPending ? 'Creating...' : 'Create Workspace'}
                    </button>
                </form>
            </div>
        </div>
    )
}
