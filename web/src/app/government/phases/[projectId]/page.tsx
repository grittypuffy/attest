"use client";

import { useEffect, useState, use } from "react";
import { api } from "@/lib/api";
import {
  CheckCircle,
  Clock,
  Lock,
  Handshake,
  Money,
} from "@phosphor-icons/react";
import { useWalletClient, useAccount, useSwitchChain } from "wagmi";
import { encodeFunctionData, parseGwei } from "viem";
import { ATTEST_MANAGER_ADDRESS, ACTIVE_CHAIN_ID } from "@/lib/constants";
import AttestManagerABI from "@/abi/AttestManager.json";

export default function ProjectPhasesPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);

  const [phases, setPhases] = useState<any[]>([]);
  const [proposalId, setProposalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { chainId, address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { switchChain } = useSwitchChain();

  const [onchainId, setOnchainId] = useState<number | null>(null);

  const load = async () => {
    const { data } = await api.project({ project_id: projectId }).proposal.all.get();
    const accepted: any = data?.data?.find((p: any) => p.status === "Accepted");
    setPhases(accepted?.phases ?? []);
    setProposalId(accepted?.proposal_id ?? null);
    setOnchainId(accepted?.onchain_id ?? null);
  };

  useEffect(() => { load(); }, []);

  // deterministic next allowed phase
  const nextIndex = phases.findIndex(
    (p, i) =>
      p.status === "Not Started" &&
      (i === 0 || phases[i - 1].status === "Completed")
  );

  /* ----------------- OFF-CHAIN ACCEPT ----------------- */
  const acceptPhase = async () => {
    if (!proposalId || nextIndex === -1) return;
    setLoading(true);

    try {
      await api
        .project({ project_id: projectId })
        .proposal({ proposal_id: proposalId })
        .phase.accept.post({ phase_id: phases[nextIndex]._id });
      await load();
    } catch {
      alert("Phase accept failed");
    } finally {
      setLoading(false);
    }
  };

  /* ----------------- ON-CHAIN RELEASE ----------------- */
  const releaseFunds = async (phaseId: string) => {
    if (!walletClient || !proposalId) return;
    if (onchainId === null) {
      alert("Proposal on-chain ID missing");
      return;
    }

    if (chainId !== ACTIVE_CHAIN_ID) {
      switchChain({ chainId: ACTIVE_CHAIN_ID });
      return;
    }

    setProcessingId(phaseId);

    try {
      if (onchainId === null || typeof onchainId === 'undefined') {
        throw new Error("On-chain ID is missing");
      }

      const data = encodeFunctionData({
        abi: AttestManagerABI,
        functionName: "verifyAndReleasePhase",
        args: [BigInt(onchainId)],
      });

      await walletClient.sendTransaction({
        account: address!,
        to: ATTEST_MANAGER_ADDRESS as `0x${string}`,
        data,
        gas: BigInt(400000),
        gasPrice: parseGwei("25"),
        type: "legacy",
      });

      await api
        .project({ project_id: projectId })
        .proposal({ proposal_id: proposalId })
        .phase.accept.post({ phase_id: phaseId });

      await load();
      alert("Phase verified & funds released");
    } catch (e: any) {
      alert(e.shortMessage || "Release failed");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Project Phases</h1>

      {phases.map((p, idx) => {
        const locked = idx !== nextIndex && p.status === "Not Started";

        return (
          <div key={p._id} className="bg-white border rounded-xl p-6 mb-4">
            <div className="flex justify-between">
              <div>
                <div className="text-xs text-gray-500">Phase {p.number}</div>
                <h3 className="text-lg font-semibold">{p.title}</h3>

                <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs ${
                  p.status === "Completed"
                    ? "bg-green-100 text-green-800"
                    : p.status === "In Progress"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-700"
                }`}>
                  {p.status === "Completed" && <CheckCircle weight="fill" />}
                  {p.status === "In Progress" && <Clock weight="fill" />}
                  {p.status === "Not Started" && <Lock weight="fill" />}
                  {p.status}
                </span>
              </div>

              <div className="text-xl font-bold">₹{p.budget}</div>
            </div>

            <p className="mt-3 text-gray-600">{p.description}</p>

            {/* Accept */}
            {idx === nextIndex && p.status === "Not Started" && (
              <div className="mt-4 flex justify-end">
                <button
                  disabled={loading}
                  onClick={acceptPhase}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  <Handshake weight="fill" /> Accept Phase
                </button>
              </div>
            )}

            {/* Release */}
            {p.status === "In Progress" && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => releaseFunds(p._id)}
                  disabled={processingId === p._id}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  <Money weight="fill" />
                  {processingId === p._id ? "Releasing…" : "Verify & Release Funds"}
                </button>
              </div>
            )}

            {locked && (
              <div className="mt-4 text-sm text-gray-400">
                🔒 Locked until previous phase completes
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
