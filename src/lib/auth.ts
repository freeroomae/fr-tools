'use server';
import { getIronSession, IronSessionData } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData extends IronSessionData {
  username?: string;
  isLoggedIn: boolean;
}

export const sessionOptions = {
  cookieName: 'propscrapeai_session',
  password: process.env.IRON_SESSION_SECRET as string,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

export async function getSession() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  return session;
}

export async function logout() {
  const session = await getSession();
  session.destroy();
}
