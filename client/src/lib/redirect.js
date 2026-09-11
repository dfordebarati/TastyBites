// Only allow in-app paths so a crafted link can't send people to another site after login
export const safeRedirect = (path) => (path && path.startsWith('/') && !path.startsWith('//') ? path : null);
