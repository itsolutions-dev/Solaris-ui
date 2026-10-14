import React from "react";
import { AspectRatio, HStack, Typography } from "@its/solaris-ui";

const band = (ratio: number, label: string) => (
  <AspectRatio
    ratio={ratio}
    bg="primaryContainer"
    radius="medium"
    width={180}
    p="s"
  >
    <Typography variant="caption">{label}</Typography>
  </AspectRatio>
);

export const Ratios = () => (
  <HStack spacing="m" wrap width={480} align="flex-start">
    {band(16 / 9, "16:9")}
    {band(4 / 3, "4:3")}
    {band(1, "1:1")}
  </HStack>
);

export const AsAMediaSlot = () => (
  <AspectRatio
    ratio={16 / 9}
    bg="tertiaryContainer"
    radius="large"
    width={360}
    p="m"
  >
    <Typography variant="subtitle1">Release banner</Typography>
    <Typography variant="caption">
      The box keeps its 16:9 shape whatever the width is.
    </Typography>
  </AspectRatio>
);
