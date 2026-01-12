"use client";

import AttestManagerABI from "@/abi/AttestManager.json";
import { api } from "@/lib/api";
import { ACTIVE_CHAIN_ID, ATTEST_MANAGER_ADDRESS } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { encodeFunctionData, parseEther, parseGwei } from "viem";
import { useAccount, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";

export default function CreateProjectPage() {
  const router = useRouter();
  const { chainId, address: userAddress } = useAccount();
  const { switchChain } = useSwitchChain();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [formData, setFormData] = useState({
    project_name: "",
    description: "",
    budget: "0",
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
      // 0. Network Check
      if (chainId !== ACTIVE_CHAIN_ID) {
        switchChain({ chainId: ACTIVE_CHAIN_ID });
        return;
      }

      // 1. Manually Encode Data (Bypass Simulation)
      const encodedData = encodeFunctionData({
        abi: AttestManagerABI.abi,
        functionName: "createProject",
        args: [
          formData.project_name,
          formData.description,
          parseEther(formData.budget),
        ],
      });

      // 2. Direct Transaction
      const hash = await walletClient.sendTransaction({
        account: userAddress,
        to: ATTEST_MANAGER_ADDRESS as `0x${string}`,
        data: encodedData,
        gas: BigInt(600000),
        gasPrice: parseGwei("25"),
        type: "legacy",
      });

      console.log("Transaction sent:", hash);

      // 3. Save to backend database
      const { data: apiData, error: apiError } = await api.project.create.post({
        project_name: formData.project_name,
        description: formData.description,
      });

      if (apiError) {
        setError(apiError.value ? String(apiError.value) : "Failed to save project to database");
      } else if (apiData && apiData.success) {
        alert("Project created on-chain and saved to database!");
        router.push("/government");
      } else {
        setError(apiData?.message || "An unexpected error occurred");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.shortMessage || err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Project</h1>

      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="project_name" className="block text-sm font-medium text-gray-700 mb-1">
              Project Name
            </label>
            <input
              type="text"
              id="project_name"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={formData.project_name}
              onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Budget (Tokens)
            </label>
            <input
              type="number"
              id="budget"
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              required
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              {loading ? "Confirming..." : "Create Project On-Chain"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
