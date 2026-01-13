"use client";

import { api } from "@/lib/api";
import type { User } from "@/lib/types";
import {
  alpha,
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";
import { CaretDown, SignOut } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ConnectWallet from "./ConnectWallet";

const NAV_ITEMS = [
  { name: "Home", href: "/" },
  { name: "Projects", href: "/projects" },
  { name: "Agencies", href: "/agencies" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  useEffect(() => {
    bootstrapAuth();
  }, [pathname]);

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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await api.auth.sign_out.post();
      setIsAuthenticated(false);
      setUser(null);
      handleMenuClose();
      router.push("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const getUserMenuItems = () => {
    if (!user) return [];

    const baseRoute = user.role === "Agency" ? "/agency" : "/government";

    return [
      {
        name: "Dashboard",
        href: `${baseRoute}`,
      },
      {
        name: "My Proposals",
        href: `${baseRoute}/proposals`,
      },
    ];
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        borderBottom: 1,
        borderColor: "divider",
        mb: 4,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: 72 }}>
          {/* Logo */}
          <Typography
            variant="h5"
            component={Link}
            href="/"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              textDecoration: "none",
              letterSpacing: "-0.02em",
              "&:hover": {
                color: "primary.main",
              },
              transition: "color 0.2s",
            }}
          >
            Attest
          </Typography>

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Navigation Links */}
          <Stack
            direction="row"
            spacing={1}
            sx={{ mr: 4, display: { xs: "none", md: "flex" } }}
          >
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  sx={{
                    px: 2,
                    py: 1,
                    color: isActive ? "primary.main" : "text.secondary",
                    fontWeight: isActive ? 600 : 500,
                    fontSize: "0.9375rem",
                    textTransform: "none",
                    position: "relative",
                    "&:hover": {
                      color: "primary.main",
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                    },
                    "&::after": isActive
                      ? {
                        content: '""',
                        position: "absolute",
                        bottom: 0,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "70%",
                        height: 2,
                        bgcolor: "primary.main",
                        borderRadius: 1,
                      }
                      : {},
                    transition: "all 0.2s",
                  }}
                >
                  {item.name}
                </Button>
              );
            })}
          </Stack>

          {/* Connect Wallet & User Menu */}
          <Stack direction="row" spacing={2} alignItems="center">
            <ConnectWallet />

            {isAuthenticated && user ? (
              <>
                <Box
                  onClick={handleMenuOpen}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    cursor: "pointer",
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 2,
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.action.hover, 0.04),
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: "primary.main",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                    }}
                  >
                    {getInitials(user.name || user.email)}
                  </Avatar>
                  <CaretDown
                    size={16}
                    weight="bold"
                    style={{
                      color: theme.palette.text.secondary,
                      transform: isMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}
                  />
                </Box>

                <Menu
                  anchorEl={anchorEl}
                  open={isMenuOpen}
                  onClose={handleMenuClose}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  sx={{
                    mt: 1,
                    "& .MuiPaper-root": {
                      minWidth: 240,
                      borderRadius: 2,
                      boxShadow: theme.shadows[3],
                      border: 1,
                      borderColor: "divider",
                    },
                  }}
                >
                  {/* User Info Header */}
                  <Box sx={{ px: 2, py: 1.5, pb: 1 }}>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="text.primary"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {user.name || "User"}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {user.email}
                    </Typography>
                    <Box
                      sx={{
                        display: "inline-block",
                        mt: 0.5,
                        px: 1,
                        py: 0.25,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        borderRadius: 1,
                      }}
                    >
                      <Typography
                        variant="caption"
                        fontWeight={600}
                        color="primary.main"
                        sx={{ textTransform: "capitalize" }}
                      >
                        {user.role}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  {/* Menu Items */}
                  {getUserMenuItems().map((item) => (
                    <MenuItem
                      key={item.href}
                      component={Link}
                      href={item.href}
                      onClick={handleMenuClose}
                      sx={{
                        py: 1.25,
                        px: 2,
                        fontSize: "0.9375rem",
                        "&:hover": {
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                        },
                      }}
                    >
                      {item.name}
                    </MenuItem>
                  ))}

                  <Divider sx={{ my: 1 }} />

                  {/* Logout Button */}
                  <MenuItem
                    onClick={handleLogout}
                    sx={{
                      py: 1.25,
                      px: 2,
                      color: "error.main",
                      fontSize: "0.9375rem",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.error.main, 0.04),
                      },
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <SignOut size={18} />
                      <span>Logout</span>
                    </Stack>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                component={Link}
                href="/auth"
                variant="contained"
                sx={{
                  px: 3,
                  py: 1,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.9375rem",
                  borderRadius: 2,
                  boxShadow: theme.shadows[2],
                  "&:hover": {
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                Sign In
              </Button>
            )}
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
