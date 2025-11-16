import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import TaxCalculator from '@/components/calculators/TaxCalculator';

export default function TaxCalculatorPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <TaxCalculator />
      </main>
      <Footer />
    </div>
  );
}
