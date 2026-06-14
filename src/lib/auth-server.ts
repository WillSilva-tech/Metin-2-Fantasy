import { NextRequest } from 'next/server';
import { adminAuth } from './firebase-admin';
import { db } from '../db/index';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { seedDatabase } from '../db/seed';

let isSeeded = false;

export async function ensureSeeded() {
  if (!isSeeded) {
    try {
      await seedDatabase();
      isSeeded = true;
    } catch (e) {
      console.error('[SEED] Failed auto-seeding:', e);
    }
  }
}

export interface AuthenticatedUser {
  id: number;
  uid: string;
  email: string;
  login: string;
  role: string;
  cashBalance: number;
}

export async function getVerifiedUser(req: NextRequest): Promise<AuthenticatedUser | null> {
  await ensureSeeded();
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const dbUser = await db.select().from(users).where(eq(users.uid, decodedToken.uid)).limit(1);
    
    if (dbUser.length > 0) {
      return dbUser[0];
    }
    
    // If authenticated in Firebase but doesn't exist in PostgreSQL yet (e.g. Google Popup),
    // sync and create them as a PLAYER
    const userEmail = decodedToken.email || `${decodedToken.uid.substring(0, 8)}@deleted.fantasy2.com.br`;
    const userLogin = userEmail.split('@')[0];
    
    const [newUser] = await db.insert(users).values({
      uid: decodedToken.uid,
      email: userEmail,
      login: userLogin,
      role: 'PLAYER',
      cashBalance: 5000 // Welcome Bonus CASH!
    }).returning();

    return newUser;
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    return null;
  }
}

export function isStaff(role: string): boolean {
  return ['ADMIN', 'GM', 'MODERATOR'].includes(role);
}

export function isAdmin(role: string): boolean {
  return role === 'ADMIN';
}
