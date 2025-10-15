const DEFAULT_HEADERS: HeadersInit = {
  "Content-Type": "application/json",
};

function normalizeBaseUrl(url: string | undefined): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
}

function resolveBaseUrl(): string {
  const envUrl = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);
  if (envUrl) {
    return envUrl;
  }

  if (typeof window !== "undefined") {
    const origin = normalizeBaseUrl(window.location.origin);

    // Ambiente local: o backend roda normalmente na porta 3000 enquanto o Vite usa 5173.
    if (typeof window !== "undefined" && window.location.host.includes("localhost")) {
      const port = window.location.port;
      if (port === "5173" || port === "4173") {
        return "http://localhost:3000";
      }
    }

    return origin;
  }

  return "";
}

const API_BASE_URL = resolveBaseUrl();

function resolveUrl(input: RequestInfo): RequestInfo {
  if (typeof input === "string") {
    if (input.startsWith("http://") || input.startsWith("https://")) {
      return input;
    }

    if (!API_BASE_URL) {
      throw new Error(
        "API_BASE_URL não configurada. Defina VITE_API_BASE_URL ou configure a origem do backend."
      );
    }

    if (input.startsWith("/")) {
      return `${API_BASE_URL}${input}`;
    }

    return `${API_BASE_URL}/${input}`;
  }
  return input;
}

function getAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem("auth_token");
}

type ApiFetchOptions = RequestInit & {
  skipJson?: boolean;
};

async function parseResponse<T>(response: Response, skipJson?: boolean): Promise<T> {
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const errorBody = await response.json();
      if (errorBody?.message) {
        message = errorBody.message;
      }
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  if (skipJson || response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function apiFetch<T>(input: RequestInfo, options: ApiFetchOptions = {}): Promise<T> {
  const { skipJson, headers, ...init } = options;

  const resolvedInput = resolveUrl(input);
  const authToken = getAuthToken();

  const response = await fetch(resolvedInput, {
    credentials: "include",
    ...init,
    headers: {
      ...DEFAULT_HEADERS,
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
      ...(headers ?? {}),
    },
  });

  return parseResponse<T>(response, skipJson);
}
