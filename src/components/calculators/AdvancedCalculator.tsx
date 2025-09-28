import React, { useMemo, useState } from "react";
import { useAdvancedCalculator } from "@/domains/calculator/hooks/useAdvancedCalculator";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui";
import { marketplaces } from "@/data/marketplaces";
import type { TaxRegime } from "@/domains/calculator/types/advanced";

type AdvancedCalculatorProps = {
  userId?: string;
};

const numberOrZero = (v: string) => {
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

const AdvancedCalculator: React.FC<AdvancedCalculatorProps> = (_props) => {
  const { calculateAdvanced, taxRegimes, isLoading, result } = useAdvancedCalculator();

  // Abas
  const [tab, setTab] = useState("tributos");

  // Tributos / custos básicos
  const [cost, setCost] = useState<string>("0");
  const [shipping, setShipping] = useState<string>("0");
  const [includeShipping, setIncludeShipping] = useState<boolean>(true);
  const [otherCost, setOtherCost] = useState<string>("0");
  const [targetMargin, setTargetMargin] = useState<string>("20");

  const [taxRegimeId, setTaxRegimeId] = useState<string>(() => taxRegimes[0]?.id ?? "simples");
  const selectedRegime = useMemo<TaxRegime | undefined>(() => taxRegimes.find(r => r.id === taxRegimeId), [taxRegimeId, taxRegimes]);
  const [customTaxEnabled, setCustomTaxEnabled] = useState(false);
  const [customTaxPercent, setCustomTaxPercent] = useState<string>("0");

  // Marketplace e taxas opcionais
  const [marketplaceId, setMarketplaceId] = useState<string>(marketplaces[0]?.id ?? "mercado-livre");
  const [marketplaceFee, setMarketplaceFee] = useState<string>(() => String(marketplaces[0]?.fee ?? 0));

  const [paymentEnabled, setPaymentEnabled] = useState<boolean>(true);
  const [paymentFee, setPaymentFee] = useState<string>("3.5");

  const [logisticsEnabled, setLogisticsEnabled] = useState<boolean>(false);
  const [logisticsFee, setLogisticsFee] = useState<string>("0");

  const [adsEnabled, setAdsEnabled] = useState<boolean>(false);
  const [advertisingFee, setAdvertisingFee] = useState<string>("0");

  const [othersEnabled, setOthersEnabled] = useState<boolean>(false);
  const [otherFees, setOtherFees] = useState<string>("0");

  // Quando usuário troca de marketplace, atualiza taxa padrão
  const handleMarketplaceChange = (id: string) => {
    setMarketplaceId(id);
    const mp = marketplaces.find(m => m.id === id);
    if (mp) { setMarketplaceFee(String(mp.fee ?? 0)); }
  };

  const handleCalculate = async () => {
    if (!selectedRegime) { return; }

    // Regime possivelmente sobrescrito com alíquota única personalizada
    const regimeForCalc: TaxRegime = customTaxEnabled
      ? {
          ...selectedRegime,
          // Usa caminho do Simples com alíquota única, zerando demais
          simplexPercent: numberOrZero(customTaxPercent),
          pis: 0,
          cofins: 0,
          irpj: 0,
          csll: 0,
          icms: 0,
          iss: 0,
          rates: { ...selectedRegime.rates, pis: 0, cofins: 0, irpj: 0, csll: 0, icms: 0, iss: 0, cpp: selectedRegime.rates.cpp }
        }
      : selectedRegime;

    const calc = await calculateAdvanced({
      cost: numberOrZero(cost),
      taxRegime: regimeForCalc,
      shipping: numberOrZero(shipping),
      includeShipping,
      targetMargin: numberOrZero(targetMargin),
      marketplaceFee: numberOrZero(marketplaceFee),
      paymentFee: paymentEnabled ? numberOrZero(paymentFee) : 0,
      logisticsFee: logisticsEnabled ? numberOrZero(logisticsFee) : 0,
      advertisingFee: adsEnabled ? numberOrZero(advertisingFee) : 0,
      otherFees: othersEnabled ? numberOrZero(otherFees) : 0,
      otherCost: numberOrZero(otherCost)
    });

    if (calc) { setTab("resumo"); }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calculadora Avançada</CardTitle>
        <CardDescription>
          Unifique tributos, marketplace e custos opcionais para precificação completa.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="tributos">Tributos</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
          </TabsList>

          <TabsContent value="tributos">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cost">Custo (R$)</Label>
                <Input id="cost" inputMode="decimal" value={cost} onChange={e => setCost(e.target.value)} />
              </div>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Label htmlFor="shipping">Frete (R$)</Label>
                  <Input id="shipping" inputMode="decimal" value={shipping} onChange={e => setShipping(e.target.value)} />
                </div>
                <div className="flex items-center gap-2 pb-2">
                  <Switch id="includeShipping" checked={includeShipping} onCheckedChange={setIncludeShipping} />
                  <Label htmlFor="includeShipping">Incluir frete no custo</Label>
                </div>
              </div>
              <div>
                <Label htmlFor="otherCost">Outros custos (R$)</Label>
                <Input id="otherCost" inputMode="decimal" value={otherCost} onChange={e => setOtherCost(e.target.value)} />
              </div>
              <div>
                <Label>Regime tributário</Label>
                <Select value={taxRegimeId} onValueChange={setTaxRegimeId}>
                  <SelectTrigger aria-label="Regime tributário">
                    <SelectValue placeholder="Selecione o regime" />
                  </SelectTrigger>
                  <SelectContent>
                    {taxRegimes.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedRegime && (
                  <p className="text-xs text-muted-foreground mt-1">{selectedRegime.description}</p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-1">
                <Switch id="customTax" checked={customTaxEnabled} onCheckedChange={setCustomTaxEnabled} />
                <Label htmlFor="customTax">Usar alíquota personalizada (%)</Label>
              </div>
              {customTaxEnabled && (
                <div>
                  <Label htmlFor="customTaxPercent">Alíquota única (%)</Label>
                  <Input id="customTaxPercent" inputMode="decimal" value={customTaxPercent} onChange={e => setCustomTaxPercent(e.target.value)} />
                  <p className="text-xs text-muted-foreground mt-1">Substitui o cálculo detalhado por uma alíquota única.</p>
                </div>
              )}

              <div>
                <Label htmlFor="targetMargin">Margem alvo (%)</Label>
                <Input id="targetMargin" inputMode="decimal" value={targetMargin} onChange={e => setTargetMargin(e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button onClick={handleCalculate} disabled={isLoading}>Calcular</Button>
            </div>
          </TabsContent>

          <TabsContent value="marketplace">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Marketplace</Label>
                <Select value={marketplaceId} onValueChange={handleMarketplaceChange}>
                  <SelectTrigger aria-label="Marketplace">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {marketplaces.map(mp => (
                      <SelectItem key={mp.id} value={mp.id}>{mp.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="marketplaceFee">Taxa do marketplace (%)</Label>
                <Input id="marketplaceFee" inputMode="decimal" value={marketplaceFee} onChange={e => setMarketplaceFee(e.target.value)} />
              </div>

              <Separator className="my-2 md:col-span-2" />

              <div className="flex items-center gap-2">
                <Switch id="paymentEnabled" checked={paymentEnabled} onCheckedChange={setPaymentEnabled} />
                <Label htmlFor="paymentEnabled">Taxa de pagamento</Label>
              </div>
              <div>
                <Label htmlFor="paymentFee">Pagamento (%)</Label>
                <Input id="paymentFee" inputMode="decimal" value={paymentFee} onChange={e => setPaymentFee(e.target.value)} disabled={!paymentEnabled} />
              </div>

              <div className="flex items-center gap-2">
                <Switch id="logisticsEnabled" checked={logisticsEnabled} onCheckedChange={setLogisticsEnabled} />
                <Label htmlFor="logisticsEnabled">Logística</Label>
              </div>
              <div>
                <Label htmlFor="logisticsFee">Logística (%)</Label>
                <Input id="logisticsFee" inputMode="decimal" value={logisticsFee} onChange={e => setLogisticsFee(e.target.value)} disabled={!logisticsEnabled} />
              </div>

              <div className="flex items-center gap-2">
                <Switch id="adsEnabled" checked={adsEnabled} onCheckedChange={setAdsEnabled} />
                <Label htmlFor="adsEnabled">Anúncios</Label>
              </div>
              <div>
                <Label htmlFor="advertisingFee">Anúncios (%)</Label>
                <Input id="advertisingFee" inputMode="decimal" value={advertisingFee} onChange={e => setAdvertisingFee(e.target.value)} disabled={!adsEnabled} />
              </div>

              <div className="flex items-center gap-2">
                <Switch id="othersEnabled" checked={othersEnabled} onCheckedChange={setOthersEnabled} />
                <Label htmlFor="othersEnabled">Outras taxas</Label>
              </div>
              <div>
                <Label htmlFor="otherFees">Outras (%)</Label>
                <Input id="otherFees" inputMode="decimal" value={otherFees} onChange={e => setOtherFees(e.target.value)} disabled={!othersEnabled} />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button onClick={handleCalculate} disabled={isLoading}>Calcular</Button>
            </div>
          </TabsContent>

          <TabsContent value="resumo">
            {!result ? (
              <p className="text-sm text-muted-foreground">Preencha os dados e clique em Calcular para ver o resumo.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Preço de venda</CardTitle>
                    <CardDescription>Preço sugerido com margem</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold">R$ {result.sellingPrice.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Margem: {result.profitMargin.toFixed(1)}%</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Custos e taxas</CardTitle>
                    <CardDescription>Tributos + marketplace + outros</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-1">
                      <li>Total de custos: R$ {result.totalCost.toFixed(2)}</li>
                      <li>Tributos: R$ {result.totalTaxes.toFixed(2)} ({result.breakdown.taxes.effectiveRate.toFixed(1)}%)</li>
                      <li>Taxas: R$ {result.totalFees.toFixed(2)}</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Lucro líquido</CardTitle>
                    <CardDescription>Após tributos e taxas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold">R$ {result.netProfit.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground mt-1">ROI: {result.roi.toFixed(1)}%</p>
                  </CardContent>
                </Card>

                <Card className="md:col-span-3">
                  <CardHeader>
                    <CardTitle>Detalhamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Tributos</h4>
                        <ul className="text-sm space-y-1">
                          {Object.entries(result.breakdown.taxes.details).map(([k, v]) => (
                            <li key={k}>{k.toUpperCase()}: R$ {v.toFixed(2)}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Taxas</h4>
                        <ul className="text-sm space-y-1">
                          <li>Marketplace: R$ {result.breakdown.fees.marketplace.toFixed(2)}</li>
                          <li>Pagamento: R$ {result.breakdown.fees.payment.toFixed(2)}</li>
                          <li>Logística: R$ {result.breakdown.fees.logistics.toFixed(2)}</li>
                          <li>Anúncios: R$ {result.breakdown.fees.advertising.toFixed(2)}</li>
                          <li>Outras: R$ {result.breakdown.fees.others.toFixed(2)}</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Margens</h4>
                        <ul className="text-sm space-y-1">
                          <li>Bruta: {result.breakdown.margins.gross.toFixed(1)}%</li>
                          <li>Líquida: {result.breakdown.margins.net.toFixed(1)}%</li>
                          <li>Contribuição: {result.breakdown.margins.contribution.toFixed(1)}%</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdvancedCalculator;
