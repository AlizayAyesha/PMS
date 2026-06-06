export const GW_DASHBOARD_SESSION = 'gw_dashboard_session';

export function getSessionSecret(): string | null {
  const secret =
    process.env.AUTH_SESSION_SECRET?.trim() ||
    process.env.DASHBOARD_SESSION_SECRET?.trim();
  return secret || null;
}
