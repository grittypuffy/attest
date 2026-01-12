"use client";

import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAccount, useConnect, useSignMessage, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

export const SignInForm = () => {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    if (!isConnected || !address) return;
    
    setLoading(true);
    setError("");

    try {
      // 1. Get nonce
      const { data: nonceData, error: nonceError } = await api.auth.nonce.get();
      if (nonceError || !nonceData?.success) {
        console.error("Nonce Error Details:", nonceError);
        console.log("Nonce Data:", nonceData);
        throw new Error("Failed to get login nonce. Check console for details.");
      }
      const nonce = nonceData.data.nonce;

      // 2. Sign message
      const message = `Sign in to Attest with your wallet. Nonce: ${nonce}`;
      const signature = await signMessageAsync({ message });

      // 3. Verify on backend
      const { data: verifyData, error: verifyError } = await api.auth.verify.post({
        address,
        signature,
        nonce
      });

      if (verifyError || !verifyData?.success || !verifyData?.data) {
        throw new Error(verifyData?.message || "Verification failed");
      }

      // 4. Redirect based on role
      const role = verifyData.data.role;
      if (role === "Government") {
        router.push("/government");
      } else {
        router.push("/agency");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!isConnected ? (
        <button
          onClick={() => connect({ connector: injected() })}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Connected Wallet</p>
            <p className="text-sm font-mono text-gray-900 break-all">{address}</p>
            <button 
              onClick={() => disconnect()}
              className="text-xs text-red-600 hover:underline mt-2"
            >
              Disconnect
            </button>
          </div>

          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
          >
            {loading ? "Verifying..." : "Sign In with Wallet"}
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 flex items-center">
           ⚠️ {error}
        </div>
      )}
    </div>
  );
};