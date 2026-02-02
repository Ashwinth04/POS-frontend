import { User } from "../types/auth";

const USER_KEY = "auth_user";
const TIME_KEY = "auth_last_checked";
const TTL = 5 * 60 * 1000; // 5 minutes

export function saveUser(user: User) {
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  sessionStorage.setItem(TIME_KEY, Date.now().toString());
}

export function getCachedUser(): User | null {
  const user = sessionStorage.getItem(USER_KEY);
  const time = sessionStorage.getItem(TIME_KEY);

  if (!user || !time) return null;

  if (Date.now() - Number(time) > TTL) return null;

  return JSON.parse(user);
}

export function clearUser() {
  sessionStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TIME_KEY);
}
