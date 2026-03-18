import { UNCFormData } from '@/hooks/useUNCForm';
import { numberToVietnameseWords, formatCurrency } from '@/lib/numberToWords';

interface Props {
  formData: UNCFormData;
  updateField: (field: keyof UNCFormData, value: string) => void;
}

const InputField = ({ label, sublabel, value, onChange, placeholder, mono, type }: {
  label: string; sublabel?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; mono?: boolean; type?: string;
}) => (
  <div>
    <label className="block text-xs font-medium text-muted-foreground mb-1">
      {label} {sublabel && <span className="font-normal italic text-muted-foreground/70">{sublabel}</span>}
    </label>
    <input
      type={type || 'text'}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full border-b border-border py-2 bg-transparent outline-none focus:border-bidv-blue transition-colors text-foreground placeholder:text-muted-foreground/50 ${mono ? 'font-mono tracking-widest' : ''}`}
    />
  </div>
);

export default function UNCForm({ formData, updateField }: Props) {
  const handleAmountChange = (val: string) => {
    const cleaned = val.replace(/[^\d]/g, '');
    updateField('amount', cleaned);
    const num = parseInt(cleaned);
    if (!isNaN(num) && num > 0) {
      updateField('amountWords', numberToVietnameseWords(num));
    } else {
      updateField('amountWords', '');
    }
  };

  const displayAmount = formData.amount
    ? formatCurrency(parseInt(formData.amount))
    : '';

  return (
    <aside className="w-[420px] min-w-[380px] bg-card border-r border-border overflow-y-auto flex-shrink-0">
      <div className="p-6 pb-2">
        <header className="mb-6">
          <h1 className="text-lg font-bold text-foreground">Lập Ủy nhiệm chi</h1>
          <p className="text-xs text-muted-foreground">BIDV Payment Order — Mẫu C014</p>
        </header>
      </div>

      <form className="px-6 pb-8 space-y-6" onSubmit={e => e.preventDefault()}>
        {/* Date */}
        <InputField label="Ngày" sublabel="/Date" value={formData.date} onChange={v => updateField('date', v)} placeholder="dd/mm/yyyy" />

        {/* Payer section */}
        <section className="space-y-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-bidv-blue">Bên trả tiền / Payer</h2>
          <InputField label="Tên tài khoản trích nợ" sublabel="/Dr A/C name" value={formData.payerName} onChange={v => updateField('payerName', v)} placeholder="Tên đơn vị / Cá nhân" />
          <InputField label="Địa chỉ" sublabel="/Address" value={formData.payerAddress} onChange={v => updateField('payerAddress', v)} placeholder="Địa chỉ" />
          <InputField label="Số tài khoản trích nợ" sublabel="/Dr A/C No" value={formData.payerAccount} onChange={v => updateField('payerAccount', v)} placeholder="Số tài khoản" mono />
          <InputField label="Tại Ngân hàng" sublabel="/At Bank" value={formData.payerBank} onChange={v => updateField('payerBank', v)} placeholder="BIDV - Chi nhánh..." />
        </section>

        {/* Amount section */}
        <section className="space-y-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-bidv-blue">Số tiền / Amount</h2>
          <div className="relative">
            <InputField label="Số tiền bằng số" sublabel="/Amount in figures" value={displayAmount} onChange={handleAmountChange} placeholder="0" mono />
            <span className="absolute right-0 bottom-2 text-xs text-muted-foreground font-medium">VNĐ</span>
          </div>
          {formData.amountWords && (
            <div className="bg-muted/50 rounded p-2 text-xs italic text-muted-foreground">
              <span className="font-medium text-foreground">Bằng chữ:</span> {formData.amountWords}
            </div>
          )}
        </section>

        {/* Fee type */}
        <section className="space-y-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-bidv-blue">Phí / Fee</h2>
          <div className="flex gap-3 text-xs">
            {[
              { key: 'deduct' as const, label: 'Trong số tiền chuyển' },
              { key: 'cash' as const, label: 'Thu từ tiền mặt' },
              { key: 'account' as const, label: 'Thu từ tài khoản' },
            ].map(opt => (
              <label key={opt.key} className="flex items-center gap-1 cursor-pointer">
                <input type="radio" name="feeType" checked={formData.feeType === opt.key} onChange={() => updateField('feeType', opt.key)} className="accent-bidv-blue" />
                <span className="text-muted-foreground">{opt.label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Beneficiary section */}
        <section className="space-y-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-bidv-blue">Bên nhận tiền / Beneficiary</h2>
          <InputField label="Người hưởng" sublabel="/Beneficiary" value={formData.beneficiaryName} onChange={v => updateField('beneficiaryName', v)} placeholder="Tên người hưởng" />
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Số CCCD/HC" sublabel="/ID No" value={formData.beneficiaryCCCD} onChange={v => updateField('beneficiaryCCCD', v)} placeholder="" mono />
            <InputField label="Ngày cấp" sublabel="/Date" value={formData.cccdDate} onChange={v => updateField('cccdDate', v)} placeholder="dd/mm/yyyy" />
          </div>
          <InputField label="Nơi cấp" sublabel="/Place" value={formData.cccdPlace} onChange={v => updateField('cccdPlace', v)} placeholder="" />
          <InputField label="Địa chỉ" sublabel="/Address" value={formData.beneficiaryAddress} onChange={v => updateField('beneficiaryAddress', v)} placeholder="Địa chỉ người hưởng" />
          <InputField label="Số tài khoản" sublabel="/Ben's A/C No" value={formData.beneficiaryAccount} onChange={v => updateField('beneficiaryAccount', v)} placeholder="Số tài khoản" mono />
          <InputField label="Tại Ngân hàng" sublabel="/At Bank" value={formData.beneficiaryBank} onChange={v => updateField('beneficiaryBank', v)} placeholder="BIDV - Chi nhánh..." />
        </section>

        {/* Remarks */}
        <section className="space-y-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-bidv-blue">Nội dung / Remarks</h2>
          <textarea
            value={formData.remarks}
            onChange={e => updateField('remarks', e.target.value)}
            placeholder="Nội dung thanh toán"
            className="w-full border border-border p-3 rounded bg-transparent outline-none focus:border-bidv-blue transition-colors h-20 resize-none text-sm text-foreground placeholder:text-muted-foreground/50"
          />
        </section>

        {/* Print button */}
        <button
          type="button"
          onClick={() => window.print()}
          className="w-full py-3 bg-bidv-blue text-primary-foreground font-semibold rounded hover:opacity-90 transition-opacity text-sm"
        >
          🖨️ In Ủy nhiệm chi
        </button>
      </form>
    </aside>
  );
}
