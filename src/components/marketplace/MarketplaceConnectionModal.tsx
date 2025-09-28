import React, { useState } from 'react';
import { AlertCircle, CheckCircle, ExternalLink, Eye, EyeOff, X } from 'lucide-react';
import { MarketplacePlatform } from '../../types/marketplace';

interface MarketplaceConnectionModalProps {
  readonly platform: MarketplacePlatform;
  readonly onSubmit: (credentials: Record<string, unknown>) => Promise<void>;
  readonly onClose: () => void;
  readonly isLoading: boolean;
}

interface FieldConfig {
  readonly key: string;
  readonly label: string;
  readonly type: 'text' | 'password' | 'url' | 'select';
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly options?: readonly string[];
  readonly help?: string;
}

const MarketplaceConnectionModal: React.FC<MarketplaceConnectionModalProps> = ({
  platform,
  onSubmit,
  onClose,
  isLoading
}) => {
  const [credentials, setCredentials] = useState<Record<string, unknown>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [testConnection, setTestConnection] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const getPlatformConfig = (): FieldConfig[] => {
    switch (platform) {
      case 'amazon':
        return [
          { key: 'accessKey', label: 'Access Key ID', type: 'text', required: true, placeholder: 'AKIA...' },
          { key: 'secretKey', label: 'Secret Access Key', type: 'password', required: true },
          { key: 'sellerId', label: 'Seller ID', type: 'text', required: true, placeholder: 'A...' },
          { key: 'mwsToken', label: 'MWS Auth Token', type: 'text', required: true },
          { 
            key: 'marketplace', 
            label: 'Marketplace', 
            type: 'select', 
            required: true,
            options: ['ATVPDKIKX0DER', 'A2Q3Y263D00KWC', 'A1AM78C64UM0Y8'],
            help: 'US, Brazil, or Mexico marketplace'
          }
        ];
      case 'mercadolivre':
        return [
          { key: 'appId', label: 'App ID', type: 'text', required: true, placeholder: '123456789' },
          { key: 'secretKey', label: 'Secret Key', type: 'password', required: true },
          { key: 'accessToken', label: 'Access Token', type: 'password', required: true },
          { key: 'refreshToken', label: 'Refresh Token', type: 'password', required: true },
          { 
            key: 'siteId', 
            label: 'Site ID', 
            type: 'select', 
            required: true,
            options: ['MLB', 'MLA', 'MLM', 'MLC', 'MCO'],
            help: 'Brazil (MLB), Argentina (MLA), Mexico (MLM), etc.'
          }
        ];
      case 'shopify':
        return [
          { key: 'shopDomain', label: 'Shop Domain', type: 'url', required: true, placeholder: 'mystore.myshopify.com' },
          { key: 'accessToken', label: 'Private App Access Token', type: 'password', required: true },
          { key: 'apiKey', label: 'API Key', type: 'text', required: true },
          { key: 'apiSecret', label: 'API Secret', type: 'password', required: true }
        ];
      case 'shopee':
        return [
          { key: 'partnerId', label: 'Partner ID', type: 'text', required: true },
          { key: 'partnerKey', label: 'Partner Key', type: 'password', required: true },
          { key: 'shopId', label: 'Shop ID', type: 'text', required: true },
          { 
            key: 'region', 
            label: 'Region', 
            type: 'select', 
            required: true,
            options: ['BR', 'MX', 'CO', 'CL'],
            help: 'Brazil, Mexico, Colombia, Chile'
          }
        ];
      case 'americanas':
        return [
          { key: 'clientId', label: 'Client ID', type: 'text', required: true },
          { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
          { key: 'username', label: 'Username', type: 'text', required: true },
          { key: 'password', label: 'Password', type: 'password', required: true }
        ];
      default:
        return [
          { key: 'apiUrl', label: 'API URL', type: 'url', required: true },
          { key: 'apiKey', label: 'API Key', type: 'password', required: true },
          { key: 'username', label: 'Username', type: 'text', required: false },
          { key: 'password', label: 'Password', type: 'password', required: false }
        ];
    }
  };

  const getPlatformInfo = () => {
    const info: Record<MarketplacePlatform, { name: string; icon: string; docs: string }> = {
      amazon: { name: 'Amazon', icon: '🛒', docs: 'https://docs.developer.amazonservices.com/' },
      mercadolivre: { name: 'Mercado Livre', icon: '💛', docs: 'https://developers.mercadolibre.com.br/' },
      shopify: { name: 'Shopify', icon: '🛍️', docs: 'https://shopify.dev/api' },
      shopee: { name: 'Shopee', icon: '🧡', docs: 'https://open.shopee.com/documents' },
      americanas: { name: 'Americanas', icon: '🔴', docs: 'https://desenvolvedores.americanas.com/' },
      casasbahia: { name: 'Casas Bahia', icon: '🏠', docs: '#' },
      magento: { name: 'Magento', icon: '🔶', docs: 'https://devdocs.magento.com/' },
      woocommerce: { name: 'WooCommerce', icon: '🌐', docs: 'https://woocommerce.github.io/woocommerce-rest-api-docs/' },
      extra: { name: 'Extra', icon: '⭐', docs: '#' },
      custom: { name: 'Personalizado', icon: '🏪', docs: '#' }
    };
    return info[platform];
  };

  const fieldConfigs = getPlatformConfig();
  const platformInfo = getPlatformInfo();

  const handleInputChange = (key: string, value: unknown) => {
    setCredentials(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const togglePasswordVisibility = (key: string) => {
    setShowPasswords(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    fieldConfigs.forEach(field => {
      const value = credentials[field.key];
      
      if (field.required && (!value || String(value).trim() === '')) {
        newErrors[field.key] = `${field.label} é obrigatório`;
      }
      
      if (field.type === 'url' && value) {
        const urlPattern = /^https?:\/\/.+/;
        if (!urlPattern.test(String(value))) {
          newErrors[field.key] = 'URL deve começar com http:// ou https://';
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTestConnection = async () => {
    if (!validateForm()) {
      return;
    }
    
    setTestConnection('testing');
    
    // Simulate API test
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const success = Math.random() > 0.3; // 70% success rate
      setTestConnection(success ? 'success' : 'error');
      
      setTimeout(() => {
        setTestConnection('idle');
      }, 3000);
    } catch {
      setTestConnection('error');
      setTimeout(() => {
        setTestConnection('idle');
      }, 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSubmit(credentials);
    } catch {
      // Error handled by parent component
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{platformInfo.icon}</span>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Conectar {platformInfo.name}
              </h2>
              <p className="text-sm text-gray-500">
                Configure suas credenciais de API
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {fieldConfigs.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                {field.type === 'select' ? (
                  <select
                    value={String(credentials[field.key] || '')}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors[field.key] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecione...</option>
                    {field.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="relative">
                    <input
                      type={field.type === 'password' && !showPasswords[field.key] ? 'password' : 'text'}
                      value={String(credentials[field.key] || '')}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors[field.key] ? 'border-red-500' : 'border-gray-300'
                      } ${field.type === 'password' ? 'pr-10' : ''}`}
                    />
                    {field.type === 'password' && (
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(field.key)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords[field.key] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                )}
                
                {field.help && (
                  <p className="text-xs text-gray-500 mt-1">{field.help}</p>
                )}
                
                {errors[field.key] && (
                  <p className="text-xs text-red-500 mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors[field.key]}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Test Connection */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">
                Testar Conexão
              </span>
              {testConnection === 'success' && (
                <div className="flex items-center text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Conexão bem-sucedida
                </div>
              )}
              {testConnection === 'error' && (
                <div className="flex items-center text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Falha na conexão
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testConnection === 'testing'}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {testConnection === 'testing' ? 'Testando...' : 'Testar Conexão'}
            </button>
          </div>

          {/* Documentation Link */}
          {platformInfo.docs !== '#' && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <a
                href={platformInfo.docs}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver documentação da API
              </a>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || testConnection === 'testing'}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Conectando...' : 'Conectar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MarketplaceConnectionModal;