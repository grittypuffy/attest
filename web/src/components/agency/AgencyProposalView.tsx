"use client";

import { api } from "@/lib/api";
import type { Proposal } from "@/lib/types";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import {
  ArrowLeft,
  Buildings,
  Calendar,
  CalendarBlank,
  CaretDown,
  CheckCircle,
  Clock,
  CurrencyInr,
  FileText,
  Folder,
  ListBullets,
  WarningCircle
} from "@phosphor-icons/react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Extended Proposal type with additional fields for hydration
interface ExtendedProposal extends Proposal {
  project_name: string;
  project_description: string;
  proposal_description: any;
  phases?: any[];
}

const Editor = dynamic(() => import("@components/agency/ProposalEditor"), {
  ssr: false,
});

export const toEditorDoc = (input: any) => {
  if (!input) return { time: Date.now(), blocks: [], version: "2.22.2" };

  if (typeof input === "object" && input.blocks) return input; // already EditorJS

  return {
    time: Date.now(),
    version: "2.22.2",
    blocks: [
      {
        type: "paragraph",
        data: { text: String(input) },
      },
    ],
  };
};

export default function AgencyProposalView() {
  const [selectedProposal, setSelectedProposal] =
    useState<ExtendedProposal | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [proposals, setProposals] = useState<ExtendedProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const userRes = await api.auth.user.get();
        if (!userRes.data?.success) return;

        const agencyId = userRes.data.data?.id;
        if (!agencyId) return;

        const proposalsRes = await api
          .agency({ agency_id: agencyId })
          .proposals.get();
        if (!proposalsRes.data?.success) return;

        const hydrated = await Promise.all(
          proposalsRes.data.data.map(async (p) => {
            const projectRes = await api
              .project({ project_id: p.project_id })
              .get();
            const project = projectRes.data?.data;

            return {
              ...p,
              project_name: project?.project_name || "Unknown",
              project_description: project?.description || "",
              proposal_description: toEditorDoc((p as any).description),
            } as unknown as ExtendedProposal;
          }),
        );

        setProposals(hydrated);
      } catch (error) {
        console.error("Error loading proposals:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleProposalSelect = (proposal: ExtendedProposal) => {
    setSelectedProposal(proposal);
    setSelectedTab(0);
    setViewMode("detail");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedProposal(null);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return "success";
      case "rejected":
      case "not accepted":
        return "error";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return <CheckCircle size={16} weight="fill" />;
      case "rejected":
      case "not accepted":
        return <WarningCircle size={16} weight="fill" />;
      case "pending":
        return <Clock size={16} weight="fill" />;
      default:
        return undefined;
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (viewMode === "list") {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            My Proposals
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage all your submitted proposals
          </Typography>
        </Box>

        {proposals.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              bgcolor: "grey.50",
              borderRadius: 2,
              border: "2px dashed",
              borderColor: "grey.300",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Folder size={64} weight="duotone" color="#9CA3AF" />
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              No Proposals Yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You haven't submitted any proposals yet.
            </Typography>
          </Box>
        ) : (
          <Box className="space-y-3">
            {proposals.map((proposal) => (
              <Card
                key={proposal.proposal_id}
                sx={{
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 3,
                  },
                }}
                onClick={() => handleProposalSelect(proposal)}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    spacing={2}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <FileText size={20} weight="duotone" />
                        <Typography variant="h6" fontWeight={600}>
                          {proposal.proposal_name}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <Buildings size={16} weight="duotone" color="#6B7280" />
                        <Typography variant="body2" color="text.secondary">
                          {proposal.project_name}
                        </Typography>
                      </Stack>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 1,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {proposal.summary}
                      </Typography>
                    </Box>

                    <Stack spacing={1} alignItems={{ xs: "flex-start", sm: "flex-end" }}>
                      <Chip
                        label={proposal.status}
                        color={getStatusColor(proposal.status)}
                        icon={getStatusIcon(proposal.status)}
                        size="small"
                      />
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <CurrencyInr size={16} weight="duotone" />
                          <Typography variant="body2" fontWeight={600}>
                            {proposal.total_budget.toLocaleString()}
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <CalendarBlank size={16} weight="duotone" />
                          <Typography variant="body2" color="text.secondary">
                            {proposal.timeline}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Container>
    );
  }

  // Detail View
  if (!selectedProposal) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box>
        {/* Back Button */}
        <Button
          startIcon={<ArrowLeft size={20} />}
          onClick={handleBackToList}
          sx={{ mb: 3, textTransform: "none", fontWeight: 600 }}
        >
          Back to Proposals
        </Button>

        {/* Proposal Header */}
        <Box sx={{ mb: 4 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                {selectedProposal.proposal_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ID: {selectedProposal.proposal_id}
              </Typography>
            </Box>
            <Chip
              label={selectedProposal.status}
              color={getStatusColor(selectedProposal.status)}
              icon={getStatusIcon(selectedProposal.status)}
              sx={{ fontWeight: 600 }}
            />
          </Stack>

          <Card
            sx={{
              bgcolor: "primary.50",
              border: 1,
              borderColor: "primary.200",
              mb: 3,
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <Buildings size={24} weight="duotone" />
                <Typography variant="h6" color="primary.dark">
                  Project Information
                </Typography>
              </Stack>
              <Typography variant="body1" fontWeight={600} color="primary.dark">
                {selectedProposal.project_name}
              </Typography>
              <Typography variant="body2" color="primary.dark" sx={{ mt: 1 }}>
                {selectedProposal.project_description}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Vertical Tabs */}
        <Box sx={{ display: "flex", gap: 3 }}>
          {/* Tabs Navigation */}
          <Tabs
            orientation="vertical"
            value={selectedTab}
            onChange={handleTabChange}
            sx={{
              borderRight: 1,
              borderColor: "divider",
              minWidth: 180,
              "& .MuiTab-root": {
                alignItems: "flex-start",
                textAlign: "left",
                textTransform: "none",
                fontSize: "0.95rem",
                fontWeight: 500,
              },
            }}
          >
            <Tab label="Overview" />
            <Tab label="Proposal Plan" />
            <Tab label="Phases" />
          </Tabs>

          {/* Tab Content */}
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            {/* Overview Tab */}
            {selectedTab === 0 && (
              <Box>
                <Typography variant="h6" className="font-bold mb-4 text-gray-900">
                  Proposal Details
                </Typography>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <Typography
                      variant="subtitle2"
                      className="font-semibold mb-1 text-gray-700"
                    >
                      Summary
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {selectedProposal.summary}
                    </Typography>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <Typography
                      variant="subtitle2"
                      className="font-semibold mb-1 text-gray-700"
                    >
                      Expected Outcome
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {selectedProposal.outcome}
                    </Typography>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <Typography
                        variant="subtitle2"
                        className="font-semibold mb-1 text-gray-700"
                      >
                        Total Budget
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        <span className="inline-flex items-center gap-1">
                          <CurrencyInr size={18} weight="duotone" />
                          {selectedProposal.total_budget?.toLocaleString() || "N/A"}
                        </span>
                      </Typography>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <Typography
                        variant="subtitle2"
                        className="font-semibold mb-1 text-gray-700"
                      >
                        Number of Phases
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {selectedProposal.no_of_phases || "N/A"}
                      </Typography>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <Typography
                      variant="subtitle2"
                      className="font-semibold mb-1 text-gray-700"
                    >
                      Timeline
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={18} weight="duotone" />
                        {selectedProposal.timeline}
                      </span>
                    </Typography>
                  </div>
                </div>
              </Box>
            )}

            {/* Proposal Plan Tab */}
            {selectedTab === 1 && (
              <Box>
                <Typography variant="h6" className="font-bold mb-4 text-gray-900">
                  Detailed Proposal Plan
                </Typography>
                <Box className="bg-white rounded-lg border border-gray-200 p-6"><Editor data={
                  typeof selectedProposal.proposal_description === 'string'
                    ? JSON.parse(selectedProposal.proposal_description)
                    : selectedProposal.proposal_description
                } />
                </Box>
              </Box>
            )}

            {/* Phases Tab */}
            {selectedTab === 2 && (
              <Box>
                <Typography variant="h6" className="font-bold mb-4 text-gray-900">
                  Project Phases
                </Typography>
                {selectedProposal.phases && selectedProposal.phases.length > 0 ? (
                  <Box className="space-y-2">
                    {selectedProposal.phases.map((phase: any, index: number) => (
                      <Accordion
                        key={index}
                        sx={{
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px !important",
                          "&:before": { display: "none" },
                          boxShadow: "none",
                          "&.Mui-expanded": {
                            margin: "8px 0 !important",
                          },
                        }}
                      >
                        <AccordionSummary
                          expandIcon={<CaretDown size={20} />}
                          sx={{
                            "& .MuiAccordionSummary-content": {
                              alignItems: "center",
                              gap: 2,
                            },
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              width: "100%",
                            }}
                          >
                            <Chip
                              label={`Phase ${phase.number || index + 1}`}
                              color="primary"
                              size="small"
                            />
                            <Typography variant="subtitle1" fontWeight={600}>
                              {phase.title || "Untitled Phase"}
                            </Typography>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box sx={{ width: "100%", p: 2 }}>
                            <div className="space-y-4">
                              <div className="bg-gray-50 rounded-lg p-4">
                                <Typography
                                  variant="subtitle2"
                                  className="font-semibold mb-1 text-gray-700"
                                >
                                  Description
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {phase.description || "No description provided"}
                                </Typography>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <Typography
                                    variant="subtitle2"
                                    className="font-semibold mb-1 text-gray-700"
                                  >
                                    Budget
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    <Stack
                                      direction="row"
                                      spacing={0.5}
                                      alignItems="center"
                                    >
                                      <CurrencyInr size={16} weight="duotone" />
                                      <span>
                                        {phase.budget?.toLocaleString() || "N/A"}
                                      </span>
                                    </Stack>
                                  </Typography>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                  <Typography
                                    variant="subtitle2"
                                    className="font-semibold mb-1 text-gray-700"
                                  >
                                    Timeline
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    <span className="inline-flex items-center gap-1">
                                      <Calendar size={16} />
                                      {phase.start_date && phase.end_date
                                        ? `${new Date(phase.start_date).toLocaleDateString()} - ${new Date(phase.end_date).toLocaleDateString()}`
                                        : phase.timeline || "N/A"}
                                    </span>
                                  </Typography>
                                </div>
                              </div>

                              {phase.validating_documents &&
                                phase.validating_documents.length > 0 && (
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <Typography
                                      variant="subtitle2"
                                      className="font-semibold mb-2 text-gray-700"
                                    >
                                      Validating Documents
                                    </Typography>
                                    <div className="flex flex-wrap gap-2">
                                      {phase.validating_documents.map(
                                        (doc: string, docIndex: number) => (
                                          <Chip
                                            key={docIndex}
                                            label={doc}
                                            size="small"
                                            icon={<FileText size={14} />}
                                            variant="outlined"
                                          />
                                        ),
                                      )}
                                    </div>
                                  </div>
                                )}
                            </div>
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 8,
                      bgcolor: "grey.50",
                      borderRadius: 2,
                      border: "2px dashed",
                      borderColor: "grey.300",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ListBullets size={64} weight="duotone" color="#9CA3AF" />
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                      No phases registered for this proposal yet.
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
