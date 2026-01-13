"use client";

import { api } from "@/lib/api";
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Briefcase,
  CheckCircle,
  MagnifyingGlass,
  MapPin,
  Star,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";

interface Agency {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  isAccredited: boolean;
  specialization: string[];
  location: string;
  completedProjects: number;
  description: string;
}

export default function AgenciesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const { data, error } = await api.agency.all.get();
        if (data && !error && data.success) {
          setAgencies(data.data as any[]);
        }
      } catch (err) {
        console.error("Failed to fetch agencies", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgencies();
  }, []);

  const filteredAgencies = agencies.filter(
    (agency) =>
      agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.specialization.some((s) =>
        s.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 6, textAlign: "center", maxWidth: 800, mx: "auto" }}>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          Find Accredited Agencies
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Search for verified agencies to partner with on government projects.
          Check their credentials, ratings, and past performance.
        </Typography>

        {/* Search Bar */}
        <TextField
          placeholder="Search by name or specialization..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MagnifyingGlass size={20} />
              </InputAdornment>
            ),
            sx: {
              borderRadius: 8,
              bgcolor: "background.paper",
            },
          }}
          sx={{
            maxWidth: 600,
            mx: "auto",
            "& .MuiOutlinedInput-root": {
              "&:hover fieldset": {
                borderColor: "primary.main",
              },
            },
          }}
        />
      </Box>

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress size={48} />
        </Box>
      ) : (
        <>
          {/* Agencies Grid */}
          <Grid container spacing={3}>
            {filteredAgencies.map((agency) => (
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 3,
                  transition: "all 0.2s",
                  "&:hover": {
                    boxShadow: 3,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <CardContent sx={{ p: 3, display: "flex", flexDirection: "column" }}>
                  {/* Header with Name and Badge */}
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={1}
                    sx={{ mb: 2 }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                        flex: 1,
                      }}
                    >
                      {agency.name}
                    </Typography>
                    {agency.isAccredited && (
                      <CheckCircle
                        size={28}
                        weight="fill"
                        style={{ color: "#2563eb", flexShrink: 0 }}
                      />
                    )}
                  </Stack>

                  {/* Rating */}
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 2 }}>
                    <Star weight="fill" size={20} style={{ color: "#facc15" }} />
                    <Typography variant="body1" fontWeight={600}>
                      {agency.rating}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ({agency.reviewCount} reviews)
                    </Typography>
                  </Stack>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      flexGrow: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {agency.description}
                  </Typography>

                  {/* Specializations */}
                  <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
                    {agency.specialization.map((spec) => (
                      <Chip
                        key={spec}
                        label={spec}
                        size="small"
                        sx={{
                          bgcolor: "grey.100",
                          color: "text.primary",
                          fontWeight: 500,
                          fontSize: "0.75rem",
                        }}
                      />
                    ))}
                  </Stack>

                  <Divider sx={{ mb: 2 }} />

                  {/* Footer with Location and Projects */}
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                  >
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <MapPin size={16} weight="duotone" />
                      <Typography variant="body2" color="text.secondary">
                        {agency.location}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Briefcase size={16} weight="duotone" />
                      <Typography variant="body2" fontWeight={600}>
                        {agency.completedProjects}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Projects
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Grid>

          {/* Empty State */}
          {filteredAgencies.length === 0 && (
            <Card
              elevation={0}
              sx={{
                border: 2,
                borderStyle: "dashed",
                borderColor: "divider",
                borderRadius: 2,
                py: 8,
                mt: 4,
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  align="center"
                  gutterBottom
                >
                  No agencies found
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  No agencies found matching "{searchTerm}". Try adjusting your search.
                </Typography>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Container>
  );
}
