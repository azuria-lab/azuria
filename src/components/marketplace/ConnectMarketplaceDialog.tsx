/**
 * Connect Marketplace Dialog
 * 
 * Dialog completo para conectar novos marketplaces com wizard multi-step
 */

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  ExternalLink, 
  Key, 
  Loader2,
  ShieldCheck
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface Marketplace {
  id: string;
  name: string;
  logo: string;
  color: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  setupTime: string;
  requiredFields: {
    name: string;
    label: string;
    type: string;
    placeholder: string;
    helpText?: string;
    helpLink?: string;
  }[];
}

const MARKETPLACES: Marketplace[] = [
  {
    id: 'mercado-livre',
    name: 'Mercado Livre',
    logo: 'https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/5.21.22/mercadolibre/logo__large_plus.png',
    color: '#FFE600',
    description: 'Maior marketplace da América Latina',
    difficulty: 'medium',
    setupTime: '5-10 min',
    requiredFields: [
      {
        name: 'client_id',
        label: 'Client ID',
        type: 'text',
        placeholder: 'Ex: 1234567890123456',
        helpText: 'Encontre no painel de desenvolvedores',
        helpLink: 'https://developers.mercadolivre.com.br/'
      },
      {
        name: 'client_secret',
        label: 'Client Secret',
        type: 'password',
        placeholder: 'Digite seu Client Secret',
        helpText: 'Mantenha em segredo, nunca compartilhe'
      },
      {
        name: 'access_token',
        label: 'Access Token',
        type: 'password',
        placeholder: 'TG-...',
        helpText: 'Token de acesso gerado após autorização OAuth'
      }
    ]
  },
  {
    id: 'shopee',
    name: 'Shopee',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Shopee.svg',
    color: '#EE4D2D',
    description: 'Marketplace líder no Sudeste Asiático',
    difficulty: 'easy',
    setupTime: '3-5 min',
    requiredFields: [
      {
        name: 'partner_id',
        label: 'Partner ID',
        type: 'text',
        placeholder: 'Ex: 1000001',
        helpText: 'ID fornecido ao se registrar como parceiro'
      },
      {
        name: 'partner_key',
        label: 'Partner Key',
        type: 'password',
        placeholder: 'Digite seu Partner Key'
      },
      {
        name: 'shop_id',
        label: 'Shop ID',
        type: 'text',
        placeholder: 'Ex: 123456',
        helpText: 'ID da sua loja na Shopee'
      }
    ]
  },
  {
    id: 'amazon',
    name: 'Amazon',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    color: '#FF9900',
    description: 'Maior marketplace global',
    difficulty: 'hard',
    setupTime: '10-15 min',
    requiredFields: [
      {
        name: 'seller_id',
        label: 'Seller ID',
        type: 'text',
        placeholder: 'Ex: A1BCDEG9FGHIJK',
        helpText: 'Encontre em Seller Central > Settings > Account Info'
      },
      {
        name: 'mws_auth_token',
        label: 'MWS Auth Token',
        type: 'password',
        placeholder: 'Digite seu MWS Auth Token'
      },
      {
        name: 'marketplace_id',
        label: 'Marketplace ID',
        type: 'text',
        placeholder: 'Ex: ATVPDKIKX0DER (US)',
        helpText: 'ID do marketplace regional'
      }
    ]
  },
  {
    id: 'magalu',
    name: 'Magazine Luiza',
    logo: 'https://logodownload.org/wp-content/uploads/2014/05/magazine-luiza-logo-0.png',
    color: '#0086FF',
    description: 'Marketplace brasileiro integrado',
    difficulty: 'easy',
    setupTime: '3-5 min',
    requiredFields: [
      {
        name: 'api_key',
        label: 'API Key',
        type: 'password',
        placeholder: 'Digite sua API Key',
        helpText: 'Solicite no Magalu Marketplace Hub'
      },
      {
        name: 'seller_id',
        label: 'Seller ID',
        type: 'text',
        placeholder: 'Ex: 12345'
      }
    ]
  },
  {
    id: 'americanas',
    name: 'Americanas',
    logo: 'https://logodownload.org/wp-content/uploads/2014/04/americanas-logo-0.png',
    color: '#E31F26',
    description: 'Marketplace das Americanas',
    difficulty: 'medium',
    setupTime: '5-10 min',
    requiredFields: [
      {
        name: 'client_id',
        label: 'Client ID',
        type: 'text',
        placeholder: 'Digite seu Client ID'
      },
      {
        name: 'client_secret',
        label: 'Client Secret',
        type: 'password',
        placeholder: 'Digite seu Client Secret'
      },
      {
        name: 'seller_code',
        label: 'Código do Vendedor',
        type: 'text',
        placeholder: 'Ex: BRL123'
      }
    ]
  }
];

interface ConnectMarketplaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (marketplaceId: string) => void;
}

