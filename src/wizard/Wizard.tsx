import { useCallback, useReducer } from "react";
import { ProgressBar } from "./components/ProgressBar";
import {
  initialState,
  nextStep,
  prevStep,
  reducer,
  STEP_META,
  STEP_ORDER,
  type StepKey,
  type StepProps,
} from "./state";
import { BridgeBuild } from "./steps/BridgeBuild";
import { BridgeSource } from "./steps/BridgeSource";
import { ClaudeCli } from "./steps/ClaudeCli";
import { ClaudeOauth } from "./steps/ClaudeOauth";
import { Configuration } from "./steps/Configuration";
import { Done } from "./steps/Done";
import { EnvGen } from "./steps/EnvGen";
import { GitConfig } from "./steps/GitConfig";
import { NodeInstall } from "./steps/NodeInstall";
import { NpmInstall } from "./steps/NpmInstall";
import { Pair } from "./steps/Pair";
import { SystemDeps } from "./steps/SystemDeps";
import { UbuntuSetup } from "./steps/UbuntuSetup";
import { Welcome } from "./steps/Welcome";
import { WslSetup } from "./steps/WslSetup";

const STEP_COMPONENTS: Record<
  StepKey,
  (props: StepProps) => React.ReactElement
> = {
  welcome: Welcome,
  wsl: WslSetup,
  ubuntu: UbuntuSetup,
  config: Configuration,
  deps: SystemDeps,
  gitcfg: GitConfig,
  node: NodeInstall,
  claude: ClaudeCli,
  source: BridgeSource,
  npm: NpmInstall,
  build: BridgeBuild,
  env: EnvGen,
  oauth: ClaudeOauth,
  pair: Pair,
  done: Done,
};

export function Wizard() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { currentStep, stepStatus } = state;

  const goNext = useCallback(() => {
    const next = nextStep(currentStep);
    if (next) {
      dispatch({ type: "GO_TO", step: next });
    }
  }, [currentStep]);

  const goBack = useCallback(() => {
    const prev = prevStep(currentStep);
    if (prev) {
      dispatch({ type: "GO_TO", step: prev });
    }
  }, [currentStep]);

  const StepComponent = STEP_COMPONENTS[currentStep];
  const currentIndex = STEP_ORDER.indexOf(currentStep);

  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>AgentControl Bridge Installer</h1>
        <ol className="steps">
          {STEP_ORDER.map((key, idx) => (
            <li
              key={key}
              className={[
                key === currentStep ? "active" : "",
                `status-${stepStatus[key]}`,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span className="num">{idx + 1}</span>
              <span>{STEP_META[key].title}</span>
            </li>
          ))}
        </ol>
      </aside>
      <main className="content">
        <ProgressBar current={currentIndex} total={STEP_ORDER.length} />
        <StepComponent
          state={state}
          dispatch={dispatch}
          onNext={goNext}
          onBack={goBack}
        />
      </main>
    </div>
  );
}
