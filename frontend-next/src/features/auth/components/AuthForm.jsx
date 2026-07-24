"use client";

import { useEffect, useMemo, useState } from "react";
import FormLabel from "@/shared/components/FormLabel";
import Snackbar from "@/shared/components/Snackbar";
import {
  firstError,
  getPasswordRuleResults,
  normalizeUsername,
  onlyDigits,
  validateEmail,
  validateIdentifier,
  validateName,
  validateOtp,
  validatePassword,
  validatePhoneNumber,
  validateUsername,
} from "@/shared/lib/validation";
import { confirmPasswordReset, getPhoneCountryCodes, login, requestPasswordReset, signup } from "../services/authApi";

const initialState = {
  name: "",
  username: "",
  email: "",
  phoneCountryCode: "",
  phoneNationalNumber: "",
  identifier: "",
  password: "",
  resetIdentifier: "",
  otp: "",
  newPassword: "",
};

function detectCountryCode(countries, fallbackCode) {
  if (typeof window === "undefined") return fallbackCode;

  const locale = Intl.DateTimeFormat().resolvedOptions().locale || navigator.language || "";
  const parts = locale.split("-");
  const region = parts[1]?.toUpperCase();

  if (!region) return fallbackCode;
  const match = countries.find((country) => country.code === region);
  return match?.code || fallbackCode;
}

