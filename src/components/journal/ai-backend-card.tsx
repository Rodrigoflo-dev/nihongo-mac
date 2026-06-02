import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Brain,
  Check,
  Cloud,
  ExternalLink,
  Loader2,
  ServerCog,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  useAiBackend,
  useTestOllama,
  useUpdateAiBackend,
} from "@/hooks/use-ai-backend";
import type { AiBackend } from "@/lib/api";
import { cn } from "@/lib/utils";

export function AiBackendCard() {
  const { data: config } = useAiBackend();
  const update = useUpdateAiBackend();
  const test = useTestOllama();

  const [claudeKey, setClaudeKey] = useState("");
  const [ollamaUrl, setOllamaUrl] = useState("");
  const [ollamaModel, setOllamaModel] = useState("");

  useEffect(() => {
    if (config) {
      setOllamaUrl(config.ollamaUrl);
      setOllamaModel(config.ollamaModel);
    }
  }, [config]);

  if (!config) return null;

  const setBackend = (b: AiBackend) => update.mutate({ backend: b });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="size-4 text-primary" />
          <CardTitle className="text-base">IA para correcciones</CardTitle>
        </div>
        <CardDescription>
          Elige qué motor corrige tus entradas del diario. Local con Ollama es
          gratis y privado; Claude API es de pago pero más preciso.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Backend tabs */}
        <div className="grid grid-cols-3 gap-2">
          <BackendOption
            active={config.backend === "none"}
            icon={X}
            title="Ninguno"
            description="Solo guarda mis entradas"
            onClick={() => setBackend("none")}
          />
          <BackendOption
            active={config.backend === "ollama"}
            icon={ServerCog}
            title="Ollama (local)"
            description="Gratis, sin internet"
            onClick={() => setBackend("ollama")}
            highlight
          />
          <BackendOption
            active={config.backend === "claude"}
            icon={Cloud}
            title="Claude API"
            description="Cuesta dinero"
            onClick={() => setBackend("claude")}
          />
        </div>

        <Separator />

        {/* Backend-specific config */}
        {config.backend === "claude" ? (
          <div className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="claude-key">API key de Anthropic</Label>
              <Input
                id="claude-key"
                type="password"
                placeholder={config.hasClaudeKey ? "•••••••• (configurada)" : "sk-ant-…"}
                value={claudeKey}
                onChange={(e) => setClaudeKey(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={!claudeKey.trim() || update.isPending}
                onClick={() => {
                  update.mutate({ claudeApiKey: claudeKey, backend: "claude" });
                  setClaudeKey("");
                }}
              >
                Guardar key
              </Button>
              {config.hasClaudeKey ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => update.mutate({ clearClaudeKey: true })}
                >
                  Quitar key
                </Button>
              ) : null}
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noreferrer"
                className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                Obtener key <ExternalLink className="size-3" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground">
              Cuesta aproximadamente <span className="font-mono">$0.003</span> por
              entrada corta. Con escribir 1 frase al día, ~$1/mes.
            </p>
          </div>
        ) : null}

        {config.backend === "ollama" ? (
          <div className="space-y-3">
            <div className="rounded-xl border bg-card/50 p-4">
              <p className="text-sm font-medium">
                Necesitas instalar Ollama una vez:
              </p>
              <ol className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li>
                  1. Descarga{" "}
                  <a
                    href="https://ollama.com/download"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline"
                  >
                    ollama.com/download
                  </a>{" "}
                  e instala
                </li>
                <li>
                  2. En Terminal, ejecuta:{" "}
                  <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-foreground">
                    ollama pull {ollamaModel}
                  </code>
                </li>
                <li>3. Ollama queda corriendo en segundo plano (~4 GB de RAM)</li>
              </ol>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="ollama-url">URL local</Label>
                <Input
                  id="ollama-url"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ollama-model">Modelo</Label>
                <Input
                  id="ollama-model"
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                  placeholder="llama3.1:8b"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() =>
                  update.mutate({
                    ollamaUrl,
                    ollamaModel,
                    backend: "ollama",
                  })
                }
              >
                Guardar
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={test.isPending}
                onClick={() => test.mutate()}
              >
                {test.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Check className="size-3.5" />
                )}
                Probar conexión
              </Button>
            </div>

            {test.data ? (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "space-y-1 rounded-lg border p-3 text-xs",
                  test.data.reachable && test.data.modelPresent
                    ? "border-success/40 bg-success/5 text-success"
                    : "border-warning/40 bg-warning/5 text-warning"
                )}
              >
                {test.data.reachable && test.data.modelPresent ? (
                  <p className="flex items-center gap-1.5">
                    <Check className="size-3.5" />
                    Ollama responde y el modelo "{ollamaModel}" está instalado.
                  </p>
                ) : test.data.reachable ? (
                  <>
                    <p className="flex items-center gap-1.5">
                      <AlertCircle className="size-3.5" />
                      Ollama responde pero "{ollamaModel}" no está instalado.
                    </p>
                    <p>
                      En Terminal:{" "}
                      <code className="font-mono">ollama pull {ollamaModel}</code>
                    </p>
                    {test.data.installedModels.length > 0 ? (
                      <p>
                        Modelos disponibles: {test.data.installedModels.join(", ")}
                      </p>
                    ) : null}
                  </>
                ) : (
                  <>
                    <p className="flex items-center gap-1.5">
                      <AlertCircle className="size-3.5" />
                      No pude conectar con Ollama.
                    </p>
                    <p>
                      Asegúrate de tener Ollama instalado y corriendo
                      (`ollama serve` o la app de menú).
                    </p>
                    {test.data.error ? (
                      <p className="opacity-80">{test.data.error}</p>
                    ) : null}
                  </>
                )}
              </motion.div>
            ) : null}
          </div>
        ) : null}

        {config.backend === "none" ? (
          <p className="text-xs text-muted-foreground">
            Sin IA, las entradas se guardan y aparecen en tu historial, pero no
            obtienes correcciones ni feedback automático.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function BackendOption({
  active,
  icon: Icon,
  title,
  description,
  highlight,
  onClick,
}: {
  active: boolean;
  icon: typeof Cloud;
  title: string;
  description: string;
  highlight?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-xl border bg-card/40 p-3 text-left transition-all",
        "hover:bg-accent/30",
        active && "border-primary ring-2 ring-primary/20 bg-primary/5",
        highlight && !active && "border-success/30"
      )}
    >
      <div className="flex items-center gap-2">
        <Icon
          className={cn("size-4", active ? "text-primary" : "text-muted-foreground")}
        />
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">{description}</p>
    </button>
  );
}
