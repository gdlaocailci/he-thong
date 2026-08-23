// =========================================================================
// PHÂN HỆ QUẢN LÝ DANH MỤC SÁCH GIÁO KHOA (V3.0 - GIAO DIỆN TAB ĐỒNG BỘ)
// Nâng cấp 1: Chuyển từ Modal nổi sang Tab chìm (Khung) chuẩn UI Hệ thống
// Nâng cấp 2: Cấu hình Header chuẩn Google Apps Script để khắc phục lỗi không Lưu được
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
    xayDungGiaoDienKhungSGK();
});

// =========================================================================
// KHỐI 1: BƠM GIAO DIỆN TAB CHÌM VÀO VÙNG HIỂN THỊ CHÍNH
// =========================================================================
function xayDungGiaoDienKhungSGK() {
    if (document.getElementById('khungDanhMucSGK')) return;

    // Xác định thẻ chứa các tab giao diện của hệ thống
    const vungChinh = document.getElementById('vungHienThiChinh');
    if (!vungChinh) return;

    // Cấu trúc Khung y hệt Danh mục Lớp / Danh mục Giáo viên
    const htmlKhung = `
    <div id="khungDanhMucSGK" class="hidden p-4 w-full h-full flex-col font-sans">
        
        <!-- Datalist cho Môn học -->
        <datalist id="danhSachMonHocSGK"></datalist>

        <div class="flex justify-between items-center mb-4 flex-none">
            <h2 class="text-xl font-extrabold text-blue-900 uppercase">QUẢN LÝ DANH MỤC SÁCH GIÁO KHOA</h2>
            <div class="flex items-center gap-2">
                <button onclick="taiLaiDuLieuDanhMucSGK()" id="btnTaiLaiDanhMuc" class="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-4 py-2 text-sm shadow transition duration-200 rounded flex items-center gap-1.5">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    Tải lại
                </button>
                <button onclick="themDongMoiDanhMucSGK()" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 text-sm shadow transition duration-200 rounded flex items-center gap-1.5">
                    + Thêm dòng
                </button>
                <button onclick="luuDongBoDanhMucSGK()" id="btnLuuDanhMuc" class="bg-blue-700 hover:bg-blue-800 text-white font-bold px-5 py-2 text-sm shadow transition duration-200 rounded flex items-center gap-1.5">
                    Lưu Hệ Thống
                </button>
            </div>
        </div>

        <div class="overflow-auto border border-gray-400 shadow-sm bg-white relative flex-1 min-w-[800px]">
            <table class="bang-excel w-full text-center">
                <thead class="sticky top-0 z-20 bg-slate-200 text-slate-900 shadow-sm">
                    <tr>
                        <th class="py-2 w-24">Khối lớp</th>
                        <th class="py-2 w-48">Môn học</th>
                        <th class="py-2">Link SGK Kỳ 1 (Cột C)</th>
                        <th class="py-2">Link SGK Kỳ 2 (Cột D)</th>
                        <th class="py-2 w-16 text-red-600">Xóa</th>
                    </tr>
                </thead>
                <tbody id="danhSachDongDuLieuSGK">
                    <tr><td colspan="5" class="text-center py-10 text-slate-500 font-bold">Vui lòng chờ, đang tải dữ liệu...</td></tr>
                </tbody>
            </table>
        </div>

    </div>`;

    // Bơm trực tiếp vào cùng cấp với các Khung khác
    vungChinh.insertAdjacentHTML('beforeend', htmlKhung);
}

