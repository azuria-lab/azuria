import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/domains/auth';
import { useToast } from '@/hooks/use-toast';

export function UpdateNameButton() {
  const [name, setName] = useState('Rômulo Barbosa');
  const [isLoading, setIsLoading] = useState(false);
  const authContext = useAuthContext();
  const { toast } = useToast();

  const handleUpdate = async () => {
    if (!authContext?.user?.id) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para atualizar o nome.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ name: name.trim() })
        .eq('id', authContext.user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "✅ Nome atualizado!",
        description: "Seu nome foi atualizado com sucesso. Recarregando...",
      });

      // Recarregar após 1 segundo
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>🔧 Atualizar Nome do Perfil</CardTitle>
        <CardDescription>
          Digite seu nome completo e clique em atualizar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome Completo</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Digite seu nome"
          />
        </div>
        <Button 
          onClick={handleUpdate} 
          disabled={isLoading || !name.trim()}
          className="w-full"
        >
          {isLoading ? 'Atualizando...' : 'Atualizar Nome'}
        </Button>
      </CardContent>
    </Card>
  );
}
