
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { logger } from "@/services/logger";
import { Camera, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatPhoneNumber } from "@/utils/phoneFormatter";

interface ProfileData {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  avatar_url?: string;
}

interface Props {
  onSave: (data: ProfileData) => Promise<boolean> | void;
  initialData?: ProfileData;
}

const SettingsProfileTab: React.FC<Props> = ({ 
  onSave,
  initialData = {
    name: "Usuário Exemplo",
    email: "usuario@exemplo.com",
    phone: "(11) 99999-9999",
    company: "",
    avatar_url: ""
  } 
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [formData, setFormData] = useState<ProfileData>(initialData);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Atualizar formData quando initialData mudar (ex: após reload do perfil)
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Aplicar formatação automática para telefone
    if (name === 'phone') {
      const formatted = formatPhoneNumber(value);
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma imagem válida.",
        variant: "destructive"
      });
      return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive"
      });
      return;
    }

    setIsUploadingAvatar(true);

    try {
      // Upload para Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = urlData.publicUrl;

      // Atualizar estado local
      setFormData(prev => ({
        ...prev,
        avatar_url: avatarUrl
      }));

      // Salvar automaticamente o avatar no perfil
      const saveSuccess = await onSave({ avatar_url: avatarUrl });

      if (saveSuccess) {
        toast({
          title: "Sucesso!",
          description: "Foto de perfil atualizada com sucesso."
        });
      } else {
        toast({
          title: "Atenção",
          description: "Upload feito, mas houve erro ao salvar. Clique em 'Salvar Alterações'.",
          variant: "destructive"
        });
      }
    } catch (error) {
      logger.error("Erro ao fazer upload do avatar:", error);
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da imagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave(formData);
    } catch (error) {
      logger.error("Erro ao salvar perfil:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gerar iniciais para o avatar
  const initials = formData.name
    ? formData.name
        .split(" ")
        .map(n => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

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
          {/* Avatar Upload */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-24 w-24 cursor-pointer transition-opacity hover:opacity-80" onClick={handleAvatarClick}>
                <AvatarImage src={formData.avatar_url || ""} alt={formData.name || "Avatar"} />
                <AvatarFallback className="bg-brand-100 text-brand-800 text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <motion.button
                type="button"
                onClick={handleAvatarClick}
                disabled={isUploadingAvatar}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-2 shadow-lg transition-colors disabled:opacity-50"
                aria-label="Alterar foto de perfil"
              >
                {isUploadingAvatar ? (
                  <Upload className="h-4 w-4 animate-pulse" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </motion.button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              aria-label="Upload de foto"
            />
            <p className="text-sm text-gray-500 text-center">
              Clique no avatar para alterar sua foto de perfil
            </p>
          </div>

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
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              type="submit" 
              disabled={isSubmitting || isUploadingAvatar}
              className="min-w-[140px]"
            >
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </motion.div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SettingsProfileTab;
