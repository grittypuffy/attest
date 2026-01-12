"use client";

import {
  Avatar,
  Box,
  Button,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import AgencyProposalView from "./components/AgencyProposalView";
import { use } from "react";

type Props = {
  params: Promise<{ id: string }>;
};

export default function AgencyDetailsPage({ params }: Props) {
  const { id } = use(params);

  // In a real app, we would fetch the agency details using the ID here.
  // const agency = await getAgency(id);

  return (
    <Container
      maxWidth="xl"
      sx={{ py: 4, height: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Box mb={2}>
        <Link href="/agency" passHref>
          <Button variant="text" sx={{ mb: 1 }}>
            &larr; Back to Agencies
          </Button>
        </Link>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48 }}>
            A
          </Avatar>
          <Stack>
            <Typography variant="h5" fontWeight={700}>
              Agency Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ID: {id}
            </Typography>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <AgencyProposalView />
      </Box>
    </Container>
  );
}
