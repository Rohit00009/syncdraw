"use client";
export function AuthPage({ isSignIn }: { isSignIn: boolean }) {
  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="px-3 py-9   bg-white rounded-2xl border-3 border-green-200 shadow">
        <div className="text-3xl m-3 mb-6 font-bold flex justify-start bg-gradient-to-r from-green-400 via-green-600 to-green-400 bg-[length:200%_200%] animate-gradient bg-clip-text text-transparent">
          <h1>SYNCDRAW</h1>
        </div>
        <div className="text-black ml-3">
          {isSignIn ? "Login to your Account" : "Create an Account"}
        </div>
        <div className="m-3">
          <input
            type="text"
            placeholder="Email"
            className="border p-2 rounded  border-slate-500 text-slate-400"
          />
        </div>
        <div className="m-3">
          <input
            type="password"
            placeholder="Password"
            className="border p-2 rounded   border-slate-500 text-slate-400"
          />
        </div>
        <div className="flex justify-center items-center ml-3 mr-3 mt-5">
          <button
            onClick={() => {}}
            className="bg-green-500 text-white w-full p-2 rounded cursor-pointer "
          >
            {isSignIn ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
