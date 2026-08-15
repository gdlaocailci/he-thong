/**
 * TỆP: app.js
 * Chức năng: Điều khiển logic giao diện, xử lý Pivot Lưới Ma Trận.
 * Nâng cấp: Xây dựng hàm kiemTraDinhMuc() quét DOM và xuất báo cáo Modal.
 * Thiết kế và phát triển
 * Hoàng Ngọc Lâm
 */

let thongSoHocVu = {};

document.addEventListener('DOMContentLoaded', () => {
    khoiTaoGiaoDien();
});

// =========================================================================
// KHỐI 1 & 2: KẾT NỐI API
// =========================================================================
async function khoiTaoGiaoDien() {
    try {
        if(typeof CAU_HINH_FRONTEND !== 'undefined') {
            document.getElementById('tenHeThong').innerText = CAU_HINH_FRONTEND.TEN_DU_AN;
            document.getElementById('logoHeThong').src = CAU_HINH_FRONTEND.LINK_LOGO_TRANG_CHU;
            document.getElementById('iconBang').src = CAU_HINH_FRONTEND.LINK_ICON_BANG;
        }

        const phanHoi = await fetch(`${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=layCauHinh`);
        thongSoHocVu = await phanHoi.json();
        
        if(thongSoHocVu.NAM_HOC) document.getElementById('hienThiNamHoc').innerText = thongSoHocVu.NAM_HOC;
        if(thongSoHocVu.TUAN_HIEN_TAI) {
            document.getElementById('hienThiTuan').innerText = thongSoHocVu.TUAN_HIEN_TAI;
            taiDuLieuTKB(thongSoHocVu.TUAN_HIEN_TAI);
        }
    } catch (loi) {
        document.getElementById('tenDonVi').innerText = "Lỗi kết nối máy chủ API";
    }
}

async function taiDuLieuTKB(tuan) {
    const vungHienThi = document.getElementById('vungHienThiDuLieu');
    vungHienThi.innerHTML = `<tr><td class="text-center text-blue-600 font-bold py-10 reactbits-fade-in text-lg">Đang tải dữ liệu lưu trữ từ hệ thống...</td></tr>`;

    try {
        const phanHoi = await fetch(`${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=layTKB&tuan=${tuan || thongSoHocVu.TUAN_HIEN_TAI}`);
        const danhSachTiet = await phanHoi.json();
        xuatMaTranBang(danhSachTiet);
    } catch (loi) {
        vungHienThi.innerHTML = `<tr><td class="text-center text-red-500 font-bold py-10 text-lg">Lỗi phân tích dữ liệu từ máy chủ.</td></tr>`;
    }
}

async function goiThuatToanXepLich() {
    const vungHienThi = document.getElementById('vungHienThiDuLieu');
    vungHienThi.innerHTML = `<tr><td class="text-center text-orange-600 font-bold py-10 reactbits-fade-in text-lg">
        <div class="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-3"></div>
        Đang chạy Động cơ phân tích Ma trận & Xếp lịch chống Trùng lấp...
    </td></tr>`;

    try {
        const phanHoi = await fetch(`${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=xepLichTuDong&tuan=${thongSoHocVu.TUAN_HIEN_TAI}`);
        const danhSachTiet = await phanHoi.json();
        xuatMaTranBang(danhSachTiet);
    } catch (loi) {
        vungHienThi.innerHTML = `<tr><td class="text-center text-red-500 font-bold py-10 text-lg">Lỗi thuật toán xếp lịch tự động.</td></tr>`;
    }
}

// =========================================================================
// KHỐI 3: HÀM TẠO DROPDOWN & KIỂM TRA ĐỊNH MỨC (NÂNG CẤP)
// =========================================================================
function taoTuyChonDong(danhSach, giaTriMacDinh, kieuText, idPhanTu) {
    let idThocTinh = idPhanTu ? `id="${idPhanTu}"` : '';
    let html = `<select ${idThocTinh} class="w-full h-full bg-transparent outline-none appearance-none text-center cursor-pointer py-1 font-bold ${kieuText}">`;
    html += `<option value=""></option>`; 
    if (danhSach && danhSach.length > 0) {
        danhSach.forEach(muc => {
            let duocChon = (muc === giaTriMacDinh) ? 'selected' : '';
            html += `<option value="${muc}" ${duocChon}>${muc}</option>`;
        });
    } else if (giaTriMacDinh) {
        html += `<option value="${giaTriMacDinh}" selected>${giaTriMacDinh}</option>`;
    }
    html += `</select>`;
    return html;
}

