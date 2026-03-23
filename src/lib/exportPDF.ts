import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportUNCToPDF() {
  // Tìm vùng chứa mẫu in (phần preview)
  const element = document.getElementById('unc-paper');
  
  if (!element) {
    alert("Không tìm thấy vùng dữ liệu để xuất PDF. Vui lòng kiểm tra lại ID 'unc-paper'.");
    return;
  }

  try {
    // Cấu hình chụp ảnh màn hình độ phân giải cao
    const canvas = await html2canvas(element, {
      scale: 3, // Tăng độ nét gấp 3 lần
      useCORS: true, // Cho phép nạp logo nếu dùng link ảnh ngoài
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      // Đảm bảo chụp đúng kích thước mẫu
      width: element.offsetWidth,
      height: element.offsetHeight
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    // Chèn ảnh vào PDF (Căn lề 0,0 để giống y hệt preview)
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    const fileName = `UNC_BIDV_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.pdf`;
    pdf.save(fileName);

  } catch (error) {
    console.error("Lỗi khi tạo PDF:", error);
    alert("Có lỗi xảy ra khi đóng gói PDF. Hãy thử lại.");
  }
}
