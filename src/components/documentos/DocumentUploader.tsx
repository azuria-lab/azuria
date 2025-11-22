import { useState } from 'react';
import { FileText, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useDocumentos } from '@/hooks/useDocumentos';
import { supabase } from '@/integrations/supabase/client';

const TIPOS_DOCUMENTO = [
  { value: 'cnd_federal', label: 'CND Federal' },
  { value: 'cnd_estadual', label: 'CND Estadual' },
  { value: 'cnd_municipal', label: 'CND Municipal' },
  { value: 'cndt', label: 'CNDT - Certidão Negativa de Débitos Trabalhistas' },
  { value: 'fgts', label: 'CRF - Certificado de Regularidade do FGTS' },
  { value: 'cnpj', label: 'Cartão CNPJ' },
  { value: 'contrato_social', label: 'Contrato Social' },
  { value: 'balanco_patrimonial', label: 'Balanço Patrimonial' },
  { value: 'alvara', label: 'Alvará de Funcionamento' },
  { value: 'licenca_ambiental', label: 'Licença Ambiental' },
  { value: 'atestado_capacidade', label: 'Atestado de Capacidade Técnica' },
  { value: 'outro', label: 'Outro' },
];

export function DocumentUploader() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [tipo, setTipo] = useState('');
  const [nome, setNome] = useState('');
  const [numero, setNumero] = useState('');
  const [dataEmissao, setDataEmissao] = useState('');
  const [dataValidade, setDataValidade] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [uploading, setUploading] = useState(false);

  const { uploadFile, createDocumento } = useDocumentos();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Auto-preencher nome se estiver vazio
      if (!nome) {
        setNome(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      // 1. Obter usuário atual
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {throw new Error('Usuário não autenticado');}

      // 2. Upload do arquivo (se houver)
      let arquivo_url: string | undefined;
      if (file) {
        const filePath = await uploadFile.mutateAsync({
          file,
          userId: userData.user.id,
        });
        arquivo_url = filePath;
      }

      // 3. Criar registro no banco
      await createDocumento.mutateAsync({
        tipo,
        nome,
        numero: numero || undefined,
        data_emissao: dataEmissao,
        data_validade: dataValidade,
        arquivo_url,
        observacoes: observacoes || undefined,
      });

      // 4. Limpar formulário e fechar
      resetForm();
      setOpen(false);
    } catch (error) {
      console.error('Erro ao cadastrar documento:', error);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setTipo('');
    setNome('');
    setNumero('');
    setDataEmissao('');
    setDataValidade('');
    setObservacoes('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Upload className="h-4 w-4" />
          Novo Documento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Documento</DialogTitle>
          <DialogDescription>
            Faça upload e registre documentos necessários para licitações
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Upload de Arquivo */}
          <div className="space-y-2">
            <Label>Arquivo (opcional)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                {file ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        setFile(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">
                      Clique para selecionar ou arraste o arquivo
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, DOC, DOCX, JPG, PNG (max. 10 MB)
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Tipo de Documento */}
          <div className="space-y-2">
            <Label htmlFor="tipo">
              Tipo de Documento <span className="text-red-500">*</span>
            </Label>
            <Select value={tipo} onValueChange={setTipo} required>
              <SelectTrigger id="tipo">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_DOCUMENTO.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nome do Documento */}
          <div className="space-y-2">
            <Label htmlFor="nome">
              Nome do Documento <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Certidão Negativa Federal 2025"
              required
            />
          </div>

          {/* Número do Documento */}
          <div className="space-y-2">
            <Label htmlFor="numero">Número do Documento</Label>
            <Input
              id="numero"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              placeholder="Ex: 12345678900"
            />
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataEmissao">
                Data de Emissão <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dataEmissao"
                type="date"
                value={dataEmissao}
                onChange={(e) => setDataEmissao(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataValidade">
                Data de Validade <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dataValidade"
                type="date"
                value={dataValidade}
                onChange={(e) => setDataValidade(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Informações adicionais..."
              rows={3}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
              disabled={uploading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? 'Salvando...' : 'Salvar Documento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

