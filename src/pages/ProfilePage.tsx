import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { 
  Briefcase, 
  Camera, 
  Edit2, 
  Github, 
  Globe, 
  Linkedin, 
  Mail, 
  MapPin,
  Phone,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuthContext } from "@/domains/auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface ProfileData {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  avatar_url?: string;
  cover_url?: string;
  bio?: string;
  title?: string;
  company?: string;
  experience?: Experience[];
  skills?: string[];
  links?: {
    linkedin?: string;
    github?: string;
    website?: string;
  };
}

interface Experience {
  id: string;
  position: string;
  company: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
}

export default function ProfilePage() {
  const { userProfile } = useAuthContext();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: userProfile?.name || "",
    email: userProfile?.email || "",
    phone: userProfile?.phone || "",
    avatar_url: userProfile?.avatar_url || "",
    bio: "",
    title: "",
    company: "",
    experience: [],
    skills: [],
    links: {},
  });

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProfile();
  }, [userProfile]);

  const loadProfile = async () => {
    if (!userProfile?.id) {return;}

    try {
      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userProfile.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error loading profile:", profileError);
      }

      if (profileData) {
        setProfileData({
          name: profileData.name || userProfile.name || "",
          email: profileData.email || userProfile.email || "",
          phone: profileData.phone || "",
          location: profileData.location || "",
          avatar_url: profileData.avatar_url || userProfile.avatar_url || "",
          cover_url: profileData.cover_url || "",
          bio: profileData.bio || "",
          title: profileData.title || "",
          company: profileData.company || "",
          experience: (Array.isArray(profileData.experience) ? profileData.experience as Experience[] : []),
          skills: (profileData.skills as string[]) || [],
          links: (profileData.links as { linkedin?: string; github?: string; website?: string }) || {},
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const handleSave = async () => {
    if (!userProfile?.id) {return;}

    setIsSaving(true);
    try {
       
      const { error: profileError } = await supabase
        .from("user_profiles")
        .upsert({
          id: userProfile.id,
          name: profileData.name,
          email: profileData.email,
        } as any, {
          phone: profileData.phone || null,
          location: profileData.location || null,
          avatar_url: profileData.avatar_url || null,
          cover_url: profileData.cover_url || null,
          bio: profileData.bio || null,
          title: profileData.title || null,
          company: profileData.company || null,
          experience: profileData.experience.length > 0 ? profileData.experience : null,
          skills: profileData.skills.length > 0 ? profileData.skills : null,
          links: Object.keys(profileData.links || {}).length > 0 ? profileData.links : null,
          updated_at: new Date().toISOString(),
        });

      if (profileError) {throw profileError;}

      toast({
        title: "Perfil salvo",
        description: "Suas informações foram atualizadas com sucesso.",
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o perfil. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!userProfile?.id) {return;}

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userProfile.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) {throw uploadError;}

      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setProfileData((prev) => ({ ...prev, avatar_url: data.publicUrl }));
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer upload da foto.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCoverUpload = async (file: File) => {
    if (!userProfile?.id) {return;}

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userProfile.id}-cover-${Math.random()}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("covers")
        .upload(filePath, file);

      if (uploadError) {throw uploadError;}

      const { data } = supabase.storage
        .from("covers")
        .getPublicUrl(filePath);

      setProfileData((prev) => ({ ...prev, cover_url: data.publicUrl }));
    } catch (error) {
      console.error("Error uploading cover:", error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer upload da capa.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const addExperience = () => {
    setProfileData((prev) => ({
      ...prev,
      experience: [
        ...(prev.experience || []),
        {
          id: Date.now().toString(),
          position: "",
          company: "",
          startDate: "",
          current: false,
        },
      ],
    }));
  };

  const removeExperience = (id: string) => {
    setProfileData((prev) => ({
      ...prev,
      experience: prev.experience?.filter((exp) => exp.id !== id) || [],
    }));
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    setProfileData((prev) => ({
      ...prev,
      experience: prev.experience?.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ) || [],
    }));
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !profileData.skills?.includes(skill.trim())) {
      setProfileData((prev) => ({
        ...prev,
        skills: [...(prev.skills || []), skill.trim()],
      }));
    }
  };

  const removeSkill = (skill: string) => {
    setProfileData((prev) => ({
      ...prev,
      skills: prev.skills?.filter((s) => s !== skill) || [],
    }));
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <>
      <Helmet>
        <title>Meu Perfil | Azuria</title>
        <meta name="description" content="Gerencie seu perfil completo" />
      </Helmet>

      <DashboardLayout>
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Header com foto de capa e perfil */}
          <div className="relative mb-6">
            {/* Banner/Cover */}
            <div className="relative h-48 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20 rounded-t-lg overflow-hidden">
              {profileData.cover_url && (
                <img
                  src={profileData.cover_url}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              )}
              {isEditing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {profileData.cover_url ? "Alterar capa" : "Adicionar capa"}
                  </Button>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {handleCoverUpload(file);}
                    }}
                  />
                </div>
              )}
            </div>

            {/* Foto de perfil */}
            <div className="relative px-6">
              <div className="flex flex-col sm:flex-row gap-4 sm:items-end -mt-12">
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                    <AvatarImage src={profileData.avatar_url} />
                    <AvatarFallback className="text-3xl bg-primary/10">
                      {getInitials(profileData.name || "U")}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute bottom-0 right-0 rounded-full"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      <Camera className="h-4 w-4" />
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {handleAvatarUpload(file);}
                        }}
                      />
                    </Button>
                  )}
                </div>

                <div className="flex-1 pt-2">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div className="flex-1">
                      {isEditing ? (
                        <Input
                          value={profileData.name}
                          onChange={(e) =>
                            setProfileData((prev) => ({ ...prev, name: e.target.value }))
                          }
                          className="text-2xl font-bold mb-2"
                          placeholder="Seu nome"
                        />
                      ) : (
                        <h2 className="text-2xl font-bold text-foreground mb-1">
                          {profileData.name || "Usuário"}
                        </h2>
                      )}
                      {isEditing ? (
                        <Input
                          value={profileData.title || ""}
                          onChange={(e) =>
                            setProfileData((prev) => ({ ...prev, title: e.target.value }))
                          }
                          className="text-muted-foreground mb-2"
                          placeholder="Seu cargo"
                        />
                      ) : (
                        <p className="text-muted-foreground mb-2">
                          {profileData.title || "Adicione seu cargo"}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsEditing(false);
                              loadProfile();
                            }}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancelar
                          </Button>
                          <Button onClick={handleSave} disabled={isSaving}>
                            <Save className="h-4 w-4 mr-2" />
                            {isSaving ? "Salvando..." : "Salvar"}
                          </Button>
                        </>
                      ) : (
                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Editar perfil
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informações de contato */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Informações de Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData((prev) => ({ ...prev, email: e.target.value }))
                      }
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{profileData.email}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  {isEditing ? (
                    <Input
                      value={profileData.phone || ""}
                      onChange={(e) =>
                        setProfileData((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      placeholder="(11) 99999-9999"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{profileData.phone || "Não informado"}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Localização</Label>
                  {isEditing ? (
                    <Input
                      value={profileData.location || ""}
                      onChange={(e) =>
                        setProfileData((prev) => ({ ...prev, location: e.target.value }))
                      }
                      placeholder="São Paulo, Brasil"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{profileData.location || "Não informado"}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Empresa</Label>
                  {isEditing ? (
                    <Input
                      value={profileData.company || ""}
                      onChange={(e) =>
                        setProfileData((prev) => ({ ...prev, company: e.target.value }))
                      }
                      placeholder="Nome da empresa"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span>{profileData.company || "Não informado"}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sobre */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Sobre</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={profileData.bio || ""}
                  onChange={(e) =>
                    setProfileData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  placeholder="Conte um pouco sobre você..."
                  rows={5}
                />
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {profileData.bio || "Adicione uma descrição sobre você."}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Experiência */}
          <Card className="mb-6">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Experiência</CardTitle>
              {isEditing && (
                <Button variant="outline" size="sm" onClick={addExperience}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {profileData.experience && profileData.experience.length > 0 ? (
                profileData.experience.map((exp) => (
                  <div key={exp.id} className="flex gap-4 pb-4 border-b last:border-0">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      {isEditing ? (
                        <>
                          <Input
                            value={exp.position}
                            onChange={(e) =>
                              updateExperience(exp.id, "position", e.target.value)
                            }
                            placeholder="Cargo"
                          />
                          <Input
                            value={exp.company}
                            onChange={(e) =>
                              updateExperience(exp.id, "company", e.target.value)
                            }
                            placeholder="Empresa"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="month"
                              value={exp.startDate}
                              onChange={(e) =>
                                updateExperience(exp.id, "startDate", e.target.value)
                              }
                              placeholder="Data de início"
                            />
                            {!exp.current && (
                              <Input
                                type="month"
                                value={exp.endDate || ""}
                                onChange={(e) =>
                                  updateExperience(exp.id, "endDate", e.target.value)
                                }
                                placeholder="Data de término"
                              />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={exp.current}
                              onChange={(e) =>
                                updateExperience(exp.id, "current", e.target.checked)
                              }
                              className="rounded"
                            />
                            <Label className="text-sm">Trabalho atual</Label>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExperience(exp.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remover
                          </Button>
                        </>
                      ) : (
                        <>
                          <p className="font-medium text-sm">{exp.position}</p>
                          <p className="text-xs text-muted-foreground">{exp.company}</p>
                          <p className="text-xs text-muted-foreground">
                            {exp.startDate} - {exp.current ? "Presente" : exp.endDate}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {isEditing
                    ? "Adicione sua experiência profissional"
                    : "Nenhuma experiência adicionada"}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Habilidades */}
          <Card className="mb-6">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Habilidades</CardTitle>
              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Adicionar habilidade"
                    className="w-48"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addSkill(e.currentTarget.value);
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profileData.skills && profileData.skills.length > 0 ? (
                  profileData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="px-3 py-1">
                      {skill}
                      {isEditing && (
                        <button
                          onClick={() => removeSkill(skill)}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {isEditing ? "Adicione suas habilidades" : "Nenhuma habilidade adicionada"}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Links */}
          <Card>
            <CardHeader>
              <CardTitle>Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>LinkedIn</Label>
                {isEditing ? (
                  <Input
                    value={profileData.links?.linkedin || ""}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        links: { ...prev.links, linkedin: e.target.value },
                      }))
                    }
                    placeholder="https://linkedin.com/in/seu-perfil"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <Linkedin className="h-4 w-4 text-muted-foreground" />
                    {profileData.links?.linkedin ? (
                      <a
                        href={profileData.links.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {profileData.links.linkedin}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">Não informado</span>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>GitHub</Label>
                {isEditing ? (
                  <Input
                    value={profileData.links?.github || ""}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        links: { ...prev.links, github: e.target.value },
                      }))
                    }
                    placeholder="https://github.com/seu-usuario"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <Github className="h-4 w-4 text-muted-foreground" />
                    {profileData.links?.github ? (
                      <a
                        href={profileData.links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {profileData.links.github}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">Não informado</span>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                {isEditing ? (
                  <Input
                    value={profileData.links?.website || ""}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        links: { ...prev.links, website: e.target.value },
                      }))
                    }
                    placeholder="https://seu-site.com"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    {profileData.links?.website ? (
                      <a
                        href={profileData.links.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {profileData.links.website}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">Não informado</span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
}

