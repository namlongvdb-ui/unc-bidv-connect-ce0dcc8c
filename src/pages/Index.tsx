import UNCForm from '@/components/UNCForm';
import UNCPreview from '@/components/UNCPreview';
import { useUNCForm } from '@/hooks/useUNCForm';
import { useBeneficiaries } from '@/hooks/useBeneficiaries';

const Index = () => {
  const { formData, updateField } = useUNCForm();
  const { beneficiaries, addBeneficiary, removeBeneficiary } = useBeneficiaries();

  return (
    <div className="flex h-svh overflow-hidden bg-desk">
      <UNCForm
        formData={formData}
        updateField={updateField}
        beneficiaries={beneficiaries}
        onSaveBeneficiary={addBeneficiary}
        onRemoveBeneficiary={removeBeneficiary}
      />
      <UNCPreview formData={formData} />
    </div>
  );
};

export default Index;