function kiemTraDinhMuc() {
    const mangLop = thongSoHocVu.DANH_SACH_LOP || [];
    const khungCT = thongSoHocVu.KHUNG_CHUONG_TRINH || {};
    
    // BƯỚC 1: Quét DOM để thống kê số tiết ĐANG HIỂN THỊ trên màn hình
    let thongKeHienTai = {};
    mangLop.forEach(lop => thongKeHienTai[lop] = {});

    const thuMacDinh = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6"];
    const buoiMacDinh = ["Sáng", "Chiều"];
    
    thuMacDinh.forEach(thu => {
        buoiMacDinh.forEach(buoi => {
            let soTiet = parseInt(thongSoHocVu[(buoi==="Sáng")?"SO_TIET_SANG":"SO_TIET_CHIEU"]) || 4;
            for(let t=1; t<=soTiet; t++) {
                mangLop.forEach(lop => {
                    let theSelectMon = document.getElementById(`mon_${thu}_${buoi}_${t}_${lop}`);
                    if(theSelectMon && theSelectMon.value) {
                        let tenMon = theSelectMon.value;
                        if(!thongKeHienTai[lop][tenMon]) thongKeHienTai[lop][tenMon] = 0;
                        thongKeHienTai[lop][tenMon]++;
                    }
                });
            }
        });
    });

    // BƯỚC 2: So sánh chéo với Khung chương trình gốc và xuất HTML Báo cáo
    let htmlKetQua = `<table class="w-full text-sm text-left border-collapse border border-gray-300">
        <thead class="bg-purple-100 text-purple-900"><tr>
            <th class="border border-gray-300 p-3">Lớp</th>
            <th class="border border-gray-300 p-3">Môn học</th>
            <th class="border border-gray-300 p-3 text-center">Đang xếp (UI)</th>
            <th class="border border-gray-300 p-3 text-center">Định mức Chuẩn</th>
            <th class="border border-gray-300 p-3 text-center">Trạng thái Cảnh báo</th>
        </tr></thead><tbody>`;
    
    let phatHienLoi = false;

    mangLop.forEach(lop => {
        let khoiHệThống = "Khoi" + lop.charAt(0);
        let dinhMucGoc = khungCT[khoiHệThống] || {};
        
        let danhSachMonDoiChieu = new Set([...Object.keys(dinhMucGoc), ...Object.keys(thongKeHienTai[lop])]);
        
        danhSachMonDoiChieu.forEach(mon => {
            // Bỏ qua các môn Tăng cường do máy tính tự sinh để lấp chỗ trống
            if (mon === "TC Toán" || mon === "TC TV" || mon === "⚠️ CẤN LỊCH") return; 
            
            let dangXep = thongKeHienTai[lop][mon] || 0;
            let quyDinh = dinhMucGoc[mon] || 0;
            
            if(quyDinh > 0 || dangXep > 0) {
                if (dangXep !== quyDinh) {
                    phatHienLoi = true;
                    let trangThai = (dangXep > quyDinh) 
                        ? `<span class="text-red-600 font-bold">❌ Thừa ${dangXep - quyDinh} tiết</span>` 
                        : `<span class="text-orange-600 font-bold">⚠️ Thiếu ${quyDinh - dangXep} tiết</span>`;
                    let nenCanhBao = (dangXep > quyDinh) ? 'bg-red-50' : 'bg-orange-50';

                    htmlKetQua += `<tr class="${nenCanhBao} hover:bg-gray-100">
                        <td class="border border-gray-300 p-2 font-bold text-center">${lop}</td>
                        <td class="border border-gray-300 p-2 font-semibold text-blue-800">${mon}</td>
                        <td class="border border-gray-300 p-2 text-center font-bold text-lg">${dangXep}</td>
                        <td class="border border-gray-300 p-2 text-center font-bold text-gray-500">${quyDinh}</td>
                        <td class="border border-gray-300 p-2 text-center">${trangThai}</td>
                    </tr>`;
                }
            }
        });
    });
    
    htmlKetQua += `</tbody></table>`;
    
    if(!phatHienLoi) {
        htmlKetQua = `<div class="p-6 bg-green-100 text-green-800 font-bold rounded-xl text-center text-lg border border-green-300 shadow-inner">
            ✅ TUYỆT VỜI! Toàn bộ các lớp trên giao diện hiện tại đã được phân bổ khớp 100% với định mức Khung Chương trình.
        </div>`;
    }

    document.getElementById('noiDungKiemTra').innerHTML = htmlKetQua;
    document.getElementById('modalKiemTra').classList.remove('hidden');
}

