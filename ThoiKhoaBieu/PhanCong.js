let duLieuTongTien = {}; 
let danhSachGV = [];

// Đổi tên hàm để tránh ghi đè sự kiện của app.js
window.onload = function() {
  google.script.run.withSuccessHandler(khoiTaoGiaoDienPhanCong).layDuLieuKhoiTao();
};

// Đổi tên hàm thành khoiTaoGiaoDienPhanCong
function khoiTaoGiaoDienPhanCong(duLieuSever) {
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
