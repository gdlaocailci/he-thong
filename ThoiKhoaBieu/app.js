/**
 * TỆP: app.js
 * Chức năng: Điều khiển logic giao diện, gọi API và xuất Ma Trận Chuẩn Biểu Mẫu.
 * Thiết kế và phát triển: Hoàng Ngọc Lâm
 */

let thongSoHocVu = {};

// Khởi chạy khi DOM tải xong
document.addEventListener('DOMContentLoaded', () => {
    khoiTaoGiaoDien();
});

/**
 * KHỐI 1: KHỞI TẠO VÀ LẤY CẤU HÌNH API
 */
async function khoiTaoGiaoDien() {
    try {
        // Nạp định danh từ file KetNoi.js
        if(typeof CAU_HINH_FRONTEND !== 'undefined') {
            document.getElementById('tenHeThong').innerText = CAU_HINH_FRONTEND.TEN_DU_AN;
            document.getElementById('logoHeThong').src = CAU_HINH_FRONTEND.LINK_LOGO_TRANG_CHU;
            document.getElementById('iconBang').src = CAU_HINH_FRONTEND.LINK_ICON_BANG;
        }

        // Gọi máy chủ lấy Niên khóa, Tuần và Danh sách Lớp nền tảng
        const phanHoi = await fetch(`${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=layCauHinh`);
        thongSoHocVu = await phanHoi.json();
        
        if(thongSoHocVu.NAM_HOC) document.getElementById('hienThiNamHoc').innerText = thongSoHocVu.NAM_HOC;
        if(thongSoHocVu.TUAN_HIEN_TAI) {
            document.getElementById('hienThiTuan').innerText = thongSoHocVu.TUAN_HIEN_TAI;
            taiDuLieuTKB(thongSoHocVu.TUAN_HIEN_TAI);
        }
    } catch (loi) {
        console.error("Lỗi API:", loi);
        document.getElementById('tenDonVi').innerText = "Lỗi kết nối máy chủ API";
    }
}

/**
 * KHỐI 2: TẢI DỮ LIỆU DATA_TKB THEO TUẦN
 */
async function taiDuLieuTKB(tuan) {
    const vungHienThi = document.getElementById('vungHienThiDuLieu');
    vungHienThi.innerHTML = `<tr><td class="text-center text-blue-600 font-medium py-10">Đang đồng bộ và xoay trục ma trận dữ liệu...</td></tr>`;

    try {
        const tuanTruyVan = tuan || thongSoHocVu.TUAN_HIEN_TAI;
        const phanHoi = await fetch(`${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=layTKB&tuan=${tuanTruyVan}`);
        const danhSachTiet = await phanHoi.json();
        
        xuatMaTranBang(danhSachTiet);
    } catch (loi) {
        vungHienThi.innerHTML = `<tr><td class="text-center text-red-500 font-bold py-10">Lỗi phân tích dữ liệu từ máy chủ.</td></tr>`;
    }
}

/**
 * KHỐI 3: THUẬT TOÁN PIVOT XUẤT MA TRẬN EXCEL
 */
