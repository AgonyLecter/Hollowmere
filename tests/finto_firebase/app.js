export const getApps = () => window.__fbApps || [];
export function initializeApp(c, n) {
  const a = { name: n };
  (window.__fbApps = window.__fbApps || []).push(a);
  return a;
}
