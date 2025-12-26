import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Info, Search, Sparkles, Trash2, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/domains/auth";
import { supabase } from "@/integrations/supabase/client";
import { SEOHead } from "@/components/seo/SEOHead";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CompanyData {
  // Dados da empresa
  nome: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual: string;
  isentoIE: boolean;
  cnae: string;
  atividadePrincipal: string;
  regimeTributario: string;
  tipoPessoa: string;
  inscricaoMunicipal: string;
  tamanhoEmpresa: string;
  
  // Endereço
  cep: string;
  uf: string;
  cidade: string;
  bairro: string;
  endereco: string;
  numero: string;
  complemento: string;
  
  // Contato
  pessoasContato: string;
  telefone: string;
  email: string;
  emailCobranca: string;
  celular: string;
  site: string;
  
  // Inscrições Estaduais
  inscricoesEstaduais: Array<{
    estado: string;
    inscricao: string;
  }>;
  
  // Logo
  logoUrl: string;
}

const estados = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const atividadesPrincipais = [
  "Máquinas e equipamentos",
  "Comércio varejista",
  "Comércio atacadista",
  "Serviços",
  "Indústria",
  "Construção civil",
  "Tecnologia",
  "Outros"
];

const regimesTributarios = [
  "Simples Nacional",
  "Lucro Presumido",
  "Lucro Real",
  "MEI"
];

const tiposPessoa = [
  "Pessoa Jurídica",
  "Pessoa Física"
];

const tamanhosEmpresa = [
  "Micro",
  "Pequena",
  "Média",
  "Grande"
];

