let duLieuTongTien = {}; 
let danhSachGV = [];
let khungChuongTrinhToanTruong = {};

// =========================================================================
// KHỐI 1: GIAO TIẾP MÁY CHỦ (API FETCH)
// =========================================================================
async function taiDuLieuPhanCongTuMayChu() {
    try {
        // Cập nhật giao diện loading đồng bộ với hệ thống
        const tbody = document.getElementById('duLieuLopHoc');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="15" class="text-center py-10 text-slate-500 font-bold">
                <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                Đang kết nối Cổng API máy chủ để lấy Cấu hình Môn học...
            </td></tr>`;
        }

        // Thay thế google.script.run bằng fetch chuẩn
        const phanHoi = await fetch(`${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=layDuLieuKhoiTao`);
        const duLieuSever = await phanHoi.json();
        
        khoiTaoGiaoDienPhanCong(duLieuSever);
    } catch (loi) {
        console.error("Lỗi kết nối khi tải dữ liệu phân công:", loi);
        const tbody = document.getElementById('duLieuLopHoc');
        if (tbody) tbody.innerHTML = `<tr><td colspan="15" class="text-center py-10 text-red-600 font-bold text-lg">Lỗi kết nối hoặc máy chủ từ chối truy cập. Vui lòng thử lại.</td></tr>`;
    }
}

// =========================================================================
// KHỐI 2: KHỞI TẠO VÀ XỬ LÝ LƯỚI GIAO DIỆN PHÂN CÔNG
// =========================================================================
function khoiTaoGiaoDienPhanCong(duLieuSever) {
  danhSachGV = duLieuSever.giaoVien || [];
  khungChuongTrinhToanTruong = duLieuSever.khungChuongTrinh || {}; // Nạp dữ liệu Khung CT
  
  // 1. Render Header Bảng Phân công
  let headerHtml = '<tr><th class="p-2 border border-gray-400 bg-slate-200 sticky left-0 z-30 min-w-[80px]">Mã Lớp</th>';
  if (duLieuSever.monHoc) {
      duLieuSever.monHoc.forEach(mon => {
        headerHtml += `<th class="p-2 border border-gray-400 min-w-[120px]">${mon}</th>`;
      });
  }
  headerHtml += '</tr>';
  document.getElementById('tieuDeMonHoc').innerHTML = headerHtml;

  // 2. Chuẩn bị Options cho Dropdown Giáo viên
  let bodyHtml = '';
  let optionsGV = `<option value=""></option>`;
  danhSachGV.forEach(gv => {
    optionsGV += `<option value="${gv.hoTen}">${gv.hoTen}</option>`;
  });

  // 3. Tạo object tra cứu nhanh dữ liệu phân công đã lưu theo Mã Lớp
  let mapPhanCongDaLuu = {};
  if (duLieuSever.phanCong && duLieuSever.phanCong.length > 0) {
    for (let i = 1; i < duLieuSever.phanCong.length; i++) {
      let rowData = duLieuSever.phanCong[i];
      let tenLop = rowData[0];
      if(tenLop) {
         mapPhanCongDaLuu[tenLop] = rowData;
      }
    }
  }

  // 4. Render Grid lấy danh sách Mã Lớp
  if (duLieuSever.maLop) {
      duLieuSever.maLop.forEach(maLop => {
        bodyHtml += `<tr class="hover:bg-slate-50 transition-colors duration-150 group">
                        <td class="p-2 border border-gray-400 font-extrabold text-slate-900 bg-white sticky left-0 z-10 group-hover:bg-slate-50">${maLop}</td>`;
        
        let duLieuCuCuaLop = mapPhanCongDaLuu[maLop] || [];

        for (let j = 0; j < duLieuSever.monHoc.length; j++) {
          let tenMon = duLieuSever.monHoc[j];
          let gvHienTai = duLieuCuCuaLop[j + 1] || ''; 
          let selectedOptions = optionsGV.replace(`value="${gvHienTai}"`, `value="${gvHienTai}" selected`);
          
          // NÂNG CẤP: Gắn tọa độ (data-lop, data-mon) vào từng thẻ select
          bodyHtml += `<td class="p-0 border border-gray-400 transition-all duration-300 bg-white group-hover:bg-slate-50">
                          <select data-lop="${maLop}" data-mon="${tenMon}" onchange="tinhToanTietDay()" class="w-full h-full min-h-[35px] outline-none appearance-none text-center bg-transparent focus:bg-blue-100 cursor-pointer font-semibold text-slate-800">
                              ${selectedOptions}
                          </select>
                       </td>`;
        }
        bodyHtml += '</tr>';
      });
  }
  
  document.getElementById('duLieuLopHoc').innerHTML = bodyHtml;
  
  // Tính toán định mức sau khi đã render xong lưới
  tinhToanTietDay();
}

// =========================================================================
// KHỐI 3: THỐNG KÊ ĐỊNH MỨC VÀ KIỂM SOÁT
// =========================================================================
function tinhToanTietDay() {
  let thongKe = {};
  danhSachGV.forEach(gv => { thongKe[gv.hoTen] = { dinhMuc: gv.dinhMuc, thucTe: 0 }; });

  const cacTheSelect = document.querySelectorAll('#bangChinh select');
  cacTheSelect.forEach(sl => {
    let tenGV = sl.value;
    if (tenGV && thongKe[tenGV]) {
      // 1. Trích xuất mã lớp và tên môn học từ thuộc tính của thẻ select
      let tenLop = sl.getAttribute('data-lop');
      let tenMon = sl.getAttribute('data-mon');
      
      // 2. Chuyển đổi mã lớp (ví dụ "1A") thành mã Khối (ví dụ "Khoi1")
      let tenKhoi = "Khoi" + tenLop.charAt(0);
      
      // 3. Tra cứu số tiết thực tế trong Khung chương trình chuẩn
      let soTiet = 0;
      if (khungChuongTrinhToanTruong[tenKhoi] && khungChuongTrinhToanTruong[tenKhoi][tenMon]) {
          soTiet = parseInt(khungChuongTrinhToanTruong[tenKhoi][tenMon]) || 0;
      }
      
      // 4. Cộng dồn chính xác số tiết thay vì cộng 1
      thongKe[tenGV].thucTe += soTiet; 
    }
  });

  let tbodyThongKe = '';
  for (const [ten, soLieu] of Object.entries(thongKe)) {
    let textClass = (soLieu.thucTe > soLieu.dinhMuc) ? 'text-red-600 font-extrabold' : 'text-blue-700 font-bold';
    let bgClass = (soLieu.thucTe > soLieu.dinhMuc) ? 'bg-red-50' : 'bg-white';
    
    tbodyThongKe += `
      <tr class="${bgClass} border-b border-gray-300 hover:bg-gray-50 transition-colors">
        <td class="p-2 font-semibold text-slate-800 text-left pl-4 border-r border-gray-300">${ten}</td>
        <td class="p-2 font-bold text-slate-600 border-r border-gray-300">${soLieu.dinhMuc}</td>
        <td class="p-2 ${textClass} text-lg">${soLieu.thucTe}</td>
      </tr>
    `;
  }
  document.getElementById('duLieuThongKe').innerHTML = tbodyThongKe;
}
// =========================================================================
// KHỐI 4: ĐIỀU HƯỚNG MÀN HÌNH (GẮN KẾT VỚI INDEX.HTML)
// =========================================================================
function moTabPhanCong() {
    thietLapMenuActive('menuPhanCong');
    
    let khungTKB = document.getElementById('khungTKB');
    if (khungTKB) khungTKB.classList.replace('block', 'hidden');
    
    let khungPC = document.getElementById('khungPhanCong');
    if (khungPC) khungPC.classList.replace('hidden', 'flex');
    
    let khungTK = document.getElementById('khungThongKe');
    if (khungTK) khungTK.classList.replace('block', 'hidden');

    // Tự động tải dữ liệu khi giáo viên mở tab lần đầu
    if (danhSachGV.length === 0) {
        taiDuLieuPhanCongTuMayChu();
    }
}

function moTabTKB() {
    thietLapMenuActive('menuTKB');
    
    let khungPC = document.getElementById('khungPhanCong');
    if (khungPC) khungPC.classList.replace('flex', 'hidden');
    
    let khungTK = document.getElementById('khungThongKe');
    if (khungTK) khungTK.classList.replace('block', 'hidden');
    
    let khungTKB = document.getElementById('khungTKB');
    if (khungTKB) khungTKB.classList.replace('hidden', 'block');
}

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
