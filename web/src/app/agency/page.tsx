"use client";

import { Container, Typography } from "@mui/material";
import SearchBar from "@/components/search/SearchBar";
import { useSearch } from "@/components/search/useSearch";
import type { Agency } from "@/lib/types/agency";
import { AgencyCardList } from "./components/AgencyCardList";

const MOCK_AGENCIES: Agency[] = [
  {
    id: "1",
    name: "Agency 1",
    email: "contact@opengov.org",
    address: "New Delhi, India",
  },
  {
    id: "2",
    name: "Agency 2",
    email: "hello@civictech.io",
    address: "Bangalore, India",
  },
  {
    id: "3",
    name: "Agency 3",
    email: "hello@civictech.io",
    address: "Bangalore, India",
  },
];

export default function agency() {
  const { query, setQuery, results } = useSearch(
    MOCK_AGENCIES,
    (a, q) =>
      a.name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.address.toLowerCase().includes(q),
  );

  return (
    <Container maxWidth="lg" className="flex flex-col gap-10">
      <Typography variant="h5" fontWeight={700} mb={3}>
        Agencies
      </Typography>
      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search agencies..."
      />
      <AgencyCardList agencies={results} />
    </Container>
  );
}
