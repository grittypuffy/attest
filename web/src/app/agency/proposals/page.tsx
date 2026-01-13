"use client";

import AgencyProposalView from "@components/agency/AgencyProposalView";
import {
  Box,
  Container
} from "@mui/material";

type Props = {
  params: Promise<{ id: string }>;
};

export default function AgencyDetailsPage() {
  return (
    <Container
      maxWidth="xl"
      sx={{ py: 4, height: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <AgencyProposalView />
      </Box>
    </Container>
  );
}
