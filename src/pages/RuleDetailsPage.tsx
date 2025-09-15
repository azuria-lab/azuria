import { useParams } from 'react-router-dom';
import { RuleDetails } from '@/components/automation/RuleDetails';

export default function RuleDetailsPage() {
  const params = useParams();
  const ruleId = params.id as string | undefined;
  if (!ruleId) {
    return <div className="p-6 text-gray-600">ID da regra inválido.</div>;
  }
  return (
    <div className="container mx-auto p-4">
      <RuleDetails ruleId={ruleId} />
    </div>
  );
}