// =========================================================================
// KHỐI 2: THUẬT TOÁN TẢI DỮ LIỆU TỪ MÁY CHỦ
// =========================================================================
async function taiLaiDuLieuDanhMucSGK() {
    const nutTai = document.getElementById('btnTaiLaiDanhMuc');
    const noiDungGoc = nutTai.innerHTML;
    nutTai.innerHTML = `<div class="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div> Đang tải...`;
    
    try {
        const phanHoi = await fetch(`${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=layDanhMucSGKToanBo`);
        const duLieu = await phanHoi.json();
        
        // 1. Nạp Datalist Môn Học
        const datalist = document.getElementById('danhSachMonHocSGK');
        datalist.innerHTML = ''; 
        if (duLieu.monHoc && duLieu.monHoc.length > 0) {
            duLieu.monHoc.forEach(mon => {
                datalist.insertAdjacentHTML('beforeend', `<option value="${mon}">`);
            });
        }

        // 2. Vẽ Bảng dữ liệu SGK
        const tbody = document.getElementById('danhSachDongDuLieuSGK');
        tbody.innerHTML = '';
        
        const mangSGK = duLieu.sgk || [];
        if (mangSGK.length > 1) {
            for (let i = 1; i < mangSGK.length; i++) {
                let khoi = mangSGK[i][0] ? String(mangSGK[i][0]).trim() : '';
                let mon = mangSGK[i][1] ? String(mangSGK[i][1]).trim() : '';
                let link1 = mangSGK[i][2] ? String(mangSGK[i][2]).trim() : '';
                let link2 = mangSGK[i][3] ? String(mangSGK[i][3]).trim() : '';
                taoDongGiaoDienDuLieu(khoi, mon, link1, link2);
            }
        } else {
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
        <td class="px-2 py-2"><input type="text" list="danhSachMonHocSGK" class="w-full bg-transparent border-b border-transparent focus:border-blue-500 focus:bg-white outline-none py-1 font-semibold text-slate-800 cursor-pointer" value="${mon}" placeholder="Nhấp đúp để chọn môn..." onfocus="this.select()"></td>
        <td class="px-2 py-2"><input type="text" class="w-full bg-transparent border-b border-transparent focus:border-blue-500 focus:bg-white outline-none py-1 text-blue-600 font-mono text-xs" value="${link1}" placeholder="Link Google Drive Kỳ 1..."></td>
        <td class="px-2 py-2"><input type="text" class="w-full bg-transparent border-b border-transparent focus:border-blue-500 focus:bg-white outline-none py-1 text-blue-600 font-mono text-xs" value="${link2}" placeholder="Link Google Drive Kỳ 2..."></td>
        <td class="px-2 py-2 text-center"><button onclick="this.closest('tr').remove()" class="text-red-400 hover:text-red-600 p-1.5 bg-red-50 hover:bg-red-100 rounded transition" title="Xóa dòng này khỏi hệ thống"><svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button></td>
    `;
    tbody.appendChild(tr);
}

function themDongMoiDanhMucSGK() {
    taoDongGiaoDienDuLieu('', '', '', '');
    const khungChua = document.getElementById('danhSachDongDuLieuSGK').parentElement.parentElement;
    setTimeout(() => { khungChua.scrollTop = khungChua.scrollHeight; }, 50);
}

// =========================================================================
// KHỐI 3: THUẬT TOÁN ĐÓNG GÓI VÀ LƯU ĐỒNG BỘ CHỐNG LỖI MẠNG
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
        
        if (khoi !== '' && mon !== '') {
            mangDuLieuGoiDi.push([khoi, mon, link1, link2]);
        }
    });

    try {
        // [QUAN TRỌNG]: Bổ sung Cấu hình Header và Redirect để Apps Script tiếp nhận lệnh POST thành công
        const phanHoi = await fetch(CAU_HINH_FRONTEND.URL_API_MAY_CHU, {
            method: 'POST',
            redirect: 'follow', // Bắt buộc cho Google Script
            headers: {
                'Content-Type': 'text/plain;charset=utf-8', // Chống lỗi kiểm duyệt CORS Preflight
            },
            body: JSON.stringify({
                thaoTac: 'luuCapNhatDanhMucSGK',
                duLieuBang: mangDuLieuGoiDi
            })
        });
        
        const ketQua = await phanHoi.json();
        
        if (ketQua.trangThai === 'thanh_cong') {
            alert("THÔNG BÁO: Đã đồng bộ thành công danh mục sách lên bảng tính Google Sheets!");
            // Xóa rác bộ nhớ cũ để file XemTruocSGK nhận diện được link mới
            if (typeof boNhoHocLieuSGK !== 'undefined') boNhoHocLieuSGK = {}; 
        } else {
            alert("Lưu thất bại: " + ketQua.thongBao);
        }
    } catch (loi) {
        alert("Sự cố đường truyền: Không thể gửi lệnh lưu lên máy chủ. Bạn hãy tải lại trang và thử lại.");
    } finally {
        nutLuu.innerHTML = noiDungGoc;
        nutLuu.disabled = false;
    }
}
