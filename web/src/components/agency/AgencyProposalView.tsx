"use client";

import { api } from "@/lib/api";
import type { Proposal } from "@/lib/types";
import {
  Box,
  Chip,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Extended Proposal type with additional fields for hydration
interface ExtendedProposal extends Proposal {
  project_name: string;
  project_description: string;
  proposal_description: any;
  phases: any[];
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
  const [tab, setTab] = useState(0);
  const [proposals, setProposals] = useState<ExtendedProposal[]>([]);

  useEffect(() => {
    const load = async () => {
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
      setSelectedProposal(hydrated[0] ?? null);
    };

    load();
  }, []);

  return (
    <Box sx={{ display: "flex", gap: 3, height: "100%", mt: 1 }}>
      {/* Sidebar */}
      <Paper sx={{ width: 280, borderRadius: 2 }}>
        <Box p={2} borderBottom={1}>
          <Typography fontWeight={600}>Proposals</Typography>
        </Box>
        <List>
          {proposals.map((p) => (
            <ListItemButton
              key={p.proposal_id}
              selected={selectedProposal?.proposal_id === p.proposal_id}
              onClick={() => {
                setSelectedProposal(p);
                setTab(0);
              }}
            >
              <ListItemText
                primary={p.proposal_name}
                secondary={p.project_name}
              />
            </ListItemButton>
          ))}
        </List>
      </Paper>

      {/* Main */}
      <Paper sx={{ flex: 1, borderRadius: 2 }}>
        {selectedProposal ? (
          <>
            {/* Header */}
            <Box p={3} borderBottom={1}>
              <Typography variant="h4" fontWeight={700}>
                {selectedProposal.proposal_name}
              </Typography>
              <Chip label={selectedProposal.status} sx={{ mt: 1 }} />
            </Box>

            {/* Tabs */}
            <Tabs value={tab} onChange={(_, v) => setTab(v)}>
              <Tab label="Overview" />
              <Tab label="Proposal Plan" />
              <Tab label="Phases" />
            </Tabs>

            {/* Content */}
            <Box p={3}>
              {tab === 0 && (
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <TextField
                      label="Project"
                      value={selectedProposal.project_name}
                      fullWidth
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>

                  <Grid size={12}>
                    <TextField
                      label="Project Description"
                      value={selectedProposal.project_description}
                      multiline
                      fullWidth
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>

                  <Grid size={6}>
                    <TextField
                      label="Timeline"
                      value={selectedProposal.timeline}
                      fullWidth
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>

                  <Grid size={6}>
                    <TextField
                      label="Budget"
                      value={`₹${selectedProposal.total_budget.toLocaleString()}`}
                      fullWidth
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>

                  <Grid size={12}>
                    <TextField
                      label="Summary"
                      value={selectedProposal.summary}
                      multiline
                      fullWidth
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>

                  <Grid size={6}>
                    <TextField
                      label="No of Phases"
                      value={selectedProposal.no_of_phases}
                      fullWidth
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>

                  <Grid size={6}>
                    <TextField
                      label="Outcome"
                      value={selectedProposal.outcome}
                      fullWidth
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                </Grid>
              )}

              {tab === 1 && (
                <Editor data={selectedProposal.proposal_description} />
              )}

              {tab === 2 && (
                <Box>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    Project Implementation Phases
                  </Typography>
                  {!selectedProposal.phases || selectedProposal.phases.length === 0 ? (
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 4,
                        textAlign: "center",
                        bgcolor: "grey.50",
                        borderStyle: "dashed",
                      }}
                    >
                      <Typography color="text.secondary">
                        No phases have been registered for this proposal yet.
                      </Typography>
                    </Paper>
                  ) : (
                    <Stack spacing={3}>
                      {selectedProposal.phases.map((phase: any, idx: number) => (
                        <Paper
                          key={phase._id || idx}
                          variant="outlined"
                          sx={{ p: 3, borderRadius: 2 }}
                        >
                          <Box
                            display="flex"
                            justifyContent="between"
                            alignItems="flex-start"
                            mb={2}
                          >
                            <Box flex={1}>
                              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                <Chip
                                  label={`Phase ${phase.number || idx + 1}`}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                                <Typography variant="subtitle1" fontWeight={700}>
                                  {phase.title}
                                </Typography>
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {phase.description}
                              </Typography>
                            </Box>
                            <Box textAlign="right">
                              <Typography fontWeight={700} color="primary.main">
                                ₹{phase.budget?.toLocaleString()}
                              </Typography>
                              <Chip
                                label={phase.status || "Pending"}
                                size="small"
                                sx={{ mt: 1 }}
                                color={
                                  phase.status === "Completed"
                                    ? "success"
                                    : phase.status === "In Progress"
                                    ? "info"
                                    : "default"
                                }
                              />
                            </Box>
                          </Box>

                          <Grid container spacing={2}>
                            <Grid size={6}>
                              <Typography variant="caption" color="text.secondary">
                                Start Date
                              </Typography>
                              <Typography variant="body2">
                                {phase.start_date ? new Date(phase.start_date).toLocaleDateString() : "N/A"}
                              </Typography>
                            </Grid>
                            <Grid size={6}>
                              <Typography variant="caption" color="text.secondary">
                                End Date
                              </Typography>
                              <Typography variant="body2">
                                {phase.end_date ? new Date(phase.end_date).toLocaleDateString() : "N/A"}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </Box>
              )}
            </Box>
          </>
        ) : (
          <Box
            height="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Typography color="text.secondary">Select a proposal</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
