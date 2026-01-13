"use client";

import { api } from "@/lib/api";
import { PhaseRegistrationPayload, Project, User } from "@/lib/types";
import { Proposal } from "@/lib/types/proposal";
import Editor from "@components/Editor";
import PhaseRegistrationModal from "@components/PhaseRegistrationModal";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import {
  ArrowLeft,
  Buildings,
  Calendar,
  CaretDown,
  CheckCircle,
  CurrencyInrIcon,
  FileText,
  ListBullets,
  PencilLine,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useAccount, useSwitchChain, useWalletClient, usePublicClient } from "wagmi";
import { encodeFunctionData, parseEther, hexToNumber } from "viem";
import { ACTIVE_CHAIN_ID, ATTEST_MANAGER_ADDRESS } from "@/lib/constants";
import AttestManagerABI from "@/abi/AttestManager.json";

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
          setError("Failed to fetch project data");
          return;
        }

        if (proposalsRes.error) {
          setError("Failed to fetch project proposals");
          return;
        }

        if (projectRes.data?.data) {
          setProject(projectRes.data.data);
          console.log("Fetched project:", projectRes.data.data);
        }

        if (proposalsRes.data?.data) {
          setProposals(proposalsRes.data.data as any);
          // setProposals(PHASES);
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
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Project not found</p>
        </div>
      </div>
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
    <div className="min-w-6xl p-4 md:p-6 w-full">
      {/* Project Header */}
      <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">
          {project.project_name}
        </h1>
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
      <div className="bg-white rounded-lg shadow-md p-6">
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
          <SubmitProposalForm projectId={project.project_id} projectOnchainId={project.onchain_id} />
        )}
      </div>

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
    </div>
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const payload = {
      ...formData,
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
      if (typeof projectOnchainId === 'undefined') throw new Error("Project on-chain ID missing");

      // 0. Network Sync
      if (chainId !== ACTIVE_CHAIN_ID) {
        switchChain({ chainId: ACTIVE_CHAIN_ID });
        setLoading(false);
        return;
      }

      // 1. On-Chain Transaction: submitProposal(uint256 projectId, string metadataURI, PhaseInput[] phases)
      // For now, we'll create simple phases based on no_of_phases
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
        // More robust: find the log that has 3 topics (ProposalSubmitted signature + 2 indexed params)
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
        setSuccess("Proposal submitted successfully on-chain and off-chain!");
        setFormData({
          proposal_name: "",
          description: "",
          no_of_phases: 1,
          outcome: "",
          timeline: "",
          total_budget: 0,
          summary: "",
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
    <div className="max-w-3xl mx-auto">
      <Typography variant="h5" className="font-bold mb-6 text-gray-900">
        Submit a New Proposal
      </Typography>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="proposal_name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Proposal Name
          </label>
          <input
            type="text"
            name="proposal_name"
            id="proposal_name"
            required
            value={formData.proposal_name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            name="description"
            id="description"
            required
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="summary"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Summary (Optional)
          </label>
          <textarea
            name="summary"
            id="summary"
            rows={3}
            value={formData.summary}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="total_budget"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Total Budget
            </label>
            <input
              type="number"
              name="total_budget"
              id="total_budget"
              required
              min="0"
              value={formData.total_budget}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="timeline"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Timeline
            </label>
            <input
              type="text"
              name="timeline"
              id="timeline"
              required
              placeholder="e.g., 6 months"
              value={formData.timeline}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="no_of_phases"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Number of Phases
            </label>
            <input
              type="number"
              name="no_of_phases"
              id="no_of_phases"
              required
              min="1"
              value={formData.no_of_phases}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="outcome"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Expected Outcome
            </label>
            <input
              type="text"
              name="outcome"
              id="outcome"
              required
              value={formData.outcome}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg">
            {success}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Proposal"}
          </Button>
        </div>
      </form>
    </div>
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
      <div className="text-center py-12">
        <FileText size={64} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 text-lg">
          No proposals available for this project yet.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        Project Proposals ({proposals.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {proposals.map((proposal) => (
          <ProposalCard
            key={proposal.proposal_id}
            proposal={proposal}
            onClick={() => onSelectProposal(proposal)}
          />
        ))}
      </div>
    </div>
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
      sx={{
        height: "100%",
        transition: "all 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 3,
        },
      }}
    >
      <CardActionArea onClick={onClick} sx={{ height: "100%", p: 0 }}>
        <CardContent
          sx={{ height: "100%", display: "flex", flexDirection: "column" }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Buildings size={24} className="text-blue-600" />
              <Chip
                label="Active"
                size="small"
                color="success"
                icon={<CheckCircle size={16} />}
              />
            </div>
          </div>

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
    <div>
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back to Proposals</span>
      </button>

      {/* Proposal Header */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Proposal Details
            </h2>
            <Typography variant="body1" color="text.secondary">
              Proposal ID: {proposal.proposal_id}
            </Typography>
          </div>
          <div className="flex items-center gap-3">
            <Chip
              label="Active"
              color="success"
              icon={<CheckCircle size={16} />}
            />
            {userRole === "Government" && (
              <Button
                variant="contained"
                color="primary"
                onClick={() =>
                  onRegisterPhases(proposal.proposal_id, proposal.proposal_name)
                }
                sx={{ textTransform: "none" }}
              >
                Register Phases
              </Button>
            )}
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Buildings size={24} className="text-blue-700" />
            <Typography variant="h6" className="text-blue-900">
              Agency Information
            </Typography>
          </div>
          <Typography variant="body1" className="text-blue-800">
            Agency ID: {proposal.agency_id}
          </Typography>
          <Typography variant="body2" className="text-blue-700 mt-1">
            Project ID: {proposal.project_id}
          </Typography>
        </div>
      </div>

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
                      <span className="inline-flex gap-1">
                        <CurrencyInrIcon />{" "}
                        {proposal.total_budget?.toLocaleString() || "N/A"}
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
                                  <span className="inline-flex items-center gap-1">
                                    <CurrencyInrIcon size={16} />
                                    {phase.budget?.toLocaleString() || "N/A"}
                                  </span>
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
    </div>
  );
};
