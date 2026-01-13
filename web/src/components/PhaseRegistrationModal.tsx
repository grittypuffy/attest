"use client";

import type {
  PhaseRegistrationItem,
  PhaseRegistrationPayload,
} from "@/lib/types";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import {
  CalendarBlank,
  CurrencyDollar,
  FileText,
  ListNumbers,
  PlusCircle,
  Trash,
  X,
} from "@phosphor-icons/react";
import { useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: PhaseRegistrationPayload) => Promise<void>;
  projectId: string;
  projectName: string;
};

export default function PhaseRegistrationModal({
  isOpen,
  onClose,
  onSubmit,
  projectId,
  projectName,
}: Props) {
  const theme = useTheme();
  const [phases, setPhases] = useState<PhaseRegistrationItem[]>([
    {
      budget: 0,
      description: "",
      end_date: "",
      number: "1",
      start_date: "",
      title: "",
      validating_documents: [],
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addPhase = () => {
    setPhases([
      ...phases,
      {
        budget: 0,
        description: "",
        end_date: "",
        number: String(phases.length + 1),
        start_date: "",
        title: "",
        validating_documents: [],
      },
    ]);
  };

  const removePhase = (index: number) => {
    if (phases.length > 1) {
      setPhases(phases.filter((_, i) => i !== index));
    }
  };

  const updatePhase = (
    index: number,
    field: keyof PhaseRegistrationItem,
    value: any,
  ) => {
    const updated = [...phases];
    updated[index] = { ...updated[index], [field]: value };
    setPhases(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convert dates to RFC 3339 format if not already
      const formattedPhases = phases.map((phase) => ({
        ...phase,
        start_date: new Date(phase.start_date).toISOString(),
        end_date: new Date(phase.end_date).toISOString(),
      }));

      await onSubmit({ phases: formattedPhases });
      onClose();
      // Reset form
      setPhases([
        {
          budget: 0,
          description: "",
          end_date: "",
          number: "1",
          start_date: "",
          title: "",
          validating_documents: [],
        },
      ]);
    } catch (error) {
      console.error("Failed to submit phases:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "90vh",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          pb: 2,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Register Project Phases
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Project:
            </Typography>
            <Chip
              label={projectName}
              size="small"
              sx={{
                fontWeight: 600,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
              }}
            />
          </Stack>
        </Box>
        <IconButton
          onClick={handleClose}
          disabled={isSubmitting}
          sx={{
            color: "text.secondary",
            "&:hover": {
              bgcolor: alpha(theme.palette.action.hover, 0.08),
            },
          }}
        >
          <X size={24} weight="bold" />
        </IconButton>
      </DialogTitle>

      <Divider />

      {/* Form Content */}
      <DialogContent sx={{ pt: 3 }}>
        <form id="phase-registration-form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {phases.map((phase, index) => (
              <Card
                key={index}
                elevation={0}
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.grey[50], 0.5),
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Phase Header */}
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 3 }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <ListNumbers size={24} weight="duotone" />
                      <Typography variant="h6" fontWeight={700}>
                        Phase {phase.number}
                      </Typography>
                    </Stack>
                    {phases.length > 1 && (
                      <Button
                        startIcon={<Trash size={18} />}
                        onClick={() => removePhase(index)}
                        color="error"
                        size="small"
                        sx={{
                          textTransform: "none",
                          fontWeight: 600,
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </Stack>

                  <Stack spacing={2.5}>
                    {/* Title */}
                    <TextField
                      fullWidth
                      required
                      label="Phase Title"
                      value={phase.title}
                      onChange={(e) =>
                        updatePhase(index, "title", e.target.value)
                      }
                      placeholder="e.g., Planning and Design Phase"
                      InputProps={{
                        startAdornment: (
                          <Box sx={{ mr: 1, display: "flex" }}>
                            <FileText
                              size={20}
                              weight="duotone"
                              style={{ color: theme.palette.text.secondary }}
                            />
                          </Box>
                        ),
                      }}
                    />

                    {/* Description */}
                    <TextField
                      fullWidth
                      required
                      multiline
                      rows={3}
                      label="Description"
                      value={phase.description}
                      onChange={(e) =>
                        updatePhase(index, "description", e.target.value)
                      }
                      placeholder="Describe the objectives and deliverables for this phase"
                    />

                    {/* Budget and Phase Number Row */}
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5}>
                      <TextField
                        fullWidth
                        required
                        type="number"
                        label="Budget"
                        value={phase.budget}
                        onChange={(e) =>
                          updatePhase(
                            index,
                            "budget",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        placeholder="0.00"
                        inputProps={{
                          min: 0,
                          step: 0.01,
                        }}
                        InputProps={{
                          startAdornment: (
                            <Box sx={{ mr: 1, display: "flex" }}>
                              <CurrencyDollar
                                size={20}
                                weight="duotone"
                                style={{ color: theme.palette.text.secondary }}
                              />
                            </Box>
                          ),
                        }}
                      />

                      <TextField
                        fullWidth
                        required
                        label="Phase Number"
                        value={phase.number}
                        onChange={(e) =>
                          updatePhase(index, "number", e.target.value)
                        }
                        placeholder="1"
                        InputProps={{
                          startAdornment: (
                            <Box sx={{ mr: 1, display: "flex" }}>
                              <ListNumbers
                                size={20}
                                weight="duotone"
                                style={{ color: theme.palette.text.secondary }}
                              />
                            </Box>
                          ),
                        }}
                      />
                    </Stack>

                    {/* Start Date and End Date Row */}
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5}>
                      <TextField
                        fullWidth
                        required
                        type="datetime-local"
                        label="Start Date"
                        value={phase.start_date}
                        onChange={(e) =>
                          updatePhase(index, "start_date", e.target.value)
                        }
                        InputLabelProps={{
                          shrink: true,
                        }}
                        InputProps={{
                          startAdornment: (
                            <Box sx={{ mr: 1, display: "flex" }}>
                              <CalendarBlank
                                size={20}
                                weight="duotone"
                                style={{ color: theme.palette.text.secondary }}
                              />
                            </Box>
                          ),
                        }}
                      />

                      <TextField
                        fullWidth
                        required
                        type="datetime-local"
                        label="End Date"
                        value={phase.end_date}
                        onChange={(e) =>
                          updatePhase(index, "end_date", e.target.value)
                        }
                        InputLabelProps={{
                          shrink: true,
                        }}
                        InputProps={{
                          startAdornment: (
                            <Box sx={{ mr: 1, display: "flex" }}>
                              <CalendarBlank
                                size={20}
                                weight="duotone"
                                style={{ color: theme.palette.text.secondary }}
                              />
                            </Box>
                          ),
                        }}
                      />
                    </Stack>

                    {/* Validating Documents */}
                    <TextField
                      fullWidth
                      label="Validating Documents (Optional)"
                      value={phase.validating_documents?.join(", ") || ""}
                      onChange={(e) =>
                        updatePhase(
                          index,
                          "validating_documents",
                          e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        )
                      }
                      placeholder="document1.pdf, document2.pdf (comma-separated)"
                      helperText="Enter document names separated by commas"
                      InputProps={{
                        startAdornment: (
                          <Box sx={{ mr: 1, display: "flex" }}>
                            <FileText
                              size={20}
                              weight="duotone"
                              style={{ color: theme.palette.text.secondary }}
                            />
                          </Box>
                        ),
                      }}
                    />
                  </Stack>
                </CardContent>
              </Card>
            ))}

            {/* Add Phase Button */}
            <Button
              fullWidth
              variant="outlined"
              startIcon={<PlusCircle size={20} weight="duotone" />}
              onClick={addPhase}
              sx={{
                py: 2,
                borderStyle: "dashed",
                borderWidth: 2,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.9375rem",
                "&:hover": {
                  borderStyle: "dashed",
                  borderWidth: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                },
              }}
            >
              Add Another Phase
            </Button>
          </Stack>
        </form>
      </DialogContent>

      <Divider />

      {/* Actions */}
      <DialogActions sx={{ px: 3, py: 2.5 }}>
        <Button
          onClick={handleClose}
          disabled={isSubmitting}
          variant="outlined"
          sx={{
            px: 3,
            py: 1.25,
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="phase-registration-form"
          disabled={isSubmitting}
          variant="contained"
          sx={{
            px: 3,
            py: 1.25,
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            boxShadow: theme.shadows[2],
            "&:hover": {
              boxShadow: theme.shadows[4],
            },
          }}
        >
          {isSubmitting ? "Registering..." : "Register Phases"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
