export const getAuth = () => window.__fbAuth || (window.__fbAuth = { currentUser: null });
export async function signInAnonymously(auth) {
  auth.currentUser = { uid: window.__fbUid };
  return { user: auth.currentUser };
}
