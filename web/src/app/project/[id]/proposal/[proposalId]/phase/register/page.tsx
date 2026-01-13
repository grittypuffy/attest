"use client";

import { api } from "@/lib/api";
import { Button, IconButton, Paper, Typography } from "@mui/material";
import { ArrowLeft, Plus, Trash, CheckCircle } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { use, useState } from "react";

type PhaseInput = {
  number: string;
  title: string;
  description: string;
  budget: number;
  start_date: string;
  end_date: string;
  validating_documents: string[];
};

export default function RegisterPhasesPage({
  params,
}: {
  params: Promise<{ id: string; proposalId: string }>;
}) {
  const { id: projectId, proposalId } = use(params);
  const router = useRouter();

  const [phases, setPhases] = useState<PhaseInput[]>([]);
  const [currentPhase, setCurrentPhase] = useState<PhaseInput>({
    number: "",
    title: "",
    description: "",
    budget: 0,
    start_date: "",
    end_date: "",
    validating_documents: [""],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhaseChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setCurrentPhase((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleDocumentChange = (index: number, value: string) => {
    const newDocs = [...currentPhase.validating_documents];
    newDocs[index] = value;
    setCurrentPhase((prev) => ({
      ...prev,
      validating_documents: newDocs,
    }));
  };

  const addDocumentField = () => {
    setCurrentPhase((prev) => ({
      ...prev,
      validating_documents: [...prev.validating_documents, ""],
    }));
  };

  const removeDocumentField = (index: number) => {
    if (currentPhase.validating_documents.length === 1) return;
    const newDocs = currentPhase.validating_documents.filter(
      (_, i) => i !== index,
    );
    setCurrentPhase((prev) => ({
      ...prev,
      validating_documents: newDocs,
    }));
  };

  const addPhase = () => {
    if (
      !currentPhase.title ||
      !currentPhase.description ||
      currentPhase.budget <= 0
    ) {
      setError("Please fill in all required phase fields.");
      return;
    }
    setError(null);
    setPhases((prev) => [...prev, currentPhase]);
    setCurrentPhase({
      number: "",
      title: "",
      description: "",
      budget: 0,
      start_date: "",
      end_date: "",
      validating_documents: [""],
    });
  };

  const removePhase = (index: number) => {
    setPhases((prev) => prev.filter((_, i) => i !== index));
  };

const handleSubmit = async () => {
  if (phases.length === 0) {
    setError("At least one phase is required.");
    return;
  }

  setLoading(true);
  setError(null);

  try {
    // Normalize frontend phase objects into backend schema
    const payload = {
      phases: phases.map((p, index) => ({
        number: String(index + 1),              // or p.number
        title: p.title,
        description: p.description,
        budget: Number(p.budget),
        start_date: p.start_date,                // convert to ISO if needed
        end_date: p.end_date,
        validating_documents: p.validating_documents || [] // must be array of strings
      })),
    };

    const { data, error: apiError } = await api
      .project({ project_id: projectId })
      .proposal({ proposal_id: proposalId })
      .phase.register.post(payload);

    if (apiError) throw new Error("Failed to register phases");

    if (data?.success) {
      router.push(`/project/${projectId}`);
    } else {
      setError(data?.message || "Failed to register phases");
    }
  } catch (err: any) {
    console.error(err);
    setError(err.message || "An error occurred");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back</span>
        </button>
        <Typography variant="h5" className="font-bold text-gray-900">
          Register Phases
        </Typography>
        <div style={{ width: 80 }} /> {/* Spacer */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-6">
          <Paper className="p-6">
            <Typography variant="h6" className="font-semibold mb-4">
              Add New Phase
            </Typography>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phase Number
                  </label>
                  <input
                    type="text"
                    name="number"
                    value={currentPhase.number}
                    onChange={handlePhaseChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget
                  </label>
                  <input
                    type="number"
                    name="budget"
                    value={currentPhase.budget}
                    onChange={handlePhaseChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={currentPhase.title}
                  onChange={handlePhaseChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Phase Title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={currentPhase.description}
                  onChange={handlePhaseChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the phase..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={currentPhase.start_date}
                    onChange={handlePhaseChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={currentPhase.end_date}
                    onChange={handlePhaseChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>


              <div className="pt-4">
                <Button
                  onClick={addPhase}
                  variant="outlined"
                  fullWidth
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  Add Phase
                </Button>
              </div>
            </div>
          </Paper>
        </div>

        {/* Right Column: List & Submit */}
        <div className="space-y-6">
          <Paper className="p-6 bg-gray-50">
            <Typography
              variant="h6"
              className="font-semibold mb-4 text-gray-900"
            >
              Phases ({phases.length})
            </Typography>

            {phases.length === 0 ? (
              <p className="text-gray-500 text-sm italic text-center py-8">
                No phases added yet.
              </p>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {phases.map((phase, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 relative group"
                  >
                    <button
                      onClick={() => removePhase(index)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash size={18} />
                    </button>
                    <Typography variant="subtitle2" className="font-bold">
                      {index + 1}. {phase.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      className="line-clamp-2"
                    >
                      {phase.description}
                    </Typography>
                    <div className="mt-2 flex justify-between text-xs text-gray-500">
                      <span>Budget: {phase.budget}</span>
                      <span>
                        {phase.start_date} - {phase.end_date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <Button
                onClick={handleSubmit}
                variant="contained"
                fullWidth
                size="large"
                disabled={phases.length === 0 || loading}
                className="bg-green-600 hover:bg-green-700"
                startIcon={<CheckCircle size={20} />}
              >
                {loading ? "Submitting..." : "Submit All Phases"}
              </Button>
            </div>
          </Paper>
        </div>
      </div>
    </div>
  );
}
