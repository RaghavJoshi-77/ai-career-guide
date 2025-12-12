import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials";
import { userTable } from "@/lib/schema";
import { db } from "@/lib/db";
import { eq , and} from "drizzle-orm";
import bcrypt from "bcryptjs"
const handler = NextAuth({
  providers:[
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!, /// ! means that it is non null value it can be used to avoid if(!githubid) wala check 
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,        
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials:{
        email:{label:"Email" , type:"email", placeholder:"jane@gmail.com"},
        password:{label:"Password", type:"password", placeholder:"******"}
      },
      //for now using any cant deal with this ts bs anymore wasted my 3 frickin hours 
      async authorize (credentials, req): Promise<any> {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        try {
          const user = await db 
          .select()
          .from(userTable)
          .where(eq(userTable.email,credentials.email))
          .limit(1) //limited to check for one 
          .execute()
        
        const valid = await bcrypt.compare(credentials.password, user[0].password)
        if (valid) {
          return user[0]
        }
        else {
          return null 
        }
        } catch (err) {
          throw err
        }

      }
        


    })
  ],
  callbacks:{
    async jwt({token , user}){
      if(user) {
        token.id = user.id
      }
      return token
    },
    async session({session, token}){
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  }, 
  pages:{
    signIn:"/sign-in", // Corrected: Use the absolute path matching your folder
    error:"/sign-in"   // Also update the error page path
  },
  session:{
    strategy:"jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }