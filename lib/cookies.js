export function getCookie(name) {
  const parts = document.cookie.split("; ");

  for (const part of parts) {
    if (part.startsWith(name + "=")) {
      return part.split("=")[1];
    }
  }

  return null;
}

export function setCookie(name, value) {
  document.cookie =
    name +
    "=" +
    value +
    "; path=/; max-age=31536000";
}