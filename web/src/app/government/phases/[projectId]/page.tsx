"use client";

import { useEffect, useState, use } from "react";
import { api } from "@/lib/api";
import { CheckCircle, Clock, Lock, Handshake } from "@phosphor-icons/react";

export default function ProjectPhasesPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const [phases, setPhases] = useState<any[]>([]);
  const [proposalId, setProposalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await api.project({ project_id: projectId }).proposal.all.get();
    const accepted = data?.data?.find((p: any) => p.status === "Accepted");
    setPhases(accepted?.phases ?? []);
    setProposalId(accepted?.proposal_id ?? null);
  };

  useEffect(() => { load(); }, []);

  // Only Not Started & previous Completed can be accepted
  const nextIndex = phases.findIndex(
    (p, i) =>
      p.status === "Not Started" &&
      (i === 0 || phases[i - 1].status === "Completed")
  );

  const acceptPhase = async (phaseId: string) => {
    if (!proposalId) return;

    try {
      setLoading(true);

      await api
        .project({ project_id: projectId })
        .proposal({ proposal_id: proposalId })
        .phase
        .accept.post({});

      await load();
    } catch (e) {
      console.error("Accept phase failed", e);
      alert("Phase accept failed");
    } finally {
      setLoading(false);
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
                    : p.status === "Accepted"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-700"
                }`}>
                  {p.status === "Completed" && <CheckCircle weight="fill" />}
                  {p.status === "Accepted" && <Clock weight="fill" />}
                  {p.status === "Not Started" && <Lock weight="fill" />}
                  {p.status}
                </span>
              </div>

              <div className="text-right">
                <div className="text-xl font-bold">₹{p.budget}</div>
              </div>
            </div>

            <p className="mt-3 text-gray-600">{p.description}</p>

            {idx === nextIndex && p.status === "Not Started" && (
              <div className="mt-4 flex justify-end">
                <button
                  disabled={loading}
                  onClick={() => acceptPhase(p._id)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  <Handshake weight="fill" />
                  Accept Phase
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

      {phases.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500">No phases found.</p>
        </div>
      )}
    </div>
  );
}
