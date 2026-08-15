/**
 * TỆP: app.js
 * Chức năng: Điều khiển logic giao diện, xử lý Pivot Lưới Ma Trận.
 * Nâng cấp: Ép buộc tạo khung UI mặc định Thứ 2 -> Thứ 6. Tự động hiển thị Thứ 7 nếu có dữ liệu phát sinh.
 * Thiết kế và phát triển
 * Hoàng Ngọc Lâm
 */

let thongSoHocVu = {};

document.addEventListener('DOMContentLoaded', () => {
    khoiTaoGiaoDien();
});

// =========================================================================
// KHỐI 1: KHỞI TẠO VÀ LẤY CẤU HÌNH API
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

// =========================================================================
// KHỐI 2: TẢI DỮ LIỆU TỪ MÁY CHỦ
// =========================================================================
async function taiDuLieuTKB(tuan) {
    const vungHienThi = document.getElementById('vungHienThiDuLieu');
    vungHienThi.innerHTML = `<tr><td class="text-center text-blue-600 font-medium py-10 hieu-ung-mo-dan">Đang đồng bộ phân công và xoay trục ma trận...</td></tr>`;

    try {
        const tuanTruyVan = tuan || thongSoHocVu.TUAN_HIEN_TAI;
        const phanHoi = await fetch(`${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=layTKB&tuan=${tuanTruyVan}`);
        const danhSachTiet = await phanHoi.json();
        
        xuatMaTranBang(danhSachTiet);
    } catch (loi) {
        vungHienThi.innerHTML = `<tr><td class="text-center text-red-500 font-bold py-10">Lỗi phân tích dữ liệu từ máy chủ.</td></tr>`;
    }
}

