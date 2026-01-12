import { Avatar, Card, CardContent, Stack, Typography } from "@mui/material";
import Link from "next/link";
import type { Agency } from "@/lib/types/agency";

type Props = {
  agency: Agency;
};

export const AgencyCard = ({ agency }: Props) => {
  const firstLetter = agency.name.charAt(0).toUpperCase();

  return (
    <Link href={`/agency/${agency.id}`} style={{ textDecoration: "none" }}>
      <Card
        elevation={2}
        sx={{
          borderRadius: 3,
          cursor: "pointer",
          transition: "box-shadow 0.2s",
          "&:hover": { boxShadow: 4 },
        }}
      >
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48 }}>
              {firstLetter}
            </Avatar>

            <Stack spacing={0.5}>
              <Typography fontWeight={600}>{agency.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {agency.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {agency.address}
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Link>
  );
};
