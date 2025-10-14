const DEFAULT_HEADERS: HeadersInit = {
  "Content-Type": "application/json",
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

function resolveUrl(input: RequestInfo): RequestInfo {
  if (typeof input === "string" && input.startsWith("/")) {
    return `${API_BASE_URL}${input}`;
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
