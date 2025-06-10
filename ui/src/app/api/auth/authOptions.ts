import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const prisma = new PrismaClient()

// Define a type that matches the expected User type
interface AuthUser {
  id: string
  name: string | null
  email: string | null
  image: string | null
  token?: string
  phone?: string
  role?: string
  picture?: string
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null // Changed from throwing an error to returning null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.hashedPassword) {
          return null // Changed from throwing an error to returning null
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        )

        if (!isCorrectPassword) {
          return null // Changed from throwing an error to returning null
        }

        // Construct the user object with all required properties
        const authUser: AuthUser = {
          id: user.id.toString(),
          name: user.name || null,
          email: user.email || null,
          image: user.image || null,
          token: undefined, // Add placeholder for optional properties
          phone: undefined,
          role: undefined,
          picture: undefined,
        }

        return authUser
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/signin-basic',
    error: '/auth/error',
  },
}