export default function ConnectMarketplaceDialog({
  open,
  onOpenChange,
  onSuccess
}: Readonly<ConnectMarketplaceDialogProps>) {
  const [step, setStep] = useState<'select' | 'configure' | 'testing' | 'success'>('select');
  const [selectedMarketplace, setSelectedMarketplace] = useState<Marketplace | null>(null);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const handleSelectMarketplace = (marketplace: Marketplace) => {
    setSelectedMarketplace(marketplace);
    setCredentials({});
    setConnectionError(null);
    setStep('configure');
  };

  const handleBack = () => {
    if (step === 'configure') {
      setStep('select');
      setSelectedMarketplace(null);
      setCredentials({});
    }
  };

  const handleCredentialChange = (fieldName: string, value: string) => {
    setCredentials(prev => ({ ...prev, [fieldName]: value }));
    setConnectionError(null);
  };

  const validateForm = () => {
    if (!selectedMarketplace) {
      return false;
    }
    
    return selectedMarketplace.requiredFields.every(field => {
      const value = credentials[field.name];
      return value && value.trim().length > 0;
    });
  };

  const handleConnect = async () => {
    if (!selectedMarketplace || !validateForm()) {
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);
    setStep('testing');

    // Simulação de conexão (em produção, chamar API real)
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Simulação: 80% sucesso, 20% erro
    const success = Math.random() > 0.2;

    if (success) {
      setStep('success');
      setTimeout(() => {
        onSuccess?.(selectedMarketplace.id);
        handleClose();
      }, 2000);
    } else {
      setStep('configure');
      setConnectionError('Falha ao conectar. Verifique suas credenciais e tente novamente.');
    }

    setIsConnecting(false);
  };

  const handleClose = () => {
    setStep('select');
    setSelectedMarketplace(null);
    setCredentials({});
    setConnectionError(null);
    setIsConnecting(false);
    onOpenChange(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'hard':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Fácil';
      case 'medium':
        return 'Médio';
      case 'hard':
        return 'Difícil';
      default:
        return difficulty;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* Step 1: Selecionar Marketplace */}
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <DialogTitle className="text-2xl">Conectar Novo Marketplace</DialogTitle>
                <DialogDescription>
                  Selecione o marketplace que deseja integrar à sua conta
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-6">
                {MARKETPLACES.map((marketplace) => (
                  <motion.button
                    key={marketplace.id}
                    onClick={() => handleSelectMarketplace(marketplace)}
                    className="flex items-center gap-4 p-4 rounded-lg border-2 hover:border-brand-500 hover:shadow-lg transition-all text-left group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div 
                      className="w-16 h-16 rounded-xl flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: `${marketplace.color}20` }}
                    >
                      <img
                        src={marketplace.logo}
                        alt={marketplace.name}
                        className="w-12 h-12 object-contain"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg group-hover:text-brand-600 transition-colors">
                          {marketplace.name}
                        </h3>
                        <Badge className={getDifficultyColor(marketplace.difficulty)}>
                          {getDifficultyLabel(marketplace.difficulty)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{marketplace.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          ⏱️ {marketplace.setupTime}
                        </span>
                        <span className="flex items-center gap-1">
                          🔑 {marketplace.requiredFields.length} credenciais
                        </span>
                      </div>
                    </div>

                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Configurar Credenciais */}
          {step === 'configure' && selectedMarketplace && (
            <motion.div
              key="configure"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${selectedMarketplace.color}20` }}
                  >
                    <img
                      src={selectedMarketplace.logo}
                      alt={selectedMarketplace.name}
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">Configurar {selectedMarketplace.name}</DialogTitle>
                    <DialogDescription>
                      Preencha as credenciais para conectar sua conta
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {connectionError && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{connectionError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4 py-6">
                {selectedMarketplace.requiredFields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name} className="flex items-center gap-2">
                      {field.label}
                      {field.helpLink && (
                        <a
                          href={field.helpLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-600 hover:text-brand-700"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </Label>
                    <Input
                      id={field.name}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={credentials[field.name] || ''}
                      onChange={(e) => handleCredentialChange(field.name, e.target.value)}
                      className={cn(
                        "transition-all",
                        credentials[field.name] && "border-green-500"
                      )}
                    />
                    {field.helpText && (
                      <p className="text-xs text-gray-500 flex items-start gap-1">
                        <Key className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        {field.helpText}
                      </p>
                    )}
                  </div>
                ))}

                <Alert>
                  <ShieldCheck className="h-4 w-4" />
                  <AlertDescription>
                    Suas credenciais são armazenadas de forma criptografada e segura. 
                    Nunca compartilhamos seus dados com terceiros.
                  </AlertDescription>
                </Alert>
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
                <Button 
                  onClick={handleConnect}
                  disabled={!validateForm() || isConnecting}
                  className="gap-2"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      Testar e Conectar
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {/* Step 3: Testando Conexão */}
          {step === 'testing' && selectedMarketplace && (
            <motion.div
              key="testing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-12 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="inline-block"
              >
                <Loader2 className="h-16 w-16 text-brand-600" />
              </motion.div>
              <h3 className="text-xl font-bold mt-6">Testando Conexão...</h3>
              <p className="text-gray-600 mt-2">
                Verificando suas credenciais no {selectedMarketplace.name}
              </p>
              <div className="mt-6 space-y-2 max-w-md mx-auto">
                {['Validando credenciais...', 'Autenticando...', 'Sincronizando dados...'].map((text, i) => (
                  <motion.div
                    key={text}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.5 }}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    {text}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 4: Sucesso */}
          {step === 'success' && selectedMarketplace && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="py-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <CheckCircle className="h-20 w-20 text-green-600 mx-auto" />
              </motion.div>
              <h3 className="text-2xl font-bold mt-6">Conectado com Sucesso! 🎉</h3>
              <p className="text-gray-600 mt-2">
                Sua conta do {selectedMarketplace.name} foi integrada com sucesso
              </p>
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200 max-w-md mx-auto">
                <p className="text-sm text-green-800">
                  Agora você pode sincronizar produtos, gerenciar estoque e acompanhar vendas em tempo real!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
