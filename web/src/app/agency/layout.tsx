"use client";

import {
  alpha,
  Avatar,
  Box,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import { Briefcase, SquaresFour } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const DRAWER_WIDTH = 280;

const MENU_ITEMS = [
  { text: "Dashboard", icon: <SquaresFour size={24} />, path: "/agency" },
  {
    text: "My Proposals",
    icon: <Briefcase size={24} />,
    path: "/agency/proposals",
  },
];

export default function AgencyLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        bgcolor: "grey.50",
        overflow: "hidden",
        mt: "72px",
        borderTop: 1,
        borderColor: "grey.200",
      }}
    >
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            position: "relative",
            border: "none",
            borderRight: 1,
            borderColor: "grey.200",
            boxShadow: theme.shadows[1],
            bgcolor: "background.paper",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          {/* Navigation Menu */}
          <Box sx={{ flex: 1, overflowY: "auto", py: 2 }}>
            <List sx={{ px: 1.5 }}>
              {MENU_ITEMS.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      component={Link}
                      href={item.path}
                      sx={{
                        borderRadius: 2,
                        py: 1.5,
                        px: 2,
                        transition: "all 0.2s",
                        bgcolor: isActive
                          ? alpha(theme.palette.primary.main, 0.08)
                          : "transparent",
                        color: isActive
                          ? "primary.main"
                          : "text.secondary",
                        "&:hover": {
                          bgcolor: isActive
                            ? alpha(theme.palette.primary.main, 0.12)
                            : alpha(theme.palette.action.hover, 0.04),
                          color: isActive ? "primary.main" : "text.primary",
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 40,
                          color: isActive
                            ? "primary.main"
                            : "action.active",
                          transition: "color 0.2s",
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontWeight: isActive ? 600 : 500,
                          fontSize: "0.9375rem",
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>

          {/* User Profile Section */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: "divider",
              borderRadius: 0,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Avatar
                sx={{
                  width: 44,
                  height: 44,
                  bgcolor: alpha(theme.palette.primary.main, 0.15),
                  color: "primary.main",
                  fontWeight: 700,
                  fontSize: "1rem",
                }}
              >
                BR
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: "text.primary",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  BuildRight
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "block",
                  }}
                >
                  Agency Account
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          overflow: "hidden",
          bgcolor: alpha(theme.palette.grey[50], 0.5),
        }}
      >
        {/* Scrollable Content */}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            p: { xs: 2, sm: 3, lg: 4 },
          }}
        >
          <Container
            maxWidth="xl"
            sx={{
              px: { xs: 0, sm: 2 },
            }}
          >
            {children}
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
