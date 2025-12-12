import withAuth from "next-auth/middleware";
import { NextResponse } from "next/server";


export default withAuth(
    function middleware(){
        return NextResponse.next()
    },

    {
        callbacks:{
            authorized: ({token,req}) =>{
                const {pathname}=req.nextUrl
                //allow auth related routes
                if (
                    pathname.startsWith("/api/auth") || pathname ==="/sign-in" || pathname==="/register"
                ) {
                    return true   
                }
                //public paths
                //define your public paths here
                //this is example
                if (pathname === "/" ) {
                    return true
                }

                return !!token
            }
        }
    }
)
//where middleware is gonna run => regex code copy paste 
export const config ={
    matcher: [ "/((?!_next/static|_next/image|favicon.ico|public/).*)"]
}