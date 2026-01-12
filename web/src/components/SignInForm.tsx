"use client";

import { api } from "@/lib/api";
import { EyeClosed, Eye } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

export const SignInForm = () => {
  const [response, action, isPending] = useActionState(
    async (prevState: any, queryData: any) => {
      const email: string = queryData.get("email");
      const password: string = queryData.get("password");

      const res = await api.auth.sign_in.post({
        email,
        password,
      });

      if (res.data?.error) {
        return {
          type: "error",
          message: res.data.error,
        };
      }
      return {
        type: "success",
        message: "Signed in successfully",
        role: res.data?.data?.role,
      };
    },
    null,
  );

  const [showPwd, setShowPwd] = useState<boolean>(false);
  const router = useRouter();
  
  useEffect(() => {
    if (response?.type === "success") {
      if (response.role === "Government") {
        router.push("/government");
      } else {
        router.push("/agency");
      }
    }
  }, [response]);

  return (
    <form action={action} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPwd ? "text" : "password"}
            required
            placeholder="••••••••"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPwd ? <Eye size={20} /> : <EyeClosed size={20} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? "Signing In..." : "Sign In"}
      </button>

      {response && response.type === "error" && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 flex items-center animate-pulse">
           ⚠️ {response.message}
        </div>
      )}
    </form>
  );
};
