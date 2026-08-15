/**
 * TỆP: app.js
 * Chức năng: Điều khiển logic giao diện, xử lý Pivot Lưới Ma Trận.
 * Nâng cấp: Chuyển đổi lưới thành Bảng tương tác (Interactive Grid) ánh xạ Dropdown.
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
// KHỐI 2: TẢI DỮ LIỆU TỪ MÁY CHỦ VÀ GỌI VẼ BẢNG
// =========================================================================
async function taiDuLieuTKB(tuan) {
    const vungHienThi = document.getElementById('vungHienThiDuLieu');
    vungHienThi.innerHTML = `<tr><td class="text-center text-blue-600 font-medium py-10 reactbits-fade-in">Đang đồng bộ định mức và dựng Không gian làm việc...</td></tr>`;

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
// KHỐI 3: HÀM HỖ TRỢ VẼ DROPDOWN ÁNH XẠ DANH MỤC GỐC
// =========================================================================
function taoTuyChonDong(danhSach, giaTriMacDinh, kieuText) {
    // Sử dụng appearance-none của Tailwind để giấu mũi tên mặc định, tạo cảm giác Excel sạch sẽ
    let html = `<select class="w-full h-full bg-transparent outline-none appearance-none text-center cursor-pointer py-1 ${kieuText}">`;
    html += `<option value=""></option>`; // Tùy chọn để trống
    
    if (danhSach && danhSach.length > 0) {
        danhSach.forEach(muc => {
            let duocChon = (muc === giaTriMacDinh) ? 'selected' : '';
            html += `<option value="${muc}" ${duocChon}>${muc}</option>`;
        });
    } else if (giaTriMacDinh) {
        // Fallback hiển thị nếu danh sách chưa tải kịp nhưng có dữ liệu cũ
        html += `<option value="${giaTriMacDinh}" selected>${giaTriMacDinh}</option>`;
    }
    
    html += `</select>`;
    return html;
}

// =========================================================================
// KHỐI 4: THUẬT TOÁN PIVOT VÀ XUẤT HTML UI TƯƠNG TÁC
// =========================================================================
function xuatMaTranBang(danhSachTiet) {
    const thead = document.getElementById('tieuDeBang');
    const tbody = document.getElementById('vungHienThiDuLieu');
    const duLieuTiet = danhSachTiet || [];

    const mangLop = (thongSoHocVu.DANH_SACH_LOP && thongSoHocVu.DANH_SACH_LOP.length > 0)
        ? thongSoHocVu.DANH_SACH_LOP 
        : [...new Set(duLieuTiet.map(t => t.maLop))].sort();

    if (mangLop.length === 0) {
        thead.innerHTML = `<tr><th class="text-center py-4 bg-slate-100">Thông báo</th></tr>`;
        tbody.innerHTML = `<tr><td class="text-center text-slate-500 py-12">Chưa thiết lập Danh mục Lớp trên hệ thống.</td></tr>`;
        return;
    }

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
            <th class="text-center font-bold bg-slate-50 text-slate-800 w-28 hover:bg-blue-50 cursor-pointer">Môn</th>
            <th class="text-center font-bold bg-slate-50 text-slate-800 w-24 hover:bg-blue-50 cursor-pointer">N dạy</th>
        `;
    });
    theadHTML += `</tr>`;
    thead.innerHTML = theadHTML;

    const luoiDuLieu = {};
    const boLocThu = {"Thứ 2": 2, "Thứ 3": 3, "Thứ 4": 4, "Thứ 5": 5, "Thứ 6": 6, "Thứ 7": 7, "Chủ nhật": 8};
    const boLocBuoi = {"Sáng": 1, "Chiều": 2};

    duLieuTiet.forEach(t => {
        const thu = t.thu.trim();
        const buoi = t.buoi.trim();
        const tiet = t.tiet;
        
        if (!luoiDuLieu[thu]) luoiDuLieu[thu] = {};
        if (!luoiDuLieu[thu][buoi]) luoiDuLieu[thu][buoi] = {};
        if (!luoiDuLieu[thu][buoi][tiet]) luoiDuLieu[thu][buoi][tiet] = {};
        
        luoiDuLieu[thu][buoi][tiet][t.maLop] = t;
    });

    const thuMacDinh = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6"];
    thuMacDinh.forEach(thu => {
        if (!luoiDuLieu[thu]) luoiDuLieu[thu] = {};
    });

    Object.keys(luoiDuLieu).forEach(thu => {
        if (!luoiDuLieu[thu]["Sáng"]) luoiDuLieu[thu]["Sáng"] = {};
        if (!luoiDuLieu[thu]["Chiều"]) luoiDuLieu[thu]["Chiều"] = {};

        [1, 2, 3, 4].forEach(t => { if (!luoiDuLieu[thu]["Sáng"][t]) luoiDuLieu[thu]["Sáng"][t] = {}; });
        [1, 2, 3].forEach(t => { if (!luoiDuLieu[thu]["Chiều"][t]) luoiDuLieu[thu]["Chiều"][t] = {}; });

        luoiDuLieu[thu]["Sáng"]["99_du"] = {};
        luoiDuLieu[thu]["Chiều"]["99_du"] = {};
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
                if (a === "99_du") return 1;
                if (b === "99_du") return -1;
                return parseInt(a) - parseInt(b);
            });
            
            let soDongCuaBuoi = danhSachTietCuaBuoi.length;
            let inCotBuoi = true;

            danhSachTietCuaBuoi.forEach(tiet => {
                tbodyHTML += `<tr class="bg-white hover:bg-slate-50 transition-colors duration-150 group">`;
                
                if (inCotThu) {
                    tbodyHTML += `<td rowspan="${soDongCuaThu}" class="text-center font-extrabold align-middle text-slate-900 bg-white">${thu}</td>`;
                    inCotThu = false;
                }
                if (inCotBuoi) {
                    tbodyHTML += `<td rowspan="${soDongCuaBuoi}" class="text-center font-bold align-middle text-slate-800 bg-white">${buoi}</td>`;
                    inCotBuoi = false;
                }

                let hienThiTiet = (tiet === "99_du") ? "" : tiet;
                let duLieuTuan = '', duLieuThang = '', duLieuNam = '';
                if (tiet !== "99_du") {
                    duLieuTuan = thongSoHocVu.TUAN_HIEN_TAI || '';
                    duLieuThang = '3'; 
                    duLieuNam = thongSoHocVu.NAM_HOC || '';
                }

                tbodyHTML += `<td class="text-center text-slate-700">${duLieuTuan}</td>`;
                tbodyHTML += `<td class="text-center text-slate-700">${duLieuThang}</td>`;
                tbodyHTML += `<td class="text-center text-slate-700">${duLieuNam}</td>`;
                tbodyHTML += `<td class="text-center font-bold text-slate-800">${hienThiTiet}</td>`;

                mangLop.forEach(lop => {
                    const duLieuO = luoiDuLieu[thu][buoi][tiet] ? luoiDuLieu[thu][buoi][tiet][lop] : null;
                    
                    if (tiet !== "99_du") {
                        // Trích xuất dữ liệu đang có (nếu trống thì gán chuỗi rỗng)
                        let monGoc = duLieuO ? duLieuO.monHoc : "";
                        let gvGoc = duLieuO ? duLieuO.maGv : "";

                        let bgMon = '', textMon = 'text-slate-900 font-medium';
                        let bgGV = '', textGV = 'text-slate-900';

                        // Xử lý Color Coding màu nền
                        const monSoSanh = monGoc.toLowerCase();
                        if (monSoSanh.includes('âm nhạc')) { bgMon = 'bg-red-600'; textMon = 'text-white font-bold'; }
                        else if (monSoSanh.includes('mĩ thuật') || monSoSanh.includes('mỹ thuật')) { bgMon = 'bg-orange-300'; }
                        else if (monSoSanh.includes('gdtc')) { bgMon = 'bg-cyan-400'; }

                        // Bơm Dropdown Môn và N Dạy vào ô (Loại bỏ padding mặc định của thẻ td bằng p-0 để select phủ kín)
                        let dropdownMon = taoTuyChonDong(thongSoHocVu.DANH_SACH_MON_HOC, monGoc, textMon);
                        let dropdownGV = taoTuyChonDong(thongSoHocVu.DANH_SACH_GIAO_VIEN, gvGoc, textGV);

                        tbodyHTML += `<td class="text-center p-0 align-middle ${bgMon} focus-within:ring-2 focus-within:ring-blue-400">${dropdownMon}</td>`;
                        tbodyHTML += `<td class="text-center p-0 align-middle ${bgGV} focus-within:ring-2 focus-within:ring-blue-400">${dropdownGV}</td>`;
                    } else {
                        // Dòng trắng dự phòng dưới cùng không có dropdown để giữ giao diện thanh thoát
                        tbodyHTML += `<td class="bg-slate-50/50 border border-slate-300"></td><td class="bg-slate-50/50 border border-slate-300"></td>`;
                    }
                });

                tbodyHTML += `</tr>`;
            });
        });
    });

    tbody.innerHTML = tbodyHTML;
}
