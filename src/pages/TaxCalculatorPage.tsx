import TaxCalculator from '@/components/calculators/TaxCalculator';

export default function TaxCalculatorPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <TaxCalculator />
      </main>
    </div>
  );
}
