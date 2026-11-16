// Calendogram lab demo: stands in for src/api.ts. Nothing leaves the browser:
// no server, no OpenAI, no sync. Data lives in this browser's IndexedDB only.
import type { Account, ParseRequest, ParsedTask, UsageReport } from '../shared/types.ts';

export function getToken() {
  return 'demo';
}
export function setToken(_token: string) {}

export class AuthError extends Error {}
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export const setAuthErrorHandler = (_fn: () => void) => {};

export const DEMO_USER: Account = { id: 'demo', username: 'demo', name: 'Demo visitor', isAdmin: false, disabled: false, createdAt: 0 };
const OFF = 'Not available in the lab demo: it runs without a server.';

export async function api<T>(path: string, _init: RequestInit = {}): Promise<T> {
  if (path === '/config') return { ai: false, transcription: false } as T;
  if (path === '/me') return DEMO_USER as T;
  if (path === '/sync') return { records: [], cursor: Date.now() } as T;
  if (path === '/usage' || path === '/logout') return { ok: true } as T;
  throw new ApiError(OFF, 503);
}

export type AppConfig = { transcription: boolean; ai: boolean };
export const getConfig = () => api<AppConfig>('/config');
export const login = async (_u: string, _p: string) => ({ token: 'demo', user: DEMO_USER });
export const getMe = () => api<Account>('/me');
export const logoutRequest = () => api<{ ok: true }>('/logout');
export const changePassword = (_c: string, _n: string) => api<{ ok: true }>('/password');
export const adminListUsers = () => api<Account[]>('/admin/users');
export const adminCreateUser = (_u: unknown) => api<Account>('/admin/users');
export const adminUpdateUser = (_id: string, _p: unknown) => api<Account>('/admin/users');
export const adminUsage = (_days = 30) => api<UsageReport>('/admin/usage');
export const adminDeleteUser = (_id: string) => api<{ ok: true }>('/admin/users');
export async function transcribeAudio(_a: Blob, _l: string, _v: string[]): Promise<string> {
  throw new ApiError(OFF, 503);
}
export async function parseNote(_r: ParseRequest): Promise<ParsedTask[]> {
  throw new ApiError(OFF, 503);
}
