"use client";

import React, { useEffect, useState } from 'react';
import { supabaseBrowser } from '../../../lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Database, XCircle } from 'lucide-react';

export default function DatabaseTestPage() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [dbInfo, setDbInfo] = useState<any>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        // Test basic connection
        const { data, error } = await supabaseBrowser
          .from('tenants')
          .select('id, name')
          .limit(1);

        if (error) {
          setConnectionStatus('error');
          setErrorMessage(error.message);
        } else {
          setConnectionStatus('connected');
          setDbInfo(data);
        }
      } catch (err) {
        setConnectionStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Erro desconhecido');
      }
    }

    testConnection();
  }, []);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Database className="w-8 h-8" />
            Teste de Conexão com Banco de Dados
          </h1>
          <p className="text-muted-foreground">
            Verificando conectividade com Supabase e integridade das tabelas do marketplace.
          </p>
        </header>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {connectionStatus === 'testing' && <Clock className="w-5 h-5 animate-spin" />}
                {connectionStatus === 'connected' && <CheckCircle className="w-5 h-5 text-green-500" />}
                {connectionStatus === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
                Status da Conexão
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span>Status:</span>
                <Badge variant={
                  connectionStatus === 'connected' ? 'default' : 
                  connectionStatus === 'error' ? 'destructive' : 
                  'secondary'
                }>
                  {connectionStatus === 'testing' && 'Testando...'}
                  {connectionStatus === 'connected' && 'Conectado'}
                  {connectionStatus === 'error' && 'Erro de Conexão'}
                </Badge>
              </div>
              
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{errorMessage}</p>
                </div>
              )}
              
              {connectionStatus === 'connected' && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-600">
                    ✅ Conexão estabelecida com sucesso!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações do Banco</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">URL:</span>
                  <span className="ml-2 text-muted-foreground">
                    {process.env.NEXT_PUBLIC_SUPABASE_URL}
                  </span>
                </div>
                
                {dbInfo && (
                  <div>
                    <span className="font-medium">Dados de Teste:</span>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                      {JSON.stringify(dbInfo, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}