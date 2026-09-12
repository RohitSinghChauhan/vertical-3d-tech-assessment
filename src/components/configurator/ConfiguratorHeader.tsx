import { useEffect, useRef, useState } from "react";
import {
  Download,
  Redo2,
  RotateCcw,
  Undo2,
  Upload,
} from "lucide-react";
import {
  downloadConfigurationJson,
  readConfigurationFile,
  serializeConfiguration,
} from "../../services/configurationIO";
import { useConfiguratorStore } from "../../store/configuratorStore";
import { Button } from "../ui/Button";

export function ConfiguratorHeader() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [ioMessage, setIoMessage] = useState<string | null>(null);
  const [ioError, setIoError] = useState<string | null>(null);

  const getConfiguration = useConfiguratorStore((s) => s.getConfiguration);
  const loadConfiguration = useConfiguratorStore((s) => s.loadConfiguration);
  const resetConfiguration = useConfiguratorStore((s) => s.resetConfiguration);
  const undo = useConfiguratorStore((s) => s.undo);
  const redo = useConfiguratorStore((s) => s.redo);
  const canUndo = useConfiguratorStore((s) => s.canUndo);
  const canRedo = useConfiguratorStore((s) => s.canRedo);

  const handleExport = async () => {
    try {
      const payload = await serializeConfiguration(getConfiguration());
      downloadConfigurationJson(payload);
      setIoError(null);
      setIoMessage("Configuration exported.");
    } catch (error) {
      setIoMessage(null);
      setIoError(error instanceof Error ? error.message : "Export failed.");
    }
  };

  const handleImport = async (file: File | undefined) => {
    if (!file) return;
    try {
      const configuration = await readConfigurationFile(file);
      loadConfiguration(configuration);
      setIoError(null);
      setIoMessage("Configuration imported.");
    } catch (error) {
      setIoMessage(null);
      setIoError(error instanceof Error ? error.message : "Import failed.");
    }
  };

  useEffect(() => {
    if (!ioMessage && !ioError) return;
    const timer = window.setTimeout(() => {
      setIoMessage(null);
      setIoError(null);
    }, 2800);
    return () => window.clearTimeout(timer);
  }, [ioMessage, ioError]);

  return (
    <header className="border-b border-line/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">
            Vertical 3D
          </p>
          <h1 className="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            Canopy Configurator
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            className="text-xs"
            disabled={!canUndo}
            onClick={undo}
            title="Ctrl+Z"
          >
            <Undo2 className="size-3.5" />
            Undo
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="text-xs"
            disabled={!canRedo}
            onClick={redo}
            title="Ctrl+Y"
          >
            <Redo2 className="size-3.5" />
            Redo
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="text-xs"
            onClick={() => void handleExport()}
          >
            <Download className="size-3.5" />
            Export
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="text-xs"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="size-3.5" />
            Import
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="text-xs"
            onClick={() => {
              if (
                window.confirm("Reset the entire configuration to defaults?")
              ) {
                resetConfiguration();
              }
            }}
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => void handleImport(e.target.files?.[0])}
          />
        </div>
      </div>
      {(ioMessage || ioError) && (
        <div className="mx-auto max-w-[1500px] px-4 pb-2 sm:px-6">
          <p
            className={`text-xs ${ioError ? "text-red-600" : "text-emerald-700"}`}
          >
            {ioError ?? ioMessage}
          </p>
        </div>
      )}
    </header>
  );
}
