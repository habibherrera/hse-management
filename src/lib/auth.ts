import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { compare } from "bcryptjs"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email y contraseña son requeridos")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.active) {
          throw new Error("Credenciales inválidas")
        }

        if (!user.password) {
          throw new Error("Esta cuenta usa Google para iniciar sesión")
        }

        const isValid = await compare(credentials.password, user.password)
        if (!isValid) {
          throw new Error("Credenciales inválidas")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const email = user.email!
        const existing = await prisma.user.findUnique({ where: { email } })

        if (!existing) {
          await prisma.user.create({
            data: {
              email,
              name: user.name ?? email,
              role: "REPORTER",
              active: true,
            },
          })
        } else if (!existing.active) {
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user && account?.provider === "credentials") {
        token.userId = user.id
        token.role = (user as any).role
      }
      if (account?.provider === "google") {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email! },
        })
        if (dbUser) {
          token.userId = dbUser.id
          token.role = dbUser.role
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.userId as string
        (session.user as any).role = token.role
      }
      return session
    },
  },
}
