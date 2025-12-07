import type { NextApiRequest, NextApiResponse } from 'next';
import { ADMIN_UID } from './adminConfig';

function headerToString(h: string | string[] | undefined) {
  if (!h) return '';
  return Array.isArray(h) ? h[0] : h;
}

export function isAdminRequest(req: NextApiRequest): boolean {
  const uidHeader = headerToString(req.headers['x-admin-uid'] || req.headers['x-user-id']);
  const uidQuery = headerToString(req.query?.admin_uid as any);
  const flag = headerToString(req.headers['x-admin']);
  const candidate = uidHeader || uidQuery;
  if (candidate && candidate === ADMIN_UID) return true;
  if (flag === 'true' && candidate === ADMIN_UID) return true;
  return false;
}

export function requireAdmin(req: NextApiRequest, res: NextApiResponse): boolean {
  if (!isAdminRequest(req)) {
    res.status(401).end('unauthorized');
    return false;
  }
  return true;
}

