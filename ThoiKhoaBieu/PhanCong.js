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

// =========================================================================
// KHỐI GIAO DIỆN: CHUYỂN TAB VÀ ĐIỀU HƯỚNG MÀN HÌNH
// =========================================================================

function moTabPhanCong() {
    // 1. Chuyển đổi trạng thái Active của thanh Menu
    thietLapMenuActive('menuPhanCong');
    
    // 2. Chuyển đổi Khung hiển thị
    document.getElementById('khungTKB').classList.replace('block', 'hidden');
    document.getElementById('khungPhanCong').classList.replace('hidden', 'flex');
    
    // Ẩn tab Thống kê (nếu đang bật)
    let khungTK = document.getElementById('khungThongKe');
    if (khungTK) khungTK.classList.replace('block', 'hidden');

    // 3. Tải lại dữ liệu nếu danh sách đang rỗng (đề phòng lỗi nạp lần đầu)
    if (danhSachGV.length === 0 && typeof google !== 'undefined') {
        google.script.run.withSuccessHandler(khoiTaoGiaoDienPhanCong).layDuLieuKhoiTao();
    }
}

function moTabTKB() {
    // 1. Chuyển đổi trạng thái Active về Menu TKB
    thietLapMenuActive('menuTKB');
    
    // 2. Tắt các khung khác, mở lại khung TKB
    document.getElementById('khungPhanCong').classList.replace('flex', 'hidden');
    let khungTK = document.getElementById('khungThongKe');
    if (khungTK) khungTK.classList.replace('block', 'hidden');
    
    document.getElementById('khungTKB').classList.replace('hidden', 'block');
}

// Hàm hỗ trợ đổi CSS cho Menu
function thietLapMenuActive(idKichHoat) {
    const cacMenu = ['menuTKB', 'menuThongKe', 'menuPhanCong'];
    cacMenu.forEach(id => {
        let m = document.getElementById(id);
        if (m) {
            m.classList.remove('bg-menu-hover', 'border-menu-active');
            m.classList.add('border-transparent');
            let span = m.querySelector('span');
            if (span) {
                span.classList.remove('text-menu-active');
                span.classList.add('text-white');
            }
        }
    });
    
    let mActive = document.getElementById(idKichHoat);
    if (mActive) {
        mActive.classList.remove('border-transparent');
        mActive.classList.add('bg-menu-hover', 'border-menu-active');
        let spanActive = mActive.querySelector('span');
        if (spanActive) { 
            spanActive.classList.remove('text-white'); 
            spanActive.classList.add('text-menu-active'); 
        }
    }
}
