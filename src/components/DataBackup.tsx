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
    <section className="card pad stack gap-sm">
      <h3 className="h3">Backup & restore</h3>
      <p className="muted small">
        Saves everything locally as JSON. On iPhone, Share lets you store the file in iCloud Drive,
        Files, Google Drive, email, etc.
      </p>
      <div className="row gap-sm wrap">
        <button type="button" className="btn primary" onClick={exportNow}>
          Export backup
        </button>
        <button type="button" className="btn ghost" onClick={pickFile}>
          Import backup
        </button>
      </div>
    </section>
  );
}
