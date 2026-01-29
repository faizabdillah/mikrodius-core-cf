import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { api } from '../lib/api'

type User = {
    id: string
    email: string
    name?: string
}

type Workspace = {
    id: string
    name: string
    slug: string
    package: string
    status: string
}

type AuthContextType = {
    user: User | null
    workspaces: Workspace[]
    currentWorkspace: Workspace | null
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    register: (email: string, password: string, name?: string) => Promise<void>
    logout: () => void
    setCurrentWorkspace: (workspace: Workspace) => void
    refreshWorkspaces: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [workspaces, setWorkspaces] = useState<Workspace[]>([])
    const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const token = api.getToken()
        if (token) {
            api.getMe()
                .then((data) => {
                    setUser(data.user)
                    setWorkspaces(data.workspaces)
                    if (data.workspaces.length > 0) {
                        const savedId = localStorage.getItem('currentWorkspaceId')
                        const saved = data.workspaces.find((w: Workspace) => w.id === savedId)
                        setCurrentWorkspace(saved || data.workspaces[0])
                    }
                })
                .catch(() => {
                    api.logout()
                })
                .finally(() => setIsLoading(false))
        } else {
            setIsLoading(false)
        }
    }, [])

    const login = async (email: string, password: string) => {
        const data = await api.login(email, password)
        setUser(data.user)
        const wsData = await api.getMe()
        setWorkspaces(wsData.workspaces)
        if (wsData.workspaces.length > 0) {
            setCurrentWorkspace(wsData.workspaces[0])
        }
    }

    const register = async (email: string, password: string, name?: string) => {
        const data = await api.register(email, password, name)
        setUser(data.user)
        setWorkspaces([])
    }

    const logout = () => {
        api.logout()
        setUser(null)
        setWorkspaces([])
        setCurrentWorkspace(null)
    }

    const handleSetCurrentWorkspace = (workspace: Workspace) => {
        setCurrentWorkspace(workspace)
        localStorage.setItem('currentWorkspaceId', workspace.id)
    }

    const refreshWorkspaces = async () => {
        const data = await api.getMe()
        setWorkspaces(data.workspaces)
    }

    return (
        <AuthContext.Provider value={{
            user,
            workspaces,
            currentWorkspace,
            isLoading,
            login,
            register,
            logout,
            setCurrentWorkspace: handleSetCurrentWorkspace,
            refreshWorkspaces,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}
