"use client";

import AttestManagerABI from "@/abi/AttestManager.json";
import { api } from "@/lib/api";
import { ACTIVE_CHAIN_ID, ATTEST_MANAGER_ADDRESS } from "@/lib/constants";
import { PhaseRegistrationPayload, Project, User } from "@/lib/types";
import { Proposal } from "@/lib/types/proposal";
import EditableEditor from "@components/EditableEditor";
import Editor from "@components/Editor";
import PhaseRegistrationModal from "@components/PhaseRegistrationModal";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid, InputAdornment, Stack,
  Tab,
  Tabs, TextField, Typography
} from "@mui/material";
import {
  ArrowLeft,
  Buildings,
  Calendar,
  CalendarBlank,
  CaretDown,
  CheckCircle,
  CurrencyDollar,
  CurrencyInrIcon,
  FileText,
  Folder,
  ListBullets,
  PencilLine,
  Warning,
  WarningCircle
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { encodeFunctionData, hexToNumber, parseEther } from "viem";
import { useAccount, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";

export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [project, setProject] = useState<Project | null>(null);
  const [proposals, setProposals] = useState<Proposal[] | null>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        setError(null);

        const resolvedParams = await params;
        const [projectRes, proposalsRes] = await Promise.all([
          api.project({ project_id: resolvedParams.id }).get(),
          api.project({ project_id: resolvedParams.id }).proposal.all.get(),
        ]);

        if (projectRes.error) {
          console.error("API Error fetching project:", projectRes.error);
          setError("Failed to fetch project data");
          return;
        }

        if (projectRes.data?.data) {
          const projectData = projectRes.data.data as any;
          setProject(projectData);
        }

        if (proposalsRes.data?.data) {
          setProposals(proposalsRes.data.data as any);
          console.log("Fetched proposals:", proposalsRes.data.data);
        }
      } catch (err) {
        console.error("Error fetching project data:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [params]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="error" icon={<WarningCircle size={24} weight="duotone" />}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="warning" icon={<Warning size={24} weight="duotone" />}>
          <AlertTitle>Not Found</AlertTitle>
          Project not found
        </Alert>
      </Container>
    );
  }

  return (
    <ProjectDetails
      project={project}
      proposals={proposals || []}
      selectedProposal={selectedProposal}
      onSelectProposal={setSelectedProposal}
    />
  );
}

const ProjectDetails = ({
  project,
  proposals,
  selectedProposal,
  onSelectProposal,
}: {
  project: Project;
  proposals: Proposal[];
  selectedProposal: Proposal | null;
  onSelectProposal: (proposal: Proposal | null) => void;
}) => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [user, setUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProposalForPhases, setSelectedProposalForPhases] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await api.auth.user.get();
        if (
          data?.success &&
          (data?.data?.role === "Agency" || data?.data?.role === "Government")
        ) {
          setUserRole(data.data.role);
          setUser(data.data);
        } else {
          setUserRole(null);
          setUser(null);
        }
      } catch (error) {
        setUserRole(null);
        setUser(null);
      }
    };

    checkAuth();
  }, []);

  const openPhaseModal = (proposalId: string, proposalName: string) => {
    setSelectedProposalForPhases({ id: proposalId, name: proposalName });
    setIsModalOpen(true);
  };

  const closePhaseModal = () => {
    setIsModalOpen(false);
    setSelectedProposalForPhases(null);
  };

  const handleRegisterPhases = async (payload: PhaseRegistrationPayload) => {
    if (!selectedProposalForPhases) return;

    try {
      const response = await api
        .project({ project_id: project.project_id })
        .proposal({ proposal_id: selectedProposalForPhases.id })
        .phase.register.post(payload);

      if (response.data?.success) {
        alert("Phases registered successfully!");
        closePhaseModal();
      } else {
        alert("Failed to register phases");
      }
    } catch (error) {
      console.error("Error registering phases:", error);
      alert("An error occurred while registering phases");
      throw error;
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
    // Reset proposal selection when switching tabs
    onSelectProposal(null);
  };

  const isAgencyOrGovernment =
    userRole === "Agency" || userRole === "Government";

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Project Header */}
      <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            {project.project_name}
          </h1>
        </div>
        <p className="text-gray-700 text-lg">{project.description}</p>
      </div>

      {/* Tabs Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          aria-label="project tabs"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 500,
            },
          }}
        >
          <Tab
            icon={<ListBullets size={20} />}
            iconPosition="start"
            label="Proposals"
          />
          {isAgencyOrGovernment && (
            <Tab
              icon={<PencilLine size={20} />}
              iconPosition="start"
              label="Submit Proposal"
            />
          )}
        </Tabs>
      </Box>

      {/* Main Content Area */}
      <Card elevation={1} sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          {selectedTab === 0 && (
            <>
              {selectedProposal ? (
                <ProposalDetailsView
                  proposal={selectedProposal}
                  onBack={() => onSelectProposal(null)}
                  userRole={userRole}
                  onRegisterPhases={openPhaseModal}
                />
              ) : (
                <ProposalsGridView
                  proposals={proposals}
                  onSelectProposal={onSelectProposal}
                />
              )}
            </>
          )}

        {selectedTab === 1 && isAgencyOrGovernment && (
          <SubmitProposalForm 
            projectId={project.project_id} 
            projectOnchainId={project.onchain_id} 
          />
        )}
        </CardContent>
      </Card>

      {/* Phase Registration Modal */}
      {selectedProposalForPhases && (
        <PhaseRegistrationModal
          isOpen={isModalOpen}
          onClose={closePhaseModal}
          onSubmit={handleRegisterPhases}
          projectId={project.project_id}
          projectName={project.project_name}
        />
      )}
    </Container>
  );
};