export default function CompanyDataPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const auth = useAuthContext();
  const userId = auth?.userProfile?.id;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [formData, setFormData] = useState<CompanyData>({
    nome: "",
    nomeFantasia: "",
    cnpj: "",
    inscricaoEstadual: "",
    isentoIE: false,
    cnae: "",
    atividadePrincipal: "",
    regimeTributario: "",
    tipoPessoa: "Pessoa Jurídica",
    inscricaoMunicipal: "",
    tamanhoEmpresa: "",
    cep: "",
    uf: "",
    cidade: "",
    bairro: "",
    endereco: "",
    numero: "",
    complemento: "",
    pessoasContato: "",
    telefone: "",
    email: "",
    emailCobranca: "",
    celular: "",
    site: "",
    inscricoesEstaduais: [],
    logoUrl: ""
  });

  const loadCompanyData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("company_data")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (data && !error && data.data && typeof data.data === 'object') {
        const companyData = data.data as Record<string, unknown>;
        setFormData({
          ...(companyData as unknown as CompanyData),
          inscricoesEstaduais: (Array.isArray(companyData.inscricoesEstaduais) 
            ? companyData.inscricoesEstaduais 
            : []) as Array<{ estado: string; inscricao: string; }>
        });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Erro ao carregar dados da empresa:", error);
    }
  }, [userId]);

  // Carregar dados salvos
  useEffect(() => {
    if (userId) {
      loadCompanyData();
    }
  }, [userId, loadCompanyData]);

  const handleChange = (field: keyof CompanyData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCEPChange = async (cep: string) => {
    handleChange("cep", cep);
    const cepDigits = cep.replaceAll(/\D/g, "");
    if (cepDigits.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          handleChange("uf", data.uf);
          handleChange("cidade", data.localidade);
          handleChange("bairro", data.bairro);
          handleChange("endereco", data.logradouro);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Erro ao buscar CEP:", error);
      }
    }
  };

  const handleAddInscricaoEstadual = () => {
    setFormData(prev => ({
      ...prev,
      inscricoesEstaduais: [...prev.inscricoesEstaduais, { estado: "", inscricao: "" }]
    }));
  };

  const handleRemoveInscricaoEstadual = (index: number) => {
    setFormData(prev => ({
      ...prev,
      inscricoesEstaduais: prev.inscricoesEstaduais.filter((_, i) => i !== index)
    }));
  };

  const handleInscricaoEstadualChange = (index: number, field: "estado" | "inscricao", value: string) => {
    setFormData(prev => ({
      ...prev,
      inscricoesEstaduais: prev.inscricoesEstaduais.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {return;}

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma imagem válida.",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive"
      });
      return;
    }

    setIsUploadingLogo(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `company-logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("company-logos")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {throw uploadError;}

      const { data: urlData } = supabase.storage
        .from("company-logos")
        .getPublicUrl(filePath);

      handleChange("logoUrl", urlData.publicUrl);
      
      toast({
        title: "Sucesso!",
        description: "Logo atualizada com sucesso."
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Erro ao fazer upload:", error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer upload da logo.",
        variant: "destructive"
      });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
       
      const { error } = await supabase
        .from("company_data")
        .upsert({
          user_id: userId,
          data: formData as any,
          updated_at: new Date().toISOString()
        } as any, {
          onConflict: "user_id"
        });

      if (error) {throw error;}

      toast({
        title: "Sucesso!",
        description: "Dados da empresa salvos com sucesso."
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar os dados.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Dados da Empresa - Azuria+"
        description="Gerencie os dados da sua empresa para uso em relatórios, documentos e licitações."
      />
      
      <main className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-6 md:px-8 lg:px-12 py-12 md:py-16">
          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mb-6 -ml-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-2">
                  Dados da empresa
                </h1>
                <p className="text-muted-foreground">
                  Gerencie as informações da sua empresa para uso em relatórios, documentos e licitações
                </p>
              </div>
              <span className="text-xs text-muted-foreground">(*) Campos obrigatórios</span>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit}>
            {/* Dados da empresa */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Dados da empresa</CardTitle>
                <CardDescription>Informações básicas da sua empresa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => handleChange("nome", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                    <Input
                      id="nomeFantasia"
                      value={formData.nomeFantasia}
                      onChange={(e) => handleChange("nomeFantasia", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ *</Label>
                    <Input
                      id="cnpj"
                      value={formData.cnpj}
                      onChange={(e) => handleChange("cnpj", e.target.value)}
                      placeholder="00.000.000/0000-00"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="inscricaoEstadual">Inscrição Estadual</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              A Inscrição Estadual (IE) é o registro da empresa no cadastro de contribuintes do ICMS do estado. 
                              Se sua empresa for isenta, marque a opção "Isento".
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        id="inscricaoEstadual"
                        value={formData.inscricaoEstadual}
                        onChange={(e) => handleChange("inscricaoEstadual", e.target.value)}
                        disabled={formData.isentoIE}
                      />
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="isentoIE"
                          checked={formData.isentoIE}
                          onCheckedChange={(checked) => handleChange("isentoIE", checked)}
                        />
                        <Label htmlFor="isentoIE" className="cursor-pointer">Isento</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cnae">CNAE</Label>
                    <Input
                      id="cnae"
                      value={formData.cnae}
                      onChange={(e) => handleChange("cnae", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="atividadePrincipal">Atividade principal</Label>
                    <Select
                      value={formData.atividadePrincipal}
                      onValueChange={(value) => handleChange("atividadePrincipal", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {atividadesPrincipais.map((atividade) => (
                          <SelectItem key={atividade} value={atividade}>
                            {atividade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="regimeTributario">Código de regime tributário</Label>
                    <Select
                      value={formData.regimeTributario}
                      onValueChange={(value) => handleChange("regimeTributario", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {regimesTributarios.map((regime) => (
                          <SelectItem key={regime} value={regime}>
                            {regime}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tipoPessoa">Tipo da Pessoa</Label>
                    <Select
                      value={formData.tipoPessoa}
                      onValueChange={(value) => handleChange("tipoPessoa", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposPessoa.map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="inscricaoMunicipal">Inscrição Municipal</Label>
                    <Input
                      id="inscricaoMunicipal"
                      value={formData.inscricaoMunicipal}
                      onChange={(e) => handleChange("inscricaoMunicipal", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tamanhoEmpresa">Tamanho da empresa</Label>
                    <Select
                      value={formData.tamanhoEmpresa}
                      onValueChange={(value) => handleChange("tamanhoEmpresa", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {tamanhosEmpresa.map((tamanho) => (
                          <SelectItem key={tamanho} value={tamanho}>
                            {tamanho}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Endereço */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Endereço</CardTitle>
                <CardDescription>Endereço completo da empresa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <div className="relative">
                      <Input
                        id="cep"
                        value={formData.cep}
                        onChange={(e) => handleCEPChange(e.target.value)}
                        placeholder="00000-000"
                      />
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="uf">UF</Label>
                    <Select
                      value={formData.uf}
                      onValueChange={(value) => handleChange("uf", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {estados.map((estado) => (
                          <SelectItem key={estado} value={estado}>
                            {estado}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={formData.cidade}
                      onChange={(e) => handleChange("cidade", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                      id="bairro"
                      value={formData.bairro}
                      onChange={(e) => handleChange("bairro", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input
                      id="endereco"
                      value={formData.endereco}
                      onChange={(e) => handleChange("endereco", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="numero">Número</Label>
                    <Input
                      id="numero"
                      value={formData.numero}
                      onChange={(e) => handleChange("numero", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input
                      id="complemento"
                      value={formData.complemento}
                      onChange={(e) => handleChange("complemento", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contato */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Contato</CardTitle>
                <CardDescription>Informações de contato da empresa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pessoasContato">Pessoas de contato</Label>
                    <Input
                      id="pessoasContato"
                      value={formData.pessoasContato}
                      onChange={(e) => handleChange("pessoasContato", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => handleChange("telefone", e.target.value)}
                      placeholder="(00) 0000-0000"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        required
                      />
                      {formData.email && formData.email.includes("@") && (
                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="emailCobranca">E-mail de Cobrança</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              E-mail utilizado para receber faturas, boletos e notificações financeiras. 
                              Se não informado, será utilizado o e-mail principal da empresa.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      id="emailCobranca"
                      type="email"
                      value={formData.emailCobranca}
                      onChange={(e) => handleChange("emailCobranca", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="celular">Celular</Label>
                    <Input
                      id="celular"
                      value={formData.celular}
                      onChange={(e) => handleChange("celular", e.target.value)}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="site">Site</Label>
                    <Input
                      id="site"
                      type="url"
                      value={formData.site}
                      onChange={(e) => handleChange("site", e.target.value)}
                      placeholder="https://www.exemplo.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inscrições Estaduais */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Inscrições Estaduais dos substitutos tributários</CardTitle>
                <CardDescription>Adicione as inscrições estaduais necessárias</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.inscricoesEstaduais.map((inscricao, index) => (
                  <div key={`${inscricao.estado}-${inscricao.inscricao}-${index}`} className="flex gap-2 items-end">
                    <div className="flex-1 space-y-2">
                      <Label>Estado</Label>
                      <Select
                        value={inscricao.estado}
                        onValueChange={(value) => handleInscricaoEstadualChange(index, "estado", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {estados.map((estado) => (
                            <SelectItem key={estado} value={estado}>
                              {estado}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label>Inscrição Estadual</Label>
                      <Input
                        value={inscricao.inscricao}
                        onChange={(e) => handleInscricaoEstadualChange(index, "inscricao", e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveInscricaoEstadual(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddInscricaoEstadual}
                  className="w-full"
                >
                  + Adicionar outra inscrição
                </Button>
              </CardContent>
            </Card>

            {/* Sua marca */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Sua marca</CardTitle>
                <CardDescription>Gerencie o logo da sua empresa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  A resolução mínima indicada da imagem é de 120 x 56 pixels
                </p>
                
                {formData.logoUrl && (
                  <div className="flex items-center justify-center p-6 border rounded-lg">
                    <img
                      src={formData.logoUrl}
                      alt="Logo da empresa"
                      className="max-h-32 max-w-full object-contain"
                    />
                  </div>
                )}
                
                <div className="flex gap-4">
                  <div>
                    <input
                      type="file"
                      id="logoUpload"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      aria-label="Upload do logo da empresa"
                    />
                    <Label htmlFor="logoUpload" className="cursor-pointer">
                      <Button
                        type="button"
                        variant="outline"
                        asChild
                        disabled={isUploadingLogo}
                      >
                        <span>
                          <Upload className="mr-2 h-4 w-4" />
                          {formData.logoUrl ? "Alterar imagem" : "Enviar imagem"}
                        </span>
                      </Button>
                    </Label>
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      toast({
                        title: "Em breve",
                        description: "A geração automática de logo estará disponível em breve."
                      });
                    }}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Gerar nova logo
                  </Button>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Caso desejar, podemos gerar uma logo para você, basta clicar no botão acima!
                </p>
              </CardContent>
            </Card>

            {/* Footer buttons */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[140px]"
              >
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}

