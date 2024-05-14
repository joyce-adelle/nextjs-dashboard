import Credentials from 'next-auth/providers/credentials';
import NextAuth from 'next-auth';
import type { User } from '@/app/lib/definitions';
import { authConfig } from './auth.config';
import bcrypt from 'bcrypt';
import prisma from './app/lib/prisma';
import { z } from 'zod';

async function getUser(email: string): Promise<User | null> {
    try {
        const user = await prisma.user.findFirst({
            where: {
                email: email
            }
        });
        return user;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}

export const { auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await getUser(email);
                    if (!user) return null;
                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    if (passwordsMatch) return user;
                }

                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
});