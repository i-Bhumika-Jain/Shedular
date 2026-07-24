export function onlyDigits(value = "") {
  return value.replace(/\D/g, "");
}

export function normalizeUsername(value = "") {
  return value.trim().toLowerCase();
}

export function validateName(value) {
  const trimmed = value.trim();
  if (!trimmed) return "Full name is required.";
  if (trimmed.length < 2) return "Full name must be at least 2 characters.";
  if (trimmed.length > 120) return "Full name must be 120 characters or less.";
  return "";
}

export function validateUsername(value) {
  const username = normalizeUsername(value);
  if (!username) return "Username is required.";
  if (username.length < 3 || username.length > 30) return "Username must be 3 to 30 characters.";
  if (!/^[a-z0-9_][a-z0-9_.]*$/.test(username)) {
    return "Username can use lowercase letters, numbers, underscore, or dot. No spaces.";
  }
  if (username.includes("..")) return "Username cannot contain two dots together.";
  if (username.endsWith(".")) return "Username cannot end with a dot.";
  return "";
}

export function validateEmail(value) {
  const email = value.trim();
  if (!email) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
  return "";
}

export function getPasswordRuleResults(value = "") {
  return [
    { label: "At least 8 characters", valid: value.length >= 8 },
    { label: "One lowercase letter", valid: /[a-z]/.test(value) },
    { label: "One uppercase letter", valid: /[A-Z]/.test(value) },
    { label: "One number", valid: /[0-9]/.test(value) },
    { label: "One symbol", valid: /[^A-Za-z0-9]/.test(value) },
  ];
}

export function validatePassword(value, label = "Password") {
  if (!value) return `${label} is required.`;
  const missingRule = getPasswordRuleResults(value).find((rule) => !rule.valid);
  return missingRule ? `${label} must include: ${missingRule.label.toLowerCase()}.` : "";
}

export function validatePhoneNumber(nationalNumber, dialCode = "+91", { required = true } = {}) {
  const digits = onlyDigits(nationalNumber);
  const dialDigits = onlyDigits(dialCode);

  if (!digits) return required ? "Phone number is required." : "";
  if (digits.length < 4) return "Phone number is too short.";
  if (digits.length > 15) return "Phone number is too long.";
  if (dialDigits.length + digits.length < 7 || dialDigits.length + digits.length > 15) {
    return "Phone number must be valid internationally.";
  }
  return "";
}

export function validateIdentifier(value) {
  if (!value.trim()) return "Username or email is required.";
  if (value.trim().length < 3) return "Enter at least 3 characters.";
  return "";
}

export function validateOtp(value) {
  if (!value.trim()) return "OTP is required.";
  if (!/^[0-9]{6}$/.test(value.trim())) return "OTP must be 6 digits.";
  return "";
}

export function firstError(errors) {
  return Object.values(errors).find(Boolean) || "";
}