function xuatMaTranBang(danhSachTiet) {
    const thead = document.getElementById('tieuDeBang');
    const tbody = document.getElementById('vungHienThiDuLieu');

    if (!danhSachTiet || danhSachTiet.length === 0) {
        thead.innerHTML = `<tr><th class="text-center py-4 bg-slate-100">Thông báo</th></tr>`;
        tbody.innerHTML = `<tr><td class="text-center text-slate-500 py-12">Chưa có dữ liệu Thời khóa biểu lưu trữ cho tuần này. Vui lòng chạy thuật toán Xếp lịch.</td></tr>`;
        return;
    }

    // 1. Xác định số cột bằng Danh sách lớp nền tảng (nếu có), dự phòng tự lấy từ TKB
    const mangLop = (thongSoHocVu.DANH_SACH_LOP && thongSoHocVu.DANH_SACH_LOP.length > 0)
        ? thongSoHocVu.DANH_SACH_LOP 
        : [...new Set(danhSachTiet.map(t => t.maLop))].sort();

    // 2. Dựng 2 Dòng Tiêu Đề (Header)
    let theadHTML = `
        <tr>
            <th rowspan="2" class="text-center font-bold align-middle w-20">Thứ</th>
            <th rowspan="2" class="text-center font-bold align-middle w-16">Buổi</th>
            <th rowspan="2" class="text-center font-bold align-middle w-12">Tuần</th>
            <th rowspan="2" class="text-center font-bold align-middle w-12">Tháng</th>
            <th rowspan="2" class="text-center font-bold align-middle w-24">Năm học</th>
            <th rowspan="2" class="text-center font-bold align-middle w-10">Tiết</th>
    `;
    
    // Header Dòng 1: In Tên Lớp (Colspan 2: Môn và N Dạy)
    mangLop.forEach(lop => {
        theadHTML += `<th colspan="2" class="text-center font-extrabold bg-slate-100 text-slate-900 tracking-widest">${lop}</th>`;
    });
    theadHTML += `</tr><tr>`;
    
    // Header Dòng 2: Tách Môn và Giáo viên
    mangLop.forEach(() => {
        theadHTML += `
            <th class="text-center font-bold bg-slate-50 text-slate-800 w-28">Môn</th>
            <th class="text-center font-bold bg-slate-50 text-slate-800 w-24">N dạy</th>
        `;
    });
    theadHTML += `</tr>`;
    thead.innerHTML = theadHTML;

    // 3. Phân rã dữ liệu vào Lưới Tọa Độ (Thứ -> Buổi -> Tiết -> Lớp)
    const luoiDuLieu = {};
    const boLocThu = {"Thứ 2": 2, "Thứ 3": 3, "Thứ 4": 4, "Thứ 5": 5, "Thứ 6": 6, "Thứ 7": 7, "Chủ nhật": 8};
    const boLocBuoi = {"Sáng": 1, "Chiều": 2};

    danhSachTiet.forEach(t => {
        const thu = t.thu.trim();
        const buoi = t.buoi.trim();
        const tiet = t.tiet;
        
        if (!luoiDuLieu[thu]) luoiDuLieu[thu] = {};
        if (!luoiDuLieu[thu][buoi]) luoiDuLieu[thu][buoi] = {};
        if (!luoiDuLieu[thu][buoi][tiet]) luoiDuLieu[thu][buoi][tiet] = {};
        
        luoiDuLieu[thu][buoi][tiet][t.maLop] = t;
    });

    // 4. In Thân Bảng và Đổ màu nhận diện
    let tbodyHTML = '';
    const danhSachThu = Object.keys(luoiDuLieu).sort((a, b) => (boLocThu[a] || 99) - (boLocThu[b] || 99));

    danhSachThu.forEach(thu => {
        const danhSachBuoi = Object.keys(luoiDuLieu[thu]).sort((a, b) => (boLocBuoi[a] || 99) - (boLocBuoi[b] || 99));
        let soDongCuaThu = 0;
        
        danhSachBuoi.forEach(buoi => {
            soDongCuaThu += Object.keys(luoiDuLieu[thu][buoi]).length;
        });

        let inCotThu = true;

        danhSachBuoi.forEach(buoi => {
            const danhSachTietCuaBuoi = Object.keys(luoiDuLieu[thu][buoi]).sort((a, b) => parseInt(a) - parseInt(b));
            let soDongCuaBuoi = danhSachTietCuaBuoi.length;
            let inCotBuoi = true;

            danhSachTietCuaBuoi.forEach(tiet => {
                tbodyHTML += `<tr class="bg-white hover:bg-slate-50 transition-colors duration-150">`;
                
                // Gộp dọc (Rowspan) cho Thứ
                if (inCotThu) {
                    tbodyHTML += `<td rowspan="${soDongCuaThu}" class="text-center font-extrabold align-middle text-slate-900 bg-white">${thu}</td>`;
                    inCotThu = false;
                }
                
                // Gộp dọc (Rowspan) cho Buổi
                if (inCotBuoi) {
                    tbodyHTML += `<td rowspan="${soDongCuaBuoi}" class="text-center font-bold align-middle text-slate-800 bg-white">${buoi}</td>`;
                    inCotBuoi = false;
                }

                // Dò tìm thông số phụ (Tuần, Tháng, Năm học)
                let duLieuTuan = '', duLieuThang = '3', duLieuNam = '';
                for(let l of mangLop) {
                    if(luoiDuLieu[thu][buoi][tiet] && luoiDuLieu[thu][buoi][tiet][l]) {
                        duLieuTuan = luoiDuLieu[thu][buoi][tiet][l].tuan || '';
                        duLieuThang = luoiDuLieu[thu][buoi][tiet][l].thang || '3'; 
                        duLieuNam = luoiDuLieu[thu][buoi][tiet][l].namHoc || '';
                        break;
                    }
                }

                // In lặp lại các Thông số phụ (không gộp ô)
                tbodyHTML += `<td class="text-center text-slate-700">${duLieuTuan}</td>`;
                tbodyHTML += `<td class="text-center text-slate-700">${duLieuThang}</td>`;
                tbodyHTML += `<td class="text-center text-slate-700">${duLieuNam}</td>`;
                tbodyHTML += `<td class="text-center font-bold text-slate-800">${tiet}</td>`;

                // In Ma trận nội dung các Lớp
                mangLop.forEach(lop => {
                    const duLieuO = luoiDuLieu[thu][buoi][tiet] ? luoiDuLieu[thu][buoi][tiet][lop] : null;
                    
                    if (duLieuO) {
                        let bgMon = '', textMon = 'text-slate-900 font-medium';
                        let bgGV = '', textGV = 'text-slate-900';

                        // Thuật toán quét từ khóa nhận diện màu (Color Coding)
                        const mon = duLieuO.monHoc.toLowerCase();
                        if (mon.includes('âm nhạc')) { bgMon = 'bg-red-600'; textMon = 'text-white font-bold'; }
                        else if (mon.includes('mĩ thuật') || mon.includes('mỹ thuật')) { bgMon = 'bg-orange-300'; }
                        else if (mon.includes('gdtc')) { bgMon = 'bg-cyan-400'; }

                        const gv = duLieuO.maGv.toLowerCase();
                        if (gv.includes('tùng')) { bgGV = 'bg-orange-300'; }
                        else if (gv.includes('liên') || gv.includes('bình b') || gv.includes('linh') || gv.includes('đạt')) { bgGV = 'bg-blue-200'; }

                        // In ô Môn và Giáo viên
                        tbodyHTML += `<td class="text-center ${bgMon} ${textMon}">${duLieuO.monHoc}</td>`;
                        tbodyHTML += `<td class="text-center ${bgGV} ${textGV}">${duLieuO.maGv}</td>`;
                    } else {
                        // In 2 ô trống nếu lớp không học tiết đó
                        tbodyHTML += `<td class="bg-slate-50/50"></td><td class="bg-slate-50/50"></td>`;
                    }
                });

                tbodyHTML += `</tr>`;
            });
        });
    });

    tbody.innerHTML = tbodyHTML;
}
