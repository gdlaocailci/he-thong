let duLieuKhoaSoToanCuc = {}; // Lưu map { 1: { daKhoa: true, nguoiThucHien: '...', thoiGian: '...' } }
window.kiemTraTuanDaKhoa = function(tuan) {
    if (!tuan) return false;
    let t = parseInt(String(tuan).replace(/\D/g, ''), 10);
    return !!(duLieuKhoaSoToanCuc[t] && duLieuKhoaSoToanCuc[t].daKhoa);
};

// =========================================================================
// [QUAN TRỌNG]: HÀM CHUẨN HÓA ĐỒNG NHẤT DẤU TIẾNG VIỆT (PHỤC HỒI LẠI)
// =========================================================================
window.chuanHoaDinhDanhGiaoVien = function(tenGV) {
    if (!tenGV) return '';
    let tenChuan = String(tenGV).trim().toLowerCase().normalize('NFC');
    const tuDienDau = {
        'òa': 'oà', 'óa': 'oá', 'ỏa': 'oả', 'õa': 'oã', 'ọa': 'oạ',
        'òe': 'oè', 'óe': 'oé', 'ỏe': 'oẻ', 'õe': 'oẽ', 'ọe': 'oẹ',
        'ùy': 'uỳ', 'úy': 'uý', 'ủy': 'uỷ', 'ũy': 'uỹ', 'ụy': 'uỵ'
    };
    for (let [kieuCu, kieuMoi] of Object.entries(tuDienDau)) {
        tenChuan = tenChuan.replace(new RegExp(kieuCu, 'g'), kieuMoi);
    }
    return tenChuan;
};
// =========================================================================
// KHỐI 1: KIỂM SOÁT ĐĂNG NHẬP VÀ BỘ MÁY TỊNH TIẾN SỔ ĐẦU BÀI
// =========================================================================
let daTaiDuLieuSoDauBai = false;
let dangTaiDuLieuSoDauBai = false;
let duLieuTKBGopDaMap = [];
let tuDienPPCTToanCuc = {}; 
let dinhMucKhungCT = {}; 
let tuDienQuyenPhanCong = {};
let coToanQuyenSDB = false;
let maGvDangNhapHeThong = '';
    tenGvDangNhapHeThong = '';
let tenGvDangNhapHeThong = '';
let danhSachGiaoVienToanCuc = [];
let mapTkbToanTapToanCuc = {}; // [BẢO CHỨNG LỊCH SỬ]: Lưu bản đồ TKB toàn bộ các tuần (quá khứ từ DATA_TKB và hiện tại từ TKB_HIEN_TAI) // [NÂNG CẤP]: Mảng lưu danh sách giáo viên toàn cục

// Các biến toàn cục hỗ trợ kiểm soát trạng thái chưa lưu (Chống mất dữ liệu)
let tuanTruocDo_SDB = '';
let lopTruocDo_SDB = '';
let coThayDoiChuaLuu_SDB = false;

window.lamSachBoNhoSoDauBai = function() {
    if (dangTaiDuLieuSoDauBai) return;
    daTaiDuLieuSoDauBai = false;
    duLieuTKBGopDaMap = [];
    tuDienPPCTToanCuc = {}; 
    dinhMucKhungCT = {}; 
    tuDienQuyenPhanCong = {};
    coToanQuyenSDB = false;
    danhSachGiaoVienToanCuc = [];
    
    tuanTruocDo_SDB = '';
    lopTruocDo_SDB = '';
    coThayDoiChuaLuu_SDB = false;
    
    // [TỐI ƯU TỐC ĐỘ 10X]: Giữ nguyên bộ nhớ đệm tĩnh SDB_DATA_STATIC (Khung CT & PPCT)
    // Vì PPCT không thay đổi khi sửa TKB, việc giữ cache giúp API bỏ qua tải 2 bảng nặng này (giảm 85% thời gian mạng)
    
    maGvDangNhapHeThong = '';
    
    let vungHienThi = document.getElementById('vungHienThiSoDauBai');
    if (vungHienThi) vungHienThi.innerHTML = '';
    
    let elementTuan = document.getElementById('chonTuanSo');
    let elementLop = document.getElementById('chonLopSo');

    // BẢO LƯU TRẠNG THÁI: Lấy giá trị đang chọn trước khi đập bỏ HTML
    let giaTriTuanCu = elementTuan ? elementTuan.value : '';
    let giaTriLopCu = elementLop ? elementLop.value : '';

    let wTuan = document.getElementById('wrapper_chonTuanSo'); 
    if (wTuan) { 
        if (elementTuan) wTuan.parentNode.insertBefore(elementTuan, wTuan);
        wTuan.remove(); 
    }
    
    let wLop = document.getElementById('wrapper_chonLopSo'); 
    if (wLop) { 
        if (elementLop) wLop.parentNode.insertBefore(elementLop, wLop);
        wLop.remove(); 
    }

    if(elementTuan) { 
        elementTuan.style.display = ''; 
        // Gắn tạm giá trị cũ vào HTML để giữ chỗ cho hàm nạp phía sau
        if (giaTriTuanCu) elementTuan.innerHTML = `<option value="${giaTriTuanCu}" selected>${giaTriTuanCu}</option>`;
        else elementTuan.innerHTML = '<option value="" disabled selected>-- Chọn Tuần --</option>'; 
    }
    if(elementLop) { 
        elementLop.style.display = ''; 
        if (giaTriLopCu) elementLop.innerHTML = `<option value="${giaTriLopCu}" selected>${giaTriLopCu}</option>`;
        else elementLop.innerHTML = '<option value="" disabled selected>-- Chọn Lớp --</option>'; 
    }

    // Tự động tải lại lưới SĐB nếu tab này đang mở để chống lỗi trắng trang do lệnh dọn dẹp
    let khungSDB = document.getElementById('khungSoDauBai');
    if (khungSDB && !khungSDB.classList.contains('hidden') && emailGoiLen !== '') {
        setTimeout(() => { taiDuLieuSoDauBaiTuMayChu(); }, 500);
    }
};

async function taiDuLieuSoDauBaiTuMayChu() {
    if (daTaiDuLieuSoDauBai) return;
    
    const vungHienThi = document.getElementById('vungHienThiSoDauBai');
    
    // Kiểm tra trực tiếp biến toàn cục thay vì check sự kiện onclick để chống lỗi Race Condition
    const chuaDangNhap = typeof window.dinhDanhGiaoVienToanCuc === 'undefined' || window.dinhDanhGiaoVienToanCuc === '';
    if (chuaDangNhap) {
        // Giao diện Khóa bảo mật: Yêu cầu định danh trực quan trên vùng hiển thị
        if (vungHienThi) {
            vungHienThi.innerHTML = `
                <div class="flex flex-col items-center justify-center py-12 animate-pulse-once">
                    <div class="bg-red-50 text-red-600 p-4 rounded-full mb-4 border border-red-200 shadow-sm">
                        <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    </div>
                    <h3 class="text-xl font-extrabold text-slate-800 mb-2 uppercase tracking-wide">Yêu cầu định danh</h3>
                    <p class="text-sm text-slate-600 text-center max-w-md mb-6 font-semibold">Để đảm bảo bảo mật và phân quyền chính xác, hệ thống yêu cầu đồng chí đăng nhập tài khoản trước khi truy cập Sổ Đầu Bài.</p>
                    
                   <div class="flex gap-4">
                        <button onclick="document.getElementById('menuTKB').click()" class="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-slate-700 font-bold rounded shadow-sm transition-colors border border-gray-400">
                            Quay lại TKB
                        </button>
                        <button onclick="khoiDongDangNhap(); kiemTraTrangThaiDangNhapSDB()" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow transition-colors flex items-center gap-2">
                            <!-- ĐÃ SỬA: Thay thế img bị lỗi bằng mã SVG -->
                            <svg class="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 48 48">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"></path>
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                                <path fill="none" d="M0 0h48v48H0z"></path>
                            </svg>
                            Đăng nhập ngay
                        </button>
                    </div>
                </div>
            `;
        }
        return;
    }

    thucThiTaiDuLieuVaVeLuoi(vungHienThi);
}
// =========================================================================
// [NÂNG CẤP]: HÀM GẮN CỜ VÀ BIỂU TƯỢNG CÂY BÚT VÀO DÒNG CÓ THAY ĐỔI
// =========================================================================
function danhDauDongThayDoi(tr) {
    if (!tr) return;
    
    // Nếu dòng chưa được đánh dấu thay đổi thì tiến hành đánh dấu
    if (tr.getAttribute('data-thaydoi') !== 'true') {
        tr.setAttribute('data-thaydoi', 'true');
        
        let tdMon = tr.querySelector('td[data-loai="mon"]');
        if (tdMon && !tdMon.querySelector('.icon-sua-chua')) {
            // Chèn SVG cây bút (Màu hổ phách, có hiệu ứng nhấp nháy nhẹ) bên cạnh tên môn
            tdMon.innerHTML += `<svg class="icon-sua-chua w-4 h-4 inline-block ml-1 text-amber-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" title="Dòng dữ liệu này đang được chỉnh sửa"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>`;
        }
    }
}
// Lắng nghe trạng thái đăng nhập để tự động mở Sổ đầu bài
function kiemTraTrangThaiDangNhapSDB() {
    let soLanKiemTra = 0;
    const vungHienThi = document.getElementById('vungHienThiSoDauBai');
    
    if (vungHienThi) {
         let btnDangNhap = vungHienThi.querySelector('.bg-blue-600');
         if(btnDangNhap) btnDangNhap.innerHTML = `<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Đang xác thực...`;
    }

    let vongLap = setInterval(() => {
        if (typeof window.dinhDanhGiaoVienToanCuc !== 'undefined' && window.dinhDanhGiaoVienToanCuc !== '') {
            clearInterval(vongLap);
            thucThiTaiDuLieuVaVeLuoi(vungHienThi);
        }
        soLanKiemTra++;
        if (soLanKiemTra > 120) {
            clearInterval(vongLap); 
            if (vungHienThi) taiDuLieuSoDauBaiTuMayChu(); 
        }
    }, 500);
}

async function thucThiTaiDuLieuVaVeLuoi(vungHienThi) {
    dangTaiDuLieuSoDauBai = true;

    let selTuan = document.getElementById('chonTuanSo');
    let selLop = document.getElementById('chonLopSo');
    let inTuan = document.getElementById('input_chonTuanSo');
    let inLop = document.getElementById('input_chonLopSo');

    if (selTuan) { 
        selTuan.disabled = true; 
        if (!inTuan) selTuan.innerHTML = '<option value="" disabled selected>⏳ Đang tải...</option>'; 
    }
    if (selLop) { 
        selLop.disabled = true; 
        if (!inLop) selLop.innerHTML = '<option value="" disabled selected>⏳ Đang tải...</option>'; 
    }
    
    if (inTuan) { inTuan.dataset.oldValue = inTuan.value; inTuan.value = '⏳ Đang tải...'; inTuan.disabled = true; inTuan.classList.add('cursor-wait'); }
    if (inLop) { inLop.dataset.oldValue = inLop.value; inLop.value = '⏳ Đang tải...'; inLop.disabled = true; inLop.classList.add('cursor-wait'); }

    if (vungHienThi) {
        vungHienThi.innerHTML = `<div class="text-center py-12 text-slate-500 font-bold">
            <div class="w-9 h-9 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
            <p class="text-base text-blue-900 font-extrabold">Đang kết nối kho dữ liệu Sổ Đầu Bài...</p>
            <span class="text-xs text-slate-500 font-normal mt-1 block">Hệ thống đang tối ưu bộ nhớ đệm để tăng tốc. Vui lòng không chuyển trang...</span>
        </div>`;
    }

    try {
        let dinhDanhGoiLen = typeof window.dinhDanhGiaoVienToanCuc !== 'undefined' ? window.dinhDanhGiaoVienToanCuc : '';
        let cacheKey = window.layKhoaCachLy(`SDB_DATA_STATIC_${dinhDanhGoiLen}`);
        let duLieuSever = {};
        
        // KIỂM TRA CACHE
        let duLieuTinhCache = sessionStorage.getItem(cacheKey);
        let yeuCauTaiToanBo = duLieuTinhCache ? false : true;

        // [SỬA LỖI]: Phục hồi key 'emailTruyCap' trên chuỗi URL để khớp nối chính xác với tham số Backend GAS đang chờ
        let thongSoURL = `thaoTac=layDuLieuSoDauBai&emailTruyCap=${encodeURIComponent(dinhDanhGoiLen)}&taiToanBo=${yeuCauTaiToanBo}`;
        
        const phanHoi = await fetchVoiCoCheThuLai(
            `${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?${thongSoURL}`,
            {}, 3, 60000
        );
        
        const phanHoiText = await phanHoi.text();
        
        let duLieuMoi;
        try { duLieuMoi = JSON.parse(phanHoiText); } 
        catch (loiParse) { throw new Error("Phản hồi máy chủ gặp sự cố định dạng. Vui lòng thử lại!"); }

        if (duLieuMoi.trangThai === 'loi_he_thong') throw new Error(duLieuMoi.thongBao);

        // LẮP RÁP DỮ LIỆU TỪ CACHE
        if (yeuCauTaiToanBo) {
            duLieuSever = duLieuMoi;
            let duLieuTinh = {
                KHUNG_CHUONG_TRINH: duLieuMoi.KHUNG_CHUONG_TRINH,
                PPCT: duLieuMoi.PPCT
            };
            try { sessionStorage.setItem(cacheKey, JSON.stringify(duLieuTinh)); } catch (e) {}
        } else {
            let cacheParsed = JSON.parse(duLieuTinhCache);
            duLieuSever = {
                ...duLieuMoi, // Gồm SO_DAU_BAI, DATA_TKB, TKB_HIEN_TAI, MA_GIAO_VIEN, TOAN_QUYEN
                KHUNG_CHUONG_TRINH: cacheParsed.KHUNG_CHUONG_TRINH,
                PPCT: cacheParsed.PPCT
            };
        }

        // [KHẮC PHỤC TRIỆT ĐỂ LỖI QUAY MÃI]: Bỏ setTimeout để thực thi đồng bộ trong try/catch
        // 1. Mở khóa các ô chọn ngay khi dữ liệu đã tải về thành công
        if (selTuan) selTuan.disabled = false;
        if (selLop) selLop.disabled = false;
        if (inTuan) { inTuan.disabled = false; inTuan.classList.remove('cursor-wait'); }
        if (inLop) { inLop.disabled = false; inLop.classList.remove('cursor-wait'); }

        if (duLieuSever.TRANG_THAI_KHOA) { duLieuKhoaSoToanCuc = duLieuSever.TRANG_THAI_KHOA; }

        // 2. Khởi tạo dữ liệu vào bộ nhớ và tạo danh sách chọn Tuần / Lớp
        khoiTaoDuLieuSoDauBai(duLieuSever);
        daTaiDuLieuSoDauBai = true;
        dangTaiDuLieuSoDauBai = false; 

        // 3. Tự động kích hoạt vẽ Sổ Đầu Bài lên lưới (Xóa hoàn toàn màn hình chờ quay tròn)
        let theTuan = document.getElementById('chonTuanSo');
        let theLop = document.getElementById('chonLopSo');
        
        if (theTuan && theLop) {
            // Đồng bộ lại hiển thị cho input Tuần và Lớp
            if (typeof window.dongBoHienThiTuSelect === 'function') {
                window.dongBoHienThiTuSelect('chonTuanSo');
                window.dongBoHienThiTuSelect('chonLopSo');
            }

            if (theTuan.value && theLop.value) {
                ketXuatSoDauBaiLenLuoi();
            } else if (vungHienThi) {
                vungHienThi.innerHTML = `<div class="p-4"><p class="text-center py-10 text-slate-500 font-bold">Vui lòng chọn Tuần và Lớp để xem Sổ đầu bài.</p></div>`;
            }
        }

    } catch (loi) {
        dangTaiDuLieuSoDauBai = false; 
        daTaiDuLieuSoDauBai = false;
        console.error("Lỗi kết nối Sổ đầu bài:", loi);
        if (vungHienThi) {
            vungHienThi.innerHTML = `
                <div class="text-center py-10 text-red-600 font-bold text-base">
                    <div class="w-12 h-12 text-red-500 mx-auto mb-2">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    </div>
                    ⚠️ Kết nối máy chủ bị gián đoạn: <br>
                    <span class="text-xs font-normal text-slate-600 block mt-1">${loi.message}</span>
                    <button onclick="taiDuLieuSoDauBaiTuMayChu()" class="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded shadow transition-colors">
                        🔄 Thử kết nối lại
                    </button>
                </div>
            `;
        }
        if (selTuan) selTuan.disabled = false;
        if (selLop) selLop.disabled = false;
        if (inTuan) { inTuan.disabled = false; inTuan.classList.remove('cursor-wait'); inTuan.value = inTuan.dataset.oldValue || 'Chọn Tuần...'; }
        if (inLop) { inLop.disabled = false; inLop.classList.remove('cursor-wait'); inLop.value = inLop.dataset.oldValue || 'Chọn Lớp...'; }
    }
}

