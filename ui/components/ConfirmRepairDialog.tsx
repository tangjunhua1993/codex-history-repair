import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { Button } from "./ui";

export function ConfirmRepairDialog({
  disabled,
  isRepairing,
  onConfirm,
}: {
  disabled: boolean;
  isRepairing: boolean;
  onConfirm: () => void;
}) {
  const [open, setOpen] = useState(false);

  function confirmRepair() {
    setOpen(false);
    window.requestAnimationFrame(() => {
      window.setTimeout(onConfirm, 0);
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button disabled={disabled}>
          {isRepairing ? "修复中..." : "修复并重启 Codex"}
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content">
          <Dialog.Title>确认修复并重启？</Dialog.Title>
          <Dialog.Description>
            会先备份，再写入 Codex 历史文件。Provider 导入不会触发重启。
          </Dialog.Description>
          <div className="actions right">
            <Dialog.Close asChild>
              <Button variant="secondary">取消</Button>
            </Dialog.Close>
            <Button onClick={confirmRepair}>确认修复</Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
