
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";

interface Props {
  userId?: string;
}

const SettingsBusinessTab: React.FC<Props> = ({ userId }) => {
  const { 
    defaultMargin, 
    defaultTax, 
    defaultCardFee, 
    defaultShipping, 
    includeShippingDefault,
    isLoading,
    updateSettings 
  } = useBusinessSettings(userId);
  
  const [formValues, setFormValues] = useState({
    defaultMargin,
    defaultTax,
    defaultCardFee,
    defaultShipping,
    includeShippingDefault
  });
  
  // Update local state when settings are loaded
  React.useEffect(() => {
    setFormValues({
      defaultMargin,
      defaultTax,
      defaultCardFee,
      defaultShipping,
      includeShippingDefault
    });
  }, [defaultMargin, defaultTax, defaultCardFee, defaultShipping, includeShippingDefault]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    setFormValues(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };
  
  const handleSwitchChange = (checked: boolean) => {
    setFormValues(prev => ({
      ...prev,
      includeShippingDefault: checked
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(formValues);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Negócio</CardTitle>
        <CardDescription>
          Defina os valores padrão para seus cálculos de preço
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="defaultMargin">Margem padrão (%)</Label>
              <Input
                id="defaultMargin"
                name="defaultMargin"
                type="number"
                step="0.1"
                min="0"
                value={formValues.defaultMargin}
                onChange={handleChange}
              />
              <p className="text-xs text-gray-500">
                Margem de lucro padrão para novos cálculos
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="defaultTax">Imposto padrão (%)</Label>
              <Input
                id="defaultTax"
                name="defaultTax"
                type="number"
                step="0.1"
                min="0"
                value={formValues.defaultTax}
                onChange={handleChange}
              />
              <p className="text-xs text-gray-500">
                Taxa de impostos padrão para novos cálculos
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="defaultCardFee">Taxa de cartão padrão (%)</Label>
              <Input
                id="defaultCardFee"
                name="defaultCardFee"
                type="number"
                step="0.1"
                min="0"
                value={formValues.defaultCardFee}
                onChange={handleChange}
              />
              <p className="text-xs text-gray-500">
                Taxa de cartão de crédito padrão para novos cálculos
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="defaultShipping">Frete padrão (R$)</Label>
              <Input
                id="defaultShipping"
                name="defaultShipping"
                type="number"
                step="0.01"
                min="0"
                value={formValues.defaultShipping}
                onChange={handleChange}
              />
              <p className="text-xs text-gray-500">
                Valor de frete padrão para novos cálculos
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="includeShippingDefault">Incluir frete no cálculo</Label>
              <p className="text-xs text-gray-500">
                Definir como padrão incluir o frete no cálculo do preço final
              </p>
            </div>
            <Switch
              id="includeShippingDefault"
              checked={formValues.includeShippingDefault}
              onCheckedChange={handleSwitchChange}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t pt-4">
          <Button 
            type="submit" 
            className="bg-brand-600 hover:bg-brand-700"
            disabled={isLoading}
          >
            {isLoading ? "Salvando..." : "Salvar configurações"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SettingsBusinessTab;
