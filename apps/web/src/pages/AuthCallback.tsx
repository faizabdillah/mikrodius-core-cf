import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'

export default function AuthCallback() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    useEffect(() => {
        const token = searchParams.get('token')
        const error = searchParams.get('error')

        if (error) {
            navigate(`/login?error=${error}`)
            return
        }

        if (token) {
            api.setToken(token)
            navigate('/')
        } else {
            navigate('/login?error=no_token')
        }
    }, [searchParams, navigate])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p>Completing sign in...</p>
            </div>
        </div>
    )
}
