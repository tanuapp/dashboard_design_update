export type ServerNotification = {
  _id: string;
  title: string;
  body: string;
  data?: { type?: string; [key: string]: unknown };
  companyId?: string;
  appointmentId?: string;
  type?: string;
  read: boolean;
  createdAt: string;
  updatedAt?: string;
};

const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:9090/api/v1";

function getToken() {
  if (typeof window === "undefined") return "";
  const keys = ["token", "accessToken", "authToken", "tanu-token"];
  for (const key of keys) {
    const value = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (value) return value.replace(/^Bearer\s+/i, "");
  }
  return "";
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || data?.success === false) {
    throw new Error(data?.message || data?.error || "Notification request failed");
  }
  return data as T;
}

export async function fetchNotifications() {
  const data = await request<{ success: boolean; data: ServerNotification[] }>("/notification");
  return Array.isArray(data.data) ? data.data : [];
}

export async function markNotificationRead(id: string) {
  return request<{ success: boolean; data: ServerNotification }>(`/notification/${id}/read`, {
    method: "PUT",
  });
}

export async function markAllNotificationsRead() {
  return request<{ success: boolean }>("/notification/read-all", { method: "PUT" });
}

export async function deleteNotification(id: string) {
  return request<{ success: boolean }>(`/notification/${id}`, { method: "DELETE" });
}