const SubmitProposalForm = ({ projectId, projectOnchainId }: { projectId: string, projectOnchainId?: number }) => {
  const [formData, setFormData] = useState({
    proposal_name: "",
    description: "",
    no_of_phases: 1,
    outcome: "",
    timeline: "",
    total_budget: 0,
    summary: "",
  });
  const [editorData, setEditorData] = useState<any>({
    time: Date.now(),
    blocks: [],
    version: "2.22.2"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { chainId, address: userAddress } = useAccount();
  const { switchChain } = useSwitchChain();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : value) : value,
    }));
  };

  const handleEditorChange = (data: any) => {
    setEditorData(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const payload = {
      ...formData,
      description: JSON.stringify(editorData),
      total_budget: Number(formData.total_budget),
      no_of_phases: parseInt(String(formData.no_of_phases), 10),
    };

    if (isNaN(payload.no_of_phases) || payload.no_of_phases <= 0) {
      setError("Number of phases must be a positive integer.");
      setLoading(false);
      return;
    }
    if (isNaN(payload.total_budget) || payload.total_budget < 0) {
      setError("Total budget must be a non-negative number.");
      setLoading(false);
      return;
    }

    try {
      if (!walletClient) throw new Error("Wallet not connected");
      
      if (projectOnchainId === null || typeof projectOnchainId === 'undefined') {
        throw new Error("Project on-chain ID is missing");
      }

      // 0. Network Sync
      if (chainId !== ACTIVE_CHAIN_ID) {
        switchChain({ chainId: ACTIVE_CHAIN_ID });
        setLoading(false);
        return;
      }

      // 1. On-Chain Transaction: submitProposal(uint256 projectId, string metadataURI, PhaseInput[] phases)
      const phaseBudget = parseEther((payload.total_budget / payload.no_of_phases).toString());
      const phases = Array.from({ length: payload.no_of_phases }, (_, i) => ({
        description: `Phase ${i + 1}`,
        allocatedAmount: phaseBudget,
      }));

      const encodedData = encodeFunctionData({
        abi: AttestManagerABI,
        functionName: "submitProposal",
        args: [BigInt(projectOnchainId), payload.proposal_name, phases],
      });

      const hash = await walletClient.sendTransaction({
        account: userAddress,
        to: ATTEST_MANAGER_ADDRESS as `0x${string}`,
        data: encodedData,
        chain: walletClient.chain,
        kzg: undefined,
      });

      console.log("On-chain proposal submission sent:", hash);

      if (!publicClient) throw new Error("Public client missing");
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      let onchainProposalId: number | undefined;
      if (receipt.logs.length > 0) {
        const proposalLog = receipt.logs.find(l => l.topics.length >= 2);
        if (proposalLog && proposalLog.topics[1]) {
          onchainProposalId = hexToNumber(proposalLog.topics[1]);
        }
      }

      // 2. Database record
      const { data, error: apiError } = await api
        .project({ project_id: projectId })
        .proposal.register.post({
          ...payload,
          onchain_id: onchainProposalId
        });

      if (apiError) {
        const errorDetails = apiError.value as any;
        throw new Error(
          errorDetails?.message ||
          (typeof errorDetails === "string"
            ? errorDetails
            : "Failed to submit proposal"),
        );
      }

      if (data?.success) {
        setSuccess("Proposal submitted successfully!");
        setFormData({
          proposal_name: "",
          description: "",
          no_of_phases: 1,
          outcome: "",
          timeline: "",
          total_budget: 0,
          summary: "",
        });
        setEditorData({
          time: Date.now(),
          blocks: [],
          version: "2.22.2"
        });
      } else {
        setError(data?.message || "An unexpected error occurred.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during submission.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 4 }}>
        Submit a New Proposal
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Left Pane - Input Fields */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={3}>
              <TextField
                label="Proposal Name"
                name="proposal_name"
                required
                fullWidth
                value={formData.proposal_name}
                onChange={handleChange}
                variant="outlined"
              />

              <TextField
                label="Expected Outcome"
                name="outcome"
                multiline
                rows={3}
                fullWidth
                value={formData.outcome}
                onChange={handleChange}
                variant="outlined"
                helperText="Expected proposal's outcome"
              />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Total Budget"
                    name="total_budget"
                    type="number"
                    required
                    fullWidth
                    value={formData.total_budget}
                    onChange={handleChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CurrencyDollar size={20} weight="duotone" />
                        </InputAdornment>
                      ),
                    }}
                    inputProps={{ min: 0 }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Timeline"
                    name="timeline"
                    required
                    fullWidth
                    placeholder="e.g., 6 months"
                    value={formData.timeline}
                    onChange={handleChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarBlank size={20} weight="duotone" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Number of Phases"
                    name="no_of_phases"
                    type="number"
                    required
                    fullWidth
                    value={formData.no_of_phases}
                    onChange={handleChange}
                    variant="outlined"
                    inputProps={{ min: 1 }}
                  />
                </Grid>
              </Grid>
            </Stack>
          </Grid>

          {/* Right Pane - Editor */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                Proposal Description *
              </Typography>
              <Card variant="outlined" sx={{ minHeight: 400, p: 2 }}>
                <EditableEditor
                  data={editorData}
                  onChange={handleEditorChange}
                  holder="proposal-editor"
                />
              </Card>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                Use the editor to create a detailed proposal description
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Error and Success Messages */}
        {error && (
          <Alert severity="error" sx={{ mt: 3 }} icon={<WarningCircle size={24} weight="duotone" />}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mt: 3 }} icon={<CheckCircle size={24} weight="fill" />}>
            {success}
          </Alert>
        )}

        {/* Submit Button */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <PencilLine size={20} />}
            sx={{ textTransform: "none", px: 4 }}
          >
            {loading ? "Submitting..." : "Submit Proposal"}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

const ProposalsGridView = ({
  proposals,
  onSelectProposal,
}: {
  proposals: Proposal[];
  onSelectProposal: (proposal: Proposal) => void;
}) => {
  if (proposals.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <FileText size={64} weight="duotone" color="#9CA3AF" style={{ margin: "0 auto 16px" }} />
        <Typography variant="h6" color="text.secondary">
          No proposals available for this project yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 4 }}>
        Project Proposals ({proposals.length})
      </Typography>
      <Grid container spacing={3}>
        {proposals.map((proposal) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={proposal.proposal_id}>
            <ProposalCard
              proposal={proposal}
              onClick={() => onSelectProposal(proposal)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

const ProposalCard = ({
  proposal,
  onClick,
}: {
  proposal: Proposal;
  onClick: () => void;
}) => {
  return (
    <Card
      elevation={2}
      sx={{
        height: "100%",
        transition: "all 0.2s",
        borderRadius: 2,
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
        },
      }}
    >
      <CardActionArea onClick={onClick} sx={{ height: "100%", p: 0 }}>
        <CardContent
          sx={{ height: "100%", display: "flex", flexDirection: "column", p: 3 }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Buildings size={24} weight="duotone" color="#2563EB" />
              <Chip
                label="Active"
                size="small"
                color="success"
                icon={<CheckCircle size={16} weight="fill" />}
              />
            </Stack>
          </Stack>

          <Typography
            variant="h6"
            component="h3"
            className="font-semibold mb-2"
          >
            Proposal #{proposal.proposal_name.slice(0, 8)}
          </Typography>

          <div className="flex items-center gap-2 mb-3">
            <Buildings size={18} className="text-gray-500" />
            <Typography variant="body2" color="text.secondary">
              Agency: {proposal.agency_id}
            </Typography>
          </div>

          <div className="mt-auto pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-600 font-medium">View Details →</span>
            </div>
          </div>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

const ProposalDetailsView = ({
  proposal,
  onBack,
  userRole,
  onRegisterPhases,
}: {
  proposal: Proposal;
  onBack: () => void;
  userRole: string | null;
  onRegisterPhases: (proposalId: string, proposalName: string) => void;
}) => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  // Parse description as EditorJS data or fallback to empty blocks
  const parseDescription = () => {
    try {
      if (typeof proposal.description === "string") {
        return JSON.parse(proposal.description);
      }
      return proposal.description || { time: Date.now(), blocks: [] };
    } catch {
      return {
        time: Date.now(),
        blocks: [
          { type: "paragraph", data: { text: proposal.description || "" } },
        ],
      };
    }
  };

  return (
    <Box>
      {/* Back Button */}
      <Button
        startIcon={<ArrowLeft size={20} />}
        onClick={onBack}
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
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Proposal Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ID: {proposal.proposal_id}
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip
              label="Active"
              color="success"
              icon={<CheckCircle size={16} weight="fill" />}
            />
            {userRole === "Agency" && (
              <Button
                variant="contained"
                color="primary"
                onClick={() =>
                  onRegisterPhases(proposal.proposal_id, proposal.proposal_name)
                }
                sx={{ textTransform: "none" }}
                startIcon={<CalendarBlank size={18} />}
              >
                Register Phases
              </Button>
            )}
          </Stack>
        </Stack>

        <Card sx={{ bgcolor: "primary.50", border: 1, borderColor: "primary.200" }}>
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <Buildings size={24} weight="duotone" />
              <Typography variant="h6" color="primary.dark">
                Agency Information
              </Typography>
            </Stack>
            <Typography variant="body1" color="primary.dark">
              Agency ID: {proposal.agency_id}
            </Typography>
            <Typography variant="body2" color="primary.dark" sx={{ mt: 0.5 }}>
              Project ID: {proposal.project_id}
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
          <Tab label="Details" />
          <Tab label="Description" />
          <Tab label="Phases" />
        </Tabs>

        {/* Tab Content */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          {/* Details Tab */}
          {selectedTab === 0 && (
            <Box>
              <Typography variant="h6" className="font-bold mb-4 text-gray-900">
                Proposal Information
              </Typography>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <Typography
                    variant="subtitle2"
                    className="font-semibold mb-1 text-gray-700"
                  >
                    Proposal Name
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {proposal.proposal_name}
                  </Typography>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <Typography
                    variant="subtitle2"
                    className="font-semibold mb-1 text-gray-700"
                  >
                    Summary
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {proposal.summary}
                  </Typography>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <Typography
                    variant="subtitle2"
                    className="font-semibold mb-1 text-gray-700"
                  >
                    Outcome
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {proposal.outcome}
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
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <CurrencyInrIcon size={18} weight="duotone" />
                        <span>{proposal.total_budget?.toLocaleString() || "N/A"}</span>
                      </Stack>
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
                      {proposal.no_of_phases || "N/A"}
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
                    {proposal.timeline}
                  </Typography>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <Typography
                    variant="subtitle2"
                    className="font-semibold mb-1 text-gray-700"
                  >
                    Status
                  </Typography>
                  <Chip
                    label={proposal.status || "Pending"}
                    color={
                      proposal.status === "Accepted"
                        ? "success"
                        : proposal.status === "Not Accepted"
                          ? "error"
                          : "warning"
                    }
                  />
                </div>
              </div>
            </Box>
          )}

          {/* Description Tab */}
          {selectedTab === 1 && (
            <Box>
              <Typography variant="h6" className="font-bold mb-4 text-gray-900">
                Proposal Description
              </Typography>
              <Box className="bg-white rounded-lg border border-gray-200 p-6">
                <Editor data={parseDescription()} />
              </Box>
            </Box>
          )}

          {/* Phases Tab */}
          {selectedTab === 2 && (
            <Box>
              <Typography variant="h6" className="font-bold mb-4 text-gray-900">
                Project Phases
              </Typography>
              {proposal.phases && proposal.phases.length > 0 ? (
                <Box className="space-y-2">
                  {proposal.phases.map((phase: any, index: number) => (
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
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
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
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  <Stack direction="row" spacing={0.5} alignItems="center">
                                    <CurrencyDollar size={16} weight="duotone" />
                                    <span>₹{phase.budget?.toLocaleString() || "N/A"}</span>
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
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  <span className="inline-flex items-center gap-1">
                                    <Calendar size={16} />
                                    {phase.start_date && phase.end_date
                                      ? `${new Date(phase.start_date).toLocaleDateString()} - ${new Date(phase.end_date).toLocaleDateString()}`
                                      : "N/A"}
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
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    No phases registered for this proposal yet.
                  </Typography>
                  {userRole === "Government" && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Click "Register Phases" to add phases to this proposal.
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};
