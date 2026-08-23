// =========================================================================
// PHÂN HỆ QUẢN LÝ DANH MỤC SÁCH GIÁO KHOA (MODULE ĐỘC LẬP)
// Chức năng: Quản trị viên cập nhật Link SGK Kỳ 1 (Cột C) và Kỳ 2 (Cột D)
// Tích hợp: Tự động bơm giao diện HTML, đọc/ghi dữ liệu trực tiếp với Google Sheets
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
    xayDungGiaoDienQuanLyDanhMucSGK();
});

// =========================================================================
// KHỐI 1: BƠM GIAO DIỆN HTML (MODAL QUẢN LÝ TRỰC QUAN)
// =========================================================================
function xayDungGiaoDienQuanLyDanhMucSGK() {
    // Tránh bơm trùng lặp nếu hệ thống tải tệp JS nhiều lần
    if (document.getElementById('vungQuanLyDanhMucSGK')) return;

    const htmlGiaoDien = `
    <div id="vungQuanLyDanhMucSGK" class="hidden fixed inset-0 z-[80] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity">
        <div class="bg-white w-full max-w-6xl h-[88vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-300">
            
            <!-- Tiêu đề và Thanh công cụ -->
            <div class="bg-gradient-to-r from-blue-800 to-indigo-900 px-6 py-4 flex justify-between items-center text-white flex-none">
                <div class="flex items-center gap-3">
                    <div class="bg-white/20 p-2 rounded-lg">
                        <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                    </div>
                    <div>
                        <h2 class="text-lg font-extrabold tracking-wide uppercase">Danh mục Sách giáo khoa</h2>
                        <p class="text-xs text-blue-200">Đồng bộ trực tiếp với Google Sheets (Cột C: Kỳ 1, Cột D: Kỳ 2)</p>
                    </div>
                </div>
                
                <div class="flex items-center gap-2">
                    <button onclick="taiLaiDuLieuDanhMucSGK()" id="btnTaiLaiDanhMuc" class="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition text-sm font-semibold flex items-center gap-1.5">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        Tải lại
                    </button>
                    <button onclick="themDongMoiDanhMucSGK()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition text-sm font-semibold flex items-center gap-1.5 shadow">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                        Thêm dòng
                    </button>
                    <button onclick="luuDongBoDanhMucSGK()" id="btnLuuDanhMuc" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg transition text-sm font-bold flex items-center gap-1.5 shadow">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                        Lưu đồng bộ
                    </button>
                    <div class="w-px h-5 bg-white/30 mx-1"></div>
                    <button onclick="dongGiaoDienQuanLyDanhMucSGK()" class="p-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-white transition" title="Đóng bảng">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
            </div>

            <!-- Vùng Bảng dữ liệu (Excel thu nhỏ) -->
            <div class="flex-1 bg-slate-100 p-4 overflow-auto">
                <div class="bg-white rounded-xl shadow border border-slate-200 overflow-hidden min-w-[800px]">
                    <table class="w-full text-left border-collapse whitespace-nowrap">
                        <thead class="bg-slate-100 sticky top-0 z-10 text-slate-700 text-sm shadow-sm">
                            <tr>
                                <th class="px-4 py-3 font-extrabold border-b border-slate-300 w-24 text-center">Khối lớp</th>
                                <th class="px-4 py-3 font-extrabold border-b border-slate-300 w-48">Môn học</th>
                                <th class="px-4 py-3 font-extrabold border-b border-slate-300">Link SGK Kỳ 1 (Cột C)</th>
                                <th class="px-4 py-3 font-extrabold border-b border-slate-300">Link SGK Kỳ 2 (Cột D)</th>
                                <th class="px-4 py-3 font-extrabold border-b border-slate-300 w-16 text-center text-red-600">Xóa</th>
                            </tr>
                        </thead>
                        <tbody id="danhSachDongDuLieuSGK" class="divide-y divide-slate-100 text-sm">
                            <!-- JS sẽ tự động đổ dữ liệu vào đây -->
                        </tbody>
                    </table>
                </div>
            </div>
            
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', htmlGiaoDien);
}

// =========================================================================
// KHỐI 2: ĐIỀU HƯỚNG MỞ / ĐÓNG GIAO DIỆN
// =========================================================================
window.moGiaoDienQuanLyDanhMucSGK = function() {
    const khung = document.getElementById('vungQuanLyDanhMucSGK');
    if (!khung) return;
    khung.classList.remove('hidden');
    khung.classList.add('flex');
    taiLaiDuLieuDanhMucSGK(); // Tự động tải lại bảng khi mở
};

window.dongGiaoDienQuanLyDanhMucSGK = function() {
    const khung = document.getElementById('vungQuanLyDanhMucSGK');
    if (khung) {
        khung.classList.remove('flex');
        khung.classList.add('hidden');
    }
};

// =========================================================================
// KHỐI 3: THUẬT TOÁN TẢI DỮ LIỆU TỪ MÁY CHỦ VÀ VẼ LÊN BẢNG
// =========================================================================
async function taiLaiDuLieuDanhMucSGK() {
    const nutTai = document.getElementById('btnTaiLaiDanhMuc');
    const noiDungGoc = nutTai.innerHTML;
    nutTai.innerHTML = `<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Đang tải...`;
    
    try {
        const phanHoi = await fetch(`${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=layDanhMucSGKToanBo`);
        const duLieu = await phanHoi.json();
        
        const tbody = document.getElementById('danhSachDongDuLieuSGK');
        tbody.innerHTML = '';
        
        // Dữ liệu lấy về bao gồm dòng tiêu đề, lặp từ index 1 để bỏ qua dòng tiêu đề
        if (duLieu && duLieu.length > 1) {
            for (let i = 1; i < duLieu.length; i++) {
                let khoi = duLieu[i][0] ? String(duLieu[i][0]).trim() : '';
                let mon = duLieu[i][1] ? String(duLieu[i][1]).trim() : '';
                let link1 = duLieu[i][2] ? String(duLieu[i][2]).trim() : '';
                let link2 = duLieu[i][3] ? String(duLieu[i][3]).trim() : '';
                taoDongGiaoDienDuLieu(khoi, mon, link1, link2);
            }
        } else {
            // Nếu Sheets rỗng, tự mọc ra 1 dòng trắng để giáo viên nhập
            themDongMoiDanhMucSGK(); 
        }
    } catch (loi) {
        alert("Sự cố mạng: Không thể kết nối với máy chủ để tải danh mục.");
    } finally {
        nutTai.innerHTML = noiDungGoc;
    }
}

function taoDongGiaoDienDuLieu(khoi = '', mon = '', link1 = '', link2 = '') {
    const tbody = document.getElementById('danhSachDongDuLieuSGK');
    const tr = document.createElement('tr');
    tr.className = "hover:bg-blue-50/60 transition-colors dong-nhap-lieu-sgk";
    
    tr.innerHTML = `
        <td class="px-2 py-2 text-center"><input type="text" class="w-full text-center bg-transparent border-b border-transparent focus:border-blue-500 focus:bg-white outline-none py-1 font-bold text-slate-700" value="${khoi}" placeholder="VD: 3"></td>
        <td class="px-2 py-2"><input type="text" class="w-full bg-transparent border-b border-transparent focus:border-blue-500 focus:bg-white outline-none py-1 font-semibold text-slate-800" value="${mon}" placeholder="VD: Tin học"></td>
        <td class="px-2 py-2"><input type="text" class="w-full bg-transparent border-b border-transparent focus:border-blue-500 focus:bg-white outline-none py-1 text-blue-600 font-mono text-xs" value="${link1}" placeholder="Link Google Drive Kỳ 1..."></td>
        <td class="px-2 py-2"><input type="text" class="w-full bg-transparent border-b border-transparent focus:border-blue-500 focus:bg-white outline-none py-1 text-blue-600 font-mono text-xs" value="${link2}" placeholder="Link Google Drive Kỳ 2..."></td>
        <td class="px-2 py-2 text-center"><button onclick="this.closest('tr').remove()" class="text-red-400 hover:text-red-600 p-1.5 bg-red-50 hover:bg-red-100 rounded transition" title="Xóa dòng này khỏi hệ thống"><svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button></td>
    `;
    tbody.appendChild(tr);
}

function themDongMoiDanhMucSGK() {
    taoDongGiaoDienDuLieu('', '', '', '');
    const khungChua = document.getElementById('danhSachDongDuLieuSGK').parentElement.parentElement;
    // Tự động cuộn xuống dòng mới thêm bằng setTimeout để DOM cập nhật xong
    setTimeout(() => { khungChua.scrollTop = khungChua.scrollHeight; }, 50);
}

// =========================================================================
// KHỐI 4: THUẬT TOÁN ĐÓNG GÓI VÀ LƯU ĐỒNG BỘ LÊN MÁY CHỦ
// =========================================================================
async function luuDongBoDanhMucSGK() {
    const nutLuu = document.getElementById('btnLuuDanhMuc');
    const noiDungGoc = nutLuu.innerHTML;
    nutLuu.innerHTML = `<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Đang lưu...`;
    nutLuu.disabled = true;

    let mangDuLieuGoiDi = [];
    const cacDong = document.querySelectorAll('.dong-nhap-lieu-sgk');
    
    cacDong.forEach(dong => {
        const cacOInput = dong.querySelectorAll('input');
        let khoi = cacOInput[0].value.trim();
        let mon = cacOInput[1].value.trim();
        let link1 = cacOInput[2].value.trim();
        let link2 = cacOInput[3].value.trim();
        
        // Chỉ gửi đi các dòng có dữ liệu Khối và Môn hợp lệ
        if (khoi !== '' && mon !== '') {
            mangDuLieuGoiDi.push([khoi, mon, link1, link2]);
        }
    });

    try {
        const phanHoi = await fetch(CAU_HINH_FRONTEND.URL_API_MAY_CHU, {
            method: 'POST',
            body: JSON.stringify({
                thaoTac: 'luuCapNhatDanhMucSGK',
                duLieuBang: mangDuLieuGoiDi
            })
        });
        const ketQua = await phanHoi.json();
        
        if (ketQua.trangThai === 'thanh_cong') {
            alert("THÔNG BÁO: Đã đồng bộ thành công danh mục sách lên bảng tính Google Sheets!");
            
            // Liên kết với hệ thống XemTruocSGK: Ép làm sạch bộ nhớ RAM để nhận link mới ngay lập tức
            if (typeof boNhoHocLieuSGK !== 'undefined') {
                boNhoHocLieuSGK = {}; 
            }
        } else {
            alert("Lưu thất bại: " + ketQua.thongBao);
        }
    } catch (loi) {
        alert("Sự cố mạng: Không thể gửi dữ liệu lưu trữ lên máy chủ.");
    } finally {
        nutLuu.innerHTML = noiDungGoc;
        nutLuu.disabled = false;
    }
}