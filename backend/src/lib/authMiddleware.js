import { verifyAccess } from '../lib/jwt.js';
import { prisma } from './prisma.js';

export function requireAuth(req, res, next){
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing access token' });
  try {
    req.user = verifyAccess(token);
    return next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid/expired access token' });
  }
}

export async function requireApprovedUser(req, res, next) {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isApproved) {
      return res.status(403).json({ message: 'User is not approved for portal access' });
    }

    req.portalUser = user;
    return next();
  } catch {
    return res.status(500).json({ message: 'Failed to validate approved user' });
  }
}

export async function requireAdmin(req, res, next) {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    req.portalUser = user;
    return next();
  } catch {
    return res.status(500).json({ message: 'Failed to validate admin access' });
  }
}
