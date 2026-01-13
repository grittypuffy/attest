"use client";

import { api } from "@/lib/api";
import type { PhaseRegistrationPayload, User } from "@/lib/types";
import PhaseRegistrationModal from "@components/PhaseRegistrationModal";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  ArrowUpRight,
  Buildings,
  CalendarBlank,
  FunnelSimple,
  MagnifyingGlass,
  MapPin,
  PlusCircle
} from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type ProjectStatus = "PROPOSAL" | "ACTIVE" | "COMPLETED";

interface Project {
  project_id: string;
  project_name: string;
  description: string;
  department?: string;
  status?: ProjectStatus;
  budget?: string;
  date?: string;
  location?: string;
}

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | "ALL">("ALL");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProjectForPhases, setSelectedProjectForPhases] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const router = useRouter();

  useEffect(() => {
    bootstrapAuth();
    fetchProjects();
  }, []);

  const bootstrapAuth = async () => {
    try {
      const session = await api.auth.session.valid.get();

      if (!session.data?.data?.valid) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      setIsAuthenticated(true);

      const userRes = await api.auth.user.get();
      if (userRes.data?.success) {
        setUser(userRes.data.data);
      }
    } catch {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await api.project.all.get();
      if (data && !error && data.data) {
        const mappedProjects: Project[] = data.data.map((p: any) => ({
          ...p,
          department: "Government",
          status: "ACTIVE",
          budget: "TBD",
          date: new Date().toISOString().split("T")[0],
          location: "National",
        }));
        setProjects(mappedProjects);
      }
    } catch (err) {
      console.error("Failed to fetch projects", err);
    } finally {
      setLoading(false);
    }
  };

  const openPhaseModal = (projectId: string, projectName: string) => {
    setSelectedProjectForPhases({ id: projectId, name: projectName });
    setIsModalOpen(true);
  };

  const closePhaseModal = () => {
    setIsModalOpen(false);
    setSelectedProjectForPhases(null);
  };

  const handleRegisterPhases = async (payload: PhaseRegistrationPayload) => {
    if (!selectedProjectForPhases) return;

    const proposalId = "proposal-id-placeholder";

    try {
      const response = await api
        .project({ project_id: selectedProjectForPhases.id })
        .proposal({ proposal_id: proposalId })
        .phase.register.post(payload);

      if (response.data?.success) {
        alert("Phases registered successfully!");
      } else {
        alert("Failed to register phases");
      }
    } catch (error) {
      console.error("Error registering phases:", error);
      alert("An error occurred while registering phases");
      throw error;
    }
  };

  const getStatusColor = (status: ProjectStatus | undefined) => {
    switch (status) {
      case "PROPOSAL":
        return "secondary";
      case "ACTIVE":
        return "success";
      case "COMPLETED":
        return "default";
      default:
        return "default";
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.department || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          Public Projects
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse government initiatives and proposals.
        </Typography>
      </Box>

      {/* Search and Filter Section */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mb: 4 }}
        alignItems={{ xs: "stretch", sm: "center" }}
      >
        <TextField
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MagnifyingGlass size={20} />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: { sm: 400 } }}
        />

        <FormControl sx={{ minWidth: 200 }}>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ProjectStatus | "ALL")}
            displayEmpty
            startAdornment={
              <InputAdornment position="start">
                <FunnelSimple size={20} />
              </InputAdornment>
            }
          >
            <MenuItem value="ALL">All Statuses</MenuItem>
            <MenuItem value="PROPOSAL">Proposals</MenuItem>
            <MenuItem value="ACTIVE">Active</MenuItem>
            <MenuItem value="COMPLETED">Completed</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress size={48} />
        </Box>
      ) : (
        <Stack spacing={3}>
          {/* Projects List */}
          {filteredProjects.map((project) => (
            <Card
              key={project.project_id}
              elevation={0}
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 2,
                transition: "box-shadow 0.2s",
                "&:hover": {
                  boxShadow: 3,
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                {/* Project Header */}
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  spacing={2}
                  sx={{ mb: 2 }}
                >
                  <Box>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                      <Chip
                        label={project.status}
                        color={getStatusColor(project.status)}
                        size="small"
                      />
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Buildings size={16} weight="duotone" />
                        <Typography variant="body2" color="text.secondary">
                          {project.department}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Typography variant="h5" fontWeight={600}>
                      {project.project_name}
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
                    <Typography variant="h4" fontWeight={700}>
                      {project.budget}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Budget
                    </Typography>
                  </Box>
                </Stack>

                {/* Project Description */}
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  {project.description}
                </Typography>

                <Divider sx={{ mb: 2 }} />

                {/* Project Meta Info */}
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={2}
                >
                  <Stack direction="row" spacing={3}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <MapPin size={18} weight="duotone" />
                      <Typography variant="body2" color="text.secondary">
                        {project.location}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <CalendarBlank size={18} weight="duotone" />
                      <Typography variant="body2" color="text.secondary">
                        {project.date}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Button
                    component={Link}
                    href={`/project/${project.project_id}`}
                    endIcon={<ArrowUpRight size={18} />}
                    sx={{ textTransform: "none" }}
                  >
                    View Details
                  </Button>
                </Stack>

                {isAuthenticated && user?.role === "Government" && (
                  <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<PlusCircle size={20} />}
                      onClick={() => openPhaseModal(project.project_id, project.project_name)}
                      sx={{ textTransform: "none" }}
                    >
                      Register Phases
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Empty State */}
          {filteredProjects.length === 0 && (
            <Card
              elevation={0}
              sx={{
                border: 2,
                borderStyle: "dashed",
                borderColor: "divider",
                borderRadius: 2,
                py: 8,
              }}
            >
              <CardContent>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  align="center"
                >
                  No projects found matching your criteria.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Stack>
      )}

      {/* Phase Registration Modal */}
      {selectedProjectForPhases && (
        <PhaseRegistrationModal
          isOpen={isModalOpen}
          onClose={closePhaseModal}
          onSubmit={handleRegisterPhases}
          projectId={selectedProjectForPhases.id}
          projectName={selectedProjectForPhases.name}
        />
      )}
    </Container>
  );
}
