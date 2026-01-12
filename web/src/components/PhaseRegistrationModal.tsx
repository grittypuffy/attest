"use client";

import type {
  PhaseRegistrationItem,
  PhaseRegistrationPayload,
} from "@/lib/types";
import { X } from "@phosphor-icons/react";
import { useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: PhaseRegistrationPayload) => Promise<void>;
  projectId: string;
  projectName: string;
};

export default function PhaseRegistrationModal({
  isOpen,
  onClose,
  onSubmit,
  projectId,
  projectName,
}: Props) {
  const [phases, setPhases] = useState<PhaseRegistrationItem[]>([
    {
      budget: 0,
      description: "",
      end_date: "",
      number: "1",
      start_date: "",
      title: "",
      validating_documents: [],
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const addPhase = () => {
    setPhases([
      ...phases,
      {
        budget: 0,
        description: "",
        end_date: "",
        number: String(phases.length + 1),
        start_date: "",
        title: "",
        validating_documents: [],
      },
    ]);
  };

  const removePhase = (index: number) => {
    if (phases.length > 1) {
      setPhases(phases.filter((_, i) => i !== index));
    }
  };

  const updatePhase = (
    index: number,
    field: keyof PhaseRegistrationItem,
    value: any,
  ) => {
    const updated = [...phases];
    updated[index] = { ...updated[index], [field]: value };
    setPhases(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convert dates to RFC 3339 format if not already
      const formattedPhases = phases.map((phase) => ({
        ...phase,
        start_date: new Date(phase.start_date).toISOString(),
        end_date: new Date(phase.end_date).toISOString(),
      }));

      await onSubmit({ phases: formattedPhases });
      onClose();
      // Reset form
      setPhases([
        {
          budget: 0,
          description: "",
          end_date: "",
          number: "1",
          start_date: "",
          title: "",
          validating_documents: [],
        },
      ]);
    } catch (error) {
      console.error("Failed to submit phases:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Register Project Phases
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Project: <span className="font-semibold">{projectName}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} weight="bold" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {phases.map((phase, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-6 bg-gray-50 relative"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Phase {phase.number}
                    </h3>
                    {phases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePhase(index)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Remove Phase
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Title */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phase Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={phase.title}
                        onChange={(e) =>
                          updatePhase(index, "title", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="e.g., Planning and Design Phase"
                      />
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <textarea
                        required
                        value={phase.description}
                        onChange={(e) =>
                          updatePhase(index, "description", e.target.value)
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Describe the objectives and deliverables for this phase"
                      />
                    </div>

                    {/* Budget */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Budget (₹) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={phase.budget}
                        onChange={(e) =>
                          updatePhase(
                            index,
                            "budget",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="0.00"
                      />
                    </div>

                    {/* Phase Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phase Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={phase.number}
                        onChange={(e) =>
                          updatePhase(index, "number", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="1"
                      />
                    </div>

                    {/* Start Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date *
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={phase.start_date}
                        onChange={(e) =>
                          updatePhase(index, "start_date", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>

                    {/* End Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date *
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={phase.end_date}
                        onChange={(e) =>
                          updatePhase(index, "end_date", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>

                    {/* Validating Documents */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Validating Documents (Optional)
                      </label>
                      <input
                        type="text"
                        value={phase.validating_documents?.join(", ") || ""}
                        onChange={(e) =>
                          updatePhase(
                            index,
                            "validating_documents",
                            e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="document1.pdf, document2.pdf (comma-separated)"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter document names separated by commas
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Phase Button */}
            <button
              type="button"
              onClick={addPhase}
              className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors font-medium"
            >
              + Add Another Phase
            </button>

            {/* Actions */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Registering..." : "Register Phases"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
