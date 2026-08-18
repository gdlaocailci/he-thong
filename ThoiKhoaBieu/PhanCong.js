let duLieuTongTien = {}; 
let danhSachGV = [];
let khungChuongTrinhToanTruong = {}; // Khởi tạo biến lưu trữ định mức Khung Chương Trình

// =========================================================================
// KHỐI 1: GIAO TIẾP MÁY CHỦ (API FETCH)
// =========================================================================
async function taiDuLieuPhanCongTuMayChu() {
    try {
        const tbody = document.getElementById('duLieuLopHoc');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="15" class="text-center py-10 text-slate-500 font-bold">
                <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                Đang kết nối Cổng API máy chủ để lấy Cấu hình Môn học...
            </td></tr>`;
        }

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
  khungChuongTrinhToanTruong = duLieuSever.khungChuongTrinh || {}; 
  
  // NÂNG CẤP: Đổi p-2 thành py-1 px-2 để giảm chiều cao tiêu đề bảng
  let headerHtml = '<tr><th class="py-1 px-2 border border-gray-400 bg-slate-200 sticky left-0 z-30 min-w-[80px]">Mã Lớp</th>';
  if (duLieuSever.monHoc) {
      duLieuSever.monHoc.forEach(mon => {
        headerHtml += `<th class="py-1 px-2 border border-gray-400 min-w-[120px]">${mon}</th>`;
      });
  }
  headerHtml += '</tr>';
  document.getElementById('tieuDeMonHoc').innerHTML = headerHtml;

  let bodyHtml = '';
  let optionsGV = `<option value=""></option>`;
  danhSachGV.forEach(gv => {
    optionsGV += `<option value="${gv.hoTen}">${gv.hoTen}</option>`;
  });

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

  if (duLieuSever.maLop) {
      duLieuSever.maLop.forEach(maLop => {
        // NÂNG CẤP: Đổi p-2 thành py-1 px-2 ở cột Mã lớp
        bodyHtml += `<tr class="hover:bg-slate-50 transition-colors duration-150 group">
                        <td class="py-1 px-2 border border-gray-400 font-extrabold text-slate-900 bg-white sticky left-0 z-10 group-hover:bg-slate-50">${maLop}</td>`;
        
        let duLieuCuCuaLop = mapPhanCongDaLuu[maLop] || [];

        for (let j = 0; j < duLieuSever.monHoc.length; j++) {
          let tenMon = duLieuSever.monHoc[j];
          let gvHienTai = duLieuCuCuaLop[j + 1] || ''; 
          let selectedOptions = optionsGV.replace(`value="${gvHienTai}"`, `value="${gvHienTai}" selected`);
          
          // NÂNG CẤP: Giảm min-h-[35px] xuống min-h-[26px] để thu hẹp thẻ select
          bodyHtml += `<td class="p-0 border border-gray-400 transition-all duration-300 bg-white group-hover:bg-slate-50">
                          <select data-lop="${maLop}" data-mon="${tenMon}" onchange="tinhToanTietDay()" class="w-full h-full min-h-[26px] outline-none appearance-none text-center bg-transparent focus:bg-blue-100 cursor-pointer font-semibold text-slate-800">
                              ${selectedOptions}
                          </select>
                       </td>`;
        }
        bodyHtml += '</tr>';
      });
  }
  
  document.getElementById('duLieuLopHoc').innerHTML = bodyHtml;
  tinhToanTietDay();
}

// =========================================================================
// KHỐI 3: THỐNG KÊ ĐỊNH MỨC VÀ KIỂM SOÁT TỔNG HỢP CHI TIẾT
// =========================================================================
function tinhToanTietDay() {
  let thongKe = {};
  
  danhSachGV.forEach(gv => { thongKe[gv.hoTen] = { dinhMuc: gv.dinhMuc, thucTe: 0, chiTiet: [] }; });

  const cacTheSelect = document.querySelectorAll('#bangChinh select');
  cacTheSelect.forEach(sl => {
    let tenGV = sl.value;
    if (tenGV && thongKe[tenGV]) {
      let tenLop = sl.getAttribute('data-lop');
      let tenMon = sl.getAttribute('data-mon');
      
      // NÂNG CẤP: Bỏ logic tạo "tenKhoi", tra cứu trực tiếp theo "tenLop"
      let soTiet = 0;
      if (khungChuongTrinhToanTruong[tenLop] && khungChuongTrinhToanTruong[tenLop][tenMon]) {
          soTiet = parseInt(khungChuongTrinhToanTruong[tenLop][tenMon]) || 0;
      }
      
      thongKe[tenGV].thucTe += soTiet; 
      
      if (soTiet > 0) {
          thongKe[tenGV].chiTiet.push(`<span class="inline-block bg-blue-50 text-blue-800 border border-blue-200 rounded px-1.5 py-0.5 m-0.5 text-[11px] whitespace-nowrap shadow-sm">${tenMon} ${tenLop} (${soTiet})</span>`);
      }
    }
  });

  let containerThongKe = document.getElementById('duLieuThongKe').parentElement.parentElement;
  if (containerThongKe) {
      containerThongKe.className = 'w-[500px] overflow-auto border border-gray-400 shadow-sm bg-white flex-none relative';
  }

  const theadThongKe = document.querySelector('#duLieuThongKe').previousElementSibling;
  if (theadThongKe) {
      theadThongKe.className = 'bg-purple-100 text-purple-900 shadow-sm';
      theadThongKe.innerHTML = `
        <tr>
            <th class="py-1 px-2 border border-gray-400 bg-purple-200 text-slate-900 font-bold sticky top-0 left-0 z-30 shadow-[1px_1px_0_0_#9ca3af]">Giáo viên</th>
            <th class="py-1 px-2 border border-gray-400 bg-purple-100 w-[12%] sticky top-0 z-20 shadow-[0_1px_0_0_#9ca3af]">Định mức</th>
            <th class="py-1 px-2 border border-gray-400 bg-purple-100 w-[12%] sticky top-0 z-20 shadow-[0_1px_0_0_#9ca3af]">Thực tế</th>
            <th class="py-1 px-2 border border-gray-400 bg-purple-100 text-left w-auto sticky top-0 z-20 shadow-[0_1px_0_0_#9ca3af]">Chi tiết giảng dạy</th>
        </tr>
      `;
  }

  let tbodyThongKe = '';
  for (const [ten, soLieu] of Object.entries(thongKe)) {
    let bgClass = 'bg-white';
    let textClass = 'text-blue-700 font-bold';

    if (soLieu.thucTe > soLieu.dinhMuc) {
        bgClass = 'bg-red-100'; 
        textClass = 'text-red-600 font-extrabold';
    } else if (soLieu.thucTe === soLieu.dinhMuc && soLieu.dinhMuc > 0) {
        bgClass = 'bg-green-100'; 
        textClass = 'text-green-700 font-extrabold';
    } else {
        bgClass = 'bg-white'; 
        textClass = 'text-blue-700 font-bold';
    }
    
    let chiTietHienThi = soLieu.chiTiet.length > 0 ? soLieu.chiTiet.join(' ') : '<span class="text-gray-400 italic text-[11px]">Chưa phân công</span>';
    
    tbodyThongKe += `
      <tr class="${bgClass} hover:bg-gray-50 transition-colors">
        <td class="py-1 px-2 font-semibold text-slate-800 text-left pl-4 border-b border-r border-gray-300 whitespace-nowrap sticky left-0 z-10 bg-inherit shadow-[1px_0_0_0_#d1d5db]">${ten}</td>
        <td class="py-1 px-2 font-bold text-slate-600 border-b border-r border-gray-300 text-center">${soLieu.dinhMuc}</td>
        <td class="py-1 px-2 ${textClass} text-base border-b border-r border-gray-300 text-center">${soLieu.thucTe}</td>
        <td class="py-1 px-2 text-left leading-tight whitespace-normal border-b border-gray-300">${chiTietHienThi}</td>
      </tr>
    `;
  }
  document.getElementById('duLieuThongKe').innerHTML = tbodyThongKe;
}

// =========================================================================
// KHỐI 4: LƯU TRỮ DỮ LIỆU ĐA TẦNG VÀO GOOGLE SHEETS
// =========================================================================
async function xuLyLuuTru() {
  const btnLuu = document.querySelector('#khungPhanCong button[onclick="xuLyLuuTru()"]');
  let textGoc = btnLuu ? btnLuu.innerHTML : 'Lưu Phân Công';
  
  if (btnLuu) {
      btnLuu.innerHTML = `<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Đang xử lý...`;
      btnLuu.disabled = true;
  }
  
  try {
    let mangGhi = [];
    
    // 1. Quét dòng Tiêu đề (Mã Lớp + Các Môn học)
    let thead = document.querySelectorAll('#tieuDeMonHoc th');
    let dongTieuDe = [];
    thead.forEach(th => dongTieuDe.push(th.innerText.trim()));
    mangGhi.push(dongTieuDe);
    
    // 2. Quét dữ liệu dọc theo từng lớp
    let cacDongLop = document.querySelectorAll('#duLieuLopHoc tr');
    cacDongLop.forEach(tr => {
        let dongDuLieu = [];
        
        let tdLop = tr.querySelector('td:first-child');
        if (tdLop) {
            dongDuLieu.push(tdLop.innerText.trim());
            
            let cacSelect = tr.querySelectorAll('select');
            cacSelect.forEach(sl => {
                dongDuLieu.push(sl.value.trim());
            });
            mangGhi.push(dongDuLieu);
        }
    });
    
    // 3. Gửi lệnh lưu về Máy chủ
    const payload = { thaoTac: 'luuDuLieuPhanCong', duLieu: mangGhi };
    const phanHoi = await fetch(CAU_HINH_FRONTEND.URL_API_MAY_CHU, { 
        method: 'POST', 
        body: JSON.stringify(payload) 
    });
    const ketQua = await phanHoi.json();
    
    if (ketQua.trangThai === 'Thành công') {
        alert("Đã lưu bảng Phân công chuyên môn vào hệ thống thành công!");
    } else {
        alert("Lỗi từ máy chủ: " + ketQua.thongBao);
    }
  } catch(loi) {
    console.error("Lỗi khi lưu phân công:", loi);
    alert("Lỗi kết nối mạng hoặc máy chủ không phản hồi.");
  } finally {
    if (btnLuu) {
        btnLuu.innerHTML = textGoc;
        btnLuu.disabled = false;
    }
  }
}

// =========================================================================
// KHỐI 5: ĐIỀU HƯỚNG MÀN HÌNH TỔNG LỰC (TỐI ƯU HÓA CHỐNG GIẬT LAG)
// =========================================================================

function moTabPhanCong() {
    thietLapMenuActive('menuPhanCong');
    
    setTimeout(() => {
        let thanhCongCu = document.getElementById('thanhCongCuTKB');
        if (thanhCongCu) { thanhCongCu.classList.remove('flex'); thanhCongCu.classList.add('hidden'); }
        
        let khungTKB = document.getElementById('khungTKB');
        if (khungTKB) { khungTKB.classList.remove('block'); khungTKB.classList.add('hidden'); }
        
        let khungTK = document.getElementById('khungThongKe');
        if (khungTK) { khungTK.classList.remove('block'); khungTK.classList.add('hidden'); }

        // BỔ SUNG: Ẩn giao diện Khung chương trình
        let khungKCT = document.getElementById('khungKhungChuongTrinh');
        if (khungKCT) { khungKCT.classList.remove('flex'); khungKCT.classList.add('hidden'); }
        
        let khungPC = document.getElementById('khungPhanCong');
        if (khungPC) { khungPC.classList.remove('hidden'); khungPC.classList.add('flex'); }

        if (danhSachGV.length === 0) taiDuLieuPhanCongTuMayChu();
    }, 15); 
}

function moTabTKB() {
    thietLapMenuActive('menuTKB');
    
    setTimeout(() => {
        let thanhCongCu = document.getElementById('thanhCongCuTKB');
        if (thanhCongCu) { thanhCongCu.classList.remove('hidden'); thanhCongCu.classList.add('flex'); }
        
        let khungPC = document.getElementById('khungPhanCong');
        if (khungPC) { khungPC.classList.remove('flex'); khungPC.classList.add('hidden'); }
        
        let khungTK = document.getElementById('khungThongKe');
        if (khungTK) { khungTK.classList.remove('block'); khungTK.classList.add('hidden'); }

        // BỔ SUNG: Ẩn giao diện Khung chương trình
        let khungKCT = document.getElementById('khungKhungChuongTrinh');
        if (khungKCT) { khungKCT.classList.remove('flex'); khungKCT.classList.add('hidden'); }
        
        let khungTKB = document.getElementById('khungTKB');
        if (khungTKB) { khungTKB.classList.remove('hidden'); khungTKB.classList.add('block'); }
    }, 15);
}

window.moTabThongKe = function() {
    thietLapMenuActive('menuThongKe');
    
    setTimeout(() => {
        let thanhCongCu = document.getElementById('thanhCongCuTKB');
        if (thanhCongCu) { thanhCongCu.classList.remove('flex'); thanhCongCu.classList.add('hidden'); }
        
        let khungTKB = document.getElementById('khungTKB');
        if (khungTKB) { khungTKB.classList.remove('block'); khungTKB.classList.add('hidden'); }
        
        let khungPC = document.getElementById('khungPhanCong');
        if (khungPC) { khungPC.classList.remove('flex'); khungPC.classList.add('hidden'); }

        // BỔ SUNG: Ẩn giao diện Khung chương trình
        let khungKCT = document.getElementById('khungKhungChuongTrinh');
        if (khungKCT) { khungKCT.classList.remove('flex'); khungKCT.classList.add('hidden'); }
        
        let khungTK = document.getElementById('khungThongKe');
        if (khungTK) { khungTK.classList.remove('hidden'); khungTK.classList.add('block'); }
    }, 15);
};

window.dongTabThongKe = moTabTKB;

function thietLapMenuActive(idKichHoat) {
    // NÂNG CẤP: Bổ sung 'menuKhungChuongTrinh' vào danh sách quét để tắt màu khi chuyển tab
    const cacMenu = ['menuTKB', 'menuThongKe', 'menuPhanCong', 'menuKhungChuongTrinh'];
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
