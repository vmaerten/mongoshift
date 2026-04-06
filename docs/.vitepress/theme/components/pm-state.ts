import { ref } from "vue";

export const PM_OPTIONS = ["pnpm", "npm", "yarn", "bun"] as const;
export type PmChoice = (typeof PM_OPTIONS)[number];

const STORAGE_KEY = "mongoshift-pm";

function readInitial(): PmChoice {
  if (typeof window === "undefined") return "pnpm";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && (PM_OPTIONS as readonly string[]).includes(stored)) {
    return stored as PmChoice;
  }
  return "pnpm";
}

export const activePm = ref<PmChoice>(readInitial());

export function setActivePm(pm: PmChoice): void {
  activePm.value = pm;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, pm);
  }
}

export const PM_LABELS: Record<PmChoice, string> = {
  pnpm: "pnpm",
  npm: "npm",
  yarn: "yarn",
  bun: "bun",
};

/**
 * Returns the full command string for a given package manager + mongoshift subcommand.
 * Examples:
 *   buildRunCommand("pnpm", "init") -> "pnpm dlx mongoshift init"
 *   buildRunCommand("npm", "up --dry-run") -> "npx mongoshift up --dry-run"
 */
export function buildRunCommand(pm: PmChoice, cmd: string): string {
  switch (pm) {
    case "pnpm":
      return `pnpm dlx mongoshift ${cmd}`;
    case "npm":
      return `npx mongoshift ${cmd}`;
    case "yarn":
      return `yarn dlx mongoshift ${cmd}`;
    case "bun":
      return `bunx mongoshift ${cmd}`;
  }
}

/**
 * Returns the install command for a given package manager.
 */
export function buildInstallCommand(pm: PmChoice, pkg: string): string {
  switch (pm) {
    case "pnpm":
      return `pnpm add ${pkg}`;
    case "npm":
      return `npm install ${pkg}`;
    case "yarn":
      return `yarn add ${pkg}`;
    case "bun":
      return `bun add ${pkg}`;
  }
}
