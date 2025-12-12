import  { DefaultSession } from "next-auth"


// we will be importing default session 

declare module "next-auth"{
    interface Session{
        user:{
            id:string;
        } & DefaultSession["user"]
    }
}
//here we are definig interface of session uska type define karre and each session will contain id and & ke after default user jo hamne define kiya hai uske credentials honge 