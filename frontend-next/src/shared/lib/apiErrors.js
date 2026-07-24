function cleanMessage(message) {
  return String(message || "")
    .replace(/^Value error,\s*/i, "")
    .trim();
}

function fieldNameFromLocation(location) {
  if (!Array.isArray(location)) return "";
  const field = location[location.length - 1];
  if (typeof field !== "string") return "";
  return field.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}

export function formatApiError(payload, fallback = "Request failed") {
  const detail = payload?.detail ?? payload?.error?.message ?? payload?.message;

  if (!detail) return fallback;
  if (typeof detail === "string") return cleanMessage(detail) || fallback;

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item === "string") return cleanMessage(item);
        const fieldName = fieldNameFromLocation(item?.loc);
        const message = cleanMessage(item?.msg);
        if (!message) return "";
        return fieldName ? `${fieldName}: ${message}` : message;
      })
      .filter(Boolean);

    return messages.length ? messages.join(" ") : fallback;
  }

  if (typeof detail === "object") {
    return cleanMessage(detail.message || detail.msg || JSON.stringify(detail)) || fallback;
  }

  return cleanMessage(detail) || fallback;
}
