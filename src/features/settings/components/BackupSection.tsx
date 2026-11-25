import { Download, Upload } from "lucide-react";
import { useRef, useState } from "react";
import {
  backupFileName,
  createBackup,
  parseBackup,
  restoreBackup,
  serializeBackup,
} from "@/data/backup";
import { showToast } from "@/shared/lib/toast";
import { Card } from "@/shared/ui";

/** Export everything to a JSON file, or replace everything from one. */
export default function BackupSection() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleExport() {
    setBusy(true);

    try {
      const file = new File([serializeBackup(await createBackup())], backupFileName(), {
        type: "application/json",
      });

      // Phones: the share sheet saves to Files / Drive / AirDrop. Desktop: download.
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "GymTrack backup" });
      } else {
        const url = URL.createObjectURL(file);
        const link = Object.assign(document.createElement("a"), { href: url, download: file.name });

        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      // Closing the share sheet isn't an error.
      if ((error as Error).name !== "AbortError") {
        showToast({ message: "Couldn't create the backup." });
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleImport(file: File) {
    try {
      const backup = parseBackup(await file.text());
      const from = backup.exportedAt ? ` from ${new Date(backup.exportedAt).toLocaleDateString()}` : "";

      if (
        !window.confirm(
          `Replace all workouts on this device with the backup${from}? This can't be undone.`,
        )
      ) {
        return;
      }

      await restoreBackup(backup);
      showToast({ message: "Backup restored" });
    } catch (error) {
      showToast({ message: (error as Error).message || "Couldn't read that file." });
    }
  }

  return (
    <Card className="space-y-3 p-4">
      <div>
        <p className="font-semibold text-(--text-strong)">Backup</p>
        <p className="text-sm text-(--text-muted)">
          Your workouts live only on this device. Export a backup to keep them safe or move to a
          new phone.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={busy}
          className="flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-(--accent) text-sm font-semibold text-(--accent-ink) transition active:scale-[0.98] disabled:opacity-60"
          onClick={() => void handleExport()}
        >
          <Download size={17} /> Export
        </button>
        <button
          type="button"
          className="flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-(--surface-control) text-sm font-semibold text-(--text-strong) transition active:scale-[0.98] hover:bg-(--surface-control-hover)"
          onClick={() => fileInput.current?.click()}
        >
          <Upload size={17} /> Import
        </button>
      </div>
      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];

          event.target.value = "";

          if (file) {
            void handleImport(file);
          }
        }}
      />
    </Card>
  );
}
