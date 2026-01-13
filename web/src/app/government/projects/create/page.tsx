"use client";

import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAccount, useSwitchChain, useWalletClient, usePublicClient } from "wagmi";
import { encodeFunctionData, parseEther, hexToNumber } from "viem";
import { ACTIVE_CHAIN_ID, ATTEST_MANAGER_ADDRESS } from "@/lib/constants";
import AttestManagerABI from "@/abi/AttestManager.json";

export default function CreateProjectPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    project_name: "",
    description: "",
    budget: "0",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { chainId, address: userAddress } = useAccount();
  const { switchChain } = useSwitchChain();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!walletClient) throw new Error("Wallet not connected");

      // 0. Network Sync
      if (chainId !== ACTIVE_CHAIN_ID) {
        switchChain({ chainId: ACTIVE_CHAIN_ID });
        setLoading(false);
        return;
      }

      // 1. On-Chain Transaction: createProject(string name, string description, uint256 budget)
      const encodedData = encodeFunctionData({
        abi: AttestManagerABI,
        functionName: "createProject",
        args: [formData.project_name, formData.description, parseEther(formData.budget)],
      });

      const hash = await walletClient.sendTransaction({
        account: userAddress,
        to: ATTEST_MANAGER_ADDRESS as `0x${string}`,
        data: encodedData,
        chain: walletClient.chain,
        kzg: undefined,
      });

      console.log("On-chain project creation sent:", hash);

      // Wait for receipt to get the project ID from events
      if (!publicClient) throw new Error("Public client missing");
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log("Transaction Receipt Logs:", receipt.logs);
      
      // Extract projectId from logs (ProjectCreated event)
      let onchainId: number | undefined;
      if (receipt.logs.length > 0) {
        const projectLog = receipt.logs.find(l => l.topics.length >= 2);
        console.log("Found Project Log Candidate:", projectLog);
        if (projectLog && projectLog.topics[1]) {
          onchainId = hexToNumber(projectLog.topics[1]);
          console.log("Extracted On-chain ID:", onchainId);
        }
      }

      // 2. Database Record
      const { data, error: apiError } = await api.project.create.post({
        ...formData,
        onchain_id: onchainId
      });

      if (apiError) {
        setError(
          apiError.value ? String(apiError.value) : "Failed to save project to database",
        );
      } else if (data && data.success) {
        router.push("/government");
      } else {
        setError(data?.message || "An unexpected error occurred");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Network error or invalid response");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Create New Project
      </h1>

      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="project_name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Project Name
            </label>
            <input
              type="text"
              id="project_name"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={formData.project_name}
              onChange={(e) =>
                setFormData({ ...formData, project_name: e.target.value })
              }
            />
          </div>

          <div>
            <label
              htmlFor="budget"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Estimated Budget (ETH)
            </label>
            <input
              type="number"
              id="budget"
              required
              step="0.01"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={formData.budget}
              onChange={(e) =>
                setFormData({ ...formData, budget: e.target.value })
              }
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              required
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
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
              {loading ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
