const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function api(path, options = {}) {
  const headers = {
    'ngrok-skip-browser-warning': 'true',
    ...options.headers,
  };

  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok || body.success === false) {
    throw new Error(
      body.error?.message ||
        body.error?.code ||
        `Request gagal (${response.status})`,
    );
  }

  return body.data;
}
