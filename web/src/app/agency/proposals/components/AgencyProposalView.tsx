"use client";

import type { Proposal } from "@/lib/types";
import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import dynamic from "next/dynamic";
import { useState } from "react";

// Dynamically import Editor to avoid SSR issues with window object
const Editor = dynamic(() => import("./Editor"), { ssr: false });

const MOCK_PROPOSALS: Proposal[] = [
  {
    proposal_id: "1",
    proposal_name: "Urban Park Renovation",
    project_id: "proj-1",
    agency_id: "agency-1",
    total_budget: 500000,
    timeline: "2024-01-01",
    summary: "Renovation of the central city park.",
    no_of_phases: 3,
    outcome: "A revitalized urban park with improved facilities and green spaces.",
    status: "Pending",
    description: JSON.stringify({
      time: 1642603957790,
      blocks: [
        {
          id: "header1",
          type: "header",
          data: {
            text: "Urban Park Renovation Project",
            level: 2,
          },
        },
        {
          id: "p1",
          type: "paragraph",
          data: {
            text: "This project aims to revitalize the central urban park, adding new greenery, walking paths, and recreational areas for the community.",
          },
        },
        {
          id: "p2",
          type: "paragraph",
          data: {
            text: "<b>Phase 1:</b> Demolition and clearing.",
          },
        },
      ],
      version: "2.22.2",
    }),
  },
  {
    proposal_id: "2",
    proposal_name: "Smart Traffic Lights",
    project_id: "proj-2",
    agency_id: "agency-1",
    total_budget: 1200000,
    timeline: "2024-03-15",
    summary: "Installation of AI-powered traffic lights.",
    no_of_phases: 2,
    outcome: "Reduced traffic congestion and improved air quality through intelligent traffic management.",
    status: "Pending",
    description: JSON.stringify({
      time: 1642604000000,
      blocks: [
        {
          id: "header2",
          type: "header",
          data: {
            text: "Smart Traffic Management",
            level: 2,
          },
        },
        {
          id: "p3",
          type: "paragraph",
          data: {
            text: "Implementing an intelligent traffic management system to reduce congestion and improve air quality.",
          },
        },
      ],
      version: "2.22.2",
    }),
  },
];

export default function AgencyProposalView() {
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(
    null,
  );

  // Parse description as EditorJS data
  const parseDescription = (description: string) => {
    try {
      return JSON.parse(description);
    } catch {
      return { time: Date.now(), blocks: [] };
    }
  };

  return (
    <Box sx={{ display: "flex", gap: 3, height: "100%", mt: 1 }}>
      {/* Sidebar List */}
      <Paper
        elevation={2}
        sx={{ width: "25%", minWidth: 250, overflowY: "auto", borderRadius: 2 }}
      >
        <Box p={2} borderBottom={1} borderColor="divider">
          <Typography variant="h6" fontWeight={600}>
            Proposals
          </Typography>
        </Box>
        <List component="nav" sx={{ p: 1 }}>
          {MOCK_PROPOSALS.map((proposal) => (
            <ListItemButton
              key={proposal.proposal_id}
              selected={selectedProposal?.proposal_id === proposal.proposal_id}
              onClick={() => setSelectedProposal(proposal)}
              sx={{ borderRadius: 1, mb: 0.5 }}
            >
              <ListItemText
                primary={proposal.proposal_name}
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItemButton>
          ))}
        </List>
      </Paper>

      {/* Main Canvas Area */}
      <Paper
        elevation={2}
        sx={{
          flex: 1,
          borderRadius: 2,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box p={3} flex={1} sx={{ overflowY: "auto", bgcolor: "#fafafa" }}>
          {selectedProposal ? (
            <Box
              sx={{
                maxWidth: 800,
                mx: "auto",
                bgcolor: "white",
                p: 4,
                minHeight: "100%",
                boxShadow: 1,
                borderRadius: 1,
              }}
            >
              <Typography variant="h4" gutterBottom fontWeight={700}>
                {selectedProposal.proposal_name}
              </Typography>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                gutterBottom
              >
                Budget: ${selectedProposal.total_budget.toLocaleString()} •
                Timeline: {selectedProposal.timeline}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box className="editor-js-content">
                <Editor
                  data={parseDescription(selectedProposal.description)}
                />
              </Box>
            </Box>
          ) : (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              height="100%"
              color="text.secondary"
            >
              <Typography variant="h6">
                Select a proposal to view details
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
