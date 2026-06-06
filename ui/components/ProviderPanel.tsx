import { providerOutcomeLines, providerPreviewLines } from "../lib/format";
import type {
  BusyState,
  ProviderDraft,
  ProviderForm,
  ProviderImportOutcome,
} from "../types";
import { ResultPanel } from "./RepairPanel";
import { Button, Field, Panel } from "./ui";

export function ProviderPanel({
  busy,
  draft,
  form,
  outcome,
  onChange,
  onImport,
  onPreview,
}: {
  busy: BusyState;
  draft: ProviderDraft | null;
  form: ProviderForm;
  outcome: ProviderImportOutcome | null;
  onChange: (form: ProviderForm) => void;
  onImport: () => void;
  onPreview: () => void;
}) {
  const update = (patch: Partial<ProviderForm>) => onChange({ ...form, ...patch });
  const resultLines = [
    ...providerPreviewLines(draft),
    ...providerOutcomeLines(outcome),
  ];

  return (
    <div className="content-grid">
      <Panel title="Provider 导入" eyebrow="Import">
        <Field label="cc-switch 目录">
          <input
            value={form.ccSwitchDir}
            onChange={(event) => update({ ccSwitchDir: event.target.value })}
          />
        </Field>
        <textarea
          value={form.jsonText}
          onChange={(event) => update({ jsonText: event.target.value })}
          placeholder="粘贴 CPA / sub2api 格式的 OpenAI 账号 JSON"
        />
        <div className="form-grid">
          <Field label="Provider id">
            <input
              value={form.providerId}
              onChange={(event) => update({ providerId: event.target.value })}
              placeholder="留空自动生成"
            />
          </Field>
          <Field label="Provider name">
            <input
              value={form.providerName}
              onChange={(event) => update({ providerName: event.target.value })}
              placeholder="例如 mark@example.com"
            />
          </Field>
        </div>
        <div className="actions">
          <Button
            disabled={busy !== "idle"}
            onClick={onPreview}
            variant="secondary"
          >
            预览
          </Button>
          <Button disabled={busy !== "idle"} onClick={onImport}>
            写入 cc-switch
          </Button>
        </div>
      </Panel>
      <ResultPanel lines={resultLines} title="导入结果" />
    </div>
  );
}