// =========================================================================
// KHỐI 3: THUẬT TOÁN PIVOT XUẤT MA TRẬN CHUẨN BIỂU MẪU
// =========================================================================
function xuatMaTranBang(danhSachTiet) {
    const thead = document.getElementById('tieuDeBang');
    const tbody = document.getElementById('vungHienThiDuLieu');
    const duLieuTiet = danhSachTiet || [];

    // 1. Xác định số cột cứng dựa vào Khung Hệ Thống (DM_LOP)
    const mangLop = (thongSoHocVu.DANH_SACH_LOP && thongSoHocVu.DANH_SACH_LOP.length > 0)
        ? thongSoHocVu.DANH_SACH_LOP 
        : [...new Set(duLieuTiet.map(t => t.maLop))].sort();

    if (mangLop.length === 0) {
        thead.innerHTML = `<tr><th class="text-center py-4 bg-slate-100">Thông báo</th></tr>`;
        tbody.innerHTML = `<tr><td class="text-center text-slate-500 py-12">Chưa thiết lập Danh mục Lớp trên hệ thống.</td></tr>`;
        return;
    }

    // 2. Dựng Khung Tiêu Đề (Header)
    let theadHTML = `
        <tr>
            <th rowspan="2" class="text-center font-bold align-middle w-20">Thứ</th>
            <th rowspan="2" class="text-center font-bold align-middle w-16">Buổi</th>
            <th rowspan="2" class="text-center font-bold align-middle w-12">Tuần</th>
            <th rowspan="2" class="text-center font-bold align-middle w-12">Tháng</th>
            <th rowspan="2" class="text-center font-bold align-middle w-24">Năm học</th>
            <th rowspan="2" class="text-center font-bold align-middle w-10">Tiết</th>
    `;
    mangLop.forEach(lop => {
        theadHTML += `<th colspan="2" class="text-center font-extrabold bg-slate-100 text-slate-900 tracking-widest">${lop}</th>`;
    });
    theadHTML += `</tr><tr>`;
    mangLop.forEach(() => {
        theadHTML += `
            <th class="text-center font-bold bg-slate-50 text-slate-800 w-28">Môn</th>
            <th class="text-center font-bold bg-slate-50 text-slate-800 w-24">N dạy</th>
        `;
    });
    theadHTML += `</tr>`;
    thead.innerHTML = theadHTML;

    // -------------------------------------------------------------------------
    // BƯỚC QUAN TRỌNG: KHỞI TẠO KHUNG LƯỚI ẢO MẶC ĐỊNH (THỨ 2 -> THỨ 6)
    // -------------------------------------------------------------------------
    const luoiDuLieu = {};
    const boLocThu = {"Thứ 2": 2, "Thứ 3": 3, "Thứ 4": 4, "Thứ 5": 5, "Thứ 6": 6, "Thứ 7": 7, "Chủ nhật": 8};
    const boLocBuoi = {"Sáng": 1, "Chiều": 2};

    // Tự động phân tích có bao nhiêu Tiết Sáng/Chiều từ dữ liệu trả về
    let cacTietSang = new Set();
    let cacTietChieu = new Set();
    duLieuTiet.forEach(t => {
        if (t.buoi === "Sáng") cacTietSang.add(t.tiet);
        if (t.buoi === "Chiều") cacTietChieu.add(t.tiet);
    });
    
    // Nếu dữ liệu trống trơn, thiết lập Khung Tiết mặc định chuẩn sư phạm
    if (cacTietSang.size === 0) [1, 2, 3, 4].forEach(t => cacTietSang.add(t));
    if (cacTietChieu.size === 0) [1, 2, 3].forEach(t => cacTietChieu.add(t));

    cacTietSang = [...cacTietSang].sort((a,b) => parseInt(a) - parseInt(b));
    cacTietChieu = [...cacTietChieu].sort((a,b) => parseInt(a) - parseInt(b));

    // Bơm Thứ 2 đến Thứ 6 vào Lưới Ảo để ép hiển thị
    const thuMacDinh = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6"];
    thuMacDinh.forEach(thu => {
        luoiDuLieu[thu] = { "Sáng": {}, "Chiều": {} };
        cacTietSang.forEach(tiet => luoiDuLieu[thu]["Sáng"][tiet] = {});
        cacTietChieu.forEach(tiet => luoiDuLieu[thu]["Chiều"][tiet] = {});
    });

    // -------------------------------------------------------------------------
    // BƯỚC NẠP DỮ LIỆU: Đổ dữ liệu thực vào khung ảo (Tự động mở rộng Thứ 7)
    // -------------------------------------------------------------------------
    duLieuTiet.forEach(t => {
        const thu = t.thu.trim();
        const buoi = t.buoi.trim();
        const tiet = t.tiet;
        
        if (!luoiDuLieu[thu]) luoiDuLieu[thu] = {};
        if (!luoiDuLieu[thu][buoi]) luoiDuLieu[thu][buoi] = {};
        if (!luoiDuLieu[thu][buoi][tiet]) luoiDuLieu[thu][buoi][tiet] = {};
        
        luoiDuLieu[thu][buoi][tiet][t.maLop] = t;
    });

    // -------------------------------------------------------------------------
    // BƯỚC VẼ BẢNG: Xuất ra HTML với cấu trúc đã chuẩn hóa
    // -------------------------------------------------------------------------
    let tbodyHTML = '';
    const danhSachThu = Object.keys(luoiDuLieu).sort((a, b) => (boLocThu[a] || 99) - (boLocThu[b] || 99));

    danhSachThu.forEach(thu => {
        const danhSachBuoi = Object.keys(luoiDuLieu[thu]).sort((a, b) => (boLocBuoi[a] || 99) - (boLocBuoi[b] || 99));
        let soDongCuaThu = 0;
        danhSachBuoi.forEach(buoi => { soDongCuaThu += Object.keys(luoiDuLieu[thu][buoi]).length; });

        let inCotThu = true;

        danhSachBuoi.forEach(buoi => {
            const danhSachTietCuaBuoi = Object.keys(luoiDuLieu[thu][buoi]).sort((a, b) => parseInt(a) - parseInt(b));
            let soDongCuaBuoi = danhSachTietCuaBuoi.length;
            let inCotBuoi = true;

            danhSachTietCuaBuoi.forEach(tiet => {
                tbodyHTML += `<tr class="bg-white hover:bg-slate-50 transition-colors duration-150">`;
                
                if (inCotThu) {
                    tbodyHTML += `<td rowspan="${soDongCuaThu}" class="text-center font-extrabold align-middle text-slate-900 bg-white">${thu}</td>`;
                    inCotThu = false;
                }
                if (inCotBuoi) {
                    tbodyHTML += `<td rowspan="${soDongCuaBuoi}" class="text-center font-bold align-middle text-slate-800 bg-white">${buoi}</td>`;
                    inCotBuoi = false;
                }

                // Chiết xuất thông số hành chính (Ưu tiên lấy từ biến môi trường nếu ô trống)
                let duLieuTuan = thongSoHocVu.TUAN_HIEN_TAI || '';
                let duLieuThang = '3'; 
                let duLieuNam = thongSoHocVu.NAM_HOC || '';
                
                for(let l of mangLop) {
                    if(luoiDuLieu[thu][buoi][tiet] && luoiDuLieu[thu][buoi][tiet][l] && luoiDuLieu[thu][buoi][tiet][l].namHoc) {
                        duLieuTuan = luoiDuLieu[thu][buoi][tiet][l].tuan;
                        duLieuThang = luoiDuLieu[thu][buoi][tiet][l].thang || '3'; 
                        duLieuNam = luoiDuLieu[thu][buoi][tiet][l].namHoc;
                        break;
                    }
                }

                tbodyHTML += `<td class="text-center text-slate-700">${duLieuTuan}</td>`;
                tbodyHTML += `<td class="text-center text-slate-700">${duLieuThang}</td>`;
                tbodyHTML += `<td class="text-center text-slate-700">${duLieuNam}</td>`;
                tbodyHTML += `<td class="text-center font-bold text-slate-800">${tiet}</td>`;

                // In Ma trận nội dung Lớp
                mangLop.forEach(lop => {
                    const duLieuO = luoiDuLieu[thu][buoi][tiet] ? luoiDuLieu[thu][buoi][tiet][lop] : null;
                    
                    if (duLieuO) {
                        let bgMon = '', textMon = 'text-slate-900 font-medium';
                        let bgGV = '', textGV = 'text-slate-900';

                        // Thuật toán Color Coding (Tự động tô màu môn đặc thù)
                        const mon = duLieuO.monHoc.toLowerCase();
                        if (mon.includes('âm nhạc')) { bgMon = 'bg-red-600'; textMon = 'text-white font-bold'; }
                        else if (mon.includes('mĩ thuật') || mon.includes('mỹ thuật')) { bgMon = 'bg-orange-300'; }
                        else if (mon.includes('gdtc')) { bgMon = 'bg-cyan-400'; }

                        tbodyHTML += `<td class="text-center ${bgMon} ${textMon}">${duLieuO.monHoc}</td>`;
                        tbodyHTML += `<td class="text-center ${bgGV} ${textGV}">${duLieuO.maGv}</td>`;
                    } else {
                        // Nếu không có lịch, in ô trống có màu nền nhẹ
                        tbodyHTML += `<td class="bg-slate-50/50 border border-slate-300"></td><td class="bg-slate-50/50 border border-slate-300"></td>`;
                    }
                });

                tbodyHTML += `</tr>`;
            });
        });
    });

    tbody.innerHTML = tbodyHTML;
}
