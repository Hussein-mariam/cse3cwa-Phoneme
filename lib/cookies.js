export function getCookie(name) {
  const parts = document.cookie.split("; ");

  for (const part of parts) {
    if (part.startsWith(name + "=")) {
      return part.split("=")[1];
    }
  }

  return null;
}

// max-age is in seconds, so this keeps the setting for a year.
export function setCookie(name, value) {
  document.cookie = name + "=" + value + "; path=/; max-age=31536000";
}