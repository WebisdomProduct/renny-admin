const ADMIN_TOKEN_KEY = 'adminToken';
const ADMIN_INFO_KEY = 'adminInfo';

export const getAdminToken = () => localStorage.getItem(ADMIN_TOKEN_KEY);

export const getAdminInfo = () => {
  const stored = localStorage.getItem(ADMIN_INFO_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

export const saveAdminSession = (adminData) => {
  localStorage.setItem(ADMIN_TOKEN_KEY, adminData.token);
  localStorage.setItem(ADMIN_INFO_KEY, JSON.stringify(adminData));
};

export const clearAdminSession = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_INFO_KEY);
};

export const getPostAuthRoute = (adminData = getAdminInfo()) => (
  adminData?.mustChangePassword ? '/change-password' : '/admin'
);

export const isSuperadmin = (adminData = getAdminInfo()) => adminData?.role === 'superadmin';

export const isSetupDisabledError = (message = '') => {
  const normalized = String(message).toLowerCase();

  return [
    'public registration is disabled',
    'registration is disabled',
    'setup already completed',
    'admin already exists',
    'superadmin already exists',
    'first admin already exists'
  ].some((fragment) => normalized.includes(fragment));
};
