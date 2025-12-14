
import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, X } from "lucide-react";

const comparisonData = [
  {
    feature: "Cálculo automático de impostos",
    planilhas: false,
    outrosApps: true,
    azuria: true
  },
  {
    feature: "Inteligência artificial avançada",
    planilhas: false,
    outrosApps: false,
    azuria: true
  },
  {
    feature: "Integração nativa com marketplaces",
    planilhas: false,
    outrosApps: "Parcial",
    azuria: true
  },
  {
    feature: "Análise competitiva de mercado",
    planilhas: false,
    outrosApps: false,
    azuria: true
  },
  {
    feature: "Precificação em massa",
    planilhas: "Manual",
    outrosApps: "Limitado",
    azuria: true
  },
  {
    feature: "Simulação de cenários estratégicos",
    planilhas: false,
    outrosApps: false,
    azuria: true
  },
  {
    feature: "Analytics e relatórios executivos",
    planilhas: "Básico",
    outrosApps: "Básico",
    azuria: true
  },
  {
    feature: "Automação inteligente de processos",
    planilhas: false,
    outrosApps: false,
    azuria: true
  },
  {
    feature: "Suporte técnico especializado",
    planilhas: false,
    outrosApps: "Email",
    azuria: true
  }
];

const ComparisonSectionBling: React.FC = () => {
  const reduceMotion = useReducedMotion();

  const renderCell = (value: boolean | string) => {
    if (value === true) {
      return <Check className="h-5 w-5 text-[#0BA360] mx-auto" />;
    }
    if (value === false) {
      return <X className="h-5 w-5 text-gray-300 mx-auto" />;
    }
    return <span className="text-gray-600 text-sm">{value}</span>;
  };

  return (
    <section className="py-20 md:py-32 bg-[#F8FBFF] w-full">
      <div className="container mx-auto px-4 w-full">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={reduceMotion ? undefined : { duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-4 tracking-tight">
            Compare e Identifique a Diferença
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-light">
            Descubra por que o Azuria é a solução mais completa para precificação estratégica
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto overflow-x-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8FBFF] border-b border-gray-200">
                  <th className="text-left p-6 font-bold text-[#0A1930]">Recurso</th>
                  <th className="text-center p-6 font-bold text-[#0A1930]">Planilhas</th>
                  <th className="text-center p-6 font-bold text-[#0A1930]">Outros Apps</th>
                  <th className="text-center p-6 font-bold text-[#005BFF] bg-[#EAF6FF]">Azuria Pro</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, index) => (
                  <motion.tr
                    key={row.feature}
                    initial={reduceMotion ? undefined : { opacity: 0, x: -20 }}
                    whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={reduceMotion ? undefined : { duration: 0.4, delay: index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-[#F8FBFF] transition-colors"
                  >
                    <td className="p-6 text-gray-700 font-medium">{row.feature}</td>
                    <td className="p-6 text-center">{renderCell(row.planilhas)}</td>
                    <td className="p-6 text-center">{renderCell(row.outrosApps)}</td>
                    <td className="p-6 text-center bg-[#EAF6FF]/30">{renderCell(row.azuria)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSectionBling;

