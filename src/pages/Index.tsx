import UNCForm from '@/components/UNCForm';
import UNCPreview from '@/components/UNCPreview';
import { useUNCForm } from '@/hooks/useUNCForm';

const Index = () => {
  const { formData, updateField } = useUNCForm();

  return (
    <div className="flex h-svh overflow-hidden bg-desk">
      <UNCForm formData={formData} updateField={updateField} />
      <UNCPreview formData={formData} />
    </div>
  );
};

export default Index;
