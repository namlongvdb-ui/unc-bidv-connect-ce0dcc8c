import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportUNCToPDF() {
  const element = document.getElementById('unc-paper');
  if (!element) {
    alert("Không tìm thấy vùng dữ liệu 'unc-paper' để xuất PDF!");
    return;
  }

  try {
    // 1. Chụp ảnh vùng chỉ định với độ nét cao
    const canvas = await html2canvas(element, {
      scale: 3, // Giữ độ nét cao để in ấn tại PGD Cao Bằng không bị mờ
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    
    // 2. Khởi tạo PDF khổ A4 dọc (p = portrait, mm, a4)
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Kích thước chuẩn của 1 trang A4 tính bằng mm
    const pageWidth = 210;
    const pageHeight = 297;

    // 3. Chèn ảnh phủ kín hoàn toàn 1 trang A4
    // Tham số 0, 0 là tọa độ góc trên cùng bên trái
    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');

    // 4. Lưu file
    const today = new Date().toISOString().slice(0, 10);
    pdf.save(`UNC_BIDV_${today}.pdf`);

  } catch (error) {
    console.error("Lỗi xuất PDF:", error);
    alert("Lỗi hệ thống khi tạo PDF. Hãy kiểm tra lại kết nối mạng hoặc logo.");
  }
}