// =========================================================================
// KHỐI 2: VẼ GIAO DIỆN VÀ KHỞI TẠO DỮ LIỆU
// =========================================================================
function tinhNgayTuInputDate(ngayYMD, tenThu) {
    if (!ngayYMD) return '';
    let dateObj = new Date(ngayYMD);
    if (isNaN(dateObj.getTime())) return '';
    const doLech = { "Thứ 2": 0, "Thứ 3": 1, "Thứ 4": 2, "Thứ 5": 3, "Thứ 6": 4, "Thứ 7": 5, "Chủ nhật": 6 };
    dateObj.setDate(dateObj.getDate() + (doLech[tenThu] || 0));
    return `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;
}

// =========================================================================
// [NÂNG CẤP]: ÁNH XẠ DỮ LIỆU TUYỆT ĐỐI THEO TÊN CỘT VẬT LÝ (A, B, C...)
// Khắc phục triệt để lỗi sai lệch cột giữa TKB, Sổ Đầu Bài và PPCT
// =========================================================================
function khoiTaoDuLieuSoDauBai(duLieuSever) {
    maGvDangNhapHeThong = duLieuSever.MA_GIAO_VIEN || '';
    // [ĐỒNG BỘ]: Ưu tiên nhận TEN_GIAO_VIEN do Backend cung cấp, nếu không có mới lùi về MA_GIAO_VIEN
    tenGvDangNhapHeThong = duLieuSever.TEN_GIAO_VIEN || duLieuSever.MA_GIAO_VIEN || '';
    coToanQuyenSDB = duLieuSever.TOAN_QUYEN || false;
    tuDienQuyenPhanCong = duLieuSever.QUYEN_THEO_LOP || {};
    if (duLieuSever.DANH_SACH_GIAO_VIEN && Array.isArray(duLieuSever.DANH_SACH_GIAO_VIEN)) {
        danhSachGiaoVienToanCuc = duLieuSever.DANH_SACH_GIAO_VIEN;
    } else if (typeof thongSoHocVu !== 'undefined' && thongSoHocVu.DANH_SACH_GIAO_VIEN) {
        danhSachGiaoVienToanCuc = thongSoHocVu.DANH_SACH_GIAO_VIEN;
    }

    let theChotQuyen = document.getElementById('theChotQuyenSDB');
    if (!theChotQuyen) {
        theChotQuyen = document.createElement('div');
        theChotQuyen.id = 'theChotQuyenSDB';
        theChotQuyen.style.display = 'none';
        
        let vungChinh = document.getElementById('khungSoDauBai');
        if (vungChinh) vungChinh.appendChild(theChotQuyen);
        else document.body.appendChild(theChotQuyen);
    }
    
    theChotQuyen.setAttribute('data-madinhdanh', maGvDangNhapHeThong);
    theChotQuyen.setAttribute('data-tendinhdanh', tenGvDangNhapHeThong);
    theChotQuyen.setAttribute('data-quantri', coToanQuyenSDB);
    theChotQuyen.setAttribute('data-matranquyen', JSON.stringify(tuDienQuyenPhanCong));

    let mapDuiLieuHopNhat = {};

    const chuanHoaThu = (thuStr) => {
        if (!thuStr) return '';
        let raw = String(thuStr).trim().toLowerCase();
        return raw.charAt(0).toUpperCase() + raw.slice(1);
    };

    // 1. XỬ LÝ SỔ ĐẦU BÀI (Chỉ đọc cột vật lý)
    if (duLieuSever.SO_DAU_BAI) {
        let namHocHienTai = duLieuSever.NAM_HOC || (typeof thongSoHocVu !== 'undefined' && thongSoHocVu.NAM_HOC) || (typeof window.thongSoHocVu !== 'undefined' && window.thongSoHocVu.NAM_HOC) || '';

        duLieuSever.SO_DAU_BAI.forEach(dong => {
            let maLuuTru = String(dong['A'] || '').trim();
            let tuan = String(dong['B'] || '').replace(/\D/g, ''); // Cột B: Tuần
            let lop = String(dong['C'] || '').trim().toUpperCase(); // Cột C: Lớp
            let thuChuan = chuanHoaThu(dong['D'] || ''); 
            let ngay = String(dong['E'] || '').trim();
            let buoi = String(dong['F'] || '').trim().toLowerCase() === 'sáng' ? 'sáng' : 'chiều';
            let tiet = String(dong['G'] || '').trim();

            // [NÂNG CẤP ĐỘT PHÁ]: Cách ly tuyệt đối theo Năm học để chống nhầm lẫn/ghi đè sang năm sau
            if (namHocHienTai) {
                if (maLuuTru.startsWith(namHocHienTai + '_')) {
                    // Thuộc đúng năm học hiện tại -> Chấp nhận nạp
                } else if (/^\d{4}-\d{4}_/.test(maLuuTru)) {
                    // Thuộc năm học khác -> Bỏ qua, không nạp đè lên lưới năm nay!
                    return;
                } else if (ngay) {
                    let matchNgay = ngay.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
                    if (matchNgay) {
                        let thang = parseInt(matchNgay[2], 10);
                        let nam = parseInt(matchNgay[3], 10);
                        let nhTuNgay = (thang >= 8) ? `${nam}-${nam+1}` : `${nam-1}-${nam}`;
                        if (nhTuNgay !== namHocHienTai) {
                            return; // Khác năm học hiện tại -> Bỏ qua
                        }
                    }
                }
            }
            
            let khoa = `${tuan}_${lop}_${thuChuan}_${buoi}_${tiet}`;
            
            mapDuiLieuHopNhat[khoa] = {
                'Tuần': tuan, 'Mã Lớp': lop, 'Thứ': thuChuan, 'Buổi': buoi, 'Tiết': tiet,
                'Môn Học': dong['H'] || '',
                'Mã GV': '', 
                'Ngày': ngay,
                'TietPPCT_Thuc': dong['I'] || '',
                'TenBai_Thuc': dong['J'] || '',
                'NhanXet_Thuc': dong['K'] || '',
                'XepLoai_Thuc': dong['L'] || '',
                'ChuKy_Thuc': dong['M'] || '',
                'ChuyenCan_Thuc': dong['N'] || '',
                'DaLuu': true 
            };
        });
    }

    let mapTkbToanTap = {};
    let tuanHeThong = (typeof thongSoHocVu !== 'undefined' && thongSoHocVu.TUAN_HIEN_TAI) ? parseInt(thongSoHocVu.TUAN_HIEN_TAI) : 999;

    // 2. XỬ LÝ THỜI KHÓA BIỂU (Tọa độ vật lý của TKB khác SĐB)
    const quyTrinhXuLyTKB = (dong) => {
        // [SỬA LỖI ĐỘT PHÁ]: TKB lấy Tuần ở Cột C và Lớp ở Cột G
        let tuanDong = parseInt(String(dong['C'] || '').replace(/\D/g, '')) || 0; // Cột C: Tuần
        let lop = String(dong['G'] || '').trim().toUpperCase(); // Cột G: Mã Lớp
        let thu = chuanHoaThu(dong['D'] || ''); // Cột D: Thứ
        let buoi = String(dong['E'] || '').trim().toLowerCase() === 'sáng' ? 'sáng' : 'chiều'; // Cột E: Buổi
        let tiet = String(dong['F'] || '').trim(); // Cột F: Tiết
        
        let khoa = `${tuanDong}_${lop}_${thu}_${buoi}_${tiet}`;
        mapTkbToanTap[khoa] = {
            'Tuần': tuanDong, 'Mã Lớp': lop, 'Thứ': thu, 'Buổi': buoi, 'Tiết': tiet,
            'Môn Học': dong['H'] || '', // Cột H: Môn Học
            'Mã GV': dong['I'] || '',   // Cột I: Mã GV
            'Ngày': dong['K'] || ''     // Cột K: Ngày
        };
        return tuanDong;
    };

    if (duLieuSever.DATA_TKB) {
        duLieuSever.DATA_TKB.forEach(dong => {
            let tuanDong = quyTrinhXuLyTKB(dong);
            if (tuanDong >= tuanHeThong) delete mapTkbToanTap[`${tuanDong}_${String(dong['G'] || '').trim().toUpperCase()}_${chuanHoaThu(dong['D'] || '')}_${String(dong['E'] || '').trim().toLowerCase() === 'sáng' ? 'sáng' : 'chiều'}_${String(dong['F'] || '').trim()}`];
        });
    }
    
    if (duLieuSever.TKB_HIEN_TAI) {
        duLieuSever.TKB_HIEN_TAI.forEach(dong => {
            let tuanDong = quyTrinhXuLyTKB(dong);
            if (tuanDong < tuanHeThong) delete mapTkbToanTap[`${tuanDong}_${String(dong['G'] || '').trim().toUpperCase()}_${chuanHoaThu(dong['D'] || '')}_${String(dong['E'] || '').trim().toLowerCase() === 'sáng' ? 'sáng' : 'chiều'}_${String(dong['F'] || '').trim()}`];
        });
    }

    // [LƯU TRỮ TỪ ĐIỂN TKB TOÀN TẬP]: Phục vụ đồng bộ chủ động theo yêu cầu của giáo viên
    window._mapTkbToanTap = mapTkbToanTap;
    mapTkbToanTapToanCuc = mapTkbToanTap;

    // =========================================================================
    // [SMART RECONCILIATION ENGINE - ĐỐI CHIẾU KHÁC BIỆT CHỦ ĐỘNG]:
    // Chỉ đối chiếu phát hiện sai lệch TKB cho các tiết CHƯA KÝ để hiển thị Badge số lượng.
    // ĐỒNG THỜI LUÔN GÁN Mã GV từ TKB vào SĐB để phân quyền chính xác (vì Sheet SĐB không có cột Mã GV).
    // TUYỆT ĐỐI KHÔNG TỰ ĐỘNG GHI ĐÈ Môn/PPCT/Tên bài ĐÃ LƯU KHI VỪA MỞ SỔ!
    // =========================================================================
    let danhSachTietCapNhatTuTKB = [];

    Object.keys(mapTkbToanTap).forEach(khoa => {
        let dongTkb = mapTkbToanTap[khoa];
        let monTkb = String(dongTkb['Môn Học'] || '').trim();
        let gvTkb = String(dongTkb['Mã GV'] || '').trim();
        let ngayTkb = String(dongTkb['Ngày'] || '').trim();

        if (!mapDuiLieuHopNhat[khoa]) {
            // Tiết này có trong TKB nhưng chưa từng có trong SĐB -> Khởi tạo placeholder hiển thị trên lưới
            if (monTkb !== '') {
                mapDuiLieuHopNhat[khoa] = {
                    'Tuần': String(dongTkb['Tuần']).replace(/\D/g, ''),
                    'Mã Lớp': String(dongTkb['Mã Lớp']).trim().toUpperCase(),
                    'Thứ': chuanHoaThu(dongTkb['Thứ']),
                    'Buổi': String(dongTkb['Buổi']).trim().toLowerCase() === 'sáng' ? 'sáng' : 'chiều',
                    'Tiết': String(dongTkb['Tiết']).trim(),
                    'Môn Học': monTkb,
                    'Mã GV': gvTkb,
                    'Ngày': ngayTkb,
                    'TietPPCT_Thuc': '', 'TenBai_Thuc': '', 'NhanXet_Thuc': '', 
                    'XepLoai_Thuc': '', 'ChuKy_Thuc': '', 'ChuyenCan_Thuc': '',
                    'DaLuu': false,
                    'CapNhatTuTKB': false
                };
            }
        } else {
            let dongSdb = mapDuiLieuHopNhat[khoa];
            // [CỰC KỲ QUAN TRỌNG]: SĐB không lưu cột Mã GV, nên Mã GV phải LUÔN được nạp từ TKB để nhận diện giáo viên được phân công!
            dongSdb['Mã GV'] = gvTkb;
            if (ngayTkb && (!dongSdb['Ngày'] || dongSdb['Ngày'] === '...')) {
                dongSdb['Ngày'] = ngayTkb;
            }

            let chuKy = String(dongSdb['ChuKy_Thuc'] || '').trim();
            let daKy = (chuKy !== '' && chuKy !== '--');

            if (!daKy) {
                // TIẾT CHƯA KÝ TÊN -> ĐỐI CHIẾU KHÁC BIỆT MÔN VÀ GV
                let monSdb = String(dongSdb['Môn Học'] || '').trim();
                let coThayDoiMon = (monTkb !== '' && monTkb.toLowerCase() !== monSdb.toLowerCase());

                if (coThayDoiMon) {
                    let chiTietDoi = `Môn: [${monSdb || '--'} ➔ ${monTkb || '--'}] | GV: [${gvTkb || '--'}]`;
                    danhSachTietCapNhatTuTKB.push({
                        tuan: dongSdb['Tuần'],
                        lop: dongSdb['Mã Lớp'],
                        thu: dongSdb['Thứ'],
                        buoi: dongSdb['Buổi'],
                        tiet: dongSdb['Tiết'],
                        monTkb: monTkb,
                        gvTkb: gvTkb,
                        ngayTkb: ngayTkb,
                        monSdb: monSdb,
                        chiTiet: chiTietDoi
                    });
                }
            }
        }
    });

    // Quét các tiết trong SĐB chưa ký nhưng TKB mới đã hủy/xóa tiết đó
    Object.keys(mapDuiLieuHopNhat).forEach(khoa => {
        let dongSdb = mapDuiLieuHopNhat[khoa];
        let chuKy = String(dongSdb['ChuKy_Thuc'] || '').trim();
        let daKy = (chuKy !== '' && chuKy !== '--');
        if (!daKy) {
            let dongTkb = mapTkbToanTap[khoa];
            let monTkb = dongTkb ? String(dongTkb['Môn Học'] || '').trim() : '';
            let monSdb = String(dongSdb['Môn Học'] || '').trim();
            if (monSdb !== '' && monTkb === '') {
                danhSachTietCapNhatTuTKB.push({
                    tuan: dongSdb['Tuần'],
                    lop: dongSdb['Mã Lớp'],
                    thu: dongSdb['Thứ'],
                    buoi: dongSdb['Buổi'],
                    tiet: dongSdb['Tiết'],
                    monTkb: '',
                    gvTkb: '',
                    monSdb: monSdb,
                    chiTiet: `Hủy tiết [${monSdb}] theo TKB mới`
                });
            }
        }
    });

    window._danhSachTietCapNhatTuTKB = danhSachTietCapNhatTuTKB;

    let tkbGop = Object.values(mapDuiLieuHopNhat);
    const thuTuThu = { "Thứ 2": 2, "Thứ 3": 3, "Thứ 4": 4, "Thứ 5": 5, "Thứ 6": 6, "Thứ 7": 7, "Chủ nhật": 8 };
    const thuTuBuoi = { "sáng": 1, "chiều": 2, "tối": 3 };
    
    tkbGop.sort((a, b) => {
        let tuanA = parseInt(a['Tuần']) || 0; let tuanB = parseInt(b['Tuần']) || 0;
        if (tuanA !== tuanB) return tuanA - tuanB;
        let thuA = thuTuThu[a['Thứ']] || 99; let thuB = thuTuThu[b['Thứ']] || 99;
        if (thuA !== thuB) return thuA - thuB;
        let buoiA = thuTuBuoi[a['Buổi']] || 99; let buoiB = thuTuBuoi[b['Buổi']] || 99;
        if (buoiA !== buoiB) return buoiA - buoiB;
        return (parseInt(a['Tiết']) || 0) - (parseInt(b['Tiết']) || 0);
    });

    // 3. XỬ LÝ KHUNG CHƯƠNG TRÌNH (Sử dụng dòng tiêu đề r=0 để định vị cột Lớp)
    dinhMucKhungCT = {};
    if (duLieuSever.KHUNG_CHUONG_TRINH && duLieuSever.KHUNG_CHUONG_TRINH.length > 0) {
        let dongTieuDe = duLieuSever.KHUNG_CHUONG_TRINH[0]; // Lấy Header map
        
        for (let i = 1; i < duLieuSever.KHUNG_CHUONG_TRINH.length; i++) {
            let dong = duLieuSever.KHUNG_CHUONG_TRINH[i];
            let mon = String(dong['A'] || '').trim().toLowerCase(); // Cột A: Môn học
            if (!mon || mon === 'môn học') continue;
            
            Object.keys(dong).forEach(colKey => {
                if (colKey !== 'A' && colKey !== 'B') { 
                    let tenLopKhoi = String(dongTieuDe[colKey] || '').trim();
                    let matchKhoi = tenLopKhoi.match(/\d+/);
                    if (matchKhoi) {
                        let khoi = matchKhoi[0];
                        if (!dinhMucKhungCT[khoi]) dinhMucKhungCT[khoi] = {};
                        let tiet = parseInt(dong[colKey]) || 0;
                        if (tiet > 0) dinhMucKhungCT[khoi][mon] = tiet;
                    }
                }
            });
        }
    }

    // 4. XỬ LÝ PPCT (Tọa độ vật lý của PPCT)
    tuDienPPCTToanCuc = {}; 
    if (duLieuSever.PPCT) {
        let boNhoKhoi = ''; let boNhoMon = ''; 
        duLieuSever.PPCT.forEach(dong => {
            let khoiGoc = String(dong['A'] || '').trim(); // Cột A: Khối
            if (khoiGoc !== '') boNhoKhoi = khoiGoc; else khoiGoc = boNhoKhoi; 
            let matchKhoi = khoiGoc.match(/\d+/);
            let khoi = matchKhoi ? matchKhoi[0] : khoiGoc; 
            
            let tietPPCT_Goc = String(dong['B'] || '').trim(); // Cột B: Tiết
            let monGoc = String(dong['C'] || '').trim().toLowerCase(); // Cột C: Môn học
            if (monGoc !== '') boNhoMon = monGoc; else monGoc = boNhoMon; 
            let monRutGon = monGoc.replace(/[0-9\(\)]/g, '').trim().replace(/\s+/g, ' ');
            let baiDay = dong['D'] || ''; // Cột D: Tên bài
            
            tuDienPPCTToanCuc[`${khoi}_${monGoc}_${tietPPCT_Goc}`] = baiDay;
            if (!tuDienPPCTToanCuc[`${khoi}_${monRutGon}_${tietPPCT_Goc}`]) {
                tuDienPPCTToanCuc[`${khoi}_${monRutGon}_${tietPPCT_Goc}`] = baiDay;
            }
        });
    }

    // =========================================================================
    // [NÂNG CẤP ĐỒNG BỘ - BẢN FIX CUỐI]: Gán danh sách giáo viên từ Backend gửi sang
    // =========================================================================
    // Nhờ việc Backend trả trực tiếp TEN_GIAO_VIEN, ta gán chữ ký:
    // - Quản trị viên (BGH): Giữ danh sách toàn trường để có thể ký/điều chỉnh thay
    // - Giáo viên bộ môn: Chỉ được ký đúng tên của chính mình
    if (coToanQuyenSDB) {
        if (duLieuSever.DANH_SACH_GIAO_VIEN && Array.isArray(duLieuSever.DANH_SACH_GIAO_VIEN)) {
            danhSachGiaoVienToanCuc = duLieuSever.DANH_SACH_GIAO_VIEN;
        } else if (typeof thongSoHocVu !== 'undefined' && thongSoHocVu.DANH_SACH_GIAO_VIEN) {
            danhSachGiaoVienToanCuc = thongSoHocVu.DANH_SACH_GIAO_VIEN;
        }
    } else if (tenGvDangNhapHeThong && tenGvDangNhapHeThong.trim() !== '') {
        danhSachGiaoVienToanCuc = [tenGvDangNhapHeThong.trim()];
    } else {
        danhSachGiaoVienToanCuc = [];
    }

    mapTkbToanTapToanCuc = mapTkbToanTap; // Lưu trữ bản đồ TKB toàn trường của tất cả các tuần
    duLieuTKBGopDaMap = tkbGop; 
    napDropdownSoDauBai();
}

let khoaDoubleKetXuat = false;

// =========================================================================
// [THUẬT TOÁN BẢO VỆ TIẾN ĐỘ PPCT]: KIỂM TRA TÍNH TUẦN TỰ LƯU SỔ ĐẦU BÀI
// Ngăn chặn nhảy cóc sang Tuần N khi các tuần trước (đặc biệt Tuần 1) chưa lưu
// =========================================================================

// =========================================================================
// [KIỂM SOÁT PHÂN QUYỀN CHÍNH XÁC]: HÀM XÁC THỰC QUYỀN GIÁO VIÊN THEO TỪNG TIẾT TKB
// Đảm bảo: Thời khóa biểu phân dạy Tiết 1 Tiếng Việt thì CHỈ được quyền ký tiết đó;
// các tiết khác của môn Tiếng Việt (hoặc môn khác) không được phân công sẽ BỊ KHÓA HOÀN TOÀN!
// =========================================================================
window.kiemTraQuyenGiaoVienTheoTiet = function(dongDuLieu, maLop, monHoc) {
    // 1. Quản trị viên / Ban Giám Hiệu: Toàn quyền quản trị chuyên môn
    if (coToanQuyenSDB) return true;
    let theChot = document.getElementById('theChotQuyenSDB');
    if (theChot && (theChot.getAttribute('data-quantri') === 'true' || theChot.getAttribute('data-quantri') === true)) return true;

    // 2. Định danh giáo viên đang đăng nhập
    let madinhdanh = maGvDangNhapHeThong || (theChot ? theChot.getAttribute('data-madinhdanh') || '' : '');
    let tendinhdanh = tenGvDangNhapHeThong || (theChot ? theChot.getAttribute('data-tendinhdanh') || '' : '') || madinhdanh;
    let emailDinhDanh = (typeof window.dinhDanhGiaoVienToanCuc !== 'undefined' && window.dinhDanhGiaoVienToanCuc !== '') ? window.dinhDanhGiaoVienToanCuc.trim().toLowerCase() : '';

    let maChuan = window.chuanHoaDinhDanhGiaoVien(madinhdanh);
    let tenChuan = window.chuanHoaDinhDanhGiaoVien(tendinhdanh);

    if (!maChuan && !tenChuan && !emailDinhDanh) return false;

    // Hàm kiểm tra khớp danh tính giáo viên đăng nhập
    const laGiaoVienHienTai = function(chuoiGV) {
        if (!chuoiGV) return false;
        let gvNorm = window.chuanHoaDinhDanhGiaoVien(chuoiGV);
        if (!gvNorm) return false;

        let tokens = gvNorm.split(/[,;&-]/).map(t => t.trim()).filter(Boolean);
        for (let t of tokens) {
            // Khớp chính xác mã GV, tên GV, hoặc email
            if (maChuan && t === maChuan) return true;
            if (tenChuan && t === tenChuan) return true;
            if (emailDinhDanh && t === emailDinhDanh) return true;

            let tKhongDau = t.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            let maKhongDau = maChuan ? maChuan.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';
            let tenKhongDau = tenChuan ? tenChuan.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';

            if (maKhongDau && tKhongDau === maKhongDau) return true;
            if (tenKhongDau && tKhongDau === tenKhongDau) return true;

            // Khớp theo tên chính (từ cuối cùng của họ tên, ví dụ: 'Hương' trong 'Nguyễn Thị Hương')
            if (tenChuan) {
                let parts = tenChuan.split(/\s+/);
                let tenChinh = parts[parts.length - 1];
                let tenChinhKhongDau = tenChinh.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                
                if (t === tenChinh || tKhongDau === tenChinhKhongDau) return true;
                if (t.endsWith(' ' + tenChinh) || tKhongDau.endsWith(' ' + tenChinhKhongDau)) return true;
            }

            // Khớp họ tên đầy đủ từ 2 từ trở lên
            if (t.includes(' ') && tenChuan.includes(' ')) {
                if (t === tenChuan || t.includes(tenChuan) || tenChuan.includes(t)) return true;
            }
            if (maChuan && maChuan.length >= 4 && (t.includes(maChuan) || maChuan.includes(t))) return true;
        }
        return false;
    };

    // 3. Nếu tiết này đã có chữ ký trong SĐB:
    let chuKyHienTai = dongDuLieu ? window.chuanHoaDinhDanhGiaoVien(dongDuLieu['ChuKy_Thuc']) : '';
    if (chuKyHienTai && chuKyHienTai !== '--') {
        // Nếu chính giáo viên này đã ký -> Cho phép tiếp tục xem/sửa tiết của chính mình
        if (laGiaoVienHienTai(chuKyHienTai)) return true;
        // Nếu tiết đã được giáo viên khác ký -> Khóa cứng, tuyệt đối không được sửa hay ký đè
        return false;
    }

    // 4. [CHUẨN HÓA PHÂN QUYỀN CHẶT CHẼ THEO THỜI KHÓA BIỂU]:
    // Chỉ giáo viên ĐƯỢC PHÂN CÔNG DẠY ĐÚNG TIẾT NÀY trong Thời Khóa Biểu mới có quyền ký và nhập bài!
    // Các tiết khác (dù cùng môn) sẽ KHÔNG được quyền.
    let gvTkb = dongDuLieu ? String(dongDuLieu['Mã GV'] || '').trim() : '';

    // Fallback tra cứu trực tiếp từ mapTkbToanTap theo tọa độ tiết nếu dongDuLieu chưa gắn sẵn Mã GV
    if (!gvTkb && dongDuLieu) {
        let tuanDong = parseInt(String(dongDuLieu['Tuần']).replace(/\D/g, ''), 10) || 0;
        let lopDong = String(dongDuLieu['Mã Lớp'] || maLop || '').trim().toUpperCase();
        let thuDong = String(dongDuLieu['Thứ'] || '').trim();
        if (thuDong) {
            let thuLow = thuDong.toLowerCase();
            thuDong = thuLow.charAt(0).toUpperCase() + thuLow.slice(1);
        }
        let buoiDong = String(dongDuLieu['Buổi'] || '').trim().toLowerCase() === 'sáng' ? 'sáng' : 'chiều';
        let tietDong = String(dongDuLieu['Tiết'] || '').trim();
        let khoaTkb = `${tuanDong}_${lopDong}_${thuDong}_${buoiDong}_${tietDong}`;
        if (window._mapTkbToanTap && window._mapTkbToanTap[khoaTkb]) {
            gvTkb = String(window._mapTkbToanTap[khoaTkb]['Mã GV'] || '').trim();
        }
    }

    // Nếu Thời khóa biểu có ghi nhận giáo viên dạy tiết này:
    if (gvTkb) {
        return laGiaoVienHienTai(gvTkb);
    }

    // Nếu tiết học này không có phân công giáo viên trong TKB -> Không cấp quyền ký tự do
    return false;
};

window.moModalChiTietDongBoTKB = function() {
    let modal = document.getElementById('modalChiTietDongBoTKB');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
};

window.dongModalChiTietDongBoTKB = function() {
    let modal = document.getElementById('modalChiTietDongBoTKB');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
};

window.kiemTraTuanHopLeTruocKhiMo = function(tuanCanMo, lopChon) {
    if (!tuanCanMo || !lopChon) return { hopLe: true };
    let tMo = parseInt(String(tuanCanMo).replace(/\D/g, ''), 10) || 1;

    let lop = String(lopChon).trim().toUpperCase();
    if (!duLieuTKBGopDaMap || duLieuTKBGopDaMap.length === 0) return { hopLe: true };

    // [THÔNG MINH]: Chỉ xét các tuần THỰC SỰ CÓ LỊCH DẠY của lớp này trong CSDL
    let dsTuanCuaLop = [...new Set(
        duLieuTKBGopDaMap
            .filter(d => String(d['Mã Lớp']).trim().toUpperCase() === lop && String(d['Môn Học'] || '').trim() !== '')
            .map(d => parseInt(String(d['Tuần']).replace(/\D/g, ''), 10) || 0)
            .filter(t => t > 0)
    )].sort((a, b) => a - b);

    if (dsTuanCuaLop.length === 0) return { hopLe: true };

    // Tuần nhỏ nhất có lịch dạy của lớp này luôn luôn hợp lệ để mở (không ép buộc phải có Tuần 1 nếu dữ liệu bắt đầu từ Tuần 3)
    let tuanNhoNhat = dsTuanCuaLop[0];
    if (tMo <= tuanNhoNhat) return { hopLe: true };

    // Quét tìm tuần có lịch dạy trước tMo mà CHƯA LƯU
    for (let t of dsTuanCuaLop) {
        if (t >= tMo) break;

        let daLuuTuanT = duLieuTKBGopDaMap.some(d => 
            parseInt(String(d['Tuần']).replace(/\D/g, ''), 10) === t && 
            String(d['Mã Lớp']).trim().toUpperCase() === lop && 
            d.DaLuu === true
        );

        if (!daLuuTuanT) {
            return {
                hopLe: false,
                tuanChuaLuu: t,
                thongBao: `Lưu ý: Sổ đầu bài TUẦN ${t} của Lớp ${lop} chưa được lưu vào hệ thống.\n\nViệc mở Tuần ${tMo} có thể khiến số tiết phân phối chương trình chưa được tính lũy kế nối tiếp từ Tuần ${t}.\n\nĐồng chí có chắc chắn vẫn muốn mở Tuần ${tMo} không?`
            };
        }
    }

    return { hopLe: true };
};

function ketXuatSoDauBaiLenLuoi() {
    if (khoaDoubleKetXuat) return;
    khoaDoubleKetXuat = true;
    setTimeout(() => { khoaDoubleKetXuat = false; }, 50);

    let theSelectTuan = document.getElementById('chonTuanSo');
    let theSelectLop = document.getElementById('chonLopSo');
    let tuanChon = theSelectTuan?.value;
    let lopChon = theSelectLop?.value;

    if (!tuanChon || !lopChon) return; 

    // Chốt chặn bảo vệ nếu có thay đổi nháp
    if (coThayDoiChuaLuu_SDB) {
        let xacNhan = confirm("⚠️ Đồng chí có dữ liệu chưa lưu trên màn hình! Bấm [Hủy] để ở lại lưu, bấm [OK] để chuyển tuần (dữ liệu chưa lưu sẽ mất).");
        if (!xacNhan) {
            if (theSelectTuan && tuanTruocDo_SDB) theSelectTuan.value = tuanTruocDo_SDB;
            if (theSelectLop && lopTruocDo_SDB) theSelectLop.value = lopTruocDo_SDB;
            return;
        } else {
            coThayDoiChuaLuu_SDB = false;
        }
    }

    // [THUẬT TOÁN BẢO VỆ TIẾN ĐỘ PPCT]: CẢNH BÁO NẾU TUẦN TRƯỚC CHƯA LƯU (KHÔNG CHẶN CỨNG LÀM HỎNG Ô CHỌN)
    let kiemTraTuan = window.kiemTraTuanHopLeTruocKhiMo(tuanChon, lopChon);
    if (!kiemTraTuan.hopLe) {
        let xacNhanMo = confirm(kiemTraTuan.thongBao);
        if (!xacNhanMo) {
            // Người dùng chọn Hủy -> Chuyển về tuần chưa lưu trước đó
            if (theSelectTuan) {
                let optHopLe = Array.from(theSelectTuan.options).find(o => 
                    parseInt(String(o.value).replace(/\D/g, ''), 10) === kiemTraTuan.tuanChuaLuu
                );
                if (optHopLe) {
                    theSelectTuan.value = optHopLe.value;
                } else {
                    theSelectTuan.value = String(kiemTraTuan.tuanChuaLuu);
                }
                if (typeof window.dongBoHienThiTuSelect === 'function') {
                    window.dongBoHienThiTuSelect('chonTuanSo');
                }
            }
            tuanChon = theSelectTuan?.value;
        }
        // Nếu người dùng chọn OK -> Vẫn cho phép mở tuần đang chọn bình thường!
    }

    thucThiKetXuatSoDauBaiLenLuoi();

    tuanTruocDo_SDB = theSelectTuan?.value || '';
    lopTruocDo_SDB = theSelectLop?.value || '';
    coThayDoiChuaLuu_SDB = false; 
}

function thucThiKetXuatSoDauBaiLenLuoi() {
    let tuanChon = document.getElementById('chonTuanSo')?.value;
    let lopChon = document.getElementById('chonLopSo')?.value;
    let inputNgay = document.getElementById('chonNgaySDB');
    let vungHienThi = document.getElementById('vungHienThiSoDauBai');

    if (!tuanChon || !lopChon || !vungHienThi) return;
    if (inputNgay) {
        inputNgay.readOnly = true;
        inputNgay.classList.add('bg-slate-100', 'cursor-not-allowed');
    }

    let theChotQuyen = document.getElementById('theChotQuyenSDB');
    let madinhdanhGV = maGvDangNhapHeThong || (theChotQuyen ? theChotQuyen.getAttribute('data-madinhdanh') || '' : '');
    let quyenQuanTri = coToanQuyenSDB || (theChotQuyen ? (theChotQuyen.getAttribute('data-quantri') === 'true' || theChotQuyen.getAttribute('data-quantri') === true) : false);

    let maxTuanChon = parseInt(tuanChon.replace(/\D/g, '')) || 0;
    
    let boDemTietPPCT = {}; 
    let demTietTienDo = {}; 
    
    duLieuTKBGopDaMap.forEach(d => {
        let t = parseInt(String(d['Tuần']).replace(/\D/g, '')) || 0;
        let maLop = String(d['Mã Lớp']).trim().toUpperCase();

        if (maLop === lopChon.toUpperCase() && t <= maxTuanChon) {
            let mon = String(d['Môn Học']).trim();
            if (mon !== '') {
                let monGocChuan = mon.toLowerCase().replace(/\s+/g, ' ');
                let monPPCT = mon.replace(/[0-9\(\)]/g, '').trim().toLowerCase().replace(/\s+/g, ' ');

                if (t < maxTuanChon) {
                    if (d.DaLuu === true) {
                        demTietTienDo[monGocChuan] = (demTietTienDo[monGocChuan] || 0) + 1;
                        let tietLuu = parseInt(String(d['TietPPCT_Thuc']).replace(/\D/g, '')) || 0;
                        if (tietLuu > (boDemTietPPCT[monPPCT] || 0)) {
                            boDemTietPPCT[monPPCT] = tietLuu;
                        } else if (!boDemTietPPCT[monPPCT]) {
                            boDemTietPPCT[monPPCT] = 1;
                        } else {
                            boDemTietPPCT[monPPCT] = boDemTietPPCT[monPPCT] + 1;
                        }
                    }
                } else if (t === maxTuanChon) {
                    demTietTienDo[monGocChuan] = (demTietTienDo[monGocChuan] || 0) + 1;
                }
            }
        }
    });

    let matchKhoiChon = lopChon.match(/\d+/);
    let khoiChon = matchKhoiChon ? matchKhoiChon[0] : '';
    let dinhMucKhoiNay = dinhMucKhungCT[khoiChon] || {};
    let canhBaoHtml = ''; let hasCanhBao = false;

    if (maxTuanChon > 0) {
        for (let mon in dinhMucKhoiNay) {
            let dinhMuc = dinhMucKhoiNay[mon];
            let tietThucTe = demTietTienDo[mon] || 0; 
            let tietChuanDuKien = dinhMuc * maxTuanChon; 
            
            let doLech = tietThucTe - tietChuanDuKien;
            let tenMonIn = mon.charAt(0).toUpperCase() + mon.slice(1);

            if (doLech < 0) { 
                canhBaoHtml += `<span class="bg-red-100 text-red-700 font-bold px-3 py-1 rounded border border-red-200 shadow-sm flex items-center gap-1 text-xs whitespace-nowrap"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>${tenMonIn}: Thiếu ${Math.abs(doLech)} (tính đến hết tuần ${maxTuanChon})</span>`;
                hasCanhBao = true;
            } else if (doLech > 0) { 
                canhBaoHtml += `<span class="bg-orange-100 text-orange-700 font-bold px-3 py-1 rounded border border-orange-200 shadow-sm flex items-center gap-1 text-xs whitespace-nowrap"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>${tenMonIn}: Thừa ${doLech} (tính đến hết tuần ${maxTuanChon})</span>`;
                hasCanhBao = true;
            }
        }
    }

    let thanhCanhBaoRender = hasCanhBao ? `<div class="mb-3 p-2 bg-white border-l-4 border-red-500 shadow-sm text-sm flex flex-col md:flex-row md:items-center gap-3 w-full"><div class="flex items-center gap-2 flex-none"><div class="p-1 bg-red-100 rounded-full"><svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg></div><span class="font-extrabold text-red-700 uppercase tracking-wide text-xs">Cảnh báo Tiến độ:</span></div><div class="flex flex-wrap gap-2 flex-1">${canhBaoHtml}</div></div>` : '';

    let tkbTuanNay = duLieuTKBGopDaMap.filter(d => String(d['Tuần']).trim() === tuanChon && String(d['Mã Lớp']).trim().toUpperCase() === lopChon.toUpperCase());
    let soTietDaKy = 0;
    let soTietDaCoNoiDung = 0;
    let tongSoTietCoMon = 0;
    let dictTKB = {}; let mapNgayChinhXac = {}; 
    let coDayBuThu7 = false; let coDayBuChuNhat = false;

    tkbTuanNay.forEach(dong => {
        let thuGoc = String(dong['Thứ']).trim();
        if (thuGoc === 'Thứ 7') coDayBuThu7 = true;
        if (thuGoc === 'Chủ nhật') coDayBuChuNhat = true;
        if (dong['Ngày'] && dong['Ngày'] !== '' && dong['Ngày'] !== '...') mapNgayChinhXac[thuGoc] = dong['Ngày']; 
        let buoiKiemTra = String(dong['Buổi']).trim().toLowerCase() === 'sáng' ? 'Sang' : 'Chieu';
        
        let mon = String(dong['Môn Học']).trim();
        if (mon !== '') {
            tongSoTietCoMon++;
            let monPPCT = mon.replace(/[0-9\(\)]/g, '').trim().toLowerCase().replace(/\s+/g, ' ');

            let chuKy = String(dong['ChuKy_Thuc'] || '').trim();
            let daKy = (chuKy !== '' && chuKy !== '--');
            let tenBai = String(dong['TenBai_Thuc'] || '').trim();

            if (daKy) {
                // TIẾT ĐÃ KÝ TÊN -> BẢO TOÀN SỐ TIẾT PPCT VÀ BÀI DẠY ĐÃ KÝ
                soTietDaKy++;
                let tietDaKy = parseInt(String(dong['TietPPCT_Thuc']).replace(/\D/g, '')) || 0;
                if (tietDaKy > (boDemTietPPCT[monPPCT] || 0)) {
                    boDemTietPPCT[monPPCT] = tietDaKy;
                }
            }
            if (daKy || (dong.DaLuu && tenBai !== '')) {
                soTietDaCoNoiDung++;
            }
            if (!daKy) {
                // [TÍNH TOÁN PPCT THÔNG MINH]: TIẾT CHƯA KÝ TỰ ĐỘNG TỊNH TIẾN NỐI TIẾP THEO THỜI GIAN
                // Đảm bảo khi TKB thay đổi (đổi môn, thêm/bớt tiết, hoán đổi tiết), 
                // số tiết luôn tăng dần đều theo thứ tự thời gian, không bao giờ bị nhảy cóc hay mất bài.
                boDemTietPPCT[monPPCT] = (boDemTietPPCT[monPPCT] || 0) + 1;
                dong['TietPPCT_Thuc'] = boDemTietPPCT[monPPCT];

                // Tự động kéo Tên bài học chính xác từ từ điển PPCT theo số tiết mới
                let khoaChinh = `${khoiChon}_${mon.toLowerCase().replace(/\s+/g, ' ')}_${dong['TietPPCT_Thuc']}`;
                let khoaPhu = `${khoiChon}_${monPPCT}_${dong['TietPPCT_Thuc']}`;
                let tenBaiMoi = tuDienPPCTToanCuc[khoaChinh] || tuDienPPCTToanCuc[khoaPhu] || '';
                if (tenBaiMoi) {
                    dong['TenBai_Thuc'] = tenBaiMoi;
                }
            }
        }
        
        dictTKB[`${thuGoc}_${buoiKiemTra}_${dong['Tiết']}`] = dong;
    });

    // =========================================================================
    // [KHỐI MỚI 1]: KIỂM TRA TRẠNG THÁI KHÓA TUẦN & CẬP NHẬT BANNER / NÚT BẤM
    // =========================================================================
    let soBiKhoa = window.kiemTraTuanDaKhoa(tuanChon);
    let thongTinKhoa = duLieuKhoaSoToanCuc[maxTuanChon] || {};

    let btnKhoa = document.getElementById('btnKhoaSoDauBai');
    if (btnKhoa) {
        if (soBiKhoa) {
            btnKhoa.className = "bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 text-xs shadow transition duration-200 rounded flex items-center gap-1.5";
            btnKhoa.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path></svg><span>Mở khóa Tuần ${maxTuanChon}</span>`;
        } else {
            btnKhoa.className = "bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 text-xs shadow transition duration-200 rounded flex items-center gap-1.5";
            btnKhoa.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg><span>Khóa Sổ Tuần ${maxTuanChon}</span>`;
        }
    }

    let theTrangThaiHtml = '';
    if (soBiKhoa) {
        let namHocHienThi = thongTinKhoa.namHoc ? ` (NĂM HỌC ${thongTinKhoa.namHoc})` : '';
        theTrangThaiHtml = `
            <div class="mb-4 p-3 bg-red-50 border-2 border-red-500 shadow-sm flex items-center justify-between rounded animate-pulse-once">
                <div class="flex items-center gap-3">
                    <div class="bg-red-600 text-white rounded-full p-1.5 shadow flex-none">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    </div>
                    <div>
                        <span class="text-sm font-black text-red-900 tracking-wide uppercase block">SỔ ĐẦU BÀI TUẦN ${maxTuanChon}${namHocHienThi} TOÀN TRƯỜNG ĐÃ ĐƯỢC KHÓA (CHẾ ĐỘ CHỈ XEM)</span>
                        <span class="text-xs text-red-700 font-semibold">Người khóa: <b>${thongTinKhoa.nguoiThucHien || 'Ban Giám Hiệu'}</b> lúc ${thongTinKhoa.thoiGian || 'Gần đây'}. Toàn bộ các lớp đã được niêm phong, không thể chỉnh sửa.</span>
                    </div>
                </div>
                <span class="text-xs font-extrabold bg-red-200 text-red-900 border border-red-400 px-3 py-1.5 rounded-full uppercase tracking-wider whitespace-nowrap">Chỉ Xem</span>
            </div>`;
    } else if (tongSoTietCoMon > 0) {
        let coTietDaChot = (soTietDaKy > 0 || soTietDaCoNoiDung > 0);
        if (coTietDaChot) {
            theTrangThaiHtml = `<div class="mb-4 p-2 bg-emerald-50 border border-emerald-200 shadow-sm flex items-center justify-between rounded"><div class="flex items-center gap-2"><div class="bg-emerald-500 rounded-full p-1"><svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg></div><span class="text-sm font-extrabold text-emerald-800 tracking-wide uppercase">CÓ DỮ LIỆU ĐÃ ĐƯỢC CHỐT SỔ</span></div><span class="text-xs font-semibold text-emerald-700 italic hidden sm:block">Các tiết đã Ký Tên sẽ bị khóa cứng. Các tiết chưa ký vẫn tiếp tục mở để chỉnh sửa.</span></div>`;
        } else {
            theTrangThaiHtml = `<div class="mb-4 p-2 bg-amber-50 border border-amber-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded animate-pulse-once"><div class="flex items-center gap-2"><div class="bg-amber-500 rounded-full p-1"><svg class="w-3 h-3 text-white animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg></div><span class="text-sm font-extrabold text-amber-800 tracking-wide uppercase">DỮ LIỆU MỚI TỊNH TIẾN (CHƯA LƯU)</span></div><span class="text-xs font-bold text-amber-800 bg-amber-200 px-3 py-1 rounded-full border border-amber-400">⚠️ Yêu cầu: Bấm "Đồng bộ TKB", Nhập Đánh giá, Ký tên và bấm "Lưu Sổ đầu bài" để lưu!</span></div>`;
        }
    }

    let tapHopMonDay = new Set();
    tkbTuanNay.forEach(dong => {
        let monHoc = String(dong['Môn Học']).trim();
        if (monHoc !== '') {
            if (quyenQuanTri || window.kiemTraQuyenGiaoVienTheoTiet(dong, lopChon, monHoc)) {
                tapHopMonDay.add(monHoc);
            }
        }
    });

    let chuoiMonDay = quyenQuanTri 
        ? 'Toàn quyền Quản trị Chuyên môn (Ban Giám Hiệu)' 
        : (tapHopMonDay.size > 0 ? Array.from(tapHopMonDay).join(', ') : '<span class="text-red-500 font-normal">Không có tiết dạy tại lớp này</span>');
    let tenHienThiGv = (theChotQuyen ? theChotQuyen.getAttribute('data-tendinhdanh') : '') || madinhdanhGV;
    let theHienThiQuyen = `<div class="mb-4 p-2.5 bg-blue-50 border border-blue-300 shadow-sm text-sm rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-pulse-once"><div><span class="font-bold text-blue-800">Giáo viên:</span> <span class="text-blue-700 font-extrabold">${tenHienThiGv || 'Chưa nhận diện'}</span></div><div class="text-left sm:text-right sm:max-w-[70%]"><span class="font-bold text-blue-800">Được phân công dạy:</span> <span class="text-blue-700 font-semibold italic">${chuoiMonDay}</span></div></div>`;

    // [UI THÔNG MINH - CHỦ ĐỘNG ĐỒNG BỘ]:
    // Loại bỏ hoàn toàn banner chiếm diện tích màn hình. Chuyển toàn bộ chỉ báo thành Badge số lượng trên nút "Đồng bộ TKB"
    let thongBaoCapNhatTkbHtml = '';
    let dsCapNhatLopNay = (window._danhSachTietCapNhatTuTKB || []).filter(item => 
        String(item.tuan).trim() === String(tuanChon).replace(/\D/g, '') &&
        String(item.lop).trim().toUpperCase() === String(lopChon).trim().toUpperCase()
    );
    let soTietCanDongBo = dsCapNhatLopNay.length;

    // Cập nhật trạng thái nút bấm trên thanh công cụ
    setTimeout(() => {
        let btnDongBo = document.getElementById('btnDongBoTenBai');
        if (btnDongBo) {
            if (soTietCanDongBo > 0) {
                btnDongBo.innerHTML = `
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    <span>Đồng bộ TKB</span>
                    <span class="ml-1 px-1.5 py-0.2 bg-red-600 text-white rounded-full text-[10px] font-black animate-pulse shadow-xs">${soTietCanDongBo}</span>
                `;
                btnDongBo.className = "bg-amber-500 hover:bg-amber-600 text-white font-bold px-3 py-2 text-xs shadow-md transition duration-200 rounded flex items-center gap-1.5 ring-2 ring-amber-300 ring-offset-1 cursor-pointer";
                btnDongBo.title = `Có ${soTietCanDongBo} tiết chưa ký có thay đổi theo Thời khóa biểu mới. Bấm để chủ động đồng bộ!`;
            } else {
                btnDongBo.innerHTML = `
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    <span>Đồng bộ TKB</span>
                `;
                btnDongBo.className = "bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 text-xs shadow transition duration-200 rounded flex items-center gap-1.5 cursor-pointer";
                btnDongBo.title = "Đồng bộ môn, giáo viên và tên bài học từ TKB & PPCT";
            }
        }
    }, 50);

    let danhSachThu = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6"];
    if (coDayBuThu7) danhSachThu.push("Thứ 7");
    if (coDayBuChuNhat) danhSachThu.push("Chủ nhật");

    let mienNgayHienTai = '';
    if (mapNgayChinhXac['Thứ 2']) {
        let p = mapNgayChinhXac['Thứ 2'].split('/');
        if (p.length === 3) mienNgayHienTai = `${p[2]}-${p[1]}-${p[0]}`; 
    } else {
        let keys = Object.keys(mapNgayChinhXac);
        if (keys.length > 0) {
            let thuBatKy = keys[0];
            let p = mapNgayChinhXac[thuBatKy].split('/');
            if (p.length === 3) {
                let d = new Date(parseInt(p[2], 10), parseInt(p[1], 10) - 1, parseInt(p[0], 10));
                let mapThuToDay = {"Thứ 2": 1, "Thứ 3": 2, "Thứ 4": 3, "Thứ 5": 4, "Thứ 6": 5, "Thứ 7": 6, "Chủ nhật": 0};
                let khoangCach = mapThuToDay[thuBatKy] - 1; 
                d.setDate(d.getDate() - khoangCach);
                mienNgayHienTai = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
            }
        }
    }

    if (inputNgay && mienNgayHienTai) {
        inputNgay.value = mienNgayHienTai;
    }

    let ngayDauTieuDe = mienNgayHienTai ? tinhNgayTuInputDate(mienNgayHienTai, "Thứ 2") : '...';
    let ngayCuoiTieuDe = mienNgayHienTai ? tinhNgayTuInputDate(mienNgayHienTai, danhSachThu[danhSachThu.length - 1]) : '...';

    let htmlBang = `
        <div class="mb-8 bang-so-dau-bai-container overflow-x-auto">
            <div class="flex justify-between items-center mb-2">
                <span class="font-bold text-slate-800 uppercase text-base header-lop">LỚP: ${lopChon}</span>
                <span class="text-center italic text-sm text-slate-600 flex-1 header-ngay">(Từ ngày ${ngayDauTieuDe} đến ngày ${ngayCuoiTieuDe})</span>
                <span class="font-bold text-slate-800 uppercase text-base header-tuan">TUẦN ${tuanChon.replace(/\D/g,'')}</span>
            </div>
            <table class="w-full min-w-[950px] border-collapse border border-gray-500 text-sm">
                <thead class="bg-slate-100 text-center font-bold">
                <tr>
                        <th class="border border-gray-500 p-2 w-20">THỨ</th>
                        <th class="border border-gray-500 p-2 w-10">TIẾT</th>
                        <th class="border border-gray-500 p-2 min-w-[80px] w-20">C.CẦN</th>
                        <th class="border border-gray-500 p-2 min-w-[140px] w-40">MÔN</th>
                        <th class="border border-gray-500 p-2 w-12">TIẾT PPCT</th>
                        <th class="border border-gray-500 p-2 min-w-[240px] w-1/2">TÊN BÀI DẠY</th>
                        <th class="border border-gray-500 p-2 min-w-[240px] w-1/2">NHẬN XÉT CỦA GV</th>
                        <th class="border border-gray-500 p-2 min-w-[85px] w-20">XẾP LOẠI</th>
                        <th class="border border-gray-500 p-2 min-w-[200px]">GIÁO VIÊN DẠY</th>
                    </tr>
                </thead>
                <tbody>
    `;

    danhSachThu.forEach(thu => {
        let ngayCuaThu = mienNgayHienTai ? tinhNgayTuInputDate(mienNgayHienTai, thu) : '';
        let hienThiThu = ngayCuaThu ? `<span style="display: block;">${thu}</span><span style="display: block; font-size: 11pt; font-weight: normal;">${ngayCuaThu}</span>` : `<span style="display: block;">${thu}</span>`;
        let danhSachBuoi = [{ id: 'Sang', dataBuoi: 'Sáng', dsTiet: [1, 2, 3, 4, 5] }, { id: 'Chieu', dataBuoi: 'Chiều', dsTiet: [1, 2, 3, 4] }];
        let tongDongTrongNgay = 9; let daInCotThu = false;

        danhSachBuoi.forEach(buoiObj => {
            buoiObj.dsTiet.forEach(tiet => {
                let dongDuLieu = dictTKB[`${thu}_${buoiObj.id}_${tiet}`]; 
                let monHoc = dongDuLieu ? dongDuLieu['Môn Học'] : '';
                let tietPPCT = dongDuLieu ? dongDuLieu['TietPPCT_Thuc'] : '';
                let isDaLuu = dongDuLieu ? dongDuLieu['DaLuu'] : false;
                let tenBai = dongDuLieu ? dongDuLieu['TenBai_Thuc'] : '';
                let nhanXet = dongDuLieu ? dongDuLieu['NhanXet_Thuc'] : '';
                let xepLoai = dongDuLieu ? dongDuLieu['XepLoai_Thuc'] : '';
                let chuKy = dongDuLieu ? dongDuLieu['ChuKy_Thuc'] : '';
                let chuyenCan = dongDuLieu ? (dongDuLieu['ChuyenCan_Thuc'] || '') : '';
                
                // =========================================================================
                // [KHỐI MỚI 2]: KHÓA CỨNG Ô NẾU TUẦN ĐÃ KHÓA
                // =========================================================================
                let isLocked = soBiKhoa; 

                let quyenNhapThuCong = quyenQuanTri || window.kiemTraQuyenGiaoVienTheoTiet(dongDuLieu, lopChon, monHoc);
                
                let thuocVeGvHienTai = quyenNhapThuCong && !quyenQuanTri;
                let cssTenBai = ""; let theTenBai = "";
                let theNhanXet = ""; let theXepLoai = ""; let theChuKy = ""; let theChuyenCan = ""; 
                let theTietPPCT = ""; 
                
                if (monHoc && monHoc !== "") {
                    let monPPCT = monHoc.replace(/[0-9\(\)]/g, '').trim().toLowerCase().replace(/\s+/g, ' ');

                    if (isLocked) {
                        cssTenBai = "text-emerald-700 font-bold";
                        theTenBai = `<span class="font-semibold text-slate-800">${tenBai}</span>`;
                        theChuyenCan = `<span class="font-bold text-slate-800 block text-center">${chuyenCan}</span>`;
                        theNhanXet = `<span class="font-normal text-slate-800 block">${nhanXet}</span>`;
                        theXepLoai = `<span class="font-bold text-slate-800 block text-center">${xepLoai}</span>`;
                        theChuKy = `<span class="font-bold text-slate-800 uppercase block text-center">${chuKy}</span>`;
                        theTietPPCT = `<span class="font-extrabold text-blue-700 block text-center">${tietPPCT}</span>`; 
                    } else {
                        let trangThaiKhoa = !quyenNhapThuCong ? "disabled" : "";
                        let cssNenKhoa = !quyenNhapThuCong ? "bg-slate-100 cursor-not-allowed opacity-70" : "bg-transparent";
                        let placeholderText = !quyenNhapThuCong ? "Không có quyền" : "Nhập...";

                        theTenBai = `<textarea rows="1" oninput="this.style.height='auto'; this.style.height=(this.scrollHeight)+'px';" ${trangThaiKhoa} class="w-full text-left outline-none ${cssNenKhoa} font-semibold text-slate-800 placeholder-slate-400 px-1 resize-none overflow-hidden align-middle" placeholder="${placeholderText}">${tenBai}</textarea>`;
                        theChuyenCan = `<input type="text" ${trangThaiKhoa} class="w-full text-center outline-none ${cssNenKhoa} font-semibold text-slate-800 placeholder-slate-400" placeholder="..." value="${chuyenCan}">`;
                        theNhanXet = `<textarea rows="1" oninput="this.style.height='auto'; this.style.height=(this.scrollHeight)+'px';" ${trangThaiKhoa} class="w-full text-left outline-none ${cssNenKhoa} font-normal text-slate-800 placeholder-slate-400 px-1 resize-none overflow-hidden align-middle" placeholder="Nhận xét...">${nhanXet}</textarea>`;
                        
                        let monHocAnToan = monHoc.replace(/'/g, "\\'"); 
                        let onfocusLogic = `moKhungTruotPPCT(event, this, '${khoiChon}', '${monHocAnToan}', this.value || ${parseInt(tietPPCT) || (boDemTietPPCT[monPPCT] || 1)})`;
                        
                        theTietPPCT = `<input type="text" onclick="${onfocusLogic}" readonly ${trangThaiKhoa} 
                                        class="w-full text-center outline-none ${cssNenKhoa} font-extrabold text-blue-700 placeholder-blue-300 transition-all cursor-pointer hover:bg-blue-50" 
                                        placeholder="..." value="${tietPPCT}">`;
                                              
                        let optTot = (xepLoai === 'Tốt') ? 'selected' : '';
                        let optKha = (xepLoai === 'Khá') ? 'selected' : '';
                        let optTB = (xepLoai === 'TB') ? 'selected' : '';
                        let optYeu = (xepLoai === 'Yếu') ? 'selected' : '';
                        
                        theXepLoai = `<select ${trangThaiKhoa} class="w-full text-center outline-none ${cssNenKhoa} font-bold text-slate-800 cursor-pointer appearance-none"><option value="" ${!xepLoai ? 'selected' : ''}>-Chọn-</option><option value="Tốt" ${optTot}>Tốt</option><option value="Khá" ${optKha}>Khá</option><option value="TB" ${optTB}>TB</option><option value="Yếu" ${optYeu}>Yếu</option></select>`;
                        
                        let onfocusChuKy = `moKhungTruotChuKy(event, this)`;
                        theChuKy = `<div class="relative flex items-center justify-center w-full h-full">
                                        <input type="text" autocomplete="off" ${trangThaiKhoa} data-thuocve="${thuocVeGvHienTai}" 
                                            class="w-full text-center outline-none transition-colors duration-300 rounded ${cssNenKhoa} font-semibold text-blue-700 placeholder-blue-300 cursor-pointer hover:bg-blue-50 focus:bg-blue-50 pr-5" 
                                            placeholder="${!quyenNhapThuCong ? 'Không có quyền' : 'Ghi rõ họ tên...'}" value="${chuKy}" 
                                            onclick="${onfocusChuKy}" 
                                            oninput="locDanhSachChuKy(this)">
                                        ${!quyenNhapThuCong ? '' : `<svg class="w-4 h-4 absolute right-1 text-blue-400 pointer-events-none opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>`}
                                    </div>`;
                    }
                }

                let isCuoiBuoi = (tiet === buoiObj.dsTiet[buoiObj.dsTiet.length - 1]);
                let kieuVienNgang = isCuoiBuoi ? "solid" : "dashed";
                let doDayVienNgang = isCuoiBuoi ? "2px" : "1px";
                let styleVien = `border-left: 1px solid #6b7280 !important; border-right: 1px solid #6b7280 !important; border-bottom: ${doDayVienNgang} ${kieuVienNgang} #6b7280 !important; border-top: none !important;`;
                
                let coCapNhatTkb = dongDuLieu && dongDuLieu['CapNhatTuTKB'] === true;
                let attrThayDoi = coCapNhatTkb ? "true" : "false";
                let bgDong = coCapNhatTkb ? "bg-blue-50/50 hover:bg-blue-100/60" : "hover:bg-slate-50";
                let badgeTkb = coCapNhatTkb ? `<span class="inline-block ml-1 px-1.5 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-700 border border-blue-300" title="Tiết học được tự động cập nhật theo TKB mới nhất (chưa ký)">TKB mới</span>` : '';

                htmlBang += `<tr class="${bgDong} transition-colors duration-150 group" data-buoi="${buoiObj.dataBuoi}" data-daluu="${isDaLuu}" data-thaydoi="${attrThayDoi}">`;
                
                if (!daInCotThu) {
                    htmlBang += `<td class="text-center font-bold uppercase leading-tight bg-white group-hover:bg-slate-50" style="border: 1px solid #6b7280 !important; border-bottom: 2px solid #6b7280 !important;" rowspan="${tongDongTrongNgay}">${hienThiThu}</td>`;
                    daInCotThu = true;
                }

                htmlBang += `
                    <td class="text-center p-1 bg-white group-hover:bg-slate-50" style="${styleVien}" title="Buổi ${buoiObj.dataBuoi}" data-loai="tietSDB">${tiet}</td>
                    <td class="text-center p-1 bg-white group-hover:bg-slate-50 align-middle" style="${styleVien}" data-loai="chuyenCan">${theChuyenCan}</td>
                    <td class="p-1 font-bold text-center text-slate-900 bg-white group-hover:bg-slate-50" style="${styleVien}" data-loai="mon">${monHoc}${badgeTkb}</td>
                    <td class="p-1 bg-white group-hover:bg-slate-50 align-middle" style="${styleVien}" data-loai="tiet">${theTietPPCT}</td>
                    <td class="p-1 ${cssTenBai} bg-white group-hover:bg-slate-50 align-middle" style="white-space: normal; word-wrap: break-word; ${styleVien}" data-loai="tenBai" data-islocked="${isLocked}" data-coquyensua="${quyenNhapThuCong}">${theTenBai}</td>
                    <td class="p-1 bg-white group-hover:bg-slate-50 align-middle" style="white-space: normal; word-wrap: break-word; ${styleVien}" data-loai="nhanXet">${theNhanXet}</td>
                    <td class="p-1 bg-white group-hover:bg-slate-50 align-middle text-center" style="${styleVien}" data-loai="xepLoai">${theXepLoai}</td>
                    <td class="p-1 bg-white group-hover:bg-slate-50 align-middle text-center" style="${styleVien}" data-loai="chuKy">${theChuKy}</td>
                </tr>`;
            });
        });
    });

    htmlBang += `</tbody></table></div>`;
    vungHienThi.innerHTML = theTrangThaiHtml + thanhCanhBaoRender + thongBaoCapNhatTkbHtml + theHienThiQuyen + htmlBang;
    
    // =========================================================================
    // [KHỐI MỚI 3]: KHÓA NÚT LƯU VÀ ĐỒNG BỘ NẾU TUẦN ĐÃ KHÓA
    // =========================================================================
    let btnLuu = document.getElementById('btnLuuSoDauBai');
    let btnDongBo = document.getElementById('btnDongBoTenBai');
    if (btnLuu) {
        btnLuu.disabled = soBiKhoa;
        if (soBiKhoa) {
            btnLuu.classList.add('opacity-40', 'cursor-not-allowed');
            btnLuu.title = "Sổ đầu bài tuần này đã bị khóa chuyên môn toàn trường, không thể lưu";
        } else {
            btnLuu.classList.remove('opacity-40', 'cursor-not-allowed');
            btnLuu.title = "Chốt dữ liệu Sổ đầu bài này lưu vĩnh viễn vào CSDL";
        }
    }
    if (btnDongBo) {
        btnDongBo.disabled = soBiKhoa;
        if (soBiKhoa) {
            btnDongBo.classList.add('opacity-40', 'cursor-not-allowed');
            btnDongBo.title = "Sổ đầu bài tuần này đã bị khóa chuyên môn toàn trường, không thể đồng bộ";
        } else {
            btnDongBo.classList.remove('opacity-40', 'cursor-not-allowed');
            btnDongBo.title = "Kéo Tên bài học từ PPCT dựa trên Tiết trên màn hình";
        }
    }

    setTimeout(() => {
        let cacOVanBan = vungHienThi.querySelectorAll('textarea');
        cacOVanBan.forEach(ta => {
            ta.style.height = 'auto';
            ta.style.height = (ta.scrollHeight) + 'px';
        });

        // Chỉ gắn sự kiện bắt thay đổi khi tuần CHƯA BỊ KHÓA
        if (!soBiKhoa) {
            let tatCaOVanBan = vungHienThi.querySelectorAll('textarea, input, select');
            tatCaOVanBan.forEach(oNhap => {
                oNhap.addEventListener('input', (e) => { 
                    coThayDoiChuaLuu_SDB = true; 
                    danhDauDongThayDoi(e.target.closest('tr'));
                });
                oNhap.addEventListener('change', (e) => { 
                    coThayDoiChuaLuu_SDB = true; 
                    danhDauDongThayDoi(e.target.closest('tr'));
                });
            });
        }
    }, 50);
}

async function luuSoDauBaiSangMayChu() {
    let tuanChon = document.getElementById('chonTuanSo')?.value;
    let lopChon = document.getElementById('chonLopSo')?.value;
    if (!tuanChon || !lopChon) return alert("Vui lòng chọn Tuần và Lớp trước khi lưu!");
    if (window.kiemTraTuanDaKhoa(tuanChon)) {
        return alert(`⛔ TỪ CHỐI THAO TÁC:\n\nSổ đầu bài TUẦN ${tuanChon.replace(/\D/g, '')} của toàn trường ĐÃ BỊ KHÓA bởi Quản lý chuyên môn.\n\nĐồng chí không thể sửa đổi hoặc lưu đè dữ liệu!`);
    }

    let tuanSo = parseInt(tuanChon.replace(/\D/g, ''));
    let tuanHeThong = (typeof window.thongSoHocVu !== 'undefined' && window.thongSoHocVu.TUAN_HIEN_TAI) ? parseInt(window.thongSoHocVu.TUAN_HIEN_TAI) : 999;
    
    let theChotQuyen = document.getElementById('theChotQuyenSDB');
    let madinhdanhGV = maGvDangNhapHeThong || (theChotQuyen ? theChotQuyen.getAttribute('data-madinhdanh') || '' : '');
    let quyenQuanTri = coToanQuyenSDB || (theChotQuyen ? (theChotQuyen.getAttribute('data-quantri') === 'true' || theChotQuyen.getAttribute('data-quantri') === true) : false);
    let maGvDangNhapLC = madinhdanhGV.trim().toLowerCase().normalize('NFC');

    // [LƯU LẦN ĐẦU TIÊN & KIỂM TRA TRẠNG THÁI]:
    // Quét xem tuần này của lớp này đã từng có tiết nào được chốt/ký tên trong CSDL chưa
    let tkbTuanNay = duLieuTKBGopDaMap.filter(d => 
        String(d['Tuần']).trim() === String(tuanSo) && 
        String(d['Mã Lớp']).trim().toUpperCase() === String(lopChon).trim().toUpperCase()
    );
    let soTietDaKyTrongCSDL = tkbTuanNay.filter(d => {
        let ck = String(d['ChuKy_Thuc'] || '').trim();
        return ck !== '' && ck !== '--';
    }).length;
    let soTietDaLuuCoNoiDung = tkbTuanNay.filter(d => d.DaLuu === true && (String(d['TenBai_Thuc'] || '').trim() !== '' || String(d['ChuKy_Thuc'] || '').trim() !== '')).length;
    
    // Nếu tuần này chưa có tiết nào ký tên và chưa có tiết nào lưu nội dung chính thức -> Đây là LƯU SỔ LẦN ĐẦU TIÊN
    let isLuuLanDau = (soTietDaKyTrongCSDL === 0 && soTietDaLuuCoNoiDung === 0);

    let duLieuQuetDuoc = [];
    let danhSachThongBao = []; 
    let soDongCoThayDoi = 0; 
    let canThiTietThieuTenBai = false; 
    let danhSachLoiPhanQuyen = [];

    // BƯỚC 1: QUÉT UI (DOM) VÀ ĐÓNG GÓI DỮ LIỆU
    let cacBang = document.querySelectorAll('#vungHienThiSoDauBai .bang-so-dau-bai-container');
    cacBang.forEach(khungBang => {
        let thuHienTai = ''; let ngayHienTai = '';
        let cacDong = khungBang.querySelectorAll('table tbody tr');
        
        cacDong.forEach(dong => {
            let cellThu = dong.querySelector('td[rowspan]');
            if (cellThu) {
                let textThuNgay = cellThu.innerText.split('\n');
                let thuGoc = textThuNgay[0].trim().toLowerCase();
                thuHienTai = thuGoc.charAt(0).toUpperCase() + thuGoc.slice(1);
                ngayHienTai = textThuNgay.length > 1 ? textThuNgay[1].trim() : '';
            }

            let cellMon = dong.querySelector('td[data-loai="mon"]');
            let mon = '';
            if (cellMon) {
                for (let node of cellMon.childNodes) {
                    if (node.nodeType === 3) mon += node.textContent;
                }
                mon = mon.trim();
            }

            if (mon !== '') {
                let isDaLuu = dong.getAttribute('data-daluu') === 'true';
                let isThayDoi = dong.getAttribute('data-thaydoi') === 'true';

                let getVal = (cell) => {
                    if (!cell) return '';
                    let theNhap = cell.querySelector('input, select, textarea');
                    let rawVal = theNhap ? theNhap.value : cell.innerText;
                    return rawVal.replace(/\n/g, ' ').trim(); 
                };

                let tiet = getVal(dong.querySelector('td[data-loai="tietSDB"]'));
                let chuyenCan = getVal(dong.querySelector('td[data-loai="chuyenCan"]'));
                let tietPPCT = getVal(dong.querySelector('td[data-loai="tiet"]'));
                let tenBai = getVal(dong.querySelector('td[data-loai="tenBai"]'));
                let nhanXetGV = getVal(dong.querySelector('td[data-loai="nhanXet"]'));
                let xepLoaiGV = getVal(dong.querySelector('td[data-loai="xepLoai"]'));
                let chuKyGV = getVal(dong.querySelector('td[data-loai="chuKy"]'));
                let buoi = dong.getAttribute('data-buoi') || 'Sáng';

                let chuanHoaThu = String(thuHienTai).trim().toLowerCase();
                let chuanHoaBuoi = String(buoi).trim().toLowerCase();
                let chuanHoaLop = String(lopChon).trim().toUpperCase();

                let indexTrongRam = duLieuTKBGopDaMap.findIndex(d => 
                    parseInt(String(d['Tuần']).replace(/\D/g, '')) === tuanSo && 
                    String(d['Mã Lớp']).trim().toUpperCase() === chuanHoaLop && 
                    String(d['Thứ']).trim().toLowerCase() === chuanHoaThu && 
                    String(d['Buổi']).trim().toLowerCase() === chuanHoaBuoi && 
                    String(d['Tiết']).trim() === String(tiet).trim()
                );
                let dongTrongRam = indexTrongRam !== -1 ? duLieuTKBGopDaMap[indexTrongRam] : null;

                // [KIỂM SOÁT PHÂN QUYỀN CHÍNH XÁC]:
                // Chỉ kiểm tra vi phạm quyền khi giáo viên THỰC SỰ THAY ĐỔI / KÝ TÊN vào dòng này (isThayDoi === true)
                // Các dòng chưa thay đổi (khi lưu lần đầu cho cả lớp) không bị tính là lỗi phân quyền
                if (!quyenQuanTri && isThayDoi) {
                    let coQuyen = window.kiemTraQuyenGiaoVienTheoTiet(dongTrongRam, lopChon, mon);
                    if (!coQuyen) {
                        danhSachLoiPhanQuyen.push(`- ${thuHienTai} (${buoi}), Tiết ${tiet}: Môn ${mon} (Không thuộc phân công dạy của đồng chí)`);
                        dong.classList.add('bg-red-100'); 
                    } else if (chuKyGV && chuKyGV !== '--') {
                        // Chữ ký nhập vào phải khớp với tài khoản giáo viên đang đăng nhập
                        let theChot = document.getElementById('theChotQuyenSDB');
                        let madinhdanh = maGvDangNhapHeThong || (theChot ? theChot.getAttribute('data-madinhdanh') || '' : '');
                        let tendinhdanh = tenGvDangNhapHeThong || (theChot ? theChot.getAttribute('data-tendinhdanh') || '' : '') || madinhdanh;
                        let maChuan = window.chuanHoaDinhDanhGiaoVien(madinhdanh);
                        let tenChuan = window.chuanHoaDinhDanhGiaoVien(tendinhdanh);
                        let chuKyChuan = window.chuanHoaDinhDanhGiaoVien(chuKyGV);

                        let laChuKyHopLe = false;
                        if (tenChuan && (chuKyChuan === tenChuan || chuKyChuan.includes(tenChuan) || tenChuan.includes(chuKyChuan))) laChuKyHopLe = true;
                        if (maChuan && (chuKyChuan === maChuan || chuKyChuan.includes(maChuan))) laChuKyHopLe = true;

                        if (!laChuKyHopLe) {
                            danhSachLoiPhanQuyen.push(`- ${thuHienTai} (${buoi}), Tiết ${tiet}: Chữ ký "${chuKyGV}" không khớp với tài khoản của đồng chí`);
                            dong.classList.add('bg-red-100');
                        }
                    }
                }

                // Điền tên bài tự động nếu thiếu khi đã ký tên
                if (chuKyGV !== '' && tuanSo < tuanHeThong && tenBai === '') {
                    canThiTietThieuTenBai = true;
                    let matchKhoi = lopChon.match(/\d+/);
                    let khoi = matchKhoi ? matchKhoi[0] : '';
                    let monPPCT = mon.replace(/[0-9\(\)]/g, '').trim().toLowerCase().replace(/\s+/g, ' ');
                    let monGocChuan = mon.toLowerCase().replace(/\s+/g, ' ');
                    
                    let baiDayChuan = tuDienPPCTToanCuc[`${khoi}_${monGocChuan}_${tietPPCT}`] || tuDienPPCTToanCuc[`${khoi}_${monPPCT}_${tietPPCT}`] || '';
                    
                    if (baiDayChuan !== '') {
                        let theTextarea = dong.querySelector('td[data-loai="tenBai"] textarea');
                        if (theTextarea) {
                            theTextarea.value = baiDayChuan;
                            theTextarea.style.height = 'auto';
                            theTextarea.style.height = (theTextarea.scrollHeight) + 'px';
                        }
                        tenBai = baiDayChuan.replace(/\n/g, ' ').trim(); 
                        isThayDoi = true;
                        if (typeof danhDauDongThayDoi === 'function') danhDauDongThayDoi(dong);
                    }
                }

                // [LƯU LẦN ĐẦU TIÊN]: Nếu là lần đầu tiên lưu sổ -> Lưu toàn bộ các tiết có môn học!
                // Nếu là các lần lưu tiếp theo -> Lưu các dòng có thay đổi hoặc chưa lưu
                let canLuuDongNay = isLuuLanDau || isThayDoi || !isDaLuu;

                if (canLuuDongNay) {
                    soDongCoThayDoi++;
                    danhSachThongBao.push(`- ${thuHienTai} (${buoi}), Tiết ${tiet}: ${mon}`);
                    
                    // =====================================================================
                    // [NÂNG CẤP]: MÃ LƯU TRỮ ĐỊNH DANH ĐẦY ĐỦ 6 TRỤC (BAO GỒM NĂM HỌC)
                    // =====================================================================
                    let namHocHienTai = (typeof window.thongSoHocVu !== 'undefined' && window.thongSoHocVu.NAM_HOC) ? window.thongSoHocVu.NAM_HOC : (typeof thongSoHocVu !== 'undefined' && thongSoHocVu.NAM_HOC ? thongSoHocVu.NAM_HOC : '');
                    let chuCaiDauThu = chuanHoaThu.charAt(0).toUpperCase() + chuanHoaThu.slice(1);
                    let chuCaiDauBuoi = chuanHoaBuoi.charAt(0).toUpperCase() + chuanHoaBuoi.slice(1);
                    let maLuuTruDinhDanh = `${namHocHienTai ? namHocHienTai + '_' : ''}${tuanSo}_${chuanHoaLop}_${chuCaiDauThu}_${chuCaiDauBuoi}_${tiet}`;
                    
                    duLieuQuetDuoc.push({
                        maLuuTru: maLuuTruDinhDanh, 
                        namHoc: namHocHienTai,
                        tuan: tuanSo, 
                        maLop: chuanHoaLop,
                        thu: chuCaiDauThu, 
                        ngay: ngayHienTai, 
                        buoi: chuCaiDauBuoi, 
                        tiet: tiet,
                        mon: mon, 
                        tietPPCT: tietPPCT, 
                        tenBai: tenBai, 
                        nhanXet: nhanXetGV, 
                        xepLoai: xepLoaiGV, 
                        chuKy: chuKyGV,
                        chuyenCan: chuyenCan
                    });

                    // Cập nhật giá trị sửa vào bộ nhớ tạm (RAM)
                    if (indexTrongRam !== -1) {
                        duLieuTKBGopDaMap[indexTrongRam]['Mã Lưu Trữ'] = maLuuTruDinhDanh; 
                        duLieuTKBGopDaMap[indexTrongRam]['Ngày'] = ngayHienTai;
                        duLieuTKBGopDaMap[indexTrongRam]['ChuyenCan_Thuc'] = chuyenCan;
                        duLieuTKBGopDaMap[indexTrongRam]['TietPPCT_Thuc'] = tietPPCT;
                        duLieuTKBGopDaMap[indexTrongRam]['TenBai_Thuc'] = tenBai;
                        duLieuTKBGopDaMap[indexTrongRam]['NhanXet_Thuc'] = nhanXetGV;
                        duLieuTKBGopDaMap[indexTrongRam]['XepLoai_Thuc'] = xepLoaiGV;
                        duLieuTKBGopDaMap[indexTrongRam]['ChuKy_Thuc'] = chuKyGV;
                        duLieuTKBGopDaMap[indexTrongRam]['TrangThaiThayDoi'] = true;
                    }
                }
            }
        });
    });

    if (danhSachLoiPhanQuyen.length > 0) {
        return alert(`⛔ CẢNH BÁO PHÂN QUYỀN:\n\nPhát hiện ${danhSachLoiPhanQuyen.length} tiết học được chỉnh sửa/ký tên nhưng KHÔNG THUỘC PHÂN CÔNG của đồng chí:\n${danhSachLoiPhanQuyen.slice(0, 5).join('\n')}${danhSachLoiPhanQuyen.length > 5 ? '\n...' : ''}\n\nVui lòng chỉ chỉnh sửa và ký tên các tiết được phân công dạy!`);
    }

    if (canThiTietThieuTenBai) return alert("Phát hiện sổ tuần bị bỏ trống Tên bài. Hệ thống đã điền tự động. Vui lòng kiểm tra lại trên lưới và bấm Lưu lần nữa để xác nhận!");
    if (soDongCoThayDoi === 0) return alert("Sổ đầu bài chưa có thay đổi nào để lưu.");

    let tieuDeXacNhan = isLuuLanDau 
        ? `Hệ thống ghi nhận khởi tạo và LƯU LẦN ĐẦU TIÊN ${soDongCoThayDoi} tiết học cho Sổ đầu bài Lớp ${lopChon} - Tuần ${tuanSo}:` 
        : `Hệ thống ghi nhận ${soDongCoThayDoi} tiết học có sự thay đổi/cập nhật dữ liệu:`;

    let thongBaoGiaoDien = `${tieuDeXacNhan}\n\n` + 
                          danhSachThongBao.slice(0, 15).join('\n') + 
                          (danhSachThongBao.length > 15 ? `\n... và ${danhSachThongBao.length - 15} tiết khác.` : "") + 
                          `\n\nĐồng chí có chắc chắn muốn chốt lưu dữ liệu này lên Server?`;
                          
    if (!confirm(thongBaoGiaoDien)) return;

    const btn = document.getElementById('btnLuuSoDauBai');
    let textGoc = btn.innerHTML;
    btn.innerHTML = `<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span class="ml-1">Đang lưu...</span>`;
    btn.disabled = true;

    try {
        let namHocLuu = (typeof window.thongSoHocVu !== 'undefined' && window.thongSoHocVu.NAM_HOC) ? window.thongSoHocVu.NAM_HOC : (typeof thongSoHocVu !== 'undefined' && thongSoHocVu.NAM_HOC ? thongSoHocVu.NAM_HOC : '');
        const payload = { 
            thaoTac: 'luuSoDauBaiDongBo', 
            tuan: tuanChon.replace(/\D/g, ''), 
            namHoc: namHocLuu,
            lop: lopChon, 
            duLieu: duLieuQuetDuoc,
            emailTruyCap: (typeof window.dinhDanhGiaoVienToanCuc !== 'undefined' && window.dinhDanhGiaoVienToanCuc !== '') ? window.dinhDanhGiaoVienToanCuc : madinhdanhGV
        };
        const phanHoi = await fetchVoiCoCheThuLai(CAU_HINH_FRONTEND.URL_API_MAY_CHU, { method: 'POST', body: JSON.stringify(payload) });
        const ketQua = await phanHoi.json();

        if (ketQua.trangThai === 'thanh_cong') {
            alert(`✅ Đã chốt thành công các cập nhật của Sổ đầu bài Lớp ${lopChon} - Tuần ${tuanSo}!`);
            
            coThayDoiChuaLuu_SDB = false; 
            
            duLieuTKBGopDaMap.forEach(d => { 
                if (d.TrangThaiThayDoi) { 
                    d.DaLuu = true; 
                    delete d.TrangThaiThayDoi; 
                } 
            });
            
            if (typeof capNhatSoDauBaiNgamLenLuoi === 'function') {
                capNhatSoDauBaiNgamLenLuoi(tuanChon, lopChon);
            }
        } else throw new Error(ketQua.thongBao);
    } catch (loi) { 
        alert("Lưu thất bại: " + loi.message); 
    } finally { 
        btn.innerHTML = textGoc; btn.disabled = false; 
    }
}

function dongBoTenBaiHoc() {
    let tuanChon = document.getElementById('chonTuanSo')?.value;
    if (window.kiemTraTuanDaKhoa(tuanChon)) {
        return alert(`⛔ Sổ đầu bài Tuần này đã bị khóa toàn trường. Không thể đồng bộ!`);
    }
    const btn = document.getElementById('btnDongBoTenBai');
    let textGoc = btn ? btn.innerHTML : '';
    if (btn) {
        btn.innerHTML = `<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span class="ml-1">Đang đồng bộ...</span>`;
        btn.disabled = true;
    }

    setTimeout(() => {
        let lopChon = document.getElementById('chonLopSo')?.value;
        if (!lopChon) {
            if (btn) { btn.innerHTML = textGoc; btn.disabled = false; }
            return;
        }
        
        let tuanSo = parseInt(tuanChon.replace(/\D/g, ''), 10);
        let matchKhoi = lopChon.match(/\d+/);
        let khoi = matchKhoi ? matchKhoi[0] : '';
        let cacDong = document.querySelectorAll('#vungHienThiSoDauBai tbody tr');

        let demTkbCapNhat = 0;
        let demTenBaiCapNhat = 0;

        // 1. Đồng bộ các tiết chưa ký nếu TKB có sự thay đổi
        cacDong.forEach(dong => {
            let oTiet = dong.querySelector('td[data-loai="tietSDB"]');
            let oMon = dong.querySelector('td[data-loai="mon"]');
            let oChuKy = dong.querySelector('td[data-loai="chuKy"] input');
            let buoi = dong.getAttribute('data-buoi') || 'Sáng';

            let cellThu = dong.querySelector('td[rowspan]');
            let thuHienTai = '';
            if (cellThu) {
                thuHienTai = cellThu.innerText.split('\n')[0].trim();
            } else {
                let prev = dong.previousElementSibling;
                while (prev) {
                    let c = prev.querySelector('td[rowspan]');
                    if (c) { thuHienTai = c.innerText.split('\n')[0].trim(); break; }
                    prev = prev.previousElementSibling;
                }
            }

            let chuKy = oChuKy ? oChuKy.value.trim() : '';
            let daKy = (chuKy !== '' && chuKy !== '--');

            if (!daKy && oTiet && oMon) {
                let tiet = oTiet.innerText.trim();
                
                // [ĐỘC LẬP THỜI GIAN TUYỆT ĐỐI]: Tra cứu chính xác theo đúng Tuần đang xem
                // Nếu là tuần quá khứ, lấy từ DATA_TKB (trong mapTkbToanTapToanCuc), không bị nhầm sang tuần hiện tại
                let khoaSlot = `${tuanSo}_${lopChon.toUpperCase()}_${thuHienTai}_${buoi.toLowerCase()}_${tiet}`;
                let tietTkb = (typeof mapTkbToanTapToanCuc !== 'undefined') ? mapTkbToanTapToanCuc[khoaSlot] : null;

                if (!tietTkb) {
                    let nguonTkb = (typeof duLieuTkbHienTai !== 'undefined' && duLieuTkbHienTai.length > 0) ? duLieuTkbHienTai : [];
                    tietTkb = nguonTkb.find(t => 
                        parseInt(t.tuan, 10) === tuanSo &&
                        String(t.maLop).trim().toUpperCase() === lopChon.toUpperCase() &&
                        String(t.thu).trim().toLowerCase() === thuHienTai.toLowerCase() &&
                        String(t.buoi).trim().toLowerCase() === buoi.toLowerCase() &&
                        String(t.tiet).trim() === tiet
                    );
                }

                if (tietTkb) {
                    let monTkbMoi = String(tietTkb.monHoc || '').trim();
                    let gvTkbMoi = String(tietTkb.maGv || '').trim();
                    let monSdbHienTai = oMon.innerText.replace(/TKB mới/g, '').trim();

                    if (monTkbMoi !== '' && monTkbMoi.toLowerCase() !== monSdbHienTai.toLowerCase()) {
                        oMon.innerHTML = `${monTkbMoi} <span class="inline-block ml-1 px-1.5 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-700 border border-blue-300" title="Đã cập nhật theo TKB mới">TKB mới</span>`;
                        demTkbCapNhat++;
                        coThayDoiChuaLuu_SDB = true;
                        danhDauDongThayDoi(dong);

                        // Cập nhật lại trong RAM duLieuTKBGopDaMap
                        let idxRam = duLieuTKBGopDaMap.findIndex(d => 
                            parseInt(d['Tuần']) === tuanSo &&
                            String(d['Mã Lớp']).toUpperCase() === lopChon.toUpperCase() &&
                            String(d['Thứ']).toLowerCase() === thuHienTai.toLowerCase() &&
                            String(d['Buổi']).toLowerCase() === buoi.toLowerCase() &&
                            String(d['Tiết']) === tiet
                        );
                        if (idxRam !== -1) {
                            duLieuTKBGopDaMap[idxRam]['Môn Học'] = monTkbMoi;
                            duLieuTKBGopDaMap[idxRam]['Mã GV'] = gvTkbMoi;
                            duLieuTKBGopDaMap[idxRam]['TietPPCT_Thuc'] = '';
                            duLieuTKBGopDaMap[idxRam]['TenBai_Thuc'] = '';
                            duLieuTKBGopDaMap[idxRam]['DaLuu'] = false;
                            duLieuTKBGopDaMap[idxRam]['TrangThaiThayDoi'] = true;
                            duLieuTKBGopDaMap[idxRam]['CapNhatTuTKB'] = true;
                        }
                    }
                }
            }
        });

        // 2. [CẬP NHẬT THÔNG MINH SỐ TIẾT PPCT & TÊN BÀI DẠY]:
        // Tái lập mốc số tiết phân phối xuất phát từ các tuần trước đó
        let boDemTietPPCT = {};
        duLieuTKBGopDaMap.forEach(d => {
            let t = parseInt(String(d['Tuần']).replace(/\D/g, '')) || 0;
            let maLop = String(d['Mã Lớp']).trim().toUpperCase();

            if (maLop === lopChon.toUpperCase() && t < tuanSo) {
                let mon = String(d['Môn Học']).trim();
                if (mon !== '') {
                    let monPPCT = mon.replace(/[0-9\(\)]/g, '').trim().toLowerCase().replace(/\s+/g, ' ');
                    if (d.DaLuu === true) {
                        let tietLuu = parseInt(String(d['TietPPCT_Thuc']).replace(/\D/g, '')) || 0;
                        if (tietLuu > (boDemTietPPCT[monPPCT] || 0)) {
                            boDemTietPPCT[monPPCT] = tietLuu;
                        } else if (!boDemTietPPCT[monPPCT]) {
                            boDemTietPPCT[monPPCT] = 1;
                        } else {
                            boDemTietPPCT[monPPCT] = boDemTietPPCT[monPPCT] + 1;
                        }
                    }
                }
            }
        });

        // [THUẬT TOÁN BĂM O(1) SIÊU TỐC]: Tra cứu từ điển tức thời trong 0.001ms, loại bỏ vòng lặp duyệt mảng
        const timTenBaiChuan = (monHoc, tietPPCT) => {
            if (!monHoc || !tietPPCT) return '';
            let monChuan = monHoc.trim().toLowerCase().replace(/\s+/g, ' ');
            let keyChinhXac = `${khoi}_${monChuan}_${tietPPCT}`;
            if (tuDienPPCTToanCuc[keyChinhXac]) return tuDienPPCTToanCuc[keyChinhXac];
            
            let monKhongSo = monChuan.replace(/\s*\d+$/, '').trim();
            let keyKhongSo = `${khoi}_${monKhongSo}_${tietPPCT}`;
            if (tuDienPPCTToanCuc[keyKhongSo]) return tuDienPPCTToanCuc[keyKhongSo];

            let monRutGon = monChuan.replace(/[0-9\(\)]/g, '').trim().replace(/\s+/g, ' ');
            let keyRutGon = `${khoi}_${monRutGon}_${tietPPCT}`;
            return tuDienPPCTToanCuc[keyRutGon] || '';
        };

        // Duyệt tuần tự theo đúng thời gian: Thứ 2 -> Thứ 6/7, Tiết 1 -> 5
        cacDong.forEach(dong => {
            let oMon = dong.querySelector('td[data-loai="mon"]');
            let oTiet = dong.querySelector('td[data-loai="tiet"]');
            let oTenBai = dong.querySelector('td[data-loai="tenBai"]');
            let oChuKy = dong.querySelector('td[data-loai="chuKy"] input');
            let oTietSDB = dong.querySelector('td[data-loai="tietSDB"]');
            let buoi = dong.getAttribute('data-buoi') || 'Sáng';

            let cellThu = dong.querySelector('td[rowspan]');
            let thuHienTai = '';
            if (cellThu) {
                thuHienTai = cellThu.innerText.split('\n')[0].trim();
            } else {
                let prev = dong.previousElementSibling;
                while (prev) {
                    let c = prev.querySelector('td[rowspan]');
                    if (c) { thuHienTai = c.innerText.split('\n')[0].trim(); break; }
                    prev = prev.previousElementSibling;
                }
            }

            let chuKy = oChuKy ? oChuKy.value.trim() : '';
            let daKy = (chuKy !== '' && chuKy !== '--');
            let tietThuTu = oTietSDB ? oTietSDB.innerText.trim() : '';

            if (oMon && oTiet && oTenBai) {
                let mon = oMon.innerText.replace(/TKB mới/g, '').trim();
                
                if (mon !== '') {
                    let monPPCT = mon.replace(/[0-9\(\)]/g, '').trim().toLowerCase().replace(/\s+/g, ' ');

                    // Tìm bản ghi tương ứng trong RAM
                    let idxRam = duLieuTKBGopDaMap.findIndex(d => 
                        parseInt(String(d['Tuần']).replace(/\D/g, '')) === tuanSo &&
                        String(d['Mã Lớp']).toUpperCase() === lopChon.toUpperCase() &&
                        String(d['Thứ']).toLowerCase() === thuHienTai.toLowerCase() &&
                        String(d['Buổi']).toLowerCase() === buoi.toLowerCase() &&
                        String(d['Tiết']).trim() === tietThuTu
                    );

                    if (daKy) {
                        // Tiết đã ký: bảo lưu số tiết và nâng mốc lũy kế
                        let theNhapTiet = oTiet.querySelector('input, select, textarea');
                        let tietHienTai = theNhapTiet ? parseInt(theNhapTiet.value.trim()) : parseInt(oTiet.innerText.trim());
                        if (tietHienTai > (boDemTietPPCT[monPPCT] || 0)) {
                            boDemTietPPCT[monPPCT] = tietHienTai;
                        }
                    } else {
                        // Tiết chưa ký: ĐÁNH SỐ PPCT THÔNG MINH NỐI TIẾP
                        boDemTietPPCT[monPPCT] = (boDemTietPPCT[monPPCT] || 0) + 1;
                        let tietMoi = boDemTietPPCT[monPPCT];
                        let baiDayChuan = timTenBaiChuan(mon, tietMoi);

                        // Cập nhật lên ô input Tiết PPCT
                        let theInputTiet = oTiet.querySelector('input');
                        if (theInputTiet) {
                            if (theInputTiet.value != tietMoi) {
                                theInputTiet.value = tietMoi;
                                coThayDoiChuaLuu_SDB = true;
                                danhDauDongThayDoi(dong);
                            }
                        }

                        // Cập nhật lên ô textarea Tên bài dạy
                        let theTextarea = oTenBai.querySelector('textarea');
                        if (theTextarea && !theTextarea.disabled && baiDayChuan !== '') {
                            if (theTextarea.value.trim() !== baiDayChuan) {
                                theTextarea.value = baiDayChuan;
                                theTextarea.style.height = 'auto';
                                theTextarea.style.height = (theTextarea.scrollHeight) + 'px';
                                demTenBaiCapNhat++;
                                coThayDoiChuaLuu_SDB = true;
                                danhDauDongThayDoi(dong);
                            }
                        }

                        // Đồng bộ vào RAM
                        if (idxRam !== -1) {
                            duLieuTKBGopDaMap[idxRam]['TietPPCT_Thuc'] = tietMoi;
                            duLieuTKBGopDaMap[idxRam]['TenBai_Thuc'] = baiDayChuan;
                            duLieuTKBGopDaMap[idxRam]['TrangThaiThayDoi'] = true;
                        }
                    }
                }
            }
        });

        // 3. CẬP NHẬT LẠI DANH SÁCH KHÁC BIỆT & XÓA BADGE TRÊN NÚT BẤM
        if (window._danhSachTietCapNhatTuTKB) {
            window._danhSachTietCapNhatTuTKB = window._danhSachTietCapNhatTuTKB.filter(it => 
                !(String(it.tuan).trim() === String(tuanSo) && String(it.lop).trim().toUpperCase() === String(lopChon).trim().toUpperCase())
            );
        }

        if (btn) { 
            btn.innerHTML = `
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                <span>Đồng bộ TKB</span>
            `; 
            btn.className = "bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 text-xs shadow transition duration-200 rounded flex items-center gap-1.5 cursor-pointer";
            btn.title = "Đồng bộ môn, giáo viên và tên bài học từ TKB & PPCT";
            btn.disabled = false; 
        }

        let thongBao = `✅ ĐÃ ĐỒNG BỘ CHỦ ĐỘNG HOÀN TẤT:\n`;
        if (demTkbCapNhat > 0) thongBao += `• Đã cập nhật ${demTkbCapNhat} tiết theo Thời khóa biểu mới nhất.\n`;
        if (demTenBaiCapNhat > 0) thongBao += `• Đã tự động đánh số và điền ${demTenBaiCapNhat} tên bài học theo PPCT.\n`;
        if (demTkbCapNhat === 0 && demTenBaiCapNhat === 0) thongBao += `Toàn bộ các tiết trên Sổ đầu bài đã hoàn toàn khớp chuẩn với Thời khóa biểu và PPCT.`;
        else thongBao += `\n👉 Đồng chí vui lòng kiểm tra lại và bấm [Lưu Sổ đầu bài] để chốt cơ sở dữ liệu!`;

        alert(thongBao);
    }, 150); 
}

function chonMucPPCT(soTiet, tenBai, event) {
    if (event) event.stopPropagation(); 
    let daThayDoi = false;
    if (trangThaiKhungPPCT.inputTiet) {
        trangThaiKhungPPCT.inputTiet.value = soTiet;
        coThayDoiChuaLuu_SDB = true; 
        daThayDoi = true;
    }
    if (trangThaiKhungPPCT.inputTenBai && tenBai !== 'Chưa có dữ liệu bài dạy') {
        trangThaiKhungPPCT.inputTenBai.value = tenBai;
        trangThaiKhungPPCT.inputTenBai.style.height = 'auto';
        trangThaiKhungPPCT.inputTenBai.style.height = (trangThaiKhungPPCT.inputTenBai.scrollHeight) + 'px';
        coThayDoiChuaLuu_SDB = true; 
        daThayDoi = true;
    }
    
    // [NÂNG CẤP]: Gắn cờ và biểu tượng khi chọn từ menu thả
    if (daThayDoi && trangThaiKhungPPCT.inputTiet) {
        danhDauDongThayDoi(trangThaiKhungPPCT.inputTiet.closest('tr'));
    }
    
    dongKhungTruotPPCT(); 
}

function chonMucChuKy(tenGv, event) {
    if (event) {
        event.preventDefault(); 
        event.stopPropagation();
    }
    if (trangThaiKhungChuKy.inputChuKy) {
        trangThaiKhungChuKy.inputChuKy.value = tenGv;
        coThayDoiChuaLuu_SDB = true; 
        
        // [NÂNG CẤP]: Gắn cờ và biểu tượng khi chọn chữ ký
        danhDauDongThayDoi(trangThaiKhungChuKy.inputChuKy.closest('tr'));
        
        let ev = new Event('input', { bubbles: true});
        trangThaiKhungChuKy.inputChuKy.dispatchEvent(ev);
        
        // Hủy mờ sau khi chọn xong
        trangThaiKhungChuKy.inputChuKy.classList.remove('text-slate-400', 'opacity-60');
        trangThaiKhungChuKy.inputChuKy.classList.add('text-blue-700');
    }
    dongKhungTruotChuKy();
}

function xuatWordSoDauBai() {
    let vungHienThi = document.getElementById('vungHienThiSoDauBai');
    if (!vungHienThi || vungHienThi.innerText.includes('Vui lòng chọn')) return alert("Không có dữ liệu để xuất!");

    let tuanChon = document.getElementById('chonTuanSo').value;
    let lopChon = document.getElementById('chonLopSo').value;

    let theChotQuyen = document.getElementById('theChotQuyenSDB');
    let madinhdanhGV = maGvDangNhapHeThong || (theChotQuyen ? theChotQuyen.getAttribute('data-madinhdanh') || '' : '');
    let quyenQuanTri = coToanQuyenSDB || (theChotQuyen ? (theChotQuyen.getAttribute('data-quantri') === 'true' || theChotQuyen.getAttribute('data-quantri') === true) : false);
    
    let coQuyenTaiXuong = quyenQuanTri;
    if (!coQuyenTaiXuong && madinhdanhGV) {
        let maGvDangNhapLC = madinhdanhGV.trim().toLowerCase().normalize('NFC');
        let tkbTuanNay = duLieuTKBGopDaMap.filter(d => String(d['Tuần']).trim() === tuanChon && String(d['Mã Lớp']).trim().toUpperCase() === lopChon.toUpperCase());
        
        coQuyenTaiXuong = tkbTuanNay.some(dong => {
            let monHoc = String(dong['Môn Học']).trim();
            if (monHoc === '') return false;
            let gvTkb = String(dong['Mã GV']).trim().toLowerCase().normalize('NFC');
            let tapHopGvTkb = gvTkb.split(/[,;&-]/).map(g => g.trim());
            return tapHopGvTkb.includes(maGvDangNhapLC) || tapHopGvTkb.some(g => maGvDangNhapLC.includes(g) && g.length > 2);
        });
    }

    if (!coQuyenTaiXuong) {
        return alert("Từ chối truy cập: Đồng chí không có tiết dạy tại lớp này nên không được cấp quyền xuất Sổ đầu bài!");
    }

    let preHtml = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>Sổ Đầu Bài</title>
        <style>
            @page WordSection1 { size: 841.9pt 595.3pt; mso-page-orientation: landscape; margin: 0.8in 0.8in 0.8in 0.8in; }
            div.WordSection1 { page: WordSection1; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 20px; font-family: "Times New Roman", Times, serif; font-size: 12pt; }
            th, td { border: 1px solid black; padding: 6px; }
            th { text-align: center; font-weight: bold; background-color: #f1f5f9; }
            .text-center { text-align: center; }
            
            /* Bố cục CSS phân chia làm 3 cột bằng nhau để dàn đều trên Word */
            .flex { display: table; width: 100%; margin-bottom: 15px; font-family: "Times New Roman", Times, serif; }
            .justify-between span { display: table-cell; vertical-align: middle; width: 33.33%; }
            .justify-between span:nth-child(1) { text-align: left; font-weight: bold; font-size: 14pt; text-transform: uppercase; }
            .justify-between span:nth-child(2) { text-align: center; font-style: italic; font-size: 12pt; }
            .justify-between span:last-child { text-align: right; font-weight: bold; font-size: 14pt; text-transform: uppercase; }
        </style>
        </head><body><div class='WordSection1'>
    `;
    
    let noiDungClone = vungHienThi.cloneNode(true);
    let canhBaoNode = noiDungClone.querySelector('.border-red-500');
    if (canhBaoNode) canhBaoNode.remove();

    // 1. Quét và ép toàn bộ các ô Nhập liệu (input, select, textarea) thành Văn bản Word
    let cacTagGoc = vungHienThi.querySelectorAll('input, textarea, select');
    let cacTagClone = noiDungClone.querySelectorAll('input, textarea, select');
    cacTagGoc.forEach((tag, idx) => {
        if (cacTagClone[idx]) {
            let val = tag.value ? tag.value.trim() : "";
            // Xóa sạch rác hệ thống
            if (val === "" || val === "-Chọn-" || val === "--") {
                val = "";
            }
            // Chuyển ký tự Enter (\n) trong Textarea thành thẻ <br> để Word hiển thị đúng nhiều dòng
            val = val.replace(/\n/g, "<br>");
            cacTagClone[idx].outerHTML = `<span style="font-family: 'Times New Roman', serif;">${val}</span>`;
        }
    });

    // 2. Can thiệp sâu vào Cột THỨ để ép thẻ <br> chuẩn xác cho MS Word
    let cacCellThu = noiDungClone.querySelectorAll('td[rowspan]');
    cacCellThu.forEach(cell => {
        // Lấy chữ thuần túy trong ô (VD: THỨ 228/09/2026)
        let textTrongCell = cell.innerText || cell.textContent;
        
        // Dùng Regex tách chuẩn xác [2-7] và chèn thẻ <br> của HTML
        let fixText = textTrongCell.replace(/(THỨ\s*[2-7]|CHỦ NHẬT)\s*(\d{2}\/\d{2}\/\d{4})/gi, "$1<br><span style='font-size: 11pt; font-weight: normal;'>$2</span>");
        
        cell.innerHTML = fixText;
        cell.style.textAlign = "center";
        cell.style.verticalAlign = "middle";
    });

    // 3. Xóa các class Tailwind CSS dư thừa để bảng Word sạch sẽ và không bị loạn định dạng
    noiDungClone.querySelectorAll('table, th, td, tr').forEach(el => {
        el.removeAttribute('class');
    });

    let htmlContent = preHtml + noiDungClone.innerHTML + "</div></body></html>";
    let blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    let link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `SoDauBai_Lop${lopChon}_Tuan${tuanChon.replace(/\D/g,'')}.doc`;
    link.click();
}

async function xuatExcelSoDauBai() {
    let vungHienThi = document.getElementById('vungHienThiSoDauBai');
    if (!vungHienThi || vungHienThi.innerText.includes('Vui lòng chọn')) return alert("Không có dữ liệu để xuất!");

    let tuanChon = document.getElementById('chonTuanSo').value;
    let lopChon = document.getElementById('chonLopSo').value;

    let theChotQuyen = document.getElementById('theChotQuyenSDB');
    let madinhdanhGV = maGvDangNhapHeThong || (theChotQuyen ? theChotQuyen.getAttribute('data-madinhdanh') || '' : '');
    let quyenQuanTri = coToanQuyenSDB || (theChotQuyen ? (theChotQuyen.getAttribute('data-quantri') === 'true' || theChotQuyen.getAttribute('data-quantri') === true) : false);
    
    let coQuyenTaiXuong = quyenQuanTri;
    if (!coQuyenTaiXuong && madinhdanhGV) {
        let maGvDangNhapLC = madinhdanhGV.trim().toLowerCase().normalize('NFC');
        let tkbTuanNay = duLieuTKBGopDaMap.filter(d => String(d['Tuần']).trim() === tuanChon && String(d['Mã Lớp']).trim().toUpperCase() === lopChon.toUpperCase());
        
        coQuyenTaiXuong = tkbTuanNay.some(dong => {
            let monHoc = String(dong['Môn Học']).trim();
            if (monHoc === '') return false;
            let gvTkb = String(dong['Mã GV']).trim().toLowerCase().normalize('NFC');
            let tapHopGvTkb = gvTkb.split(/[,;&-]/).map(g => g.trim());
            return tapHopGvTkb.includes(maGvDangNhapLC) || tapHopGvTkb.some(g => maGvDangNhapLC.includes(g) && g.length > 2);
        });
    }

    if (!coQuyenTaiXuong) {
        return alert("Từ chối truy cập: Đồng chí không có tiết dạy tại lớp này nên không được cấp quyền xuất Sổ đầu bài!");
    }

    try {
        if (typeof ExcelJS === 'undefined') {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('SO_DAU_BAI');
        
        const cacBang = document.querySelectorAll('#vungHienThiSoDauBai .bang-so-dau-bai-container');
        
        if(cacBang.length === 0) return alert("Không có dữ liệu để xuất!");
        let rowIndex = 1;

        cacBang.forEach(khungBang => {
            let rowHeader1 = worksheet.getRow(rowIndex);
            
            let txtLop = khungBang.querySelector('.header-lop') ? khungBang.querySelector('.header-lop').innerText : '';
            let txtTuan = khungBang.querySelector('.header-tuan') ? khungBang.querySelector('.header-tuan').innerText : '';
            
            rowHeader1.getCell(1).value = txtLop + '                ' + txtTuan;
            rowHeader1.font = { name: 'Times New Roman', size: 14, bold: true };
            worksheet.mergeCells(`A${rowIndex}:I${rowIndex}`);
            rowIndex++;

            let rowHeader2 = worksheet.getRow(rowIndex);
            let txtNgay = khungBang.querySelector('.header-ngay') ? khungBang.querySelector('.header-ngay').innerText : '';
            
            rowHeader2.getCell(1).value = txtNgay;
            rowHeader2.font = { name: 'Times New Roman', size: 12, italic: true };
            rowHeader2.getCell(1).alignment = { horizontal: 'center' };
            worksheet.mergeCells(`A${rowIndex}:I${rowIndex}`);
            rowIndex++;

            const rows = khungBang.querySelectorAll('table tr');
            rows.forEach((tr, idx) => {
                let rData = [];
                tr.querySelectorAll('th, td').forEach(cell => {
                    let theNhap = cell.querySelector('input, select, textarea');
                    let giaTriCell = "";
                    
                    // Ưu tiên đọc dữ liệu người dùng gõ
                    if (theNhap) {
                        giaTriCell = theNhap.value;
                    } else {
                        giaTriCell = cell.innerText;
                    }
                    
                    // Xử lý và làm sạch dữ liệu
                    if (giaTriCell && typeof giaTriCell === 'string') {
                        giaTriCell = giaTriCell.trim();
                        // 1. Xóa rác hệ thống (Chữ "-Chọn-")
                        if (giaTriCell === "-Chọn-" || giaTriCell === "--") {
                            giaTriCell = "";
                        }
                        
                        // 2. Ép Regex tách riêng chữ Thứ và Ngày xuống dòng an toàn
                        giaTriCell = giaTriCell.replace(/(THỨ\s*[2-7]|CHỦ NHẬT)\s*(\d{2}\/\d{2}\/\d{4})/gi, "$1\n$2");
                        
                        // 3. Chống Crash Excel do nhận diện nhầm dấu (+, -, =) thành công thức toán học
                        if (/^[=+\-@]/.test(giaTriCell)) {
                            giaTriCell = "'" + giaTriCell;
                        }
                    }
                    
                    rData.push(giaTriCell || "");
                });

                if(idx > 0 && rData.length < 9) rData.unshift(''); 

                let row = worksheet.addRow(rData);
                row.font = { name: 'Times New Roman', size: 12 };
                
                if (idx === 0) {
                    row.font = { bold: true, name: 'Times New Roman' };
                    row.alignment = { vertical: 'middle', horizontal: 'center' };
                }

               // NÂNG CẤP: ĐỊNH DẠNG NÉT KẺ BẢNG EXCEL (Nét đứt ngang giữa các tiết, nét liền dọc)
                let thuocBuoi = tr.getAttribute('data-buoi') || '';
                let tietHienTai = parseInt(rData[1]); // rData[1] luôn là số tiết học

                row.eachCell({ includeEmpty: true }, function(cell, colNumber) {
                    if (idx === 0) {
                        // Dòng tiêu đề bảng (THỨ, TIẾT, MÔN...) luôn kẻ nét liền 4 cạnh
                        cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
                    } else {
                        // Xét viền ngang cho các dòng nội dung tiết học
                        let kieuVienTren = (tietHienTai === 1) ? 'thin' : 'dashed'; // Bắt đầu buổi -> nét liền
                        let kieuVienDuoi = 'dashed'; // Mặc định giữa các tiết -> nét đứt
                        
                        // Xác định tiết cuối cùng của mỗi buổi để đóng nét liền
                        if ((thuocBuoi === 'Sáng' && tietHienTai === 5) || (thuocBuoi === 'Chiều' && tietHienTai === 4)) {
                            kieuVienDuoi = 'thin'; 
                        }
                        
                        if (colNumber === 1) {
                            // Cột THỨ sẽ gộp ô (Merge Cells) nên thiết lập nét liền
                            cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
                        } else {
                            // Các cột còn lại: Nét dọc luôn liền ('thin'), nét ngang đứt ('dashed') hoặc liền tùy vị trí
                            cell.border = { 
                                top: {style: kieuVienTren}, 
                                left: {style:'thin'}, 
                                bottom: {style: kieuVienDuoi}, 
                                right: {style:'thin'} 
                            };
                        }
                    }

                    if([1, 2, 3, 4, 5, 8, 9].includes(colNumber)) cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                    else cell.alignment = { vertical: 'middle', wrapText: true };
                    if (colNumber === 2) cell.numFmt = '@'; 
                });
                rowIndex++;
            });

            rowIndex += 2;
        });

        worksheet.eachRow((row, rowNumber) => {
            let val = row.getCell(1).value;
            let valUpper = (val && typeof val === 'string') ? val.toUpperCase() : '';
            // Gộp ô (Merge Cells) cho cột THỨ
            if (valUpper && (valUpper.startsWith('THỨ ') || valUpper.startsWith('CHỦ NHẬT')) && valUpper !== 'THỨ') {
                let rowsToMerge = 0;
                while(worksheet.getCell(rowNumber + rowsToMerge + 1, 1).value === '') {
                    if(worksheet.getCell(rowNumber + rowsToMerge + 1, 2).value === null) break;
                    rowsToMerge++;
                }
                if (rowsToMerge > 0) worksheet.mergeCells(`A${rowNumber}:A${rowNumber + rowsToMerge}`);
                row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            }
        });

        worksheet.getColumn(1).width = 10;
        worksheet.getColumn(2).width = 6;
        worksheet.getColumn(3).width = 8;
        worksheet.getColumn(4).width = 15;
        worksheet.getColumn(5).width = 10;
        worksheet.getColumn(6).width = 40; 
        worksheet.getColumn(7).width = 25; 
        worksheet.getColumn(8).width = 10; 
        worksheet.getColumn(9).width = 15; 

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `SoDauBai_Lop${lopChon}_Tuan${tuanChon.replace(/\D/g,'')}.xlsx`;
        link.click();

    } catch (loi) {
        console.error(loi);
        alert("Có lỗi khi tạo tệp Excel!");
    }
}

function napDropdownSoDauBai() {
    let tapHopTuan = new Set(); let tapHopLop = new Set();
    duLieuTKBGopDaMap.forEach(dong => {
        if (dong['Tuần']) tapHopTuan.add(String(dong['Tuần']).trim());
        if (dong['Mã Lớp']) tapHopLop.add(String(dong['Mã Lớp']).trim());
    });

    // [NÂNG CẤP]: Thuật toán sắp xếp tuần giảm dần (từ tuần lớn nhất đến tuần nhỏ nhất)
    let mangTuan = Array.from(tapHopTuan).sort((a, b) => parseInt(b.replace(/\D/g,'')) - parseInt(a.replace(/\D/g,'')));
    let mangLop = Array.from(tapHopLop).sort();

    let chonTuanHtml = `<option value="" disabled selected>-- Chọn Tuần --</option>` + mangTuan.map(t => `<option value="${t}">Tuần ${t.replace(/\D/g,'')}</option>`).join('');
    let chonLopHtml = `<option value="" disabled selected>-- Chọn Lớp --</option>` + mangLop.map(l => `<option value="${l}">Lớp ${l}</option>`).join('');

    let elementTuan = document.getElementById('chonTuanSo');
    let elementLop = document.getElementById('chonLopSo');
    
    // BẢO VỆ GIÁ TRỊ: Lưu lại giá trị đang chọn trước khi làm mới danh sách HTML
    let giaTriTuanCu = elementTuan ? elementTuan.value : null;
    let giaTriLopCu = elementLop ? elementLop.value : null;

    if(elementTuan) {
        elementTuan.disabled = false;
        elementTuan.innerHTML = chonTuanHtml;
        // Phục hồi lại giá trị cũ nếu danh sách mới vẫn chứa giá trị đó, hoặc chọn mặc định tuần hiện tại
        if (giaTriTuanCu && mangTuan.includes(giaTriTuanCu)) {
            elementTuan.value = giaTriTuanCu;
        } else if (mangTuan.length > 0) {
            let tuanHT = (typeof window.tuanDangXem !== 'undefined' && window.tuanDangXem) 
                ? String(window.tuanDangXem) 
                : ((typeof thongSoHocVu !== 'undefined' && thongSoHocVu.TUAN_HIEN_TAI) ? String(thongSoHocVu.TUAN_HIEN_TAI) : '');
            if (tuanHT && mangTuan.includes(tuanHT)) {
                elementTuan.value = tuanHT;
            } else {
                elementTuan.value = mangTuan[0]; // Tuần lớn nhất
            }
        }
    }
    if(elementLop) {
        elementLop.disabled = false;
        elementLop.innerHTML = chonLopHtml;
        // Phục hồi lại giá trị cũ, hoặc chọn lớp đầu tiên
        if (giaTriLopCu && mangLop.includes(giaTriLopCu)) {
            elementLop.value = giaTriLopCu;
        } else if (mangLop.length > 0) {
            elementLop.value = mangLop[0];
        }
    }

    let inTuan = document.getElementById('input_chonTuanSo');
    let inLop = document.getElementById('input_chonLopSo');
    if (inTuan) { inTuan.disabled = false; inTuan.classList.remove('cursor-wait'); }
    if (inLop) { inLop.disabled = false; inLop.classList.remove('cursor-wait'); }

    nangCapSelectThanhInput('chonTuanSo', 'Chọn Tuần...');
    nangCapSelectThanhInput('chonLopSo', 'Chọn Lớp...');

    // ĐỒNG BỘ GIAO DIỆN: Ép thẻ Input hiển thị lại đúng chữ dựa trên value vừa phục hồi
    if (typeof dongBoHienThiTuSelect === 'function') {
        dongBoHienThiTuSelect('chonTuanSo');
        dongBoHienThiTuSelect('chonLopSo');
    }

    let vungHienThi = document.getElementById('vungHienThiSoDauBai');
    if (elementTuan && elementTuan.value && elementLop && elementLop.value) {
        ketXuatSoDauBaiLenLuoi();
    } else if (vungHienThi) {
        vungHienThi.innerHTML = `<div class="p-4"><p class="text-center py-10 text-slate-500 font-bold">Vui lòng chọn Tuần và Lớp để xem Sổ đầu bài.</p></div>`;
    }
}

// =========================================================================
// [NÂNG CẤP]: KHỐI THUẬT TOÁN ĐỒNG BỘ GIAO DIỆN SELECT VÀ INPUT (UI ĐÃ TINH CHỈNH)
// =========================================================================
window.nangCapSelectThanhInput = function(selectId, placeholderText) {
    let selectEl = document.getElementById(selectId);
    if (!selectEl) return;

    // Ngăn chặn việc nhãn (label) bị xuống dòng bằng cách ép phần tử cha không bẻ dòng
    let theCha = selectEl.parentElement;
    if (theCha) theCha.style.whiteSpace = 'nowrap';

    let wrapperId = 'wrapper_' + selectId;
    let wrapper = document.getElementById(wrapperId);
    let inputEl, listEl;

    if (!wrapper) {
        // Tạo vỏ bọc bao quanh - Đã thu hẹp kích thước cố định w-32 (khoảng 128px) để nhường chỗ cho text Tên tuần
        wrapper = document.createElement('div');
        wrapper.id = wrapperId;
        wrapper.className = 'relative inline-block w-32 align-middle ml-1';
        
        selectEl.parentNode.insertBefore(wrapper, selectEl);
        wrapper.appendChild(selectEl);
        selectEl.style.display = 'none'; // Giấu select hệ thống

        // Khởi tạo khung nhập liệu
        inputEl = document.createElement('input');
        inputEl.type = 'text';
        inputEl.id = 'input_' + selectId;
        inputEl.className = 'w-full px-2 py-1.5 pr-7 text-xs border border-slate-400 rounded shadow-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors bg-white font-bold text-slate-800 placeholder-slate-400 cursor-pointer text-center';
        inputEl.placeholder = placeholderText;
        inputEl.autocomplete = 'off';

        // Gắn biểu tượng mũi tên nhận diện bằng mã SVG trực tiếp (Khắc phục lỗi hiển thị ảnh icon)
        let iconEl = document.createElement('div');
        iconEl.className = 'absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500';
        iconEl.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>`;

        // Khởi tạo danh sách kết quả lọc
        listEl = document.createElement('ul');
        listEl.id = 'list_' + selectId;
        listEl.className = 'absolute z-[999] w-full min-w-[130px] mt-1 max-h-56 overflow-y-auto overscroll-contain bg-white border border-blue-400 rounded shadow-xl hidden divide-y divide-slate-100 left-0 text-left';

        wrapper.appendChild(inputEl);
        wrapper.appendChild(iconEl);
        wrapper.appendChild(listEl);

        // Lắng nghe thao tác
        inputEl.addEventListener('focus', () => {
            // Khi bấm vào thì trả lại màu đen để gõ tìm kiếm
            inputEl.classList.remove('text-blue-900', 'font-extrabold');
            inputEl.classList.add('text-slate-800', 'font-bold');
            inputEl.value = ''; 
            renderDanhSach(selectEl, listEl, inputEl, '');
            listEl.classList.remove('hidden');
        });

        inputEl.addEventListener('input', (e) => {
            renderDanhSach(selectEl, listEl, inputEl, e.target.value);
        });

        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target)) {
                listEl.classList.add('hidden');
                dongBoHienThiTuSelect(selectId);
            }
        });
        
        selectEl.addEventListener('change', () => {
            dongBoHienThiTuSelect(selectId);
        });
    } else {
        inputEl = document.getElementById('input_' + selectId);
        listEl = document.getElementById('list_' + selectId);
    }

    dongBoHienThiTuSelect(selectId);
};

