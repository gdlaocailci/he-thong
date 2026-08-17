let duLieuTongTien = {}; 
let danhSachGV = [];

// Tải dữ liệu ngay khi mở ứng dụng
window.onload = function() {
  google.script.run.withSuccessHandler(khoiTaoGiaoDien).layDuLieuKhoiTao();
};

function khoiTaoGiaoDien(duLieuSever) {
  danhSachGV = duLieuSever.giaoVien;
  
  // 1. Render Header Bảng Phân công (Mã Lớp + Các Môn học dọc thành ngang)
  let headerHtml = '<tr><th>Mã Lớp</th>';
  duLieuSever.monHoc.forEach(mon => {
    headerHtml += `<th>${mon}</th>`;
  });
  headerHtml += '</tr>';
  document.getElementById('tieuDeMonHoc').innerHTML = headerHtml;

  // 2. Chuẩn bị Options cho Dropdown Giáo viên
  let bodyHtml = '';
  let optionsGV = `<option value="">-- Chọn --</option>`;
  danhSachGV.forEach(gv => {
    optionsGV += `<option value="${gv.hoTen}">${gv.hoTen}</option>`;
  });

  // 3. Nâng cấp: Tạo object tra cứu nhanh dữ liệu phân công đã lưu theo Mã Lớp
  let mapPhanCongDaLuu = {};
  if (duLieuSever.phanCong && duLieuSever.phanCong.length > 0) {
    // Bỏ qua dòng tiêu đề (index 0)
    for (let i = 1; i < duLieuSever.phanCong.length; i++) {
      let rowData = duLieuSever.phanCong[i];
      let tenLop = rowData[0];
      if(tenLop) {
         mapPhanCongDaLuu[tenLop] = rowData;
      }
    }
  }

  // 4. Render Grid lấy danh sách Mã Lớp từ DM_LOP làm trục (Rows)
  duLieuSever.maLop.forEach(maLop => {
    bodyHtml += `<tr><td><strong>${maLop}</strong></td>`;
    
    // Lấy dòng dữ liệu phân công cũ của lớp này ra (nếu đã từng lưu)
    let duLieuCuCuaLop = mapPhanCongDaLuu[maLop] || [];

    // Render dropdown cho từng môn học ngang theo cột
    for (let j = 0; j < duLieuSever.monHoc.length; j++) {
      // j+1 do cột đầu tiên (index 0) của dữ liệu cũ là Mã lớp
      let gvHienTai = duLieuCuCuaLop[j + 1] || ''; 
      
      let selectedOptions = optionsGV.replace(`value="${gvHienTai}"`, `value="${gvHienTai}" selected`);
      bodyHtml += `<td><select onchange="tinhToanTietDay()">${selectedOptions}</select></td>`;
    }
    bodyHtml += '</tr>';
  });
  
  document.getElementById('duLieuLopHoc').innerHTML = bodyHtml;

  // Lần đầu chạy hàm thống kê hiển thị số tiết
  tinhToanTietDay();
}

// Hàm tính toán số tiết realtime khi thay đổi dropdown
function tinhToanTietDay() {
  // Reset số tiết hiện tại về 0
  let thongKe = {};
  danhSachGV.forEach(gv => { thongKe[gv.hoTen] = { dinhMuc: gv.dinhMuc, thucTe: 0 }; });

  // Đếm số lần xuất hiện trong các thẻ select
  const cacTheSelect = document.querySelectorAll('#bangChinh select');
  cacTheSelect.forEach(sl => {
    let tenGV = sl.value;
    if (tenGV && thongKe[tenGV]) {
      // CHÚ Ý: Mặc định ở đây tính 1 ô = 1 tiết. Cần nhân hệ số môn nếu có.
      thongKe[tenGV].thucTe += 1; 
    }
  });

  // Render lại bảng thống kê
  let tbodyThongKe = '';
  for (const [ten, soLieu] of Object.entries(thongKe)) {
    let lopCanhBao = (soLieu.thucTe > soLieu.dinhMuc) ? 'vuot-dinh-muc' : '';
    tbodyThongKe += `
      <tr>
        <td>${ten}</td>
        <td>${soLieu.dinhMuc}</td>
        <td class="${lopCanhBao}">${soLieu.thucTe}</td>
      </tr>
    `;
  }
  document.getElementById('duLieuThongKe').innerHTML = tbodyThongKe;
}

function xuLyLuuTru() {
  // Code duyệt qua HTML Table đóng gói thành Mảng 2 chiều và gọi google.script.run.luuDuLieuPhanCong()
  alert('Chức năng thu thập mảng và lưu trữ sẵn sàng tích hợp.');
}
