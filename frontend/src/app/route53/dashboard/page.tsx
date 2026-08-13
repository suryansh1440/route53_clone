import { ComingSoonPlaceholder } from '@/components/aws/ComingSoonPlaceholder';

export default function DashboardPage() {
  return (
    <ComingSoonPlaceholder
      title="Dashboard"
      description="View your Route 53 DNS domain health, hosted zone counts, and traffic overview."
      featureName="Route 53 Dashboard"
    />
  );
}
