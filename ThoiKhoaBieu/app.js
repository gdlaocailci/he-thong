/**
 * TỆP: app.js
 * Chức năng: Điều khiển logic giao diện và xử lý xuất dữ liệu.
 */

let thongSoHocVu = {};

document.addEventListener('DOMContentLoaded', () => {
    khoiTaoGiaoDien();
});

async function khoiTaoGiaoDien() {
    try {
        // 1. Bơm dữ liệu từ KetNoi.js vào HTML
        document.getElementById('tenHeThong').innerText = CAU_HINH_FRONTEND.TEN_DU_AN;
        
        if(CAU_HINH_FRONTEND.TIEU_DE_TAC_GIA) {
            document.getElementById('tieuDeTacGia').innerText = CAU_HINH_FRONTEND.TIEU_DE_TAC_GIA;
        }
        if(CAU_HINH_FRONTEND.TAC_GIA_THIET_KE) {
            document.getElementById('tenTacGia').innerText = CAU_HINH_FRONTEND.TAC_GIA_THIET_KE;
        }
        
        const logo = document.getElementById('logoHeThong');
        logo.src = CAU_HINH_FRONTEND.LINK_LOGO_TRANG_CHU;
        logo.classList.remove('hidden');

        const iconBang = document.getElementById('iconBang');
        iconBang.src = CAU_HINH_FRONTEND.LINK_ICON_BANG;
        iconBang.classList.remove('hidden');

        // 2. Gọi API lấy Niên khóa, Tuần từ máy chủ (Sheet CAI_DAT)
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
    vungHienThi.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-blue-600">Đang đồng bộ dữ liệu...</td></tr>`;

    try {
        const tuanTruyVan = tuan || thongSoHocVu.TUAN_HIEN_TAI;
        const phanHoi = await fetch(`${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=layTKB&tuan=${tuanTruyVan}`);
        const danhSachTiet = await phanHoi.json();
        
        xuatHTMLBang(danhSachTiet);
    } catch (loi) {
        vungHienThi.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-red-500">Lỗi đồng bộ dữ liệu.</td></tr>`;
    }
}

function xuatHTMLBang(danhSachTiet) {
    const vungHienThi = document.getElementById('vungHienThiDuLieu');
    if (!danhSachTiet || danhSachTiet.length === 0) {
        vungHienThi.innerHTML = `<tr><td colspan="7" class="px-6 py-10 text-center text-gray-500">Chưa có dữ liệu.</td></tr>`;
        return;
    }

    let chuoiHTML = '';
    danhSachTiet.forEach((tietHoc) => {
        let mauTrangThai = 'bg-green-100 text-green-700';
        if(tietHoc.trangThai === 'Dạy thay') mauTrangThai = 'bg-yellow-100 text-yellow-700';
        if(tietHoc.trangThai === 'Nghỉ') mauTrangThai = 'bg-red-100 text-red-700';

        chuoiHTML += `
            <tr class="hover:bg-blue-50 transition duration-150">
                <td class="px-6 py-4 font-semibold">${tietHoc.thu}</td>
                <td class="px-6 py-4">${tietHoc.buoi}</td>
                <td class="px-6 py-4 text-center font-bold text-blue-700">${tietHoc.tiet}</td>
                <td class="px-6 py-4 font-bold">${tietHoc.maLop}</td>
                <td class="px-6 py-4 text-blue-600 font-medium">${tietHoc.monHoc}</td>
                <td class="px-6 py-4 font-semibold">${tietHoc.maGv}</td>
                <td class="px-6 py-4 text-center">
                    <span class="px-2 py-1 rounded text-xs font-bold ${mauTrangThai}">
                        ${tietHoc.trangThai || 'Chính thức'}
                    </span>
                </td>
            </tr>
        `;
    });
    vungHienThi.innerHTML = chuoiHTML;
}
