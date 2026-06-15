import type { Dispatch } from "react";

export type StepKey =
  | "welcome"
  | "wsl"
  | "ubuntu"
  | "config"
  | "deps"
  | "gitcfg"
  | "node"
  | "claude"
  | "source"
  | "npm"
  | "env"
  | "oauth"
  | "pair"
  | "done";

export type StepStatus = "pending" | "running" | "done" | "error" | "skipped";

export type FormData = {
  gitName: string;
  gitEmail: string;
  claimCode: string;
};

export type WizardState = {
  currentStep: StepKey;
  stepStatus: Record<StepKey, StepStatus>;
  stepLogs: Record<StepKey, string[]>;
  errors: Record<StepKey, string | null>;
  formData: FormData;
  distro: string;
  apiKey: string;
};

export type Action =
  | { type: "GO_TO"; step: StepKey }
  | { type: "SET_STATUS"; step: StepKey; status: StepStatus }
  | { type: "APPEND_LOG"; step: StepKey; line: string }
  | { type: "SET_ERROR"; step: StepKey; error: string }
  | { type: "UPDATE_FORM"; data: Partial<FormData> }
  | { type: "SET_DISTRO"; distro: string }
  | { type: "SET_API_KEY"; key: string };

export const STEP_ORDER: readonly StepKey[] = [
  "welcome",
  "wsl",
  "ubuntu",
  "config",
  "deps",
  "gitcfg",
  "node",
  "claude",
  "source",
  "npm",
  "env",
  "oauth",
  "pair",
  "done",
];

export const STEP_META: Record<
  StepKey,
  { title: string; description: string }
> = {
  welcome: { title: "Welcome", description: "What this installer will do" },
  wsl: {
    title: "WSL2 setup",
    description: "Detect and install WSL2 (Windows only)",
  },
  ubuntu: { title: "Ubuntu", description: "Install Ubuntu 22.04 if missing" },
  config: {
    title: "Configuration",
    description: "Git name, email, optional claim code",
  },
  deps: {
    title: "System dependencies",
    description: "build-essential, git, python3",
  },
  gitcfg: {
    title: "Git config",
    description: "Set global git user.name and user.email",
  },
  node: {
    title: "Node.js 22",
    description: "Install Node.js 22 via NodeSource",
  },
  claude: {
    title: "Claude Code CLI",
    description: "npm install -g @anthropic-ai/claude-code",
  },
  source: {
    title: "Bridge source",
    description: "Download the bridge tarball",
  },
  npm: { title: "npm install", description: "Install bridge npm dependencies" },
  env: {
    title: "Generate .env",
    description: "Auto-generate a 64-char API_KEY",
  },
  oauth: {
    title: "Sign in to Claude",
    description: "Open browser for OAuth login",
  },
  pair: {
    title: "Pair bridge",
    description: "Pair with your AgentControl org",
  },
  done: { title: "Done", description: "Bridge running, app download link" },
};

const initialStatus = (): Record<StepKey, StepStatus> =>
  STEP_ORDER.reduce(
    (acc, key) => {
      acc[key] = "pending";
      return acc;
    },
    {} as Record<StepKey, StepStatus>,
  );

const initialLogs = (): Record<StepKey, string[]> =>
  STEP_ORDER.reduce(
    (acc, key) => {
      acc[key] = [];
      return acc;
    },
    {} as Record<StepKey, string[]>,
  );

const initialErrors = (): Record<StepKey, string | null> =>
  STEP_ORDER.reduce(
    (acc, key) => {
      acc[key] = null;
      return acc;
    },
    {} as Record<StepKey, string | null>,
  );

export const initialState: WizardState = {
  currentStep: "welcome",
  stepStatus: initialStatus(),
  stepLogs: initialLogs(),
  errors: initialErrors(),
  formData: { gitName: "", gitEmail: "", claimCode: "" },
  distro: "Ubuntu-22.04",
  apiKey: "",
};

export function reducer(state: WizardState, action: Action): WizardState {
  switch (action.type) {
    case "GO_TO":
      return { ...state, currentStep: action.step };
    case "SET_STATUS":
      return {
        ...state,
        stepStatus: { ...state.stepStatus, [action.step]: action.status },
      };
    case "APPEND_LOG":
      return {
        ...state,
        stepLogs: {
          ...state.stepLogs,
          [action.step]: [...state.stepLogs[action.step], action.line],
        },
      };
    case "SET_ERROR":
      return {
        ...state,
        errors: { ...state.errors, [action.step]: action.error },
        stepStatus: { ...state.stepStatus, [action.step]: "error" },
      };
    case "UPDATE_FORM":
      return { ...state, formData: { ...state.formData, ...action.data } };
    case "SET_DISTRO":
      return { ...state, distro: action.distro };
    case "SET_API_KEY":
      return { ...state, apiKey: action.key };
    default:
      return state;
  }
}

export function stepIndex(step: StepKey): number {
  return STEP_ORDER.indexOf(step);
}

export function nextStep(step: StepKey): StepKey | null {
  const idx = stepIndex(step);
  return idx < STEP_ORDER.length - 1 ? STEP_ORDER[idx + 1] : null;
}

export function prevStep(step: StepKey): StepKey | null {
  const idx = stepIndex(step);
  return idx > 0 ? STEP_ORDER[idx - 1] : null;
}

export type StepProps = {
  state: WizardState;
  dispatch: Dispatch<Action>;
  onNext: () => void;
  onBack: () => void;
};
