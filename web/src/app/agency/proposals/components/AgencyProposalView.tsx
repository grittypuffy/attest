"use client";

import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
  Tabs,
  Tab,
  Grid,
  TextField,
  Chip,
} from "@mui/material";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { Proposal } from "@/lib/types/proposal";
import { api } from "@/lib/api";

const Editor = dynamic(() => import("./Editor"), { ssr: false });

export const toEditorDoc = (input: any) => {
  if (!input)
    return { time: Date.now(), blocks: [], version: "2.22.2" };

  if (typeof input === "object" && input.blocks)
    return input; // already EditorJS

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
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [tab, setTab] = useState(0);
  const [proposals, setProposals] = useState<Proposal[]>([]);

  useEffect(() => {
    const load = async () => {
      const userRes = await api.auth.user.get();
      if (!userRes.data?.success) return;

      const agencyId = userRes.data.data?.id;

      const proposalsRes = await api.agency({ agency_id: agencyId }).proposals.get();
      if (!proposalsRes.data?.success) return;

      const hydrated = await Promise.all(
        proposalsRes.data.data.map(async (p) => {
          const projectRes = await api.project({ project_id: p.project_id }).get();
          const project = projectRes.data?.data;

          return {
            ...p,
            project_name: project?.project_name || "Unknown",
            project_description: project?.description || "",
            proposal_description: toEditorDoc(p.description)
          };
        })
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
              onClick={() => { setSelectedProposal(p); setTab(0); }}
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
            </Tabs>

            {/* Content */}
            <Box p={3}>
            {tab === 0 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Project"
                    value={selectedProposal.project_name}
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Project Description"
                    value={selectedProposal.project_description}
                    multiline
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="Timeline"
                    value={selectedProposal.timeline}
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="Budget"
                    value={`₹${selectedProposal.total_budget.toLocaleString()}`}
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Summary"
                    value={selectedProposal.summary}
                    multiline
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="No of Phases"
                    value={selectedProposal.no_of_phases}
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Grid>

                <Grid item xs={6}>
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
              <Editor
                data={
                  selectedProposal.proposal_description
                }
              />
            )}
            </Box>
          </>
        ) : (
          <Box height="100%" display="flex" alignItems="center" justifyContent="center">
            <Typography color="text.secondary">Select a proposal</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
