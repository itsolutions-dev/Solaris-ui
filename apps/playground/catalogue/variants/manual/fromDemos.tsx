import { useState, type ComponentType } from "react";
import type { DemoProps } from "../../types";
import type { Variant } from "../types";
import { NavigationDrawerDemo, TableDemo, TopAppBarDemo } from "../../demos";

// Galleries for the components whose stage demo already exercises them: each
// variant is that demo with a fixed set of panel values, so the gallery and
// the stage cannot drift apart. A demo that writes back through `updateProp`
// (the rail's active destination) keeps working, against local state.

const Stateful = ({
  Demo,
  initial,
}: {
  Demo: ComponentType<DemoProps>;
  initial: Record<string, any>;
}) => {
  const [props, setProps] = useState(initial);
  return (
    <Demo
      props={props}
      updateProp={(key, value) => setProps((p) => ({ ...p, [key]: value }))}
    />
  );
};

const galleryOf = (
  Demo: ComponentType<DemoProps>,
  entries: [title: string, props: Record<string, any>, description?: string][],
): Variant[] =>
  entries.map(([title, props, description]) => ({
    name: title.replace(/[^A-Za-z0-9]+/g, ""),
    title,
    description,
    render: () => <Stateful Demo={Demo} initial={props} />,
  }));

export const topAppBarVariants = galleryOf(TopAppBarDemo, [
  ["Small", { variant: "small", title: "Orders" }],
  ["Center-aligned", { variant: "center", title: "Orders" }],
  ["Medium", { variant: "medium", title: "Orders", subtitle: "12 open" }],
  ["Large, scrolled", { variant: "large", title: "Orders", elevated: true }],
]);

export const navigationDrawerVariants = galleryOf(NavigationDrawerDemo, [
  [
    "Standard",
    { variant: "standard", title: "Mail" },
    "Inline, beside the content on expanded windows.",
  ],
  [
    "Modal",
    { variant: "modal", title: "Mail" },
    "Over the content with a scrim; Escape and Android back close it.",
  ],
]);

export const tableVariants = galleryOf(TableDemo, [["Basic", {}]]);
