// GENERATED — do not edit.
// Source: .design-sync/previews/Link.tsx
// Regenerate with `npm run variants -w @its/solaris-playground`.
import React from "react";
import type { Variant } from "../types";
import { Link, Typography, Stack } from "@its/solaris-ui";

export const Underline = () => (
  <Stack spacing="s" width={420}>
    <Link href="https://m3.material.io" underline="always">
      Always underlined
    </Link>
    <Link href="https://m3.material.io" underline="hover">
      Underlined on hover (default)
    </Link>
    <Link href="https://m3.material.io" underline="none">
      Never underlined
    </Link>
  </Stack>
);

export const InProse = () => (
  <Stack spacing="xs" width={420}>
    <Typography variant="body2">
      {"Colours follow the Material 3 roles; type follows MUI's scale."}
    </Typography>
    <Link href="https://m3.material.io/styles/color/roles">
      Read the colour-role reference
    </Link>
  </Stack>
);

export const Variants = () => (
  <Stack spacing="s" width={420}>
    <Link onPress={() => {}} variant="subtitle1">
      subtitle1, in-app press handler
    </Link>
    <Link onPress={() => {}} variant="caption">
      caption
    </Link>
    <Link href="https://m3.material.io" disabled>
      Disabled
    </Link>
  </Stack>
);

export const variants: Variant[] = [
  {
    name: "Underline",
    title: "Underline",
    render: Underline,
  },
  {
    name: "InProse",
    title: "In prose",
    render: InProse,
  },
  {
    name: "Variants",
    title: "Variants",
    render: Variants,
  },
];
