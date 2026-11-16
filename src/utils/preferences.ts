import { create } from "zustand";
type Preferences = {
  reducedMotion: boolean;
  highQuality: boolean;
  hints: boolean;
};
const defaults: Preferences = {
  reducedMotion: false,
  highQuality: true,
  hints: true,
};
function read(): Preferences {
  try {
    const v = JSON.parse(localStorage.getItem("itlab.preferences") || "null");
    return v &&
      ["reducedMotion", "highQuality", "hints"].every(
        (k) => typeof v[k] === "boolean",
      )
      ? v
      : defaults;
  } catch {
    return defaults;
  }
}
export const usePreferences = create<
  Preferences & { update: (key: keyof Preferences, value: boolean) => void }
>((set, get) => ({
  ...read(),
  update: (key, value) => {
    set({ [key]: value });
    const { reducedMotion, highQuality, hints } = get();
    try {
      localStorage.setItem(
        "itlab.preferences",
        JSON.stringify({ reducedMotion, highQuality, hints }),
      );
    } catch {
      /* Preferences still apply in memory. */
    }
  },
}));
