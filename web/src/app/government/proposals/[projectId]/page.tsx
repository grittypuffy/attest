"use client";

import { useState, useEffect, use } from "react";
import { api } from "@/lib/api";
import { CheckCircle, XCircle, Clock } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import { useAccount, useSwitchChain, useWalletClient } from "wagmi";
import { encodeFunctionData, parseGwei } from "viem";
import { ACTIVE_CHAIN_ID, ATTEST_MANAGER_ADDRESS } from "@/lib/constants";
import AttestManagerABI from "@/abi/AttestManager.json";

interface Proposal {
  proposal_id: string;
  proposal_name: string;
  agency_id: string; 
  total_budget: number;
  timeline: string;
  summary?: string;
  description: string;
  status: string;
  onchain_id?: number;
}

export default function ProjectProposalsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const router = useRouter();

  const { chainId, address: userAddress } = useAccount();
  const { switchChain } = useSwitchChain();
  const { data: walletClient } = useWalletClient();

  const fetchProposals = async () => {
    try {
      const { data, error } = await api
        .project({ project_id: projectId })
        .proposal.all.get();
      if (data && !error && data.success) {
        console.log("Fetched proposals:", data.data);
        setProposals(data.data as any); 
      }
    } catch (err) {
      console.error("Failed to fetch proposals", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProposals();
    }
  }, [projectId]);

  const handleApprove = async (proposalId: string) => {
    if (!walletClient) {
      alert("Please connect your wallet first");
      return;
    }

    if (
      !confirm(
        "Are you sure you want to approve this proposal? This will trigger a transaction and reject all other proposals.",
      )
    )
      return;

    setProcessingId(proposalId);
    try {
      // 0. Network Sync
      if (chainId !== ACTIVE_CHAIN_ID) {
        switchChain({ chainId: ACTIVE_CHAIN_ID });
        setProcessingId(null);
        return;
      }

      // 1. On-Chain Approval
      if (typeof proposals.find(p => p.proposal_id === proposalId)?.onchain_id === 'undefined') {
        throw new Error("Proposal ID missing");
      }
      
      const proposal = proposals.find(p => p.proposal_id === proposalId)!;

      const encodedData = encodeFunctionData({
        abi: AttestManagerABI,
        functionName: "approveProposal",
        args: [BigInt(proposal.onchain_id!)], 
      });

      const hash = await walletClient.sendTransaction({
        account: userAddress,
        to: ATTEST_MANAGER_ADDRESS as `0x${string}`,
        data: encodedData,
        chain: walletClient.chain,
        kzg: undefined,
      });

      console.log("Approval transaction sent:", hash);

      // 2. Off-Chain Database Update
      const { data, error } = await api
        .project({ project_id: projectId })
        .proposal.accept.post({
          proposal_id: proposalId,
        });

      if (data && data.success) {
        alert("Proposal approved successfully!");
        fetchProposals(); 
      } else {
        alert(
          "Transaction sent, but database update failed: " +
            (data?.message || error?.value || "Unknown error"),
        );
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "An error occurred during approval.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Project Proposals</h1>
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          &larr; Back to Projects
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {proposals.map((proposal) => (
            <div
              key={proposal.proposal_id}
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        proposal.status === "Accepted"
                          ? "bg-green-100 text-green-800"
                          : proposal.status === "Not Accepted"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {proposal.status === "Accepted" && (
                        <CheckCircle weight="fill" />
                      )}
                      {proposal.status === "Not Accepted" && (
                        <XCircle weight="fill" />
                      )}
                      {proposal.status === "Pending" && <Clock weight="fill" />}
                      {proposal.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      Agency ID: {proposal.agency_id}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {proposal.proposal_name}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    ${proposal.total_budget.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Total Budget</div>
                </div>
              </div>

              <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                <div>
                  <span className="font-semibold block text-gray-900">
                    Timeline:
                  </span>
                  {proposal.timeline}
                </div>
                <div>
                  <span className="font-semibold block text-gray-900">
                    Outcome:
                  </span>
                  {/* Assuming outcome field exists based on model, otherwise description */}
                  {/* proposal.outcome */} N/A
                </div>
              </div>

              <div className="mt-4">
                <p className="text-gray-700">{proposal.description}</p>
                {proposal.summary && (
                  <p className="text-gray-500 mt-2 text-sm italic">
                    {proposal.summary}
                  </p>
                )}
              </div>

              {proposal.status === "Pending" && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => handleApprove(proposal.proposal_id)}
                    disabled={!!processingId}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {processingId === proposal.proposal_id
                      ? "Processing..."
                      : "Approve Proposal"}
                  </button>
                </div>
              )}
            </div>
          ))}

          {proposals.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">
                No proposals found for this project.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
