let thongSoHocVu = {};

document.addEventListener('DOMContentLoaded', () => {
    khoiTaoGiaoDien();
});

async function khoiTaoGiaoDien() {
    try {
        // Nạp biến tĩnh
        document.getElementById('tenHeThong').innerText = CAU_HINH_FRONTEND.TEN_DU_AN;
        if(CAU_HINH_FRONTEND.TIEU_DE_TAC_GIA) document.getElementById('tieuDeTacGia').innerText = CAU_HINH_FRONTEND.TIEU_DE_TAC_GIA;
        if(CAU_HINH_FRONTEND.TAC_GIA_THIET_KE) document.getElementById('tenTacGia').innerText = CAU_HINH_FRONTEND.TAC_GIA_THIET_KE;
        
        const logo = document.getElementById('logoHeThong');
        logo.src = CAU_HINH_FRONTEND.LINK_LOGO_TRANG_CHU;
        logo.classList.remove('hidden');

        const iconBang = document.getElementById('iconBang');
        iconBang.src = CAU_HINH_FRONTEND.LINK_ICON_BANG;
        iconBang.classList.remove('hidden');

        // Lấy thông số học vụ và Danh sách Lớp nền tảng
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
    vungHienThi.innerHTML = `<tr><td class="text-center text-blue-600 py-6">Đang tải và đồng bộ ma trận dữ liệu...</td></tr>`;

    try {
        const tuanTruyVan = tuan || thongSoHocVu.TUAN_HIEN_TAI;
        const phanHoi = await fetch(`${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=layTKB&tuan=${tuanTruyVan}`);
        const danhSachTiet = await phanHoi.json();
        
        xuatMaTranBang(danhSachTiet);
    } catch (loi) {
        vungHienThi.innerHTML = `<tr><td class="text-center text-red-500 py-6">Lỗi phân tích dữ liệu.</td></tr>`;
    }
}

/**
 * THUẬT TOÁN PIVOT: Xuất bảng chuẩn biểu mẫu với số cột cố định từ DM_LOP
 */
function xuatMaTranBang(danhSachTiet) {
    const thead = document.getElementById('tieuDeBang');
    const tbody = document.getElementById('vungHienThiDuLieu');

    if (!danhSachTiet || danhSachTiet.length === 0) {
        thead.innerHTML = `<tr><th class="text-center">Thông báo</th></tr>`;
        tbody.innerHTML = `<tr><td class="text-center text-gray-500 py-8">Chưa có dữ liệu Thời khóa biểu.</td></tr>`;
        return;
    }

    // -------------------------------------------------------------------------
    // BƯỚC 1: XÁC ĐỊNH SỐ CỘT (ƯU TIÊN DANH SÁCH LỚP TỪ DM_LOP)
    // Cấu trúc dự phòng (Fix this breaks that): Nếu DM_LOP rỗng, tự quét dữ liệu.
    // -------------------------------------------------------------------------
    const mangLop = (thongSoHocVu.DANH_SACH_LOP && thongSoHocVu.DANH_SACH_LOP.length > 0)
        ? thongSoHocVu.DANH_SACH_LOP 
        : [...new Set(danhSachTiet.map(t => t.maLop))].sort();

    // -------------------------------------------------------------------------
    // BƯỚC 2: XÂY DỰNG 2 DÒNG TIÊU ĐỀ (HEADER)
    // -------------------------------------------------------------------------
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
        theadHTML += `<th colspan="2" class="text-center font-extrabold bg-gray-50 text-black tracking-wider">${lop}</th>`;
    });
    theadHTML += `</tr><tr>`;
    
    mangLop.forEach(() => {
        theadHTML += `
            <th class="text-center font-bold bg-gray-50 text-black w-28">Môn</th>
            <th class="text-center font-bold bg-gray-50 text-black w-24">N dạy</th>
        `;
    });
    theadHTML += `</tr>`;
    thead.innerHTML = theadHTML;

    // -------------------------------------------------------------------------
    // BƯỚC 3: PHÂN RÃ DỮ LIỆU LƯỚI
    // -------------------------------------------------------------------------
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

    // -------------------------------------------------------------------------
    // BƯỚC 4: IN THÂN BẢNG & TÔ MÀU NHẬN DIỆN
    // -------------------------------------------------------------------------
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
                tbodyHTML += `<tr class="bg-white">`;
                
                if (inCotThu) {
                    tbodyHTML += `<td rowspan="${soDongCuaThu}" class="text-center font-bold align-middle bg-white">${thu}</td>`;
                    inCotThu = false;
                }
                
                if (inCotBuoi) {
                    tbodyHTML += `<td rowspan="${soDongCuaBuoi}" class="text-center font-bold align-middle bg-white">${buoi}</td>`;
                    inCotBuoi = false;
                }

                let duLieuTuan = '', duLieuThang = '3', duLieuNam = '';
                for(let l of mangLop) {
                    if(luoiDuLieu[thu][buoi][tiet] && luoiDuLieu[thu][buoi][tiet][l]) {
                        duLieuTuan = luoiDuLieu[thu][buoi][tiet][l].tuan || '';
                        duLieuThang = luoiDuLieu[thu][buoi][tiet][l].thang || '3'; 
                        duLieuNam = luoiDuLieu[thu][buoi][tiet][l].namHoc || '';
                        break;
                    }
                }

                tbodyHTML += `<td class="text-center">${duLieuTuan}</td>`;
                tbodyHTML += `<td class="text-center">${duLieuThang}</td>`;
                tbodyHTML += `<td class="text-center">${duLieuNam}</td>`;
                tbodyHTML += `<td class="text-center">${tiet}</td>`;

                mangLop.forEach(lop => {
                    // Tránh lỗi undefined nếu tiết này không có lớp nào học nhưng vẫn phải in ô trống
                    const duLieuO = luoiDuLieu[thu][buoi][tiet] ? luoiDuLieu[thu][buoi][tiet][lop] : null;
                    
                    if (duLieuO) {
                        let bgMon = '', textMon = 'text-black';
                        let bgGV = '', textGV = 'text-black';

                        const mon = duLieuO.monHoc.toLowerCase();
                        if (mon.includes('âm nhạc')) { bgMon = 'bg-red-600'; textMon = 'text-white font-bold'; }
                        else if (mon.includes('mĩ thuật') || mon.includes('mỹ thuật')) { bgMon = 'bg-orange-300'; }
                        else if (mon.includes('gdtc')) { bgMon = 'bg-cyan-400'; }

                        const gv = duLieuO.maGv.toLowerCase();
                        if (gv.includes('tùng')) { bgGV = 'bg-orange-300'; }
                        else if (gv.includes('liên') || gv.includes('bình b') || gv.includes('linh') || gv.includes('đạt')) { bgGV = 'bg-blue-200'; }

                        tbodyHTML += `<td class="text-center ${bgMon} ${textMon}">${duLieuO.monHoc}</td>`;
                        tbodyHTML += `<td class="text-center ${bgGV} ${textGV}">${duLieuO.maGv}</td>`;
                    } else {
                        tbodyHTML += `<td></td><td></td>`;
                    }
                });

                tbodyHTML += `</tr>`;
            });
        });
    });

    tbody.innerHTML = tbodyHTML;
}
