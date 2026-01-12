import type { Agency } from "@/lib/types/agency";
import { AgencyCard } from "@components/agency/AgencyCard";
import { Grid } from "@mui/material";

type Props = {
  agencies: Agency[];
};

export const AgencyCardList = ({ agencies }: Props) => {
  return (
    <Grid container spacing={2}>
      {agencies.map((agency) => (
        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={agency.id}>
          <AgencyCard agency={agency} />
        </Grid>
      ))}
    </Grid>
  );
};