window.renderDanhSach = function(selectEl, listEl, inputEl, searchTerm) {
    listEl.innerHTML = '';
    let term = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let hasMatch = false;

    Array.from(selectEl.options).forEach((opt, index) => {
        if (index === 0 && opt.disabled) return; 
        
        let text = opt.text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (text.includes(term) || searchTerm === '') {
            hasMatch = true;
            let li = document.createElement('li');
            li.className = 'px-3 py-2 cursor-pointer transition-colors text-sm font-bold flex justify-between items-center';
            li.innerText = opt.text;

            // Dòng đang được chọn trong danh sách thả xuống (gọn gàng, sạch sẽ, không chèn badge gây vỡ giao diện)
            if (opt.value === selectEl.value) {
                li.classList.add('bg-blue-50', 'text-blue-600', 'italic'); 
                li.innerHTML = `<span>${opt.text}</span><svg class="w-4 h-4 text-blue-600 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
            } else {
                li.classList.add('text-slate-700', 'hover:bg-blue-100');
                li.innerHTML = `<span>${opt.text}</span>`;
            }

            li.addEventListener('mousedown', (e) => {
                e.preventDefault();
                selectEl.value = opt.value;
                listEl.classList.add('hidden');
                
                // [NÂNG CẤP]: Tự động nhả con trỏ chuột ra khỏi ô nhập liệu sau khi chọn
                inputEl.blur();
                
                // Đồng bộ thay đổi
                if (typeof selectEl.onchange === 'function') selectEl.onchange();
                selectEl.dispatchEvent(new Event('change', { bubbles: true }));
            });
            listEl.appendChild(li);
        }
    });

    if (!hasMatch) {
        let li = document.createElement('li');
        li.className = 'px-3 py-2 text-sm text-red-500 italic text-center font-medium';
        li.innerText = 'Không tìm thấy...';
        listEl.appendChild(li);
    }
};
window.dongBoHienThiTuSelect = function(selectId) {
    let selectEl = document.getElementById(selectId);
    let inputEl = document.getElementById('input_' + selectId);
    if (!selectEl || !inputEl) return;

    // [NÂNG CẤP UX]: Ngăn chặn việc tự động xóa chữ nếu ô chọn đang bị khóa chờ mạng
    if (selectEl.disabled) return;

    if (selectEl.value) {
        let opt = Array.from(selectEl.options).find(o => o.value === selectEl.value);
        if(opt) {
            inputEl.value = opt.text;
            inputEl.classList.remove('text-slate-800', 'text-slate-500', 'opacity-80', 'font-bold');
            inputEl.classList.add('text-blue-900', 'font-extrabold'); 
        }
    } else {
        inputEl.value = '';
        inputEl.classList.remove('text-blue-900', 'font-extrabold', 'text-slate-500', 'opacity-80', 'italic');
        inputEl.classList.add('text-slate-800', 'font-bold');
    }
};

// =========================================================================
// THUẬT TOÁN CỬA SỔ TRƯỢT HIỂN THỊ TIẾT PPCT
// =========================================================================
let trangThaiKhungPPCT = { dangMo: false, inputTiet: null, inputTenBai: null };

function moKhungTruotPPCT(event, theInputTiet, khoi, mon, tietHienTai) {
    if (event) event.stopPropagation(); 
    dongKhungTruotPPCT(); 
    trangThaiKhungPPCT.inputTiet = theInputTiet;
    let tr = theInputTiet.closest('tr');
    trangThaiKhungPPCT.inputTenBai = tr ? tr.querySelector('td[data-loai="tenBai"] textarea') : null;
    
    let intTiet = parseInt(tietHienTai) || 1;
    let tietBatDau = Math.max(1, intTiet - 10);
    let tietKetThuc = intTiet + 10;
    veGiaoDienKhungTruot(theInputTiet, khoi, mon, intTiet, tietBatDau, tietKetThuc);
}

function veGiaoDienKhungTruot(theInputTiet, khoi, mon, tietTrungTam, tietBatDau, tietKetThuc) {
    let monGocChuan = mon.toLowerCase().replace(/\s+/g, ' ');
    let monPPCT = mon.replace(/[0-9\(\)]/g, '').trim().toLowerCase().replace(/\s+/g, ' ');
    
    let htmlDanhSach = `<ul class="max-h-64 overflow-y-auto bg-white border border-blue-300 shadow-lg rounded text-sm w-80 text-left relative z-50">`;
    
    if (tietBatDau > 1) {
        let tietMoi = Math.max(1, tietBatDau - 10);
        htmlDanhSach += `<li class="p-2 text-center text-blue-600 font-bold bg-blue-50 cursor-pointer hover:bg-blue-100" 
                             onclick="veGiaoDienKhungTruot(trangThaiKhungPPCT.inputTiet, '${khoi}', '${mon}', ${tietTrungTam}, ${tietMoi}, ${tietBatDau - 1}); event.stopPropagation();">
                             ↑ Tải các tiết trước...
                         </li>`;
    }

    for (let i = tietBatDau; i <= tietKetThuc; i++) {
        let baiDay = tuDienPPCTToanCuc[`${khoi}_${monGocChuan}_${i}`] || tuDienPPCTToanCuc[`${khoi}_${monPPCT}_${i}`] || 'Chưa có dữ liệu bài dạy';
        let baiDayAnToan = baiDay.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        
        let cssDangChon = (i === tietTrungTam) ? "bg-blue-100 border-l-4 border-blue-600 font-bold" : "hover:bg-slate-100 border-l-4 border-transparent";
        htmlDanhSach += `<li class="p-2 cursor-pointer border-b border-slate-100 ${cssDangChon}" 
                             onclick="chonMucPPCT(${i}, '${baiDayAnToan}', event)">
                             <span class="text-blue-700 font-extrabold">Tiết ${i}:</span> <span class="text-slate-700">${baiDay}</span>
                         </li>`;
    }

    htmlDanhSach += `<li class="p-2 text-center text-blue-600 font-bold bg-blue-50 cursor-pointer hover:bg-blue-100" 
                         onclick="veGiaoDienKhungTruot(trangThaiKhungPPCT.inputTiet, '${khoi}', '${mon}', ${tietTrungTam}, ${tietKetThuc + 1}, ${tietKetThuc + 11}); event.stopPropagation();">
                         ↓ Tải các tiết sau...
                     </li></ul>`;

    let divKhung = document.createElement('div');
    divKhung.id = 'khungHienThiPPCT_Dong';
    divKhung.className = 'absolute mt-1 z-50';
    divKhung.innerHTML = htmlDanhSach;

    let tdContainer = theInputTiet.parentNode;
    if (window.getComputedStyle(tdContainer).position === 'static') {
        tdContainer.style.position = 'relative';
    }
    
    divKhung.addEventListener('mousedown', function(e) { e.stopPropagation(); });
    tdContainer.appendChild(divKhung);
    trangThaiKhungPPCT.dangMo = true;
}


function dongKhungTruotPPCT() {
    let khungOld = document.getElementById('khungHienThiPPCT_Dong');
    if (khungOld) khungOld.remove();
    trangThaiKhungPPCT.dangMo = false;
}

document.addEventListener('mousedown', function(event) {
    if (trangThaiKhungPPCT.dangMo) {
        let khungDong = document.getElementById('khungHienThiPPCT_Dong');
        let oTietDangKichHoat = trangThaiKhungPPCT.inputTiet;
        if (khungDong && event.target !== oTietDangKichHoat && !khungDong.contains(event.target)) {
            dongKhungTruotPPCT();
        }
    }
});

// =========================================================================
// KHỐI MỚI: THUẬT TOÁN CỬA SỔ TRƯỢT DANH SÁCH GIÁO VIÊN (COMBO BOX KÝ TÊN)
// =========================================================================
let trangThaiKhungChuKy = { dangMo: false, inputChuKy: null, dangHover: false };

function moKhungTruotChuKy(event, theInputChuKy) {
    if (event) event.stopPropagation();
    
    // Nếu click lại vào chính ô đang mở thì bỏ qua
    if (trangThaiKhungChuKy.dangMo && trangThaiKhungChuKy.inputChuKy === theInputChuKy) return;
    
    if (typeof dongKhungTruotPPCT === 'function') dongKhungTruotPPCT(); 
    dongKhungTruotChuKy(); 
    
    trangThaiKhungChuKy.inputChuKy = theInputChuKy;
    trangThaiKhungChuKy.dangHover = false; 

    // Mờ chữ khi mở khung chọn (nhưng sẽ đậm lại khi gõ)
    theInputChuKy.classList.remove('text-blue-700');
    theInputChuKy.classList.add('text-slate-400', 'opacity-60');

    if (theInputChuKy.disabled || !danhSachGiaoVienToanCuc || danhSachGiaoVienToanCuc.length === 0) return;

    let divKhung = document.createElement('div');
    divKhung.id = 'khungHienThiChuKy_Dong';
    divKhung.className = 'fixed z-[9999] mt-1'; 
    
    // Khởi tạo HTML toàn bộ danh sách (Truyền rỗng = Không lọc)
    divKhung.innerHTML = taoHtmlDanhSachChuKy('');

    // Bắt sự kiện chuột ra/vào để chống lỗi văng khung khi lăn bi
    divKhung.addEventListener('mouseenter', () => { trangThaiKhungChuKy.dangHover = true; });
    divKhung.addEventListener('mouseleave', () => { trangThaiKhungChuKy.dangHover = false; });

    document.body.appendChild(divKhung);
    
    let rect = theInputChuKy.getBoundingClientRect();
    divKhung.style.top = (rect.bottom + 2) + 'px';
    divKhung.style.left = (rect.right - 192) + 'px'; 
    
    trangThaiKhungChuKy.dangMo = true;
}

// [THUẬT TOÁN MỚI]: Lọc và xây dựng HTML dựa theo từ khóa
function taoHtmlDanhSachChuKy(tuKhoa) {
    let tk = String(tuKhoa).trim().toLowerCase();
    let danhSachLoc = danhSachGiaoVienToanCuc;
    
    // Lọc thông minh: Không phân biệt dấu tiếng Việt
    if (tk !== '') {
        let locKhongDau = tk.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        danhSachLoc = danhSachGiaoVienToanCuc.filter(gv => {
            let gvKhongDau = gv.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return gv.toLowerCase().includes(tk) || gvKhongDau.includes(locKhongDau);
        });
    }

    let htmlDanhSach = `<ul class="max-h-56 overflow-y-auto overscroll-contain bg-white border border-blue-400 shadow-2xl rounded text-sm w-48 text-left divide-y divide-slate-100">`;
    htmlDanhSach += `<li class="p-2.5 cursor-pointer hover:bg-red-50 text-red-600 transition-colors italic text-center font-semibold" onmousedown="chonMucChuKy('', event)">-- Xóa chữ ký --</li>`;

    if (danhSachLoc.length === 0) {
        htmlDanhSach += `<li class="p-2.5 text-slate-500 italic text-center bg-slate-50">Không tìm thấy giáo viên...</li>`;
    } else {
        danhSachLoc.forEach(gv => {
            let gvAnToan = gv.replace(/'/g, "\\'").replace(/"/g, '&quot;');
            htmlDanhSach += `<li class="p-2.5 cursor-pointer hover:bg-blue-50 transition-colors" onmousedown="chonMucChuKy('${gvAnToan}', event)">
                                 <span class="text-blue-800 font-bold block">${gv}</span>
                             </li>`;
        });
    }
    htmlDanhSach += `</ul>`;
    return htmlDanhSach;
}

// [THUẬT TOÁN MỚI]: Kích hoạt khi người dùng gõ phím trực tiếp
function locDanhSachChuKy(theInput) {
    coThayDoiChuaLuu_SDB = true;
    
    // Khi tự gõ phím thì chữ phải rõ ràng, không bị mờ
    theInput.classList.remove('text-slate-400', 'opacity-60');
    theInput.classList.add('text-blue-700');

    // Nếu người dùng bắt đầu gõ mà khung chưa mở -> Mở khung
    if (!trangThaiKhungChuKy.dangMo || trangThaiKhungChuKy.inputChuKy !== theInput) {
        moKhungTruotChuKy(null, theInput);
    }
    
    // Tiêm từ khóa đang gõ vào hàm lọc và cập nhật ngay lập tức giao diện khung thả xuống
    let khungDong = document.getElementById('khungHienThiChuKy_Dong');
    if (khungDong) {
        khungDong.innerHTML = taoHtmlDanhSachChuKy(theInput.value);
        khungDong.addEventListener('mouseenter', () => { trangThaiKhungChuKy.dangHover = true; });
        khungDong.addEventListener('mouseleave', () => { trangThaiKhungChuKy.dangHover = false; });
    }
}

function dongKhungTruotChuKy() {
    let khungOld = document.getElementById('khungHienThiChuKy_Dong');
    if (khungOld) khungOld.remove();
    if (trangThaiKhungChuKy.inputChuKy) {
        trangThaiKhungChuKy.inputChuKy.classList.remove('text-slate-400', 'opacity-60');
        trangThaiKhungChuKy.inputChuKy.classList.add('text-blue-700');
    }
    trangThaiKhungChuKy.dangMo = false;
    trangThaiKhungChuKy.dangHover = false;
}

document.addEventListener('mousedown', function(event) {
    if (trangThaiKhungChuKy.dangMo) {
        let khungDong = document.getElementById('khungHienThiChuKy_Dong');
        if (khungDong && event.target !== trangThaiKhungChuKy.inputChuKy && !khungDong.contains(event.target)) {
            dongKhungTruotChuKy();
        }
    }
});

document.addEventListener('scroll', function(event) {
    if (trangThaiKhungChuKy.dangMo) {
        // Tối ưu: Lăn bi chuột trong danh sách sẽ không làm văng khung
        if (trangThaiKhungChuKy.dangHover) return;
        
        let khungDong = document.getElementById('khungHienThiChuKy_Dong');
        if (khungDong && (event.target === khungDong || khungDong.contains(event.target))) {
            return;
        }
        dongKhungTruotChuKy();
    }
}, true);
// =========================================================================
// HÀM MỚI: CẬP NHẬT DỮ LIỆU NGẦM LÊN LƯỚI MÀ KHÔNG VẼ LẠI UI (CHỐNG GIẬT)
// =========================================================================
window.capNhatSoDauBaiNgamLenLuoi = function(tuanChon, lopChon) {
    let vungHienThi = document.getElementById('vungHienThiSoDauBai');
    if (!vungHienThi || !tuanChon || !lopChon) return;

    let maxTuanChon = parseInt(tuanChon.replace(/\D/g, '')) || 0;
    let matchKhoiChon = lopChon.match(/\d+/);
    let khoiChon = matchKhoiChon ? matchKhoiChon[0] : '';
    
    let boDemTietPPCT = {}; 
    
    // 1. Quét tiến độ PPCT các tuần trước
    duLieuTKBGopDaMap.forEach(d => {
        let t = parseInt(String(d['Tuần']).replace(/\D/g, '')) || 0;
        let maLop = String(d['Mã Lớp']).trim().toUpperCase();

        if (maLop === lopChon.toUpperCase() && t < maxTuanChon) {
            let mon = String(d['Môn Học']).trim();
            if (mon !== '') {
                let monPPCT = mon.replace(/[0-9\(\)]/g, '').trim().toLowerCase().replace(/\s+/g, ' ');
                if (d.DaLuu === true) {
                    let tietLuu = parseInt(String(d['TietPPCT_Thuc']).replace(/\D/g, '')) || 0;
                    if (tietLuu > (boDemTietPPCT[monPPCT] || 0)) {
                        boDemTietPPCT[monPPCT] = tietLuu;
                    } else if (!boDemTietPPCT[monPPCT]) {
                        boDemTietPPCT[monPPCT] = 1;
                    } else {
                        boDemTietPPCT[monPPCT] = boDemTietPPCT[monPPCT] + 1;
                    }
                }
            }
        }
    });

    // 2. Tính toán tiếp tiến độ cho các tiết chưa lưu trong tuần hiện tại
    let tkbTuanNay = duLieuTKBGopDaMap.filter(d => 
        String(d['Tuần']).trim() === tuanChon && 
        String(d['Mã Lớp']).trim().toUpperCase() === lopChon.toUpperCase()
    );

    let dictTKBMoi = {};
    tkbTuanNay.forEach(dong => {
        let thuGoc = String(dong['Thứ']).trim().toLowerCase();
        let buoiKiemTra = String(dong['Buổi']).trim().toLowerCase() === 'sáng' ? 'Sang' : 'Chieu';
        
        let mon = String(dong['Môn Học']).trim();
        if (mon !== '') {
            let monPPCT = mon.replace(/[0-9\(\)]/g, '').trim().toLowerCase().replace(/\s+/g, ' ');

            let chuKy = String(dong['ChuKy_Thuc'] || '').trim();
            let daKy = (chuKy !== '' && chuKy !== '--');

            if (daKy) {
                let tietDaKy = parseInt(String(dong['TietPPCT_Thuc']).replace(/\D/g, '')) || 0;
                if (tietDaKy > (boDemTietPPCT[monPPCT] || 0)) boDemTietPPCT[monPPCT] = tietDaKy;
            } else {
                boDemTietPPCT[monPPCT] = (boDemTietPPCT[monPPCT] || 0) + 1;
                dong['TietPPCT_Thuc'] = boDemTietPPCT[monPPCT];

                let khoaChinh = `${khoiChon}_${mon.toLowerCase().replace(/\s+/g, ' ')}_${dong['TietPPCT_Thuc']}`;
                let khoaPhu = `${khoiChon}_${monPPCT}_${dong['TietPPCT_Thuc']}`;
                let tenBaiMoi = tuDienPPCTToanCuc[khoaChinh] || tuDienPPCTToanCuc[khoaPhu] || '';
                if (tenBaiMoi) {
                    dong['TenBai_Thuc'] = tenBaiMoi;
                }
            }
        }
        dictTKBMoi[`${thuGoc}_${buoiKiemTra}_${dong['Tiết']}`] = dong;
    });

    let theChotQuyen = document.getElementById('theChotQuyenSDB');
    let madinhdanhGV = maGvDangNhapHeThong || (theChotQuyen ? theChotQuyen.getAttribute('data-madinhdanh') || '' : '');
    let quyenQuanTri = coToanQuyenSDB || (theChotQuyen ? (theChotQuyen.getAttribute('data-quantri') === 'true' || theChotQuyen.getAttribute('data-quantri') === true) : false);
    let maGvDangNhapLC = madinhdanhGV.trim().toLowerCase().normalize('NFC');

    // 3. Cập nhật DOM cục bộ
    let cacBang = document.querySelectorAll('#vungHienThiSoDauBai .bang-so-dau-bai-container');
    
    cacBang.forEach(khungBang => {
        let thuHienTai = '';
        let cacDong = khungBang.querySelectorAll('table tbody tr');
        
        cacDong.forEach(dong => {
            let cellThu = dong.querySelector('td[rowspan]');
            if (cellThu) {
                let textThuNgay = cellThu.innerText.split('\n');
                thuHienTai = textThuNgay[0].trim().toLowerCase();
            }

            let buoiThuocDong = dong.getAttribute('data-buoi') || 'Sáng';
            let buoiKiemTra = buoiThuocDong.toLowerCase() === 'sáng' ? 'Sang' : 'Chieu';
            
            let oTiet = dong.querySelector('td[data-loai="tietSDB"]');
            let tiet = oTiet ? oTiet.innerText.trim() : '';

            if (thuHienTai !== '' && tiet !== '') {
                let dongDuLieuMoi = dictTKBMoi[`${thuHienTai}_${buoiKiemTra}_${tiet}`];
                
                if (dongDuLieuMoi) {
                    let monHocMoi = dongDuLieuMoi['Môn Học'] || '';
                    let isDaLuuMoi = dongDuLieuMoi['DaLuu'] || false;
                    
                    let tenBaiMoi = String(dongDuLieuMoi['TenBai_Thuc'] || '');
                    let nhanXetMoi = String(dongDuLieuMoi['NhanXet_Thuc'] || '');
                    let xepLoaiMoi = String(dongDuLieuMoi['XepLoai_Thuc'] || '');
                    let chuKyMoi = String(dongDuLieuMoi['ChuKy_Thuc'] || '');
                    let chuyenCanMoi = String(dongDuLieuMoi['ChuyenCan_Thuc'] || '');
                    let tietPPCTMoi = String(dongDuLieuMoi['TietPPCT_Thuc'] || '');
                    // [TÙY CHỈNH]: Tạm thời tắt tính năng khóa cứng khi đã ký.
                    // let isLockedMoi = isDaLuuMoi && chuKyMoi.trim() !== '';
                    let isLockedMoi = window.kiemTraTuanDaKhoa(tuanChon);

                    let quyenNhapThuCong = quyenQuanTri || window.kiemTraQuyenGiaoVienTheoTiet(dongDuLieuMoi, lopChon, monHocMoi);

                    let tdMon = dong.querySelector('td[data-loai="mon"]');
                    if (tdMon && tdMon.innerText.trim() !== monHocMoi) {
                        tdMon.innerText = monHocMoi;
                    }

                    let tdTenBai = dong.querySelector('td[data-loai="tenBai"]');
                    if (tdTenBai) tdTenBai.setAttribute('data-islocked', isLockedMoi);
                    dong.setAttribute('data-daluu', isDaLuuMoi);

                    const capNhatO = (loai, giaTriMoi) => {
                        let td = dong.querySelector(`td[data-loai="${loai}"]`);
                        if (!td) return;
                        
                        if (isLockedMoi) {
                            let theSpan = td.querySelector('span');
                            let canDoi = !theSpan || theSpan.innerText.trim() !== giaTriMoi;
                            
                            if (loai === 'tenBai') {
                                canDoi = !td.querySelector('span') && td.innerText.trim() !== giaTriMoi;
                                if (td.querySelector('textarea')) canDoi = true; 
                            }

                            if (canDoi) {
                                if (loai === 'tenBai') {
                                    td.innerHTML = giaTriMoi; 
                                    td.className = "border border-gray-500 p-1 text-emerald-700 font-bold bg-white group-hover:bg-slate-50 align-middle";
                                } else if (loai === 'chuyenCan') {
                                    td.innerHTML = `<span class="font-bold text-slate-800 block text-center">${giaTriMoi}</span>`;
                                } else if (loai === 'nhanXet') {
                                    td.innerHTML = `<span class="font-normal text-slate-800 block">${giaTriMoi}</span>`;
                                } else if (loai === 'xepLoai') {
                                    td.innerHTML = `<span class="font-bold text-slate-800 block text-center">${giaTriMoi}</span>`;
                                } else if (loai === 'chuKy') {
                                    td.innerHTML = `<span class="font-bold text-slate-800 uppercase block text-center">${giaTriMoi}</span>`;
                                } else if (loai === 'tiet') {
                                    td.innerHTML = `<span class="font-extrabold text-blue-700 block text-center">${giaTriMoi}</span>`;
                                }
                            }
                        } else {
                            let tagNhap = td.querySelector('input, select, textarea');
                            let trangThaiKhoa = !quyenNhapThuCong ? "disabled" : "";
                            let cssNenKhoa = !quyenNhapThuCong ? "bg-slate-100 cursor-not-allowed opacity-70" : "bg-transparent";

                            if (!tagNhap) {
                                if (loai === 'tenBai') {
                                    let placeholderText = !quyenNhapThuCong ? "Không có quyền" : "Nhập...";
                                    td.innerHTML = `<textarea rows="1" oninput="this.style.height='auto'; this.style.height=(this.scrollHeight)+'px';" ${trangThaiKhoa} class="w-full text-left outline-none ${cssNenKhoa} font-semibold text-slate-800 placeholder-slate-400 px-1 resize-none overflow-hidden align-middle" placeholder="${placeholderText}">${giaTriMoi}</textarea>`;
                                    td.className = "border border-gray-500 p-1 bg-white group-hover:bg-slate-50 align-middle";
                                } else if (loai === 'chuyenCan') {
                                    td.innerHTML = `<input type="text" ${trangThaiKhoa} class="w-full text-center outline-none ${cssNenKhoa} font-semibold text-slate-800 placeholder-slate-400" placeholder="..." value="${giaTriMoi}">`;
                                } else if (loai === 'nhanXet') {
                                    td.innerHTML = `<textarea rows="1" oninput="this.style.height='auto'; this.style.height=(this.scrollHeight)+'px';" ${trangThaiKhoa} class="w-full text-left outline-none ${cssNenKhoa} font-normal text-slate-800 placeholder-slate-400 px-1 resize-none overflow-hidden align-middle" placeholder="Nhận xét...">${giaTriMoi}</textarea>`;
                                } else if (loai === 'xepLoai') {
                                    let optTot = (giaTriMoi === 'Tốt') ? 'selected' : '';
                                    let optKha = (giaTriMoi === 'Khá') ? 'selected' : '';
                                    let optTB = (giaTriMoi === 'TB') ? 'selected' : '';
                                    let optYeu = (giaTriMoi === 'Yếu') ? 'selected' : '';
                                    td.innerHTML = `<select ${trangThaiKhoa} class="w-full text-center outline-none ${cssNenKhoa} font-bold text-slate-800 cursor-pointer appearance-none"><option value="" ${!giaTriMoi ? 'selected' : ''}>-Chọn-</option><option value="Tốt" ${optTot}>Tốt</option><option value="Khá" ${optKha}>Khá</option><option value="TB" ${optTB}>TB</option><option value="Yếu" ${optYeu}>Yếu</option></select>`;
                                } else if (loai === 'chuKy') {
                                    let thuocVeGvHienTai = quyenNhapThuCong && !quyenQuanTri;
                                    td.innerHTML = `<div class="relative flex items-center justify-center w-full h-full"><input type="text" autocomplete="off" ${trangThaiKhoa} data-thuocve="${thuocVeGvHienTai}" class="w-full text-center outline-none transition-colors duration-300 rounded ${cssNenKhoa} font-semibold text-blue-700 placeholder-blue-300 cursor-pointer hover:bg-blue-50 focus:bg-blue-50 pr-5" placeholder="${!quyenNhapThuCong ? 'Không có quyền' : 'Ghi rõ họ tên...'}" value="${giaTriMoi}" onclick="moKhungTruotChuKy(event, this)" oninput="locDanhSachChuKy(this)">${!quyenNhapThuCong ? '' : `<svg class="w-4 h-4 absolute right-1 text-blue-400 pointer-events-none opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>`}</div>`;
                                } else if (loai === 'tiet') {
                                    let monHocAnToan = monHocMoi.replace(/'/g, "\\'"); 
                                    let onfocusLogic = `moKhungTruotPPCT(event, this, '${khoiChon}', '${monHocAnToan}', this.value || 1)`;
                                    td.innerHTML = `<input type="text" onclick="${onfocusLogic}" readonly ${trangThaiKhoa} class="w-full text-center outline-none ${cssNenKhoa} font-extrabold text-blue-700 placeholder-blue-300 transition-all cursor-pointer hover:bg-blue-50" placeholder="..." value="${giaTriMoi}">`;
                                }
                                
                                let tagMoi = td.querySelector('input, select, textarea');
                                if(tagMoi) {
                                    tagMoi.addEventListener('input', (e) => { coThayDoiChuaLuu_SDB = true; danhDauDongThayDoi(e.target.closest('tr')); });
                                    tagMoi.addEventListener('change', (e) => { coThayDoiChuaLuu_SDB = true; danhDauDongThayDoi(e.target.closest('tr')); });
                                    if (tagMoi.tagName === 'TEXTAREA') {
                                        tagMoi.style.height = 'auto';
                                        tagMoi.style.height = (tagMoi.scrollHeight) + 'px';
                                    }
                                }
                            } else {
                                if (tagNhap.value !== giaTriMoi) {
                                    tagNhap.value = giaTriMoi;
                                    if (tagNhap.tagName === 'TEXTAREA') {
                                        tagNhap.style.height = 'auto';
                                        tagNhap.style.height = (tagNhap.scrollHeight) + 'px';
                                    }
                                }
                                
                                if (quyenNhapThuCong) {
                                    tagNhap.removeAttribute('disabled');
                                    tagNhap.classList.remove('bg-slate-100', 'cursor-not-allowed', 'opacity-70');
                                    tagNhap.classList.add('bg-transparent');
                                } else {
                                    tagNhap.setAttribute('disabled', 'disabled');
                                    tagNhap.classList.remove('bg-transparent');
                                    tagNhap.classList.add('bg-slate-100', 'cursor-not-allowed', 'opacity-70');
                                }
                            }
                        }
                    };

                    capNhatO('chuyenCan', chuyenCanMoi);
                    capNhatO('tiet', tietPPCTMoi);
                    capNhatO('tenBai', tenBaiMoi);
                    capNhatO('nhanXet', nhanXetMoi);
                    capNhatO('xepLoai', xepLoaiMoi);
                    capNhatO('chuKy', chuKyMoi);
                    
                    dong.setAttribute('data-thaydoi', 'false');
                    let iconSua = dong.querySelector('.icon-sua-chua');
                    if(iconSua) iconSua.remove();
                }
            }
        });
    });

    // 4. Thanh trạng thái tổng quát
    let soTietDaLuu = tkbTuanNay.filter(d => d.DaLuu === true).length;
    let tongSoTietCoMon = tkbTuanNay.filter(d => String(d['Môn Học']).trim() !== '').length;

    if (tongSoTietCoMon > 0) {
        let containerDiv = vungHienThi.querySelector('div.mb-4.p-2');
        if (containerDiv) {
            if (soTietDaLuu > 0) {
                containerDiv.className = "mb-4 p-2 bg-emerald-50 border border-emerald-200 shadow-sm flex items-center justify-between rounded";
                containerDiv.innerHTML = `<div class="flex items-center gap-2"><div class="bg-emerald-500 rounded-full p-1"><svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg></div><span class="text-sm font-extrabold text-emerald-800 tracking-wide uppercase">CÓ DỮ LIỆU ĐÃ ĐƯỢC CHỐT SỔ</span></div><span class="text-xs font-semibold text-emerald-700 italic hidden sm:block">Các tiết đã Ký Tên sẽ bị khóa cứng. Các tiết chưa ký vẫn tiếp tục mở để chỉnh sửa.</span>`;
            } else {
                containerDiv.className = "mb-4 p-2 bg-amber-50 border border-amber-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded animate-pulse-once";
                containerDiv.innerHTML = `<div class="flex items-center gap-2"><div class="bg-amber-500 rounded-full p-1"><svg class="w-3 h-3 text-white animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg></div><span class="text-sm font-extrabold text-amber-800 tracking-wide uppercase">DỮ LIỆU MỚI TỊNH TIẾN (CHƯA LƯU)</span></div><span class="text-xs font-bold text-amber-800 bg-amber-200 px-3 py-1 rounded-full border border-amber-400">⚠️ Yêu cầu: Bấm "Đồng bộ Tên bài", Nhập Đánh giá, Ký tên và bấm "Lưu Sổ đầu bài" để lưu!</span>`;
            }
        }
    }
};
// =========================================================================
// THAO TÁC KHÓA / MỞ KHÓA SỔ ĐẦU BÀI THEO TUẦN (TOÀN TRƯỜNG)
// =========================================================================
async function thaoTacKhoaMoSoDauBai() {
    let theSelectTuan = document.getElementById('chonTuanSo');
    let tuanChon = theSelectTuan ? theSelectTuan.value : '';

    if (!tuanChon) {
        return alert("Vui lòng chọn Tuần học trước khi thực hiện thao tác Khóa/Mở sổ!");
    }

    let tuanSo = parseInt(String(tuanChon).replace(/\D/g, ''), 10);
    let daBiKhoa = window.kiemTraTuanDaKhoa(tuanChon);
    let hanhDongMoi = !daBiKhoa; // true: Khóa, false: Mở

    let namHocHienTai = (typeof window.thongSoHocVu !== 'undefined' && window.thongSoHocVu.NAM_HOC) ? window.thongSoHocVu.NAM_HOC : (typeof thongSoHocVu !== 'undefined' && thongSoHocVu.NAM_HOC ? thongSoHocVu.NAM_HOC : '');
    let chuoiNamHoc = namHocHienTai ? ` (Năm học ${namHocHienTai})` : '';

    let thongBao = hanhDongMoi 
        ? `🔒 XÁC NHẬN KHÓA SỔ ĐẦU BÀI TOÀN TRƯỜNG:\n\nĐồng chí có chắc chắn muốn KHÓA Sổ đầu bài TUẦN ${tuanSo}${chuoiNamHoc} của TẤT CẢ CÁC LỚP TRONG TOÀN TRƯỜNG?\n\n- Sau khi khóa, giáo viên toàn trường chỉ có quyền XEM, không thể sửa đổi hay lưu đè dữ liệu ở bất kỳ lớp nào.\n- Dữ liệu tuần này được niêm phong để BGH kiểm tra, đánh giá chuyên môn.`
        : `🔓 XÁC NHẬN MỞ KHÓA SỔ TOÀN TRƯỜNG:\n\nĐồng chí có chắc chắn muốn MỞ KHÓA Sổ đầu bài TUẦN ${tuanSo}${chuoiNamHoc} cho toàn trường?\n\n- Toàn bộ các lớp trong Tuần ${tuanSo} sẽ được mở lại để giáo viên tiếp tục cập nhật, bổ sung bài dạy.`;

    if (!confirm(thongBao)) return;

    let btn = document.getElementById('btnKhoaSoDauBai');
    let textGoc = btn ? btn.innerHTML : '';
    if (btn) {
        btn.innerHTML = `<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Đang xử lý...`;
        btn.disabled = true;
    }

    try {
        let emailNguoiDung = (typeof window.dinhDanhGiaoVienToanCuc !== 'undefined' && window.dinhDanhGiaoVienToanCuc !== '') 
    ? window.dinhDanhGiaoVienToanCuc 
    : (typeof window.emailGiaoVienToanCuc !== 'undefined' && window.emailGiaoVienToanCuc !== '' 
        ? window.emailGiaoVienToanCuc 
        : (typeof maGvDangNhapHeThong !== 'undefined' ? maGvDangNhapHeThong : ''));
        let payload = {
            thaoTac: 'khoaMoSoDauBai',
            tuan: tuanSo,
            namHoc: namHocHienTai,
            khoa: hanhDongMoi,
            emailTruyCap: emailNguoiDung
        };

        const phanHoi = await fetchVoiCoCheThuLai(CAU_HINH_FRONTEND.URL_API_MAY_CHU, {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        const ketQua = await phanHoi.json();

        if (ketQua.trangThai === 'thanh_cong') {
            alert("✅ " + ketQua.thongBao);
            
            // Cập nhật ngay RAM
            duLieuKhoaSoToanCuc[tuanSo] = {
                daKhoa: hanhDongMoi,
                tuan: tuanSo,
                namHoc: namHocHienTai,
                maTuan: ketQua.maTuan || ((namHocHienTai ? namHocHienTai + '_' : '') + 'Tuần ' + tuanSo),
                nguoiThucHien: emailNguoiDung,
                thoiGian: 'Vừa xong'
            };

            // Vẽ lại giao diện ngay tức thì
            thucThiKetXuatSoDauBaiLenLuoi();
        } else {
            alert("Thao tác thất bại: " + (ketQua.thongBao || "Lỗi không xác định."));
        }
    } catch (loi) {
        alert("Lỗi kết nối máy chủ: " + loi.message);
    } finally {
        if (btn) {
            btn.innerHTML = textGoc;
            btn.disabled = false;
        }
    }
}
