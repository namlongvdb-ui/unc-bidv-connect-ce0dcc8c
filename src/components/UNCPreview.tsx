import { UNCFormData } from '@/hooks/useUNCForm';
import { formatCurrency } from '@/lib/numberToWords';
import bidvLogo from '@/assets/bidv-logo.png';
import bidvWatermark from '@/assets/bidv-watermark.jpg';

interface Props {
  formData: UNCFormData;
}

const DottedValue = ({ value, mono }: { value: string; mono?: boolean }) => (
  <span className={`border-b border-dotted border-ink/30 flex-1 pb-0.5 min-h-[1.2em] ${mono ? 'font-mono tracking-[0.12em]' : ''}`}>
    {value || '\u00A0'}
  </span>
);

const FieldRow = ({ label, sublabel, value, mono }: { label: string; sublabel: string; value: string; mono?: boolean }) => (
  <div className="flex gap-2 items-baseline leading-relaxed">
    <span className="font-semibold whitespace-nowrap text-ink">{label}</span>
    <span className="italic text-ink/60 whitespace-nowrap text-[8.5pt]">/{sublabel}:</span>
    <DottedValue value={value} mono={mono} />
  </div>
);

const Checkbox = ({ checked }: { checked: boolean }) => (
  <span className="inline-block w-[12px] h-[12px] border border-ink/60 align-middle mr-1 relative">
    {checked && <span className="absolute inset-0 flex items-center justify-center text-[10px] leading-none font-bold text-ink">✓</span>}
  </span>
);

