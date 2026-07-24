import { apiRequest, clearSession, saveSession } from "@/lib/api";

export async function signup(payload) {
  const data = await apiRequest("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  saveSession({ token: data.token, user: data.user });
  return data;
}

export async function getPhoneCountryCodes() {
  return apiRequest("/auth/phone-country-codes");
}

export async function login(payload) {
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  saveSession({ token: data.token, user: data.user });
  return data;
}

export async function requestPasswordReset(payload) {
  return apiRequest("/auth/password-reset/request", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function confirmPasswordReset(payload) {
  return apiRequest("/auth/password-reset/confirm", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logout() {
  clearSession();
}
