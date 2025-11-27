const KEY = "auth_token";
const ROLE = "auth_role";

export const tokenstore = {
  get(): string | null {
    return localStorage.getItem(KEY);
  },
  set(token: string) {
    localStorage.setItem(KEY, token);
  },
  clear() {
    localStorage.removeItem(KEY);
    localStorage.removeItem(ROLE);
  },
  setRole(role: string | null) {
    if (role) localStorage.setItem(ROLE, role);
    else localStorage.removeItem(ROLE);
  },
  getRole(): string | null {
    return localStorage.getItem(ROLE);
  }
};
