import { createContext, useContext, useMemo, type ReactNode } from "react";
import { ThemeProvider } from "@its/solaris-ui";

import { PRESETS, parsePresetId, type PresetId } from "./themePresets";
import { usePersistentState } from "./usePersistentState";

interface PresetContextType {
  preset: PresetId;
  setPreset: (id: PresetId) => void;
}

const PresetContext = createContext<PresetContextType>({
  preset: "a",
  setPreset: () => {},
});

/**
 * Which design proposal the whole site renders in, remembered between visits.
 * It mounts the `ThemeProvider` itself, so the preset and the theme cannot be
 * wired apart.
 *
 * The static export is prerendered with Proposta A and `usePersistentState`
 * hydrates after the first frame, so a reader who chose B sees A for one
 * frame. Accepted: guessing the stored value on the first render is worse.
 */
export const PresetProvider = ({ children }: { children: ReactNode }) => {
  const [stored, setStored] = usePersistentState<string>("preset", "a");
  const preset = parsePresetId(stored);
  const value = useMemo(
    () => ({ preset, setPreset: setStored }),
    [preset, setStored],
  );

  return (
    <PresetContext.Provider value={value}>
      <ThemeProvider theme={PRESETS[preset].theme}>{children}</ThemeProvider>
    </PresetContext.Provider>
  );
};

export const usePreset = () => useContext(PresetContext);
