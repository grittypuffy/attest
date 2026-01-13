"use client";

import { useState, useEffect, use } from "react";
import { api } from "@/lib/api";
import { CheckCircle, Clock, Money, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import { useWalletClient, useAccount, useSwitchChain } from "wagmi";
import { ATTEST_MANAGER_ADDRESS, ACTIVE_CHAIN_ID } from "@/lib/constants";
import AttestManagerABI from "@/abi/AttestManager.json";
import { encodeFunctionData, parseGwei } from "viem";

interface Phase {
  _id: string;
  number: number;
  title: string;
  description: string;
  budget: number;
  status: string;
}

interface Proposal {
  proposal_id: string;
  proposal_name: string;
  status: string;
  phases: Phase[];
}

export default function ProjectPhasesPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const [acceptedProposal, setAcceptedProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const router = useRouter();

  const { chainId, address: userAddress } = useAccount();
  const { switchChain } = useSwitchChain();
  const { data: walletClient } = useWalletClient();

  const fetchAcceptedProposal = async () => {
    try {
      const { data, error } = await api.project({ project_id: projectId }).proposal.all.get();
      if (data && !error && data.data) {
         // Find the accepted one
         const accepted = (data.data as any[]).find(p => p.status === 'Accepted');
         if (accepted) {
            // Fetch the full details including phases
            const { data: detailData } = await api.project.proposal({ proposal_id: accepted.proposal_id }).get();
            if (detailData?.success) {
                setAcceptedProposal(detailData.data as any);
            }
         }
      }
    } catch (err) {
      console.error("Failed to fetch proposal details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchAcceptedProposal();
    }
  }, [projectId]);

  const handleReleaseFunds = async (phaseId: string) => {
    if (!walletClient || !acceptedProposal) return;
    if (!confirm("Are you sure you want to verify this phase and release funds on the blockchain?")) return;
    
    setProcessingId(phaseId);
    try {
      if (chainId !== ACTIVE_CHAIN_ID) {
        switchChain({ chainId: ACTIVE_CHAIN_ID });
        return;
      }

      // 1. On-Chain Transaction: verifyAndReleasePhase
      // Note: Contract function 'verifyAndReleasePhase' advance the currentPhaseIndex
      const encodedData = encodeFunctionData({
        abi: AttestManagerABI,
        functionName: "verifyAndReleasePhase",
        args: [BigInt(acceptedProposal.proposal_id)],
      });

      const hash = await walletClient.sendTransaction({
        account: userAddress,
        to: ATTEST_MANAGER_ADDRESS as `0x${string}`,
        data: encodedData,
        gas: BigInt(400000),
        gasPrice: parseGwei("25"),
        type: "legacy",
      });

      console.log("Funds release transaction sent:", hash);

      // 2. Database Update
      const { data } = await api.project({ project_id: projectId }).proposal({ proposal_id: acceptedProposal.proposal_id }).phase.accept.post({
        phase_id: phaseId
      });

      if (data && data.success) {
        alert("Phase verified and funds released successfully!");
        fetchAcceptedProposal();
      } else {
        alert("Blockchain transaction confirmed, but database update failed.");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.shortMessage || err.message || "An error occurred during fund release.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Phase Management</h1>
          {acceptedProposal && <p className="text-sm text-gray-500">Proposal: {acceptedProposal.proposal_name}</p>}
        </div>
        <button onClick={() => router.back()} className="text-sm text-gray-600 hover:text-gray-900 font-medium">
          &larr; Back
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : !acceptedProposal ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500">No accepted proposal found for this project yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {acceptedProposal.phases.map((phase) => (
            <div key={phase._id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
                    {phase.number}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{phase.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                       <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        phase.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        phase.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {phase.status === 'Completed' && <CheckCircle weight="fill" />}
                        {phase.status === 'In Progress' && <Clock weight="fill" />}
                        {phase.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">${phase.budget.toLocaleString()}</div>
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Phase Allocation</div>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-6 bg-gray-50 p-3 rounded-lg border border-gray-100">
                {phase.description}
              </p>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <button className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                  <MagnifyingGlass size={18} />
                  Review Evidence/Proofs
                </button>

                {phase.status === 'In Progress' && (
                  <button
                    onClick={() => handleReleaseFunds(phase._id)}
                    disabled={!!processingId}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-bold rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-all"
                  >
                    <Money size={18} weight="bold" />
                    {processingId === phase._id ? "Releasing Funds..." : "Verify & Release Funds"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