export default function UNCPreview({ formData }: Props) {
  const displayAmount = formData.amount ? formatCurrency(parseInt(formData.amount)) : '';

  return (
    <main className="flex-1 overflow-auto p-8 flex justify-center items-start bg-desk min-h-0">
      <div
        id="unc-paper"
        className="relative bg-paper shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] origin-top"
        style={{
          width: '210mm',
          minHeight: '297mm',
          padding: '12mm 15mm 10mm 15mm',
          fontFamily: '"Be Vietnam Pro", sans-serif',
          fontSize: '10.5pt',
          color: 'hsl(0 0% 12%)',
          lineHeight: '1.6',
        }}
      >
        {/* Watermark */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden print:opacity-100" style={{ zIndex: 0 }}>
          <img src={bidvWatermark} alt="" className="w-full h-full object-cover opacity-[0.18]" style={{ mixBlendMode: 'multiply' }} />
        </div>

        {/* Content over watermark */}
        <div className="relative" style={{ zIndex: 1 }}>
          {/* Header */}
          <div className="flex items-start justify-between mb-1">
            <div className="flex-shrink-0">
              <img src={bidvLogo} alt="BIDV" className="h-[40px] object-contain" />
            </div>
            <div className="text-center flex-1 px-4">
              <h1 className="text-[16pt] font-bold text-bidv-blue leading-tight tracking-wide">ỦY NHIỆM CHI</h1>
              <p className="text-[9pt] italic text-ink/60">PAYMENT ORDER</p>
            </div>
            <div className="text-right text-[9pt] flex-shrink-0 text-ink/70">
              <p>Mẫu số: C014</p>
            </div>
          </div>

          {/* Date */}
          <div className="text-right mb-3">
            <span className="font-semibold text-ink">Ngày</span>
            <span className="italic text-ink/60 text-[8.5pt]">/Date: </span>
            <span className="font-semibold">{formData.date}</span>
          </div>

          {/* Divider */}
          <div className="border-t-[1.5px] border-bidv-blue mb-3" />

          {/* Payer Section */}
          <div className="space-y-[3px] mb-2">
            <FieldRow label="Tên tài khoản trích nợ" sublabel="Dr A/C name" value={formData.payerName} />
            <FieldRow label="Địa chỉ" sublabel="Address" value={formData.payerAddress} />
            <FieldRow label="Số tài khoản trích nợ" sublabel="Dr A/C No" value={formData.payerAccount} mono />
            <FieldRow label="Tại Ngân hàng" sublabel="At Bank" value={formData.payerBank} />
          </div>

          <div className="border-t border-ink/10 my-2" />

          {/* Amount */}
          <div className="space-y-[3px] mb-2">
            <div className="flex gap-2 items-baseline">
              <span className="font-semibold whitespace-nowrap">Số tiền bằng số</span>
              <span className="italic text-ink/60 whitespace-nowrap text-[8.5pt]">/Amount in figures:</span>
              <span className="font-bold font-mono tracking-wider text-[12pt] flex-1">{displayAmount}</span>
              {displayAmount && <span className="font-semibold text-[10pt]">VNĐ</span>}
            </div>
            <div className="flex gap-2 items-baseline">
              <span className="font-semibold whitespace-nowrap">Số tiền bằng chữ</span>
              <span className="italic text-ink/60 whitespace-nowrap text-[8.5pt]">/Amount in words:</span>
              <DottedValue value={formData.amountWords} />
            </div>
          </div>

          {/* Exchange & Fee */}
          <div className="space-y-[3px] mb-2 text-[9.5pt]">
            <div className="flex gap-2 items-baseline">
              <span className="font-semibold whitespace-nowrap">Đề nghị quy đổi ra</span>
              <span className="italic text-ink/60 text-[8.5pt]">/Request for changing into:</span>
              <DottedValue value="" />
              <span className="font-semibold whitespace-nowrap ml-2">Tỷ giá</span>
              <span className="italic text-ink/60 text-[8.5pt]">/Ex rate:</span>
              <DottedValue value="" />
            </div>
            <div className="flex gap-4 items-center">
              <span>
                <Checkbox checked={formData.feeType === 'deduct'} />
                <span className="font-semibold">Phí trong số tiền chuyển</span>
                <span className="italic text-ink/60 text-[8pt]">/Deduct</span>
              </span>
              <span>
                <Checkbox checked={formData.feeType === 'cash'} />
                <span className="font-semibold">Phí thu từ tiền mặt</span>
                <span className="italic text-ink/60 text-[8pt]">/Fee in cash</span>
              </span>
            </div>
            <div>
              <Checkbox checked={formData.feeType === 'account'} />
              <span className="font-semibold">Phí thu từ tài khoản</span>
              <span className="italic text-ink/60 text-[8pt]">/Fee collected from A/C:</span>
            </div>
          </div>

          <div className="border-t border-ink/10 my-2" />

          {/* Beneficiary Section */}
          <div className="space-y-[3px] mb-2">
            <FieldRow label="Người hưởng" sublabel="Beneficiary" value={formData.beneficiaryName} />
            <div className="flex gap-4">
              <div className="flex gap-2 items-baseline flex-1">
                <span className="font-semibold whitespace-nowrap">Số CCCD/HC</span>
                <span className="italic text-ink/60 text-[8.5pt]">/ID No:</span>
                <DottedValue value={formData.beneficiaryCCCD} mono />
              </div>
              <div className="flex gap-2 items-baseline">
                <span className="font-semibold whitespace-nowrap">Ngày cấp</span>
                <span className="italic text-ink/60 text-[8.5pt]">/Date:</span>
                <DottedValue value={formData.cccdDate} />
              </div>
            </div>
            <div className="flex gap-2 items-baseline">
              <span className="font-semibold whitespace-nowrap">Nơi cấp</span>
              <span className="italic text-ink/60 text-[8.5pt]">/Place:</span>
              <DottedValue value={formData.cccdPlace} />
            </div>
            <FieldRow label="Địa chỉ" sublabel="Address" value={formData.beneficiaryAddress} />
            <FieldRow label="Số tài khoản" sublabel="Ben's A/C No" value={formData.beneficiaryAccount} mono />
            <FieldRow label="Tại Ngân hàng" sublabel="At Bank" value={formData.beneficiaryBank} />
          </div>

          <div className="border-t border-ink/10 my-2" />

          {/* Remarks */}
          <div className="space-y-[3px] mb-4">
            <FieldRow label="Nội dung" sublabel="Remarks" value={formData.remarks} />
          </div>

          {/* Confirmation text */}
          <p className="text-[8.5pt] italic text-ink/70 mb-6 text-center">
            <span className="font-semibold not-italic text-ink">Khách hàng xác nhận các thông tin trên là chính xác</span>
            <br />
            <span>Please sign to confirm the above information is accurate</span>
          </p>

          {/* Signatures */}
          <div className="grid grid-cols-[1fr_1fr_2px_1fr_1fr] gap-x-4 text-center text-[8.5pt] mt-4">
            <div>
              <p className="font-bold uppercase text-[9pt]">Kế toán trưởng</p>
              <p className="italic text-ink/50 text-[7.5pt]">Chief Accountant</p>
              <p className="italic text-ink/40 text-[7pt] mt-1">(Ký và ghi rõ họ tên)</p>
              <p className="italic text-ink/40 text-[7pt]">Signature & full name</p>
              <div className="h-[60px]" />
            </div>
            <div>
              <p className="font-bold uppercase text-[9pt]">Chủ tài khoản</p>
              <p className="italic text-ink/50 text-[7.5pt]">Accountholder</p>
              <p className="italic text-ink/40 text-[7pt] mt-1">(Ký và ghi rõ họ tên)</p>
              <p className="italic text-ink/40 text-[7pt]">Signature & full name</p>
              <div className="h-[60px]" />
            </div>
            <div className="bg-ink/10" />
            <div>
              <p className="font-bold uppercase text-[9pt]">Giao dịch viên</p>
              <p className="italic text-ink/50 text-[7.5pt]">Teller</p>
              <div className="h-[70px]" />
            </div>
            <div>
              <p className="font-bold uppercase text-[9pt]">Kiểm soát viên</p>
              <p className="italic text-ink/50 text-[7.5pt]">Supervisor</p>
              <div className="h-[70px]" />
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-[8mm] left-[15mm] right-[15mm] border-t border-ink/20 pt-2 flex justify-between text-[7.5pt] text-ink/50">
            <p className="italic font-semibold">Ngân hàng TMCP Đầu tư và Phát triển Việt Nam</p>
            <p>
              <span className="font-semibold">Website:</span> www.bidv.com.vn
              <span className="ml-3 font-semibold">Hotline:</span> 1900 9247
            </p>
          </div>

          {/* Thank you message */}
          <div className="text-center text-[8pt] text-ink/40 italic mt-8">
            <p>Cảm ơn quý khách hàng đã sử dụng dịch vụ của BIDV</p>
            <p>Thank you for using BIDV's services</p>
          </div>
        </div>
      </div>
    </main>
  );
}
