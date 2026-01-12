"use client";

import AttestManagerABI from "@/abi/AttestManager.json";
import { api } from "@/lib/api";
import { ACTIVE_CHAIN_ID, ATTEST_MANAGER_ADDRESS } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { encodeFunctionData, getAddress, parseGwei } from "viem";
import { useAccount, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";

export default function CreateAgencyPage() {
  const router = useRouter();
  const { chainId, address: userAddress } = useAccount();
  const { switchChain } = useSwitchChain();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    walletAddress: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletClient) {
      setError("Wallet not connected");
      return;
    }
    setLoading(true);
    setError("");

    try {
      // 0. Network & Contract Sync Check
      if (chainId !== ACTIVE_CHAIN_ID) {
        switchChain({ chainId: ACTIVE_CHAIN_ID });
        return;
      }

      if (!publicClient) throw new Error("Public client not initialized");

      const code = await publicClient.getBytecode({ address: ATTEST_MANAGER_ADDRESS as `0x${string}` });
      if (!code || code === "0x") {
        console.warn("Contract desync detected on this RPC node. Proceeding with caution...");
      }

      // 1. Manually Encode Data
      const encodedData = encodeFunctionData({
        abi: AttestManagerABI.abi,
        functionName: "registerAgency",
        args: [
          getAddress(formData.walletAddress),
          JSON.stringify({ name: formData.name, physical_address: formData.address }),
        ],
      });

      // 2. Legacy Transaction (More stable for Shardeum)
      const hash = await walletClient.sendTransaction({
        account: userAddress,
        to: ATTEST_MANAGER_ADDRESS as `0x${string}`,
        data: encodedData,
        gas: BigInt(600000),
        gasPrice: parseGwei("25"), // Use fixed gasPrice instead of maxFee
        type: "legacy",
      });

      console.log("Transaction sent:", hash);

      // 2. Database record
      const { data, error: apiError } = await api.government.agency.create.post(formData);

      if (apiError) {
        setError(apiError.value ? String(apiError.value) : "Failed to create agency in database");
      } else if (data && data.success) {
        alert("Agency registered on-chain and account created!");
        router.push("/government");
      } else {
        setError(data?.error || data?.message || "An unexpected error occurred");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.shortMessage || err.message || "An error occurred during on-chain registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Register New Agency</h1>

      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Agency Name
            </label>
            <input
              type="text"
              id="name"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Initial Password
            </label>
            <input
              type="password"
              id="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Physical Address
            </label>
            <textarea
              id="address"
              required
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-700 mb-1">
              Agency Wallet Address
            </label>
            <input
              type="text"
              id="walletAddress"
              required
              placeholder="0x..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
              value={formData.walletAddress}
              onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Authorizing..." : "Register Agency On-Chain"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
