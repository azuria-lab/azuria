
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";

interface Props {
  onSave: (data: any) => Promise<boolean> | void;
  initialData?: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
  };
}

const SettingsProfileTab: React.FC<Props> = ({ 
  onSave,
  initialData = {
    name: "Usuário Exemplo",
    email: "usuario@exemplo.com",
    phone: "(11) 99999-9999",
    company: ""
  } 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave(formData);
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil</CardTitle>
        <CardDescription>
          Atualize suas informações pessoais
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-1">
            <Label htmlFor="name">Nome</Label>
            <Input 
              id="name" 
              name="name" 
              value={formData.name || ""} 
              onChange={handleChange}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              value={formData.email || ""} 
              onChange={handleChange}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="phone">Telefone</Label>
            <Input 
              id="phone" 
              name="phone" 
              value={formData.phone || ""} 
              onChange={handleChange}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="company">Empresa (opcional)</Label>
            <Input 
              id="company" 
              name="company" 
              value={formData.company || ""} 
              onChange={handleChange}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SettingsProfileTab;
