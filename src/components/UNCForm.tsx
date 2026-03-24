import { useState, useEffect } from 'react';
import { UNCFormData } from '@/hooks/useUNCForm';
import { Beneficiary } from '@/hooks/useBeneficiaries';
import { numberToVietnameseWords, formatCurrency } from '@/lib/numberToWords';
import { TransactionRecord } from '@/hooks/useTransactionHistory';
import { exportUNCToPDF } from '@/lib/exportPDF';

interface Props {
  formData: UNCFormData;
  updateField: (field: keyof UNCFormData, value: string) => void;
  beneficiaries: Beneficiary[];
  onSaveBeneficiary: (b: Omit<Beneficiary, 'id'>) => void;
  onRemoveBeneficiary: (id: string) => void;
  history: TransactionRecord[];
  onSaveTransaction: () => void;
  onLoadTransaction: (record: TransactionRecord) => void;
  onRemoveTransaction: (id: string) => void;
}

const InputField = ({ label, sublabel, value, onChange, placeholder, mono, type }: {
  label: string; sublabel?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; mono?: boolean; type?: string;
}) => (
  <div className="group">
    <label className="block text-[11px] font-bold text-muted-foreground/70 mb-1 uppercase tracking-wider transition-colors group-focus-within:text-bidv-blue">
      {label} {sublabel && <span className="font-normal italic text-muted-foreground/50">{sublabel}</span>}
    </label>
    <input
      type={type || 'text'}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full border-b border-border/60 py-2 bg-transparent outline-none focus:border-bidv-blue focus:ring-0 transition-all text-sm text-foreground placeholder:text-muted-foreground/30 ${mono ? 'font-mono tracking-widest text-bidv-blue' : ''}`}
    />
  </div>
);

export default function UNCForm({ 
  formData, updateField, beneficiaries, onSaveBeneficiary, onRemoveBeneficiary, 
  history, onSaveTransaction, onLoadTransaction, onRemoveTransaction 
}: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const [showHistory, setShowHistory] = useState(false); 
  const [exporting, setExporting] = useState(false);

  // Hàm tự động định dạng ngày tháng dd/mm/yyyy
  const handleDateChange = (field: keyof UNCFormData, val: string) => {
    let cleaned = val.replace(/\D/g, '').slice(0, 8);
    if (cleaned.length >= 5) {
      cleaned = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4)}`;
    } else if (cleaned.length >= 3) {
      cleaned = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    updateField(field, cleaned);
  };

  const handleExportPDF = async () => {
    if (formData.beneficiaryName && formData.amount) {
      onSaveTransaction();
    }
    setExporting(true);
    try {
      await exportUNCToPDF();
    } catch (e) {
      console.error('PDF export failed', e);
    } finally {
      setExporting(false);
    }
  };

  const handleSetDefault = () => {
    updateField('payerName', 'NHPTVN-Chi nhánh KV Bắc Đông Bắc,PGD Cao Bằng');
    updateField('payerAddress', 'Số 32, phố Xuân Trường, phường Thục Phán, tỉnh Cao Bằng');
    updateField('payerAccount', '3300013207');
    updateField('payerBank', 'BIDV - Chi nhánh Cao Bằng');

    updateField('beneficiaryName', 'Danh sách cá nhân kèm theo');
    updateField('beneficiaryAccount', '280701009');
    updateField('beneficiaryBank', 'BIDV - Chi nhánh Cao Bằng');
    updateField('beneficiaryCCCD', '');
    updateField('cccdDate', '');
    updateField('cccdPlace', '');
    updateField('beneficiaryAddress', '');
    updateField('remarks', '');
  };

  const handleNewForm = () => {
    const fields: (keyof UNCFormData)[] = [
      'payerName', 'payerAddress', 'payerAccount', 'payerBank',
      'beneficiaryName', 'beneficiaryAccount', 'beneficiaryBank', 
      'beneficiaryCCCD', 'cccdDate', 'cccdPlace', 'beneficiaryAddress',
      'amount', 'amountWords', 'remarks', 'feeType'
    ];
    fields.forEach(field => updateField(field, ''));
  };

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

  const handleFeeToggle = (id: string) => {
    updateField('feeType', formData.feeType === id ? '' : id);
  };

  const handleSaveBeneficiary = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!formData.beneficiaryName || !formData.beneficiaryAccount) {
      alert("Vui lòng nhập tên và số tài khoản người hưởng!");
      return;
    }
    onSaveBeneficiary({
      name: formData.beneficiaryName,
      account: formData.beneficiaryAccount,
      bank: formData.beneficiaryBank,
      address: formData.beneficiaryAddress,
      cccd: formData.beneficiaryCCCD,
      cccdDate: formData.cccdDate,
      cccdPlace: formData.cccdPlace
    });
  };

  const selectBeneficiary = (b: Beneficiary) => {
    updateField('beneficiaryName', b.name);
    updateField('beneficiaryAccount', b.account);
    updateField('beneficiaryBank', b.bank || '');
    updateField('beneficiaryAddress', b.address || '');
    updateField('beneficiaryCCCD', b.cccd || '');
    updateField('cccdDate', b.cccdDate || '');
    updateField('cccdPlace', b.cccdPlace || '');
    setShowPicker(false);
  };

  const selectHistoryRecord = (record: TransactionRecord) => {
    onLoadTransaction(record);
    setShowHistory(false);
  };

  const displayAmount = formData.amount ? formatCurrency(parseInt(formData.amount)) : '';

  return (
    <aside className="w-[440px] shrink-0 bg-[#f8fafc] border-r border-border flex flex-col h-screen overflow-hidden relative shadow-2xl">
      
      {/* MODAL: DANH BẠ */}
      {showPicker && (
        <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-xl p-6 flex flex-col animate-in fade-in zoom-in duration-300">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h3 className="font-bold text-bidv-blue uppercase text-sm tracking-widest flex items-center gap-2">
               📇 Danh bạ người hưởng
            </h3>
            <button onClick={() => setShowPicker(false)} className="px-3 py-1 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-muted-foreground rounded-lg text-[10px] font-bold transition-all border border-border uppercase">
              Đóng
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {beneficiaries && beneficiaries.length > 0 ? (
              beneficiaries.map((b) => (
                <div key={b.id} onClick={() => selectBeneficiary(b)} className="p-4 border border-border bg-white rounded-2xl hover:border-bidv-blue hover:shadow-md cursor-pointer transition-all group relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-bidv-blue transform -translate-x-full group-hover:translate-x-0 transition-transform" />
                  <p className="font-bold text-sm uppercase text-slate-800 tracking-tight">{b.name}</p>
                  <p className="text-xs font-mono text-bidv-blue mt-1.5 font-semibold tracking-tighter">{b.account}</p>
                  <button onClick={(e) => { e.stopPropagation(); onRemoveBeneficiary(b.id); }} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-red-500 text-sm transition-opacity hover:scale-125">🗑️</button>
                </div>
              ))
            ) : (
              <div className="text-center py-20 text-xs text-muted-foreground italic">Chưa có người hưởng nào.</div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: LỊCH SỬ */}
      {showHistory && (
        <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-xl p-6 flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-300">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h3 className="font-bold text-bidv-blue uppercase text-sm tracking-widest flex items-center gap-2">
              🕒 Lịch sử lập UNC
            </h3>
            <button onClick={() => setShowHistory(false)} className="px-3 py-1 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-muted-foreground rounded-lg text-[10px] font-bold transition-all border border-border uppercase">
              Đóng
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {history && history.length > 0 ? (
              [...history].reverse().map((record) => {
                const targetData = record.data || record;
                const bName = targetData.beneficiaryName || "N/A";
                const amt = targetData.amount || "0";

                return (
                  <div key={record.id} onClick={() => selectHistoryRecord(record)} className="p-4 border border-border bg-white rounded-2xl hover:border-bidv-blue hover:shadow-md cursor-pointer transition-all group relative">
                    <p className="font-bold text-xs uppercase text-slate-800 truncate w-[85%]">{bName}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-[10px] font-medium text-slate-400">{record.timestamp}</span>
                      <span className="text-sm font-mono font-bold text-bidv-blue">{formatCurrency(parseInt(amt))}đ</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onRemoveTransaction(record.id); }} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-red-500 text-sm transition-opacity">🗑️</button>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20 text-xs text-muted-foreground italic">Chưa có lịch sử giao dịch.</div>
            )}
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="bg-primary px-5 py-5 text-primary-foreground text-center relative overflow-hidden shrink-0 shadow-lg">
        <style>{`
          @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
          .animate-copy-right { display: inline-block; white-space: nowrap; animation: marquee 18s linear infinite; }
        `}</style>
        <h2 className="text-xl font-black uppercase tracking-[0.2em]">Lập ủy nhiệm chi</h2>
        <div className="w-full border-t border-primary-foreground/10 mt-3 pt-2 overflow-hidden">
          <div className="animate-copy-right text-[10px] font-bold opacity-60 tracking-[0.1em] uppercase">
            Copyright by Trần Nam Long — VDB Chi nhánh KV Bắc Đông Bắc, PGD Cao Bằng
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8 custom-scrollbar">
        
        {/* SECTION: THÔNG TIN CHUNG */}
        <div className="flex items-end gap-4 bg-white p-4 rounded-2xl border border-border/40 shadow-sm">
            <div className="flex-1">
                <InputField label="📅 Ngày lập lệnh" value={formData.date} onChange={v => handleDateChange('date', v)} placeholder="DD/MM/YYYY" />
            </div>
            <div className="flex gap-2 pb-1">
              <button onClick={handleNewForm} className="text-[10px] px-3 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-md active:scale-95 uppercase tracking-tighter flex items-center gap-1">
                ✨ Mới
              </button>
              <button onClick={handleSetDefault} className="text-[10px] px-3 py-2 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-all shadow-md active:scale-95 uppercase tracking-tighter flex items-center gap-1">
                🏠 Gốc
              </button>
            </div>
        </div>

        {/* SECTION: BÊN TRẢ TIỀN */}
        <div className="space-y-4 p-5 bg-white rounded-3xl border border-border/50 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-5 text-4xl font-black italic select-none">SENDER</div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
            💳 Bên trả tiền (Payer)
          </p>
          <InputField label="Tên tài khoản trích nợ" value={formData.payerName} onChange={v => updateField('payerName', v)} />
          <InputField label="Địa chỉ" value={formData.payerAddress} onChange={v => updateField('payerAddress', v)} />
          <div className="grid grid-cols-2 gap-5">
            <InputField label="Số tài khoản" value={formData.payerAccount} onChange={v => updateField('payerAccount', v)} mono />
            <InputField label="Tại Ngân hàng" value={formData.payerBank} onChange={v => updateField('payerBank', v)} />
          </div>
        </div>

        {/* SECTION: SỐ TIỀN & PHÍ */}
        <div className="space-y-6 p-5 bg-white rounded-3xl border border-border/50 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-5 text-4xl font-black italic select-none">AMOUNT</div>
          <div className="grid grid-cols-1 gap-5">
            <InputField label="💰 Số tiền thanh toán" value={displayAmount} onChange={handleAmountChange} placeholder="0" mono />
            <div className="group">
              <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-2 tracking-wider">Số tiền bằng chữ</label>
              <div className="text-[12px] text-bidv-blue font-semibold italic bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200 leading-relaxed min-h-[50px] flex items-center shadow-inner">
                {formData.amountWords || <span className="text-muted-foreground/30 font-normal italic text-[10px]">Tự động dịch số tiền...</span>}
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">⚙️ Phương thức thu phí</label>
            <div className="grid grid-cols-1 gap-2.5">
              {[{ id: 'deduct', label: 'Phí trong số tiền chuyển' }, { id: 'cash', label: 'Phí thu từ tiền mặt' }, { id: 'account', label: 'Phí thu từ tài khoản' }].map(ft => (
                <div key={ft.id} onClick={() => handleFeeToggle(ft.id)} className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all cursor-pointer select-none ${formData.feeType === ft.id ? 'bg-bidv-blue/5 border-bidv-blue text-bidv-blue shadow-md' : 'bg-background border-slate-100 text-slate-500 hover:border-slate-200'}`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${formData.feeType === ft.id ? 'border-bidv-blue bg-bidv-blue' : 'border-slate-300'}`}>
                    {formData.feeType === ft.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className={`text-[11px] ${formData.feeType === ft.id ? 'font-black' : 'font-medium'}`}>{ft.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION: NGƯỜI HƯỞNG */}
        <div className="space-y-5 p-5 bg-white rounded-3xl border border-emerald-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-5 text-4xl font-black italic select-none">RECEIVER</div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-2">
               👥 Người hưởng thụ
            </p>
            <div className="flex gap-1.5">
              <button onClick={handleSaveBeneficiary} className="text-[9px] px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-all uppercase tracking-tighter shadow-md flex items-center gap-1">
                💾 Lưu
              </button>
              <button onClick={() => setShowPicker(true)} className="text-[9px] px-2.5 py-1.5 bg-bidv-blue text-white rounded-lg font-bold hover:opacity-90 transition-all uppercase tracking-tighter shadow-md flex items-center gap-1">
                📖 Sổ
              </button>
              <button onClick={() => setShowHistory(true)} className="text-[9px] px-2.5 py-1.5 bg-slate-600 text-white rounded-lg font-bold hover:opacity-90 transition-all uppercase tracking-tighter shadow-md flex items-center gap-1">
                ⌛ Sử
              </button>
            </div>
          </div>
          <InputField label="Họ và tên người nhận" value={formData.beneficiaryName} onChange={v => updateField('beneficiaryName', v)} />
          <div className="grid grid-cols-2 gap-5">
            <InputField label="Số tài khoản" value={formData.beneficiaryAccount} onChange={v => updateField('beneficiaryAccount', v)} mono />
            <InputField label="Tại Ngân hàng" value={formData.beneficiaryBank} onChange={v => updateField('beneficiaryBank', v)} />
          </div>
          <InputField label="Địa chỉ" value={formData.beneficiaryAddress} onChange={v => updateField('beneficiaryAddress', v)} />
          
          <div className="grid grid-cols-1 gap-5 pt-4 mt-2 border-t border-slate-50 bg-slate-50/50 p-4 rounded-2xl">
            <InputField label="🆔 Số CCCD/Hộ chiếu" value={formData.beneficiaryCCCD} onChange={v => updateField('beneficiaryCCCD', v)} mono />
            <div className="grid grid-cols-2 gap-5">
              <InputField label="🗓️ Ngày cấp" value={formData.cccdDate} onChange={v => handleDateChange('cccdDate', v)} placeholder="DD/MM/YYYY" />
              <InputField label="📍 Nơi cấp" value={formData.cccdPlace} onChange={v => updateField('cccdPlace', v)} />
            </div>
          </div>
        </div>

        <div className="pb-6 bg-white p-5 rounded-3xl border border-border/40 shadow-sm">
            <InputField label="📝 Nội dung thanh toán" value={formData.remarks} onChange={v => updateField('remarks', v)} placeholder="Ví dụ: Chuyển tiền thanh toán..." />
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="px-6 py-6 border-t border-border bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.04)] shrink-0">
        <div className="flex gap-4">
          <button onClick={handleExportPDF} disabled={exporting} className="flex-[2.5] bg-bidv-blue text-white py-4 rounded-2xl font-black text-sm hover:brightness-110 disabled:opacity-50 transition-all shadow-xl active:scale-[0.97] flex items-center justify-center gap-3 uppercase tracking-widest">
            {exporting ? '🚀 ĐANG XỬ LÝ...' : (
                <>
                    <span className="text-xl">📄</span> XUẤT PDF A4
                </>
            )}
          </button>
          <button onClick={() => { if (formData.beneficiaryName && formData.amount) onSaveTransaction(); window.print(); }} className="flex-1 px-4 py-4 border-2 border-slate-200 rounded-2xl text-sm font-black text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.97] flex items-center justify-center gap-2">
            <span className="text-xl">🖨️</span> IN
          </button>
        </div>
      </div>
    </aside>
  );
}
