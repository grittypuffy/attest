"use client";

import { api } from "@/lib/api";
import { Button, Typography } from "@mui/material";
import { ArrowLeft } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { use, useState } from "react";

export default function CreateProposalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);
  const router = useRouter();

  const [formData, setFormData] = useState({
    proposal_name: "",
    description: "",
    no_of_phases: 1,
    outcome: "",
    timeline: "",
    total_budget: 0,
    summary: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...formData,
      total_budget: Number(formData.total_budget),
      no_of_phases: parseInt(String(formData.no_of_phases), 10),
    };

    if (isNaN(payload.no_of_phases) || payload.no_of_phases <= 0) {
      setError("Number of phases must be a positive integer.");
      setLoading(false);
      return;
    }
    if (isNaN(payload.total_budget) || payload.total_budget < 0) {
      setError("Total budget must be a non-negative number.");
      setLoading(false);
      return;
    }

    try {
      const { data, error: apiError } = await api
        .project({ project_id: projectId })
        .proposal.register.post(payload);

      if (apiError) {
        const errorDetails = apiError.value as any;
        throw new Error(
          errorDetails?.message ||
            (typeof errorDetails === "string"
              ? errorDetails
              : "Failed to submit proposal"),
        );
      }

      if (data?.success && data.data) {
        // Redirect to phase registration
        // Assuming data.data is the Proposal object or contains proposal_id
        const proposalId = data.data.proposal_id; // Verify this assumption or adjust
        if (proposalId) {
          router.push(
            `/project/${projectId}/proposal/${proposalId}/phase/register`,
          );
        } else {
          // Fallback if proposal_id is missing (shouldn't happen if API is consistent)
          setError("Proposal created but ID missing in response.");
        }
      } else {
        setError(data?.message || "An unexpected error occurred.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during submission.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button
      type="button"
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back to Project</span>
      </button>

      <Typography variant="h4" className="font-bold mb-6 text-gray-900">
        Create New Proposal
      </Typography>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="proposal_name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Proposal Name
            </label>
            <input
              type="text"
              name="proposal_name"
              id="proposal_name"
              required
              value={formData.proposal_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
              name="description"
              id="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="summary"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Summary (Optional)
            </label>
            <textarea
              name="summary"
              id="summary"
              rows={3}
              value={formData.summary}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="total_budget"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Total Budget
              </label>
              <input
                type="number"
                name="total_budget"
                id="total_budget"
                required
                min="0"
                value={formData.total_budget}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="timeline"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Timeline
              </label>
              <input
                type="text"
                name="timeline"
                id="timeline"
                required
                placeholder="e.g., 6 months"
                value={formData.timeline}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="no_of_phases"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Number of Phases
              </label>
              <input
                type="number"
                name="no_of_phases"
                id="no_of_phases"
                required
                min="1"
                value={formData.no_of_phases}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="outcome"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Expected Outcome
              </label>
              <input
                type="text"
                name="outcome"
                id="outcome"
                required
                value={formData.outcome}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Creating..." : "Next: Add Phases"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
