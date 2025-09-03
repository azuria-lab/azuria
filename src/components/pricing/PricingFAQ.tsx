
import { motion } from "framer-motion";

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function PricingFAQ() {
  return (
    <motion.div 
      variants={itemVariants}
      className="mt-12"
    >
      <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-3xl mx-auto shadow-md">
        <h3 className="text-xl font-semibold mb-4">Perguntas Frequentes</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-2">Como funciona o período de cobrança?</h4>
            <p className="text-gray-600">
              A cobrança ocorre no ato da assinatura e é renovada automaticamente conforme a periodicidade escolhida (mensal ou anual, com desconto de 17%!).
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Posso cancelar quando quiser?</h4>
            <p className="text-gray-600">
              Sim, sua assinatura PRO pode ser cancelada a qualquer momento, sem burocracia. O acesso aos recursos premium continua até o fim do período já pago.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">O que inclui o plano Enterprise?</h4>
            <p className="text-gray-600">
              O plano Enterprise oferece white-label completo, API ilimitada, domínio personalizado e suporte dedicado. Ideal para empresas que querem revender a solução com sua própria marca.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Quais formas de pagamento são aceitas?</h4>
            <p className="text-gray-600">
              Aceitamos cartões de crédito, débito e PIX através do Stripe, nossa plataforma de pagamentos segura e confiável.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
