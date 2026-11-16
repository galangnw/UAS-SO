const styles = {
  error: 'bg-brand-red text-white',
  success: 'bg-brand-green text-brand-dark',
  info: 'bg-brand-dark text-white',
};

export default function Toast({ toast }) {
  if (!toast) return null;

  // App menyimpan toast sebagai string; event socket bisa mengirim objek.
  const payload =
    typeof toast === 'string'
      ? { type: 'info', message: toast }
      : { type: 'info', ...toast };

  return (
    <div
      role="status"
      className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border-2 border-white px-4 py-2 text-sm font-bold shadow-lg ${
        styles[payload.type] || styles.info
      }`}
    >
      {payload.message}
    </div>
  );
}
