/**
 * @fileoverview RAG Search Modal - Busca semântica em legislação TCU
 * 
 * Permite consultar legislação (Lei 8.666, Acórdãos TCU, etc.) 
 * através de busca semântica e receber respostas com citações.
 */

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertCircle,
  BookOpen,
  ExternalLink,
  FileText,
  Loader2,
  MessageSquare,
  Search,
  Sparkles,
} from 'lucide-react';
import ragEngine, { type RAGResponse, type SearchResult } from '@/azuria_ai/engines/ragEngine';

interface RAGSearchModalProps {
  readonly trigger?: React.ReactNode;
}

export function RAGSearchModal({ trigger }: RAGSearchModalProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [answer, setAnswer] = useState<RAGResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {return;}

    setSearching(true);
    setError(null);
    setResults([]);
    setAnswer(null);

    try {
      // Busca semântica
      const searchResults = await ragEngine.semanticSearch(query);

      setResults(searchResults);

      // Gerar resposta com LLM
      if (searchResults.length > 0) {
        const ragResponse = await ragEngine.generateAnswer(query);
        setAnswer(ragResponse);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar legislação');
    } finally {
      setSearching(false);
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      legislation: 'Legislação',
      jurisprudence: 'Jurisprudência',
      regulation: 'Regulamento',
      guideline: 'Orientação',
      manual: 'Manual',
      template: 'Modelo',
    };
    return labels[type] || type;
  };

  const getDocumentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      legislation: 'bg-blue-100 text-blue-800',
      jurisprudence: 'bg-purple-100 text-purple-800',
      regulation: 'bg-green-100 text-green-800',
      guideline: 'bg-yellow-100 text-yellow-800',
      manual: 'bg-orange-100 text-orange-800',
      template: 'bg-pink-100 text-pink-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Consultar Legislação
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-600" />
            Consultar Legislação TCU
          </DialogTitle>
          <DialogDescription>
            Faça perguntas em linguagem natural sobre legislação de licitações.
            Nossa IA busca e responde com base em Lei 8.666, Acórdãos TCU e jurisprudência.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Bar */}
          <div className="flex gap-2">
            <Input
              placeholder="Ex: Como calcular BDI corretamente?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              disabled={searching}
              className="flex-1"
            />
            <Button
              onClick={handleSearch}
              disabled={!query.trim() || searching}
              className="gap-2"
            >
              {searching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Buscar
                </>
              )}
            </Button>
          </div>

          {/* Quick Suggestions */}
          {!answer && !searching && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Perguntas Frequentes:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  'Como calcular BDI?',
                  'Margem de lucro máxima permitida',
                  'Documentos obrigatórios para habilitar',
                  'Prazo para recurso administrativo',
                  'Diferença entre menor preço e melhor técnica',
                ].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuery(suggestion);
                      setTimeout(handleSearch, 100);
                    }}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Answer Section */}
          <AnimatePresence>
            {answer && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* AI Generated Answer */}
                <div className="bg-gradient-to-br from-brand-50 to-blue-50 rounded-lg p-6 border border-brand-200">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-brand-100">
                      <MessageSquare className="h-5 w-5 text-brand-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">Resposta da IA</h3>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {answer.answer}
                      </p>
                    </div>
                  </div>

                  {/* Sources */}
                  {answer.sources.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Fontes Consultadas ({answer.sources.length})
                        </h4>
                        <div className="space-y-2">
                          {answer.sources.map((source, index) => (
                            <div
                              key={source.chunk.id}
                              className="bg-white rounded-lg p-3 border border-gray-200 text-sm"
                            >
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <span className="font-medium text-xs text-muted-foreground">
                                  Fonte {index + 1}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={getDocumentTypeColor(source.chunk.metadata.type)}
                                >
                                  {getDocumentTypeLabel(source.chunk.metadata.type)}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {source.chunk.content}
                              </p>
                              {source.chunk.metadata.source && (
                                <p className="text-xs text-brand-600 mt-1 flex items-center gap-1">
                                  <ExternalLink className="h-3 w-3" />
                                  {source.chunk.metadata.source}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Confidence Badge */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Confiança da resposta:</span>
                  <Badge
                    variant={answer.confidence >= 0.8 ? 'default' : 'secondary'}
                    className={
                      answer.confidence >= 0.8
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {(answer.confidence * 100).toFixed(0)}%
                  </Badge>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty Results */}
          {!searching && results.length === 0 && query && !error && !answer && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Nenhum resultado encontrado. Tente reformular sua pergunta ou use termos mais
                gerais.
              </AlertDescription>
            </Alert>
          )}

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Info */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Importante:</strong> As respostas são geradas por IA com base em
              documentos legais indexados. Sempre consulte a legislação oficial para
              decisões críticas.
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  );
}