function dongModal() {
    document.getElementById('modalKiemTra').classList.add('hidden');
}

// =========================================================================
// KHỐI 4: PIVOT XUẤT MA TRẬN 
// =========================================================================
function xuatMaTranBang(danhSachTiet) {
    const thead = document.getElementById('tieuDeBang');
    const tbody = document.getElementById('vungHienThiDuLieu');
    const duLieuTiet = danhSachTiet || [];

    const mangLop = (thongSoHocVu.DANH_SACH_LOP && thongSoHocVu.DANH_SACH_LOP.length > 0)
        ? thongSoHocVu.DANH_SACH_LOP : [...new Set(duLieuTiet.map(t => t.maLop))].sort();

    if (mangLop.length === 0) return;

    let theadHTML = `<tr>
        <th rowspan="2" class="text-center font-bold align-middle min-w-[70px]">Thứ</th>
        <th rowspan="2" class="text-center font-bold align-middle min-w-[70px]">Buổi</th>
        <th rowspan="2" class="text-center font-bold align-middle min-w-[60px]">Tuần</th>
        <th rowspan="2" class="text-center font-bold align-middle min-w-[60px]">Tháng</th>
        <th rowspan="2" class="text-center font-bold align-middle min-w-[100px]">Năm học</th>
        <th rowspan="2" class="text-center font-bold align-middle min-w-[60px]">Tiết</th>`;
    mangLop.forEach(lop => { theadHTML += `<th colspan="2" class="text-center font-extrabold bg-slate-100 text-slate-900 tracking-widest">${lop}</th>`; });
    theadHTML += `</tr><tr>`;
    mangLop.forEach(() => {
        theadHTML += `<th class="text-center font-bold bg-slate-50 text-slate-800 min-w-[120px]">Môn</th><th class="text-center font-bold bg-slate-50 text-slate-800 min-w-[105px]">N dạy</th>`;
    });
    theadHTML += `</tr>`;
    thead.innerHTML = theadHTML;

    const luoiDuLieu = {};
    const boLocThu = {"Thứ 2": 2, "Thứ 3": 3, "Thứ 4": 4, "Thứ 5": 5, "Thứ 6": 6, "Thứ 7": 7, "Chủ nhật": 8};
    const boLocBuoi = {"Sáng": 1, "Chiều": 2};

    duLieuTiet.forEach(t => {
        const thu = t.thu.trim(); const buoi = t.buoi.trim(); const tiet = t.tiet;
        if (!luoiDuLieu[thu]) luoiDuLieu[thu] = {};
        if (!luoiDuLieu[thu][buoi]) luoiDuLieu[thu][buoi] = {};
        if (!luoiDuLieu[thu][buoi][tiet]) luoiDuLieu[thu][buoi][tiet] = {};
        luoiDuLieu[thu][buoi][tiet][t.maLop] = t;
    });

    const thuMacDinh = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6"];
    thuMacDinh.forEach(thu => { if (!luoiDuLieu[thu]) luoiDuLieu[thu] = {}; });

    const gioiHanSang = parseInt(thongSoHocVu.SO_TIET_SANG) || 4;
    const gioiHanChieu = parseInt(thongSoHocVu.SO_TIET_CHIEU) || 3;

    Object.keys(luoiDuLieu).forEach(thu => {
        if (!luoiDuLieu[thu]["Sáng"]) luoiDuLieu[thu]["Sáng"] = {};
        if (!luoiDuLieu[thu]["Chiều"]) luoiDuLieu[thu]["Chiều"] = {};
        for (let i = 1; i <= gioiHanSang; i++) { if (!luoiDuLieu[thu]["Sáng"][i]) luoiDuLieu[thu]["Sáng"][i] = {}; }
        for (let j = 1; j <= gioiHanChieu; j++) { if (!luoiDuLieu[thu]["Chiều"][j]) luoiDuLieu[thu]["Chiều"][j] = {}; }
        luoiDuLieu[thu]["Sáng"]["99_du"] = {}; luoiDuLieu[thu]["Chiều"]["99_du"] = {};
    });

    let tbodyHTML = '';
    const danhSachThu = Object.keys(luoiDuLieu).sort((a, b) => (boLocThu[a] || 99) - (boLocThu[b] || 99));

    danhSachThu.forEach(thu => {
        const danhSachBuoi = Object.keys(luoiDuLieu[thu]).sort((a, b) => (boLocBuoi[a] || 99) - (boLocBuoi[b] || 99));
        let soDongCuaThu = 0;
        danhSachBuoi.forEach(buoi => { soDongCuaThu += Object.keys(luoiDuLieu[thu][buoi]).length; });
        let inCotThu = true;

        danhSachBuoi.forEach(buoi => {
            const danhSachTietCuaBuoi = Object.keys(luoiDuLieu[thu][buoi]).sort((a, b) => {
                if (a === "99_du") return 1; if (b === "99_du") return -1; return parseInt(a) - parseInt(b);
            });
            let soDongCuaBuoi = danhSachTietCuaBuoi.length;
            let inCotBuoi = true;

            danhSachTietCuaBuoi.forEach(tiet => {
                tbodyHTML += `<tr class="bg-white hover:bg-slate-50 transition-colors duration-150 group">`;
                
                if (inCotThu) { tbodyHTML += `<td rowspan="${soDongCuaThu}" class="text-center font-extrabold align-middle text-slate-900 bg-white">${thu}</td>`; inCotThu = false; }
                if (inCotBuoi) { tbodyHTML += `<td rowspan="${soDongCuaBuoi}" class="text-center font-bold align-middle text-slate-800 bg-white">${buoi}</td>`; inCotBuoi = false; }

                let hienThiTiet = (tiet === "99_du") ? "" : tiet;
                let duLieuTuan = (tiet !== "99_du") ? (thongSoHocVu.TUAN_HIEN_TAI || '') : '';
                let duLieuThang = (tiet !== "99_du") ? '3' : '';
                let duLieuNam = (tiet !== "99_du") ? (thongSoHocVu.NAM_HOC || '') : '';

                tbodyHTML += `<td class="text-center text-slate-700">${duLieuTuan}</td><td class="text-center text-slate-700">${duLieuThang}</td><td class="text-center text-slate-700">${duLieuNam}</td><td class="text-center font-bold text-slate-800">${hienThiTiet}</td>`;

                mangLop.forEach(lop => {
                    const duLieuO = luoiDuLieu[thu][buoi][tiet] ? luoiDuLieu[thu][buoi][tiet][lop] : null;
                    
                    if (tiet !== "99_du") {
                        let monGoc = duLieuO ? duLieuO.monHoc : "";
                        let gvGoc = duLieuO ? duLieuO.maGv : "";

                        let bgMon = '', textMon = 'text-slate-900';
                        let bgGV = '', textGV = 'text-slate-900';

                        const monSoSanh = monGoc.toLowerCase();
                        // Nếu thuật toán kẹt lịch, cảnh báo nền Vàng nổi bật
                        if (monSoSanh.includes('cấn lịch')) { bgMon = 'bg-yellow-400'; textMon = 'text-red-700 font-extrabold'; }
                        else if (monSoSanh.includes('âm nhạc')) { bgMon = 'bg-red-600'; textMon = 'text-white'; }
                        else if (monSoSanh.includes('mĩ thuật') || monSoSanh.includes('mỹ thuật')) { bgMon = 'bg-orange-300'; }
                        else if (monSoSanh.includes('gdtc')) { bgMon = 'bg-cyan-400'; }

                        // Gắn ID định danh cho Dropdown để hàm KiemTraDinhMuc có thể quét
                        let idMon = `mon_${thu}_${buoi}_${tiet}_${lop}`;
                        let idGv = `gv_${thu}_${buoi}_${tiet}_${lop}`;
                        
                        let dropdownMon = taoTuyChonDong(thongSoHocVu.DANH_SACH_MON_HOC, monGoc, textMon, idMon);
                        let dropdownGV = taoTuyChonDong(thongSoHocVu.DANH_SACH_GIAO_VIEN, gvGoc, textGV, idGv);

                        tbodyHTML += `<td class="text-center p-0 align-middle ${bgMon} focus-within:ring-2 focus-within:ring-blue-400 border border-slate-300">${dropdownMon}</td>`;
                        tbodyHTML += `<td class="text-center p-0 align-middle ${bgGV} focus-within:ring-2 focus-within:ring-blue-400 border border-slate-300">${dropdownGV}</td>`;
                    } else {
                        tbodyHTML += `<td class="bg-slate-50/50 border border-slate-300"></td><td class="bg-slate-50/50 border border-slate-300"></td>`;
                    }
                });
                tbodyHTML += `</tr>`;
            });
        });
    });
    tbody.innerHTML = tbodyHTML;
}
