/**
 * TỆP: app.js
 * Chức năng: Điều khiển logic giao diện, xử lý Pivot Lưới Ma Trận.
 * Nâng cấp: 
 * - Tạo khung UI mặc định Thứ 2 -> Thứ 6 (tự mở rộng Thứ 7 nếu có).
 * - Ép định mức: Sáng 4 tiết, Chiều 3 tiết.
 * - Bổ sung 1 dòng trắng dự phòng ở cuối mỗi buổi.
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
    vungHienThi.innerHTML = `<tr><td class="text-center text-blue-600 font-medium py-10 reactbits-fade-in">Đang đồng bộ phân công và định hình lưới ma trận...</td></tr>`;

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
// KHỐI 3: THUẬT TOÁN PIVOT VÀ XÂY DỰNG KHUNG SƯ PHẠM
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
    // BƯỚC 3: XÂY DỰNG KHUNG LƯỚI TỌA ĐỘ VÀ NẠP DỮ LIỆU THỰC TẾ
    // -------------------------------------------------------------------------
    const luoiDuLieu = {};
    const boLocThu = {"Thứ 2": 2, "Thứ 3": 3, "Thứ 4": 4, "Thứ 5": 5, "Thứ 6": 6, "Thứ 7": 7, "Chủ nhật": 8};
    const boLocBuoi = {"Sáng": 1, "Chiều": 2};

    // 3.1. Nạp dữ liệu thực vào Lưới (để ghi nhận nếu có tiết 5 hoặc Thứ 7)
    duLieuTiet.forEach(t => {
        const thu = t.thu.trim();
        const buoi = t.buoi.trim();
        const tiet = t.tiet;
        
        if (!luoiDuLieu[thu]) luoiDuLieu[thu] = {};
        if (!luoiDuLieu[thu][buoi]) luoiDuLieu[thu][buoi] = {};
        if (!luoiDuLieu[thu][buoi][tiet]) luoiDuLieu[thu][buoi][tiet] = {};
        
        luoiDuLieu[thu][buoi][tiet][t.maLop] = t;
    });

    // 3.2. Ép Khung Ngày Mặc Định (Thứ 2 -> Thứ 6)
    const thuMacDinh = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6"];
    thuMacDinh.forEach(thu => {
        if (!luoiDuLieu[thu]) luoiDuLieu[thu] = {};
    });

    // 3.3. Chuẩn hóa Khung Tiết (Sáng 4 tiết + dư, Chiều 3 tiết + dư)
    Object.keys(luoiDuLieu).forEach(thu => {
        if (!luoiDuLieu[thu]["Sáng"]) luoiDuLieu[thu]["Sáng"] = {};
        if (!luoiDuLieu[thu]["Chiều"]) luoiDuLieu[thu]["Chiều"] = {};

        // Sáng mặc định tối thiểu 4 tiết
        [1, 2, 3, 4].forEach(t => {
            if (!luoiDuLieu[thu]["Sáng"][t]) luoiDuLieu[thu]["Sáng"][t] = {};
        });
        
        // Chiều mặc định tối thiểu 3 tiết
        [1, 2, 3].forEach(t => {
            if (!luoiDuLieu[thu]["Chiều"][t]) luoiDuLieu[thu]["Chiều"][t] = {};
        });

        // Chèn mã "99_du" làm dòng trắng dưới cùng của mỗi buổi
        luoiDuLieu[thu]["Sáng"]["99_du"] = {};
        luoiDuLieu[thu]["Chiều"]["99_du"] = {};
    });

    // -------------------------------------------------------------------------
    // BƯỚC 4: XUẤT HTML BẢNG MA TRẬN
    // -------------------------------------------------------------------------
    let tbodyHTML = '';
    const danhSachThu = Object.keys(luoiDuLieu).sort((a, b) => (boLocThu[a] || 99) - (boLocThu[b] || 99));

    danhSachThu.forEach(thu => {
        const danhSachBuoi = Object.keys(luoiDuLieu[thu]).sort((a, b) => (boLocBuoi[a] || 99) - (boLocBuoi[b] || 99));
        let soDongCuaThu = 0;
        danhSachBuoi.forEach(buoi => { soDongCuaThu += Object.keys(luoiDuLieu[thu][buoi]).length; });

        let inCotThu = true;

        danhSachBuoi.forEach(buoi => {
            // Sắp xếp tiết: Các số tăng dần, riêng "99_du" luôn nằm cuối cùng
            const danhSachTietCuaBuoi = Object.keys(luoiDuLieu[thu][buoi]).sort((a, b) => {
                if (a === "99_du") return 1;
                if (b === "99_du") return -1;
                return parseInt(a) - parseInt(b);
            });
            
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

                // Chuyển mã "99_du" thành khoảng trắng trên giao diện
                let hienThiTiet = (tiet === "99_du") ? "" : tiet;

                // Chiết xuất thông số (Bỏ qua Tuần/Tháng/Năm đối với dòng trắng để giữ thẩm mỹ)
                let duLieuTuan = '', duLieuThang = '', duLieuNam = '';
                if (tiet !== "99_du") {
                    duLieuTuan = thongSoHocVu.TUAN_HIEN_TAI || '';
                    duLieuThang = '3'; 
                    duLieuNam = thongSoHocVu.NAM_HOC || '';
                    for(let l of mangLop) {
                        if(luoiDuLieu[thu][buoi][tiet] && luoiDuLieu[thu][buoi][tiet][l] && luoiDuLieu[thu][buoi][tiet][l].namHoc) {
                            duLieuTuan = luoiDuLieu[thu][buoi][tiet][l].tuan;
                            duLieuThang = luoiDuLieu[thu][buoi][tiet][l].thang || '3'; 
                            duLieuNam = luoiDuLieu[thu][buoi][tiet][l].namHoc;
                            break;
                        }
                    }
                }

                tbodyHTML += `<td class="text-center text-slate-700">${duLieuTuan}</td>`;
                tbodyHTML += `<td class="text-center text-slate-700">${duLieuThang}</td>`;
                tbodyHTML += `<td class="text-center text-slate-700">${duLieuNam}</td>`;
                tbodyHTML += `<td class="text-center font-bold text-slate-800">${hienThiTiet}</td>`;

                // In Ma trận nội dung Lớp
                mangLop.forEach(lop => {
                    const duLieuO = luoiDuLieu[thu][buoi][tiet] ? luoiDuLieu[thu][buoi][tiet][lop] : null;
                    
                    if (duLieuO && tiet !== "99_du") {
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
                        // In ô trống mờ cho các tiết không có lịch hoặc dòng trắng dự phòng
                        tbodyHTML += `<td class="bg-slate-50/50"></td><td class="bg-slate-50/50"></td>`;
                    }
                });

                tbodyHTML += `</tr>`;
            });
        });
    });

    tbody.innerHTML = tbodyHTML;
}
