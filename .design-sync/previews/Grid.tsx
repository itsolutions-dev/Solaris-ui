import React from "react";
import { Box, Grid, Typography } from "@its/solaris-ui";

// A labelled figure for the dashboard story (Stat is parked, roadmap v2).
const Figure = ({ label, value }: { label: string; value: string }) => (
  <Box bg="surface" p="s" radius="medium">
    <Typography variant="caption">{label}</Typography>
    <Typography variant="h6">{value}</Typography>
  </Box>
);

const tile = (n: number) => (
  <Box key={n} bg="secondaryContainer" p="m" radius="medium">
    <Typography variant="subtitle2">{n}</Typography>
  </Box>
);

export const FixedColumns = () => (
  <Grid columns={3} spacing="s" width={420}>
    {[1, 2, 3, 4, 5, 6].map(tile)}
  </Grid>
);

/** `minChildWidth` fits as many columns as the container allows. */
export const Responsive = () => (
  <Grid minChildWidth={160} spacing="s" width={420}>
    {[1, 2, 3, 4, 5].map(tile)}
  </Grid>
);

export const StatBoard = () => (
  <Grid
    columns={2}
    spacing="m"
    p="m"
    bg="surfaceContainerLow"
    radius="large"
    width={420}
  >
    <Figure label="Revenue" value="€18,420" />
    <Figure label="Orders" value="1,204" />
    <Figure label="Refunds" value="18" />
    <Figure label="Active seats" value="128" />
  </Grid>
);
