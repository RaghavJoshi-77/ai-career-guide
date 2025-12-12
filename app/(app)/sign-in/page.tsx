"use client";

import { signIn, signOut, useSession } from "next-auth/react";

import { useRouter } from "next/navigation";
import { useState } from "react";
export default function AuthDemo() {
  const { data: session } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      console.log("Login failed:", result.error);
    } else {
      console.log("Login successful!");
      router.push("/home");
    }
  };
  return (
    <div>
      {session ? (
        <>
          <p>Signed in as {session.user?.name}</p>
          <button onClick={() => signOut()}>Sign out</button>
        </>
      ) : (
        <>
          <div className="h-screen w-screen flex justify-center items-center">
            <div className="grid gap-8">
              <div
                id="back-div"
                className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-[26px] m-4"
              >
                <div className="border-[20px] border-transparent rounded-[20px] dark:bg-gray-900 bg-white shadow-lg xl:p-10 2xl:p-10 lg:p-10 md:p-10 sm:p-2 m-2">
                  <h1 className="pt-8 pb-6 font-bold dark:text-gray-400 text-5xl text-center cursor-default">
                    Log in
                  </h1>
                  {/* will edit this once i add sign-in credentials  */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 dark:text-gray-400 text-lg"
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        className="border p-3 dark:bg-indigo-700 dark:text-gray-300 dark:border-gray-700 shadow-md placeholder:text-base focus:scale-105 ease-in-out duration-300 border-gray-300 rounded-lg w-full"
                        type="email"
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="password"
                        className="mb-2 dark:text-gray-400 text-lg"
                      >
                        Password
                      </label>
                      <input
                        id="password"
                        className="border p-3 shadow-md dark:bg-indigo-700 dark:text-gray-300 dark:border-gray-700 placeholder:text-base focus:scale-105 ease-in-out duration-300 border-gray-300 rounded-lg w-full"
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                      />
                    </div>
                    <a
                      className="group text-blue-400 transition-all duration-100 ease-in-out"
                      href="#"
                    ></a>
                    <button
                      className="bg-gradient-to-r dark:text-gray-300 from-blue-500 to-purple-500 shadow-lg mt-6 p-2 text-white rounded-lg w-full hover:scale-105 hover:from-purple-500 hover:to-blue-500 transition duration-300 ease-in-out"
                      type="submit"
                    >
                      LOG IN
                    </button>
                  </form>
                  <div className="flex flex-col mt-4 items-center justify-center text-sm">
                    <h3 className="dark:text-gray-300">
                      Don't have an account?
                      <a
                        className="group text-blue-400 transition-all duration-100 ease-in-out"
                        href="/register"
                      >
                        <span className="bg-left-bottom bg-gradient-to-r from-blue-400 to-blue-400 bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-500 ease-out">
                          Sign Up
                        </span>
                      </a>
                    </h3>
                  </div>

                  {/* Third Party Authentication Options */}
                  <div
                    id="third-party-auth"
                    className="flex items-center justify-center mt-5 flex-wrap"
                  >
                    <button
                      onClick={() => signIn("google", { callbackUrl: "/home" })}
                      className="hover:scale-105 ease-in-out duration-300 shadow-lg p-2 rounded-lg m-1"
                    >
                      <img
                        className="max-w-[25px]"
                        src="https://ucarecdn.com/8f25a2ba-bdcf-4ff1-b596-088f330416ef/"
                        alt="Google"
                      />
                    </button>
                    <button
                      onClick={() => signIn("github", { callbackUrl: "/home" })}
                      className="hover:scale-105 ease-in-out duration-300 shadow-lg p-2 rounded-lg m-1"
                    >
                      <img
                        className="max-w-[25px] filter dark:invert"
                        src="https://ucarecdn.com/be5b0ffd-85e8-4639-83a6-5162dfa15a16/"
                        alt="Github"
                      />
                    </button>
                    <button
                      onClick={() => signIn("facebook")}
                      className="hover:scale-105 ease-in-out duration-300 shadow-lg p-2 rounded-lg m-1"
                    >
                      <img
                        className="max-w-[25px]"
                        src="https://ucarecdn.com/6f56c0f1-c9c0-4d72-b44d-51a79ff38ea9/"
                        alt="Facebook"
                      />
                    </button>
                    <button
                      onClick={() => signIn("twitter")}
                      className="hover:scale-105 ease-in-out duration-300 shadow-lg p-2 rounded-lg m-1"
                    >
                      <img
                        className="max-w-[25px] dark:gray-100"
                        src="https://ucarecdn.com/82d7ca0a-c380-44c4-ba24-658723e2ab07/"
                        alt="twitter"
                      />
                    </button>
                  </div>

                  <div className="text-gray-500 flex text-center flex-col mt-4 items-center text-sm">
                    <p className="cursor-default">
                      By signing in, you agree to our
                      <a
                        className="group text-blue-400 transition-all duration-100 ease-in-out"
                        href="#"
                      >
                        <span className="cursor-pointer bg-left-bottom bg-gradient-to-r from-blue-400 to-blue-400 bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-500 ease-out">
                          Terms
                        </span>
                      </a>
                      and
                      <a
                        className="group text-blue-400 transition-all duration-100 ease-in-out"
                        href="#"
                      >
                        <span className="cursor-pointer bg-left-bottom bg-gradient-to-r from-blue-400 to-blue-400 bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-500 ease-out">
                          Privacy Policy
                        </span>
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

//                       onClick={() => signIn("github", { callback: "/home" })}  this is importnatn part rem that
