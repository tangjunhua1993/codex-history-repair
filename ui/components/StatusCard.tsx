import type { Detection } from "../types";
import { Button } from "./ui";

export function StatusCard({
  detection,
  onRefresh,
}: {
  detection: Detection | null;
  onRefresh: () => void;
}) {
  const currentProvider =
    detection?.currentCodexProviderName ||
    detection?.currentCodexProviderId ||
    "未检测到当前 Codex provider";

  return (
    <aside className="status-card">
      <div className="status-row">
        <span className={detection?.dbExists ? "dot dot-ok" : "dot"} />
        <strong>{detection?.dbExists ? "cc-switch 已连接" : "等待检测"}</strong>
      </div>
      <p title={detection?.currentCodexProviderId || currentProvider}>
        {currentProvider}
      </p>
      <Button onClick={onRefresh} variant="secondary">
        刷新
      </Button>
    </aside>
  );
}
