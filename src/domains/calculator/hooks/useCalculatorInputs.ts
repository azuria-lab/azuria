
import { useEffect, useState } from "react";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";

export const useCalculatorInputs = (userId?: string) => {
  // Get business settings if userId is provided
  const { 
    defaultMargin, 
    defaultTax, 
    defaultCardFee, 
    defaultShipping, 
    includeShippingDefault 
  } = useBusinessSettings(userId || undefined);

  // Initialize states with business settings or defaults
  const [cost, setCost] = useState<string>("");
  const [margin, setMargin] = useState<number>(30);
  const [tax, setTax] = useState<string>("");
  const [cardFee, setCardFee] = useState<string>("");
  const [otherCosts, setOtherCosts] = useState<string>("");
  const [shipping, setShipping] = useState<string>("");
  const [includeShipping, setIncludeShipping] = useState<boolean>(false);

  // Update default values when business settings are loaded
  useEffect(() => {
    if (defaultMargin !== undefined) {setMargin(defaultMargin);}
    if (defaultTax !== undefined) {setTax(defaultTax.toString());}
    if (defaultCardFee !== undefined) {setCardFee(defaultCardFee.toString());}
    if (defaultShipping !== undefined) {setShipping(defaultShipping.toString());}
    if (includeShippingDefault !== undefined) {setIncludeShipping(includeShippingDefault);}
  }, [defaultMargin, defaultTax, defaultCardFee, defaultShipping, includeShippingDefault]);

  // Handle direct value updates
  const setCostValue = (value: string) => {
    setCost(value);
  };

  const setTaxValue = (value: string) => {
    setTax(value);
  };

  const setCardFeeValue = (value: string) => {
    setCardFee(value);
  };

  const setOtherCostsValue = (value: string) => {
    setOtherCosts(value);
  };

  const setShippingValue = (value: string) => {
    setShipping(value);
  };

  // Handle formatted input values
  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCost(e.target.value);
  };

  const handleTaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTax(e.target.value);
  };

  const handleCardFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardFee(e.target.value);
  };

  const handleOtherCostsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtherCosts(e.target.value);
  };

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShipping(e.target.value);
  };

  return {
    cost,
    margin,
    tax,
    cardFee,
    otherCosts,
    shipping,
    includeShipping,
    setCost: handleCostChange,
    setMargin,
    setTax: handleTaxChange,
    setCardFee: handleCardFeeChange,
    setOtherCosts: handleOtherCostsChange,
    setShipping: handleShippingChange,
    setIncludeShipping,
    // Direct value setters
    setCostValue,
    setTaxValue,
    setCardFeeValue,
    setOtherCostsValue,
    setShippingValue
  };
};
