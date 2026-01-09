/**
 * ══════════════════════════════════════════════════════════════════════════════
 * EVENT REPLAY PANEL - Painel de Replay de Eventos
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Interface para gerenciar gravações e reproduzir eventos do sistema cognitivo.
 * Permite debugging avançado através de replay controlado de eventos.
 *
 * @module components/ai/consciousness/EventReplayPanel
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  Circle,
  Download,
  Pause,
  Play,
  RotateCcw,
  Square,
  Trash2,
  Upload,
  Video,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  abortReplay,
  clearRecordings,
  deleteRecording,
  type EventRecording,
  exportRecording,
  getCurrentRecordingEvents,
  importRecording,
  isRecording,
  listRecordings,
  pauseReplay,
  type RecordedEvent,
  replay,
  type ReplayOptions,
  resumeReplay,
  startRecording,
  stopRecording,
} from '@/azuria_ai/observability/EventReplay';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

interface EventReplayPanelProps {
  className?: string;
}

interface PlaybackState {
  recording: EventRecording | null;
  currentIndex: number;
  progress: number;
  status: 'idle' | 'playing' | 'paused';
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════════

function useEventReplay() {
  const [recordings, setRecordings] = useState<EventRecording[]>([]);
  const [recordingActive, setRecordingActive] = useState(isRecording());
  const [liveEvents, setLiveEvents] = useState<RecordedEvent[]>([]);
  const [playback, setPlayback] = useState<PlaybackState>({
    recording: null,
    currentIndex: 0,
    progress: 0,
    status: 'idle',
  });

  // Atualizar lista de gravações
  const refreshRecordings = useCallback(() => {
    setRecordings(listRecordings());
    setRecordingActive(isRecording());
    if (isRecording()) {
      setLiveEvents(getCurrentRecordingEvents());
    }
  }, []);

  // Auto-refresh durante gravação
  useEffect(() => {
    if (!recordingActive) {return;}
    const interval = setInterval(() => {
      setLiveEvents(getCurrentRecordingEvents());
    }, 500);
    return () => clearInterval(interval);
  }, [recordingActive]);

  // Iniciar gravação
  const handleStartRecording = useCallback((name?: string) => {
    startRecording(name);
    setRecordingActive(true);
    setLiveEvents([]);
  }, []);

  // Parar gravação
  const handleStopRecording = useCallback(() => {
    const recording = stopRecording();
    setRecordingActive(false);
    setLiveEvents([]);
    refreshRecordings();
    return recording;
  }, [refreshRecordings]);

  // Iniciar replay
  const handleReplay = useCallback(
    async (recording: EventRecording, options: Partial<ReplayOptions> = {}) => {
      setPlayback({
        recording,
        currentIndex: 0,
        progress: 0,
        status: 'playing',
      });

      await replay(recording, {
        ...options,
        onBeforeEvent: (event) => {
          setPlayback((prev) => ({
            ...prev,
            currentIndex: recording.events.indexOf(event),
            progress: (recording.events.indexOf(event) / recording.events.length) * 100,
          }));
          return options.onBeforeEvent?.(event) ?? true;
        },
        onComplete: () => {
          setPlayback((prev) => ({
            ...prev,
            status: 'idle',
            progress: 100,
          }));
          options.onComplete?.();
        },
      });
    },
    []
  );

  // Pausar replay
  const handlePauseReplay = useCallback(() => {
    pauseReplay();
    setPlayback((prev) => ({ ...prev, status: 'paused' }));
  }, []);

  // Retomar replay
  const handleResumeReplay = useCallback(() => {
    resumeReplay();
    setPlayback((prev) => ({ ...prev, status: 'playing' }));
  }, []);

  // Abortar replay
  const handleAbortReplay = useCallback(() => {
    abortReplay();
    setPlayback({
      recording: null,
      currentIndex: 0,
      progress: 0,
      status: 'idle',
    });
  }, []);

  // Deletar gravação
  const handleDeleteRecording = useCallback(
    (id: string) => {
      deleteRecording(id);
      refreshRecordings();
    },
    [refreshRecordings]
  );

  // Limpar todas
  const handleClearAll = useCallback(() => {
    clearRecordings();
    refreshRecordings();
  }, [refreshRecordings]);

  // Exportar gravação
  const handleExport = useCallback((recording: EventRecording) => {
    const json = exportRecording(recording);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recording-${recording.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // Importar gravação
  const handleImport = useCallback(
    (json: string) => {
      try {
        importRecording(json);
        refreshRecordings();
        return true;
      } catch {
        return false;
      }
    },
    [refreshRecordings]
  );

  // Refresh inicial
  useEffect(() => {
    refreshRecordings();
  }, [refreshRecordings]);

  return {
    recordings,
    recordingActive,
    liveEvents,
    playback,
    startRecording: handleStartRecording,
    stopRecording: handleStopRecording,
    replay: handleReplay,
    pauseReplay: handlePauseReplay,
    resumeReplay: handleResumeReplay,
    abortReplay: handleAbortReplay,
    deleteRecording: handleDeleteRecording,
    clearAll: handleClearAll,
    exportRecording: handleExport,
    importRecording: handleImport,
    refresh: refreshRecordings,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTES AUXILIARES
// ═══════════════════════════════════════════════════════════════════════════════

/** Card de Controles de Gravação */
function RecordingControls({
  recordingActive,
  liveEvents,
  onStart,
  onStop,
}: {
  recordingActive: boolean;
  liveEvents: RecordedEvent[];
  onStart: (name?: string) => void;
  onStop: () => void;
}) {
  const [recordingName, setRecordingName] = useState('');

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className={cn('h-5 w-5', recordingActive && 'text-red-500 animate-pulse')} />
            <CardTitle className="text-lg">Gravação</CardTitle>
          </div>
          {recordingActive && (
            <Badge variant="destructive" className="animate-pulse">
              <Circle className="h-2 w-2 mr-1 fill-current" />
              REC
            </Badge>
          )}
        </div>
        <CardDescription>Gravar eventos para replay posterior</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!recordingActive ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="recording-name">Nome da Gravação</Label>
                <Input
                  id="recording-name"
                  placeholder="Sessão de debug..."
                  value={recordingName}
                  onChange={(e) => setRecordingName(e.target.value)}
                />
              </div>
              <Button className="w-full" onClick={() => onStart(recordingName || undefined)}>
                <Circle className="h-4 w-4 mr-2 fill-red-500 text-red-500" />
                Iniciar Gravação
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Gravando...</p>
                  <p className="text-xs text-muted-foreground">
                    {liveEvents.length} eventos capturados
                  </p>
                </div>
                <div className="text-2xl font-mono">
                  {formatDuration(
                    liveEvents.length > 0
                      ? Date.now() - liveEvents[0].timestamp + liveEvents[0].relativeTime
                      : 0
                  )}
                </div>
              </div>

              {/* Live events preview */}
              {liveEvents.length > 0 && (
                <ScrollArea className="h-[100px] border rounded-lg p-2">
                  <div className="space-y-1">
                    {liveEvents.slice(-5).map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="font-mono truncate max-w-[150px]">
                          {event.eventType}
                        </span>
                        <span className="text-muted-foreground">
                          +{event.relativeTime}ms
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              <Button variant="destructive" className="w-full" onClick={onStop}>
                <Square className="h-4 w-4 mr-2" />
                Parar Gravação
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/** Card de Replay */
function ReplayControls({
  playback,
  onPause,
  onResume,
  onAbort,
}: {
  playback: PlaybackState;
  onPause: () => void;
  onResume: () => void;
  onAbort: () => void;
}) {
  if (playback.status === 'idle' || !playback.recording) {
    return null;
  }

  return (
    <Card className="border-blue-500/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-lg">Reproduzindo</CardTitle>
          </div>
          <Badge variant={playback.status === 'playing' ? 'default' : 'secondary'}>
            {playback.status === 'playing' ? 'Playing' : 'Paused'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">{playback.recording.name}</p>
            <p className="text-xs text-muted-foreground">
              Evento {playback.currentIndex + 1} de {playback.recording.eventCount}
            </p>
          </div>

          <Progress value={playback.progress} className="h-2" />

          <div className="flex items-center justify-center gap-2">
            {playback.status === 'playing' ? (
              <Button variant="outline" size="icon" onClick={onPause}>
                <Pause className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="outline" size="icon" onClick={onResume}>
                <Play className="h-4 w-4" />
              </Button>
            )}
            <Button variant="destructive" size="icon" onClick={onAbort}>
              <Square className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/** Lista de Gravações */
function RecordingsList({
  recordings,
  onReplay,
  onDelete,
  onExport,
}: {
  recordings: EventRecording[];
  onReplay: (recording: EventRecording, options?: Partial<ReplayOptions>) => void;
  onDelete: (id: string) => void;
  onExport: (recording: EventRecording) => void;
}) {
  const [selectedRecording, setSelectedRecording] = useState<EventRecording | null>(null);
  const [replaySpeed, setReplaySpeed] = useState(1);
  const [dryRun, setDryRun] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const handleStartReplay = () => {
    if (!selectedRecording) {return;}
    onReplay(selectedRecording, { speed: replaySpeed, dryRun });
    setShowDialog(false);
    setSelectedRecording(null);
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <CardTitle className="text-lg">Gravações</CardTitle>
            </div>
            <Badge variant="outline">{recordings.length}</Badge>
          </div>
          <CardDescription>Gravações disponíveis para replay</CardDescription>
        </CardHeader>
        <CardContent>
          {recordings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma gravação disponível
            </p>
          ) : (
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Eventos</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recordings.map((recording) => (
                    <TableRow key={recording.id}>
                      <TableCell className="font-medium">
                        <div>
                          <p className="text-sm truncate max-w-[120px]">{recording.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(recording.startedAt).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{recording.eventCount}</TableCell>
                      <TableCell>{formatDuration(recording.duration)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedRecording(recording);
                                    setShowDialog(true);
                                  }}
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Reproduzir</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => onExport(recording)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Exportar</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    if (confirm('Deletar esta gravação?')) {
                                      onDelete(recording.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Deletar</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Dialog de configuração de replay */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Replay</DialogTitle>
            <DialogDescription>
              Configure as opções de reprodução para {selectedRecording?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Velocidade */}
            <div className="space-y-2">
              <Label>Velocidade: {replaySpeed}x</Label>
              <Slider
                value={[replaySpeed]}
                onValueChange={([v]) => setReplaySpeed(v)}
                min={0.25}
                max={4}
                step={0.25}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0.25x</span>
                <span>1x</span>
                <span>2x</span>
                <span>4x</span>
              </div>
            </div>

            {/* Dry Run */}
            <div className="flex items-center justify-between">
              <div>
                <Label>Modo Dry Run</Label>
                <p className="text-xs text-muted-foreground">
                  Não emite eventos reais, apenas simula
                </p>
              </div>
              <Switch checked={dryRun} onCheckedChange={setDryRun} />
            </div>

            {/* Info */}
            {selectedRecording && (
              <div className="p-3 bg-muted rounded-lg text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Eventos:</span>
                  <span className="font-mono">{selectedRecording.eventCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Duração original:</span>
                  <span className="font-mono">{formatDuration(selectedRecording.duration)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Duração ajustada:</span>
                  <span className="font-mono">
                    {formatDuration(selectedRecording.duration / replaySpeed)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleStartReplay}>
              <Play className="h-4 w-4 mr-2" />
              Iniciar Replay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Card de Importação */
function ImportCard({ onImport }: { onImport: (json: string) => boolean }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {return;}

    try {
      const text = await file.text();
      const success = onImport(text);
      if (!success) {
        setError('Arquivo inválido');
      } else {
        setError(null);
      }
    } catch {
      setError('Erro ao ler arquivo');
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-green-500" />
          <CardTitle className="text-lg">Importar</CardTitle>
        </div>
        <CardDescription>Importar gravação de arquivo JSON</CardDescription>
      </CardHeader>
      <CardContent>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          variant="outline"
          className="w-full"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4 mr-2" />
          Selecionar Arquivo
        </Button>
        {error && (
          <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function formatDuration(ms: number): string {
  if (ms < 1000) {return `${ms}ms`;}
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

export function EventReplayPanel({ className }: EventReplayPanelProps) {
  const {
    recordings,
    recordingActive,
    liveEvents,
    playback,
    startRecording: handleStart,
    stopRecording: handleStop,
    replay: handleReplay,
    pauseReplay: handlePause,
    resumeReplay: handleResume,
    abortReplay: handleAbort,
    deleteRecording: handleDelete,
    clearAll,
    exportRecording: handleExport,
    importRecording: handleImport,
  } = useEventReplay();

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold">Event Replay</h2>
        </div>
        <div className="flex items-center gap-2">
          {recordings.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm('Limpar todas as gravações?')) {
                  clearAll();
                }
              }}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Limpar Tudo
            </Button>
          )}
        </div>
      </div>

      {/* Replay em progresso */}
      <ReplayControls
        playback={playback}
        onPause={handlePause}
        onResume={handleResume}
        onAbort={handleAbort}
      />

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RecordingControls
          recordingActive={recordingActive}
          liveEvents={liveEvents}
          onStart={handleStart}
          onStop={handleStop}
        />
        <ImportCard onImport={handleImport} />
      </div>

      {/* Lista de gravações */}
      <RecordingsList
        recordings={recordings}
        onReplay={handleReplay}
        onDelete={handleDelete}
        onExport={handleExport}
      />
    </div>
  );
}

export default EventReplayPanel;
