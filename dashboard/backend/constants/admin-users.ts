export type AdminUserRecord = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor';
  status: 'active' | 'inactive';
};

export const USERS_DATA: AdminUserRecord[] = [
  {
    id: 'admin-pms',
    name: 'PM Structure Admin',
    email: 'admin@pms.os',
    role: 'admin',
    status: 'active',
  },
  {
    id: 'admin-platform',
    name: 'Platform Admin',
    email: 'admin@platform.os',
    role: 'admin',
    status: 'active',
  },
  {
    id: 'nautical',
    name: 'Nautical Insights',
    email: 'nauticalinsights.ai@gmail.com',
    role: 'admin',
    status: 'active',
  },
];
