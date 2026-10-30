/**
 * Cliente tipado para las APIs internas. Usado por los hooks y contextos.
 * Las cookies de sesión viajan solas (same-origin).
 */
import type {
  ApiErrorBody,
  ApiErrorCode,
  LessonResponse,
  LessonsResponse,
  LoginResponse,
  LogoutResponse,
  MeResponse,
  ProgressResponse,
  SaveProgressResponse,
  SignupResponse,
  UserStatsResponse,
} from "./api-types";
import type { LoginInput, SaveProgressInput, SignupInput } from "./validation";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: ApiErrorCode,
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as ApiErrorBody).error?.message === "string"
  );
}

async function request<T>(path: string, init?: RequestInit & { body?: BodyInit | null }): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      credentials: "same-origin",
      cache: "no-store",
      ...init,
      headers: { Accept: "application/json", ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers },
    });
  } catch {
    throw new ApiError(0, "server_error", "Sin conexión. Revisa tu internet e inténtalo de nuevo.");
  }

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    // Respuesta sin JSON (p. ej. 502 del proxy).
  }

  if (!response.ok) {
    if (isApiErrorBody(body)) {
      throw new ApiError(response.status, body.error.code, body.error.message, body.error.fields);
    }
    throw new ApiError(response.status, "server_error", "Algo salió mal. Inténtalo de nuevo.");
  }
  return body as T;
}

const post = <T>(path: string, data?: unknown) =>
  request<T>(path, { method: "POST", body: data === undefined ? null : JSON.stringify(data) });

export const api = {
  auth: {
    signup: (input: SignupInput) => post<SignupResponse>("/api/auth/signup", input),
    login: (input: LoginInput) => post<LoginResponse>("/api/auth/login", input),
    logout: () => post<LogoutResponse>("/api/auth/logout"),
    me: () => request<MeResponse>("/api/auth/me"),
  },
  lessons: {
    list: (opts: { full?: boolean; week?: number } = {}) => {
      const qs = new URLSearchParams();
      if (opts.full) qs.set("full", "1");
      if (opts.week) qs.set("week", String(opts.week));
      const q = qs.toString();
      return request<LessonsResponse>(`/api/lessons${q ? `?${q}` : ""}`);
    },
    byDay: (day: number) => request<LessonResponse>(`/api/lessons/${day}`),
  },
  progress: {
    get: (userId: string = "me") => request<ProgressResponse>(`/api/progress/${encodeURIComponent(userId)}`),
    save: (input: SaveProgressInput, userId: string = "me") =>
      post<SaveProgressResponse>(`/api/progress/${encodeURIComponent(userId)}`, input),
  },
  user: {
    stats: () => request<UserStatsResponse>("/api/user/stats"),
  },
};

/** Claves de TanStack Query centralizadas. */
export const queryKeys = {
  me: ["auth", "me"] as const,
  stats: ["user", "stats"] as const,
  progress: (userId: string) => ["progress", userId] as const,
  lessons: (opts: { full?: boolean; week?: number } = {}) => ["lessons", opts] as const,
  lesson: (day: number) => ["lesson", day] as const,
};
