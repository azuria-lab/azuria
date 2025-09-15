
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import React from "react";

interface Props {
  emailNotifications: boolean;
  setEmailNotifications: (v: boolean) => void;
  onSave: () => void;
}

const SettingsNotificationsTab: React.FC<Props> = ({
  emailNotifications,
  setEmailNotifications,
  onSave
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Notificações</CardTitle>
      <CardDescription>
        Gerencie suas preferências de notificação
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email-notifs">Notificações por email</Label>
            <p className="text-gray-500 text-sm">
              Receba atualizações sobre sua conta por email
            </p>
          </div>
          <Switch
            id="email-notifs"
            checked={emailNotifications}
            onCheckedChange={setEmailNotifications}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="marketing-notifs">Emails de marketing</Label>
            <p className="text-gray-500 text-sm">
              Receba ofertas especiais e novidades por email
            </p>
          </div>
          <Switch id="marketing-notifs" defaultChecked={false} />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="update-notifs">Atualizações do sistema</Label>
            <p className="text-gray-500 text-sm">
              Seja notificado sobre novos recursos e melhorias
            </p>
          </div>
          <Switch id="update-notifs" defaultChecked={true} />
        </div>
      </div>
    </CardContent>
    <CardFooter>
      <Button onClick={onSave}>Salvar Preferências</Button>
    </CardFooter>
  </Card>
);

export default SettingsNotificationsTab;
