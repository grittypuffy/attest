"use client";

import { api } from "@/lib/api";
import { Wallet } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount, useSignMessage, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";

export const SignInForm = () => {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { connect } = useConnect();
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  const router = useRouter();

  const handleWalletSignIn = async () => {
    setIsWalletLoading(true);
    setWalletError(null);
    try {
      if (!isConnected) {
        connect({ connector: injected() });
        setIsWalletLoading(false);
        return;
      }

      if (!address) throw new Error("Wallet not connected");

      // 1. Get nonce from server
      const nonceRes = await api.auth.request_nonce.post({ address });
      if (!nonceRes.data?.success) throw new Error("Failed to get nonce");
      
      const nonce = nonceRes.data.data.nonce;
      const message = `Sign this message to verify your identity: ${nonce}`;

      // 2. Sign message
      const signature = await signMessageAsync({ message });

      // 3. Verify on server
      const verifyRes = await api.auth.verify_signature.post({
        address,
        signature,
        nonce,
      });

      if (verifyRes.data?.error) {
        setWalletError(verifyRes.data.error);
      } else if (verifyRes.data?.success && verifyRes.data.data) {
        const role = verifyRes.data.data.role;
        if (role === "Government") {
          router.push("/government");
        } else {
          router.push("/agency");
        }
      }
    } catch (err: any) {
      console.error(err);
      setWalletError(err.message || "Failed to sign in with wallet");
    } finally {
      setIsWalletLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-4">
          <Wallet size={32} />
        </div>
        <p className="text-gray-600">
          Connect your wallet to securely sign in to the platform.
        </p>
      </div>

      <button
        type="button"
        onClick={handleWalletSignIn}
        disabled={isWalletLoading}
        className="w-full flex justify-center items-center gap-3 py-4 px-4 border border-transparent rounded-xl shadow-md text-base font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <Wallet size={24} weight="bold" />
        {isWalletLoading ? "Authenticating..." : isConnected ? "Sign in with Wallet" : "Connect Wallet"}
      </button>

      {walletError && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-center gap-2">
          <span>⚠️</span> {walletError}
        </div>
      )}

      <p className="text-center text-xs text-gray-500 mt-4">
        By signing in, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
};
