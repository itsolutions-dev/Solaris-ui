import React from "react";
import { Avatar, Typography } from "@its/solaris-ui";

const row: React.CSSProperties = {
  display: "flex",
  gap: 16,
  alignItems: "center",
  flexWrap: "wrap",
};

const stack: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  alignItems: "center",
};

export const Sizes = () => (
  <div style={row}>
    <Avatar name="Ada Lovelace" size={28} />
    <Avatar name="Grace Hopper" size={40} />
    <Avatar name="Alan Turing" size={56} />
    <Avatar name="Katherine Johnson" size={72} />
  </div>
);

export const Variants = () => (
  <div style={row}>
    <div style={stack}>
      <Avatar name="Ada Lovelace" size={56} variant="circular" />
      <Typography variant="caption">circular</Typography>
    </div>
    <div style={stack}>
      <Avatar name="Grace Hopper" size={56} variant="rounded" />
      <Typography variant="caption">rounded</Typography>
    </div>
    <div style={stack}>
      <Avatar name="Alan Turing" size={56} variant="square" />
      <Typography variant="caption">square</Typography>
    </div>
  </div>
);

export const Statuses = () => (
  <div style={row}>
    <div style={stack}>
      <Avatar name="Ada Lovelace" size={56} status="online" />
      <Typography variant="caption">online</Typography>
    </div>
    <div style={stack}>
      <Avatar name="Grace Hopper" size={56} status="busy" />
      <Typography variant="caption">busy</Typography>
    </div>
    <div style={stack}>
      <Avatar name="Alan Turing" size={56} status="away" />
      <Typography variant="caption">away</Typography>
    </div>
    <div style={stack}>
      <Avatar name="Katherine Johnson" size={56} status="offline" />
      <Typography variant="caption">offline</Typography>
    </div>
  </div>
);

export const Fallbacks = () => (
  <div style={row}>
    <div style={stack}>
      <Avatar name="Marie Curie" size={56} />
      <Typography variant="caption">initials</Typography>
    </div>
    <div style={stack}>
      <Avatar size={56} />
      <Typography variant="caption">default icon</Typography>
    </div>
    <div style={stack}>
      <Avatar size={56} icon="office-building-outline" variant="rounded" />
      <Typography variant="caption">icon</Typography>
    </div>
    <div style={stack}>
      <Avatar
        name="Design Ops"
        size={56}
        backgroundColor="#00629E"
        textColor="#FFFFFF"
      />
      <Typography variant="caption">custom colors</Typography>
    </div>
  </div>
);

export const TeamRoster = () => (
  <div
    style={{ display: "flex", flexDirection: "column", gap: 14, width: 300 }}
  >
    {[
      { name: "Ada Lovelace", role: "Engineering lead", status: "online" },
      { name: "Grace Hopper", role: "Platform architect", status: "busy" },
      { name: "Katherine Johnson", role: "Data science", status: "away" },
    ].map((member) => (
      <div
        key={member.name}
        style={{ display: "flex", gap: 12, alignItems: "center" }}
      >
        <Avatar name={member.name} size={44} status={member.status as any} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Typography variant="subtitle2">{member.name}</Typography>
          <Typography variant="caption">{member.role}</Typography>
        </div>
      </div>
    ))}
  </div>
);
