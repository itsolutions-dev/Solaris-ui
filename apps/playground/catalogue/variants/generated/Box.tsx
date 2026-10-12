// GENERATED — do not edit.
// Source: .design-sync/previews/Box.tsx
// Regenerate with `npm run variants -w @its/solaris-playground`.
import React from "react";
import type { Variant } from "../types";
import { Box, Typography } from "@its/solaris-ui";

export const Padding = () => (
  <Box bg="surfaceContainerLow" p="m" radius="medium" gap="s" width={360}>
    <Typography variant="caption">
      p / px / py take spacing token names
    </Typography>
    <Box bg="secondaryContainer" p="xs" radius="small">
      <Typography variant="caption">p=&quot;xs&quot; — 4</Typography>
    </Box>
    <Box bg="secondaryContainer" p="m" radius="small">
      <Typography variant="caption">p=&quot;m&quot; — 16</Typography>
    </Box>
    <Box bg="secondaryContainer" px="xl" py="xs" radius="small">
      <Typography variant="caption">
        px=&quot;xl&quot; py=&quot;xs&quot;
      </Typography>
    </Box>
  </Box>
);

export const Surfaces = () => (
  <Box gap="s" width={360}>
    {(
      [
        "surface",
        "surfaceContainer",
        "primaryContainer",
        "tertiaryContainer",
      ] as const
    ).map((bg) => (
      <Box
        key={bg}
        bg={bg}
        p="m"
        radius="medium"
        borderWidth={1}
        borderColor="outlineVariant"
      >
        <Typography variant="caption">bg=&quot;{bg}&quot;</Typography>
      </Box>
    ))}
  </Box>
);

export const FlexControls = () => (
  <Box gap="m" width={360}>
    <Box
      bg="surfaceContainerLow"
      p="s"
      radius="medium"
      gap="s"
      justify="space-between"
      align="center"
      height={72}
    >
      <Typography variant="caption">
        justify=&quot;space-between&quot; align=&quot;center&quot;
      </Typography>
      <Box bg="primaryContainer" p="s" radius="small">
        <Typography variant="caption">A</Typography>
      </Box>
    </Box>
    <Box bg="surfaceContainerLow" p="s" radius="large" gap="xs">
      <Typography variant="caption">
        radius=&quot;large&quot; gap=&quot;xs&quot;
      </Typography>
      <Box bg="primaryContainer" p="s" radius="small">
        <Typography variant="caption">B</Typography>
      </Box>
      <Box bg="primaryContainer" p="s" radius="small">
        <Typography variant="caption">C</Typography>
      </Box>
    </Box>
  </Box>
);

export const variants: Variant[] = [
  {
    name: "Padding",
    title: "Padding",
    render: Padding,
  },
  {
    name: "Surfaces",
    title: "Surfaces",
    render: Surfaces,
  },
  {
    name: "FlexControls",
    title: "Flex controls",
    render: FlexControls,
  },
];