export default function AuthForm({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [resetStep, setResetStep] = useState("request");
  const [values, setValues] = useState(initialState);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ message: "", type: "error" });
  const [loading, setLoading] = useState(false);
  const [phoneCountries, setPhoneCountries] = useState([]);
  const [phoneCountriesLoading, setPhoneCountriesLoading] = useState(true);

  const isSignup = mode === "signup";
  const isForgot = mode === "forgot";
  const selectedCountry = phoneCountries.find((country) => country.code === values.phoneCountryCode);
  const selectedDialCode = selectedCountry?.dialCode || "+91";

  const resetForm = (nextMode) => {
    setMode(nextMode);
    setResetStep("request");
    setValues((prev) => ({
      ...initialState,
      phoneCountryCode: prev.phoneCountryCode,
    }));
    setError("");
    setInfo("");
    setFieldErrors({});
    setSnackbar({ message: "", type: "error" });
  };

  const getValidationErrors = () => {
    const nextErrors = {};

    if (isSignup) {
      nextErrors.name = validateName(values.name);
      nextErrors.username = validateUsername(values.username);
      nextErrors.email = validateEmail(values.email);
      nextErrors.phoneNationalNumber = validatePhoneNumber(values.phoneNationalNumber, selectedDialCode);
      nextErrors.password = validatePassword(values.password);
      return Object.fromEntries(Object.entries(nextErrors).filter(([, message]) => message));
    }

    if (isForgot) {
      if (resetStep === "request") {
        nextErrors.resetIdentifier = validateIdentifier(values.resetIdentifier);
        return Object.fromEntries(Object.entries(nextErrors).filter(([, message]) => message));
      }
      nextErrors.otp = validateOtp(values.otp);
      nextErrors.newPassword = validatePassword(values.newPassword, "New password");
      return Object.fromEntries(Object.entries(nextErrors).filter(([, message]) => message));
    }

    nextErrors.identifier = validateIdentifier(values.identifier);
    nextErrors.password = values.password ? "" : "Password is required.";
    return Object.fromEntries(Object.entries(nextErrors).filter(([, message]) => message));
  };

  const canSubmit = useMemo(() => {
    if (isSignup) {
      return values.name && values.username && values.email && values.phoneNationalNumber && values.password;
    }

    if (isForgot) {
      if (resetStep === "request") {
        return values.resetIdentifier;
      }
      return values.otp && values.newPassword;
    }

    return values.identifier && values.password;
  }, [isSignup, isForgot, resetStep, values]);

  useEffect(() => {
    let active = true;

    async function loadPhoneCountries() {
      try {
        const data = await getPhoneCountryCodes();
        if (!active) return;

        setPhoneCountries(data.countries);
        setValues((prev) => ({
          ...prev,
          phoneCountryCode: prev.phoneCountryCode || detectCountryCode(data.countries, data.defaultCountryCode),
        }));
      } catch {
        if (!active) return;
        setPhoneCountries([{ code: "IN", name: "India", dialCode: "+91" }]);
        setValues((prev) => ({ ...prev, phoneCountryCode: prev.phoneCountryCode || "IN" }));
      } finally {
        if (active) setPhoneCountriesLoading(false);
      }
    }

    loadPhoneCountries();
    return () => {
      active = false;
    };
  }, []);

  const handleChange = (field) => (event) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }));
    setError("");
    setInfo("");
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit || loading) return;

    try {
      const nextErrors = getValidationErrors();
      const validationMessage = firstError(nextErrors);
      if (validationMessage) {
        setFieldErrors(nextErrors);
        setSnackbar({ message: validationMessage, type: "error" });
        return;
      }

      setLoading(true);
      setError("");
      setInfo("");
      setFieldErrors({});

      if (isSignup) {
        const data = await signup({
          name: values.name.trim(),
          username: normalizeUsername(values.username),
          email: values.email.trim().toLowerCase(),
          phoneCountryCode: values.phoneNationalNumber ? selectedDialCode : null,
          phoneNationalNumber: onlyDigits(values.phoneNationalNumber),
          password: values.password,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
        });
        onAuthenticated(data.user);
        return;
      }

      if (isForgot) {
        const resetIdentifier = values.resetIdentifier.trim();

        if (resetStep === "request") {
          const data = await requestPasswordReset({ identifier: resetIdentifier });
          setResetStep("verify");
          setValues((prev) => ({ ...prev, resetIdentifier }));
          const message = data.devOtp
            ? `OTP generated for local testing: ${data.devOtp}`
            : "If the account exists, an OTP has been sent.";
          setInfo(message);
          setSnackbar({ message, type: "success" });
          return;
        }

        await confirmPasswordReset({
          identifier: values.resetIdentifier,
          otp: values.otp,
          newPassword: values.newPassword,
        });
        resetForm("login");
        setSnackbar({ message: "Password reset successfully. Sign in with your new password.", type: "success" });
        return;
      }

      const identifier = values.identifier.trim();
      const data = await login({ identifier, password: values.password });
      onAuthenticated(data.user);
    } catch (apiError) {
      const message = apiError.message || "Authentication failed";
      setError(message);
      setSnackbar({ message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="authForm">
      <Snackbar message={snackbar.message} type={snackbar.type} onClose={() => setSnackbar({ message: "", type: "error" })} />
      {isSignup && (
        <>
          <label>
            <FormLabel required>Full name</FormLabel>
            <input className={fieldErrors.name ? "inputInvalid" : ""} value={values.name} onChange={handleChange("name")} placeholder="Bhumika Jain" />
            {fieldErrors.name ? <span className="fieldError">{fieldErrors.name}</span> : null}
          </label>
          <label>
            <FormLabel required>Username</FormLabel>
            <input className={fieldErrors.username ? "inputInvalid" : ""} value={values.username} onChange={handleChange("username")} placeholder="bhumika_jain" />
            {fieldErrors.username ? <span className="fieldError">{fieldErrors.username}</span> : null}
          </label>
          <label>
            <FormLabel required>Email</FormLabel>
            <input className={fieldErrors.email ? "inputInvalid" : ""} type="email" value={values.email} onChange={handleChange("email")} placeholder="you@example.com" />
            {fieldErrors.email ? <span className="fieldError">{fieldErrors.email}</span> : null}
          </label>
          <label>
            <FormLabel required>Phone number</FormLabel>
            <div className="phoneFieldRow">
              <select value={values.phoneCountryCode} onChange={handleChange("phoneCountryCode")} disabled={phoneCountriesLoading}>
                {phoneCountries.map((country) => (
                  <option key={`${country.code}-${country.dialCode}`} value={country.code}>
                    {country.name} ({country.dialCode})
                  </option>
                ))}
              </select>
              <input className={fieldErrors.phoneNationalNumber ? "inputInvalid" : ""} value={values.phoneNationalNumber} onChange={handleChange("phoneNationalNumber")} inputMode="tel" placeholder="9876543210" />
            </div>
            {fieldErrors.phoneNationalNumber ? <span className="fieldError">{fieldErrors.phoneNationalNumber}</span> : null}
          </label>
        </>
      )}

      {!isSignup && !isForgot && (
        <label>
          <FormLabel required>Username, email, or phone</FormLabel>
          <input
            className={fieldErrors.identifier ? "inputInvalid" : ""}
            value={values.identifier}
            onChange={handleChange("identifier")}
            inputMode="text"
            placeholder="bhumika_jain, you@example.com, or 9416043036"
          />
          {fieldErrors.identifier ? <span className="fieldError">{fieldErrors.identifier}</span> : null}
        </label>
      )}

      {isForgot && (
        <>
          <h2 className="authFormTitle">Reset password</h2>
          {resetStep === "request" ? (
            <label>
              <FormLabel required>Username, email, or phone</FormLabel>
              <input
                className={fieldErrors.resetIdentifier ? "inputInvalid" : ""}
                value={values.resetIdentifier}
                onChange={handleChange("resetIdentifier")}
                inputMode="text"
                placeholder="bhumika_jain, you@example.com, or 9416043036"
              />
              {fieldErrors.resetIdentifier ? <span className="fieldError">{fieldErrors.resetIdentifier}</span> : null}
            </label>
          ) : (
            <>
              <label>
                <FormLabel required>OTP</FormLabel>
                <input className={fieldErrors.otp ? "inputInvalid" : ""} value={values.otp} onChange={handleChange("otp")} inputMode="numeric" maxLength={6} placeholder="6-digit code" />
                {fieldErrors.otp ? <span className="fieldError">{fieldErrors.otp}</span> : null}
              </label>
              <label>
                <FormLabel required>New password</FormLabel>
                <input className={fieldErrors.newPassword ? "inputInvalid" : ""} type="password" value={values.newPassword} onChange={handleChange("newPassword")} placeholder="At least 8 characters" />
                <PasswordRules value={values.newPassword} />
                {fieldErrors.newPassword ? <span className="fieldError">{fieldErrors.newPassword}</span> : null}
              </label>
            </>
          )}
        </>
      )}

      {!isForgot && (
        <label>
          <FormLabel required>Password</FormLabel>
          <input className={fieldErrors.password ? "inputInvalid" : ""} type="password" value={values.password} onChange={handleChange("password")} placeholder="Password" />
          {isSignup ? <PasswordRules value={values.password} /> : null}
          {fieldErrors.password ? <span className="fieldError">{fieldErrors.password}</span> : null}
        </label>
      )}

      {info ? <p className="infoText">{info}</p> : null}
      {error ? <p className="errorText">{error}</p> : null}

      <button type="submit" disabled={!canSubmit || loading}>
        {loading
          ? "Please wait..."
          : isSignup
            ? "Create account"
            : isForgot
              ? resetStep === "request"
                ? "Send OTP"
                : "Reset password"
              : "Sign in"}
      </button>

      {!isSignup && !isForgot ? (
        <button type="button" className="linkButton" onClick={() => resetForm("forgot")}>
          Forgot password?
        </button>
      ) : null}

      <button
        type="button"
        className="ghostButton"
        onClick={() => {
          resetForm(isSignup || isForgot ? "login" : "signup");
        }}
      >
        {isSignup || isForgot ? "Back to sign in" : "Need an account? Create one"}
      </button>
    </form>
  );
}

function PasswordRules({ value }) {
  return (
    <div className="passwordRules" aria-label="Password requirements">
      {getPasswordRuleResults(value).map((rule) => (
        <span key={rule.label} className={rule.valid ? "valid" : ""}>
          {rule.valid ? "✓" : "○"} {rule.label}
        </span>
      ))}
    </div>
  );
}
