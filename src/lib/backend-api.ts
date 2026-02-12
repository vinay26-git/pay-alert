const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

type AuthResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
};

export class BackendApi {
  private accessToken: string | null = null;

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set("Content-Type", "application/json");
    if (this.accessToken) {
      headers.set("Authorization", `Bearer ${this.accessToken}`);
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
      credentials: "include"
    });

    if (response.status === 401 && path !== "/api/auth/refresh") {
      await this.refresh();
      return this.request<T>(path, init);
    }

    if (!response.ok) {
      const body = await response.json().catch(() => ({ message: "Request failed" }));
      throw new Error(body.message || "Request failed");
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  async register(payload: { fullName: string; email: string; password: string }) {
    const data = await this.request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    this.accessToken = data.accessToken;
    return data.user;
  }

  async login(payload: { email: string; password: string }) {
    const data = await this.request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    this.accessToken = data.accessToken;
    return data.user;
  }

  async refresh() {
    const data = await this.request<{ accessToken: string }>("/api/auth/refresh", {
      method: "POST"
    });
    this.accessToken = data.accessToken;
  }

  async logout() {
    await this.request<void>("/api/auth/logout", { method: "POST" });
    this.accessToken = null;
  }
}

export const backendApi = new BackendApi();
