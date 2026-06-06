import * as Tooltip from "@radix-ui/react-tooltip";
import type { Detection } from "../types";
import { Button, Panel } from "./ui";

export function SettingsPanel({
  detection,
  onRefresh,
}: {
  detection: Detection | null;
  onRefresh: () => void;
}) {
  const currentProvider = formatCurrentProvider(detection);

  return (
    <Panel title="cc-switch 检测" eyebrow="Settings">
      <dl className="details-grid">
        <Detail label="目录" value={detection?.ccSwitchDir} />
        <Detail label="数据库" value={detection?.dbPath} />
        <Detail label="settings" value={detection?.settingsPath} />
        <Detail
          label="Codex override"
          value={detection?.codexOverrideDir || "未设置"}
        />
        <Detail
          label="当前 Codex provider"
          value={currentProvider || "未检测到"}
        />
      </dl>
      <Button onClick={onRefresh} variant="secondary">
        重新检测
      </Button>
    </Panel>
  );
}

function formatCurrentProvider(detection: Detection | null) {
  if (!detection?.currentCodexProviderName) {
    return detection?.currentCodexProviderId;
  }
  if (!detection.currentCodexProviderId) {
    return detection.currentCodexProviderName;
  }
  return `${detection.currentCodexProviderName} (${detection.currentCodexProviderId})`;
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <>
      <dt>{label}</dt>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <dd>{value || "未知"}</dd>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="tooltip-content">{value || "未知"}</Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </>
  );
}
