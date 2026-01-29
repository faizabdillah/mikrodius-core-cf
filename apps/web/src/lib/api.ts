const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

type RequestOptions = {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: unknown
    headers?: Record<string, string>
}

class ApiClient {
    private token: string | null = null

    setToken(token: string | null) {
        this.token = token
        if (token) {
            localStorage.setItem('token', token)
        } else {
            localStorage.removeItem('token')
        }
    }

    getToken(): string | null {
        if (!this.token) {
            this.token = localStorage.getItem('token')
        }
        return this.token
    }

    async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...options.headers,
        }

        const token = this.getToken()
        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: options.method || 'GET',
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Request failed' }))
            throw new Error(error.error || 'Request failed')
        }

        return response.json()
    }

    // Auth
    async login(email: string, password: string) {
        const data = await this.request<{ token: string; user: any }>('/auth/login', {
            method: 'POST',
            body: { email, password },
        })
        this.setToken(data.token)
        return data
    }

    async register(email: string, password: string, name?: string) {
        const data = await this.request<{ token: string; user: any }>('/auth/register', {
            method: 'POST',
            body: { email, password, name },
        })
        this.setToken(data.token)
        return data
    }

    async getMe() {
        return this.request<{ user: any; workspaces: any[] }>('/auth/me')
    }

    logout() {
        this.setToken(null)
    }

    // Workspaces
    async getWorkspaces() {
        return this.request<{ workspaces: any[] }>('/workspaces')
    }

    async createWorkspace(name: string, slug: string) {
        return this.request<any>('/workspaces', { method: 'POST', body: { name, slug } })
    }

    async getWorkspace(id: string) {
        return this.request<any>(`/workspaces/${id}`)
    }

    // Subscribers
    async getSubscribers(workspaceId: string) {
        return this.request<{ subscribers: any[] }>(`/subscribers/workspace/${workspaceId}`)
    }

    async createSubscriber(workspaceId: string, data: any) {
        return this.request<any>(`/subscribers/workspace/${workspaceId}`, { method: 'POST', body: data })
    }

    async updateSubscriber(id: string, data: any) {
        return this.request<any>(`/subscribers/${id}`, { method: 'PUT', body: data })
    }

    async suspendSubscriber(id: string) {
        return this.request<any>(`/subscribers/${id}/suspend`, { method: 'POST' })
    }

    async activateSubscriber(id: string) {
        return this.request<any>(`/subscribers/${id}/activate`, { method: 'POST' })
    }

    async deleteSubscriber(id: string) {
        return this.request<any>(`/subscribers/${id}`, { method: 'DELETE' })
    }

    // Plans
    async getPlans(workspaceId: string) {
        return this.request<{ plans: any[] }>(`/plans/workspace/${workspaceId}`)
    }

    async createPlan(workspaceId: string, data: any) {
        return this.request<any>(`/plans/workspace/${workspaceId}`, { method: 'POST', body: data })
    }

    async updatePlan(id: string, data: any) {
        return this.request<any>(`/plans/${id}`, { method: 'PUT', body: data })
    }

    async deletePlan(id: string) {
        return this.request<any>(`/plans/${id}`, { method: 'DELETE' })
    }

    // Invoices
    async getInvoices(workspaceId: string, status?: string) {
        const query = status ? `?status=${status}` : ''
        return this.request<{ invoices: any[] }>(`/invoices/workspace/${workspaceId}${query}`)
    }

    async createInvoice(workspaceId: string, data: any) {
        return this.request<any>(`/invoices/workspace/${workspaceId}`, { method: 'POST', body: data })
    }

    async payInvoice(id: string) {
        return this.request<any>(`/invoices/${id}/pay`, { method: 'POST' })
    }

    async cancelInvoice(id: string) {
        return this.request<any>(`/invoices/${id}/cancel`, { method: 'POST' })
    }

    // Tags
    async getTags(workspaceId: string) {
        return this.request<{ tags: any[] }>(`/tags/workspace/${workspaceId}`)
    }

    async createTag(workspaceId: string, name: string, color?: string) {
        return this.request<any>(`/tags/workspace/${workspaceId}`, { method: 'POST', body: { name, color } })
    }

    // Health
    async getHealth() {
        return this.request<{ status: string }>('/health')
    }
}

export const api = new ApiClient()
