import { importPayload } from '../lib/storage';
import type { PersistedState } from '../lib/types';

type Props = {
  state: PersistedState;
  onImport: (next: PersistedState) => void;
};

function downloadJson(filename: string, body: string) {
  const blob = new Blob([body], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function shareOrDownload(filename: string, body: string) {
  const blob = new Blob([body], { type: 'application/json' });
  const file = new File([blob], filename, { type: 'application/json' });
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: 'WoD Weight Tracker backup',
      });
      return;
    } catch {
      /* user cancelled or share failed */
    }
  }
  downloadJson(filename, body);
}

/** JSON export/share + import (@see docs/STYLING.md — block data-backup). */
export function DataBackup({ state, onImport }: Props) {
  const exportNow = () => {
    const body = JSON.stringify(state, null, 2);
    const stamp = new Date().toISOString().slice(0, 10);
    void shareOrDownload(`wod-tracker-backup-${stamp}.json`, body);
  };

  const pickFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = () => {
      const f = input.files?.[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = String(reader.result ?? '');
          const parsed = importPayload(text);
          const ok = window.confirm(
            'Replace all data on this device with this backup? This cannot be undone.'
          );
          if (!ok) return;
          onImport(parsed);
        } catch {
          window.alert('Could not read backup file.');
        }
      };
      reader.readAsText(f);
    };
    input.click();
  };

  return (
    <section className="data-backup surface-card surface-card--pad-sm layout-stack layout-stack--gap-sm">
      <h3 className="type-heading type-heading--level-3">Backup & restore</h3>
      <p className="type-body type-body--muted type-body--small">
        Saves everything locally as JSON. On iPhone, Share lets you store the file in iCloud Drive, Files,
        Google Drive, email, etc.
      </p>
      <div className="data-backup__actions layout-row layout-row--gap-sm layout-row--wrap">
        <button type="button" className="btn btn--primary" onClick={exportNow}>
          Export backup
        </button>
        <button type="button" className="btn btn--ghost" onClick={pickFile}>
          Import backup
        </button>
      </div>
    </section>
  );
}
