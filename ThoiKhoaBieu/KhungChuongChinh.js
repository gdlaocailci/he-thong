/**
 * Tên file: KhungChuongChinh.js
 * Chức năng: Quản lý khung chương trình môn học theo lớp.
 * Tác giả: Hoàng Ngọc Lâm
 */

// Biến toàn cục lưu trữ dữ liệu Khung chương trình
let danhSachLopKCT = [];
let duLieuBangKCT = [];

// ==========================================
// 1. KHỞI TẠO VÀ CHÈN GIAO DIỆN LÊN DOM
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    khoiTaoMenuKhungChuongTrinh();
    khoiTaoGiaoDienKhungChuongTrinh();
});

function khoiTaoMenuKhungChuongTrinh() {
    const nav = document.querySelector('nav');
    if (nav) {
        const menuKCT = document.createElement('a');
        menuKCT.id = 'menuKhungChuongTrinh';
        menuKCT.href = 'javascript:void(0)';
        menuKCT.onclick = moTabKhungChuongTrinh;
        menuKCT.className = 'block px-6 py-4 hover:bg-menu-hover border-l-[5px] border-transparent transition-all cursor-pointer border-b border-white/10 group';
        menuKCT.innerHTML = `<span class="font-bold text-white group-hover:text-menu-active transition-colors text-[15px]">Khung chương trình (PA)</span>`;
        nav.appendChild(menuKCT);
    }
}

function khoiTaoGiaoDienKhungChuongTrinh() {
    const vungHienThiChinh = document.getElementById('vungHienThiChinh');
    if (vungHienThiChinh) {
        const khungKCT = document.createElement('div');
        khungKCT.id = 'khungKhungChuongTrinh';
        khungKCT.className = 'hidden p-4 w-full h-full flex-col font-sans bg-white reactbits-fade-in';
        khungKCT.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-extrabold text-blue-900 uppercase">Khung Chương Trình Môn Học</h2>
                <div class="flex gap-2">
                    <button onclick="themDongKhungChuongTrinh()" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow flex items-center gap-2 transition duration-200">
                        <img src="https://www.svgrepo.com/show/500463/add.svg" class="w-5 h-5 filter invert" alt="Thêm"> Thêm dòng
                    </button>
                    <button onclick="luuDuLieuKhungChuongTrinh(event)" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow flex items-center gap-2 transition duration-200">
                        <img src="https://www.svgrepo.com/show/502824/save.svg" class="w-5 h-5 filter invert" alt="Lưu"> Lưu Khung CT
                    </button>
                </div>
            </div>
            <div class="flex-1 overflow-auto border border-gray-400 shadow-sm bg-white relative">
                <table id="bangKhungChuongTrinh" class="bang-excel w-full text-center">
                    <thead class="sticky top-0 z-20 bg-slate-200 text-slate-900 shadow-sm" id="tieuDeBangKCT">
                        <tr><th class="py-2">Đang thiết lập bảng dữ liệu...</th></tr>
                    </thead>
                    <tbody id="duLieuBangKCT">
                        <tr><td class="text-center py-10 text-slate-500 font-bold">Chưa tải dữ liệu...</td></tr>
                    </tbody>
                </table>
            </div>
        `;
        vungHienThiChinh.appendChild(khungKCT);
    }
}

// ==========================================
// 2. CHUYỂN ĐỔI TAB VÀ TẢI DỮ LIỆU
// ==========================================
function moTabKhungChuongTrinh() {
    // Ẩn tất cả các tab hiện tại (tương thích với app.js)
    const cacKhung = ['khungTKB', 'khungPhanCong', 'khungThongKe', 'khungKhungChuongTrinh'];
    cacKhung.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('hidden');
            el.classList.remove('flex');
        }
    });

    // Hiển thị tab Khung chương trình
    const khungKCT = document.getElementById('khungKhungChuongTrinh');
    if (khungKCT) {
        khungKCT.classList.remove('hidden');
        khungKCT.classList.add('flex');
    }

    // Cập nhật trạng thái menu
    document.querySelectorAll('nav a').forEach(a => {
        a.classList.remove('border-menu-active', 'bg-menu-hover');
        a.classList.add('border-transparent');
        const span = a.querySelector('span');
        if(span) {
            span.classList.remove('text-menu-active');
            span.classList.add('text-white');
        }
    });
    
    const menuKCT = document.getElementById('menuKhungChuongTrinh');
    if (menuKCT) {
        menuKCT.classList.add('border-menu-active', 'bg-menu-hover');
        menuKCT.classList.remove('border-transparent');
        const span = menuKCT.querySelector('span');
        if(span) {
            span.classList.add('text-menu-active');
            span.classList.remove('text-white');
        }
    }

    taiDuLieuKhungChuongTrinhTuMayChu();
}

function taiDuLieuKhungChuongTrinhTuMayChu() {
    const tbody = document.getElementById('duLieuBangKCT');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="100%" class="text-center py-10 text-slate-500 font-bold"><div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>Đang tải dữ liệu khung chương trình...</td></tr>';
    }

    if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
            .withSuccessHandler(xuLyDuLieuKhungChuongTrinhThanhCong)
            .withFailureHandler(loi => alert('Đã xảy ra lỗi khi tải dữ liệu Khung chương trình: ' + loi))
            .getDuLieuKhungChuongTrinh(); // Hàm Apps Script cần được định nghĩa
    } else {
        // Mock data nếu chạy ngoài môi trường Apps Script
        console.warn("Môi trường không có google.script.run, tự động nạp dữ liệu mẫu.");
        const mockClasses = ['1A', '1B', '1C', '2A', '2B', '2C', '3A', '3B', '3C'];
        const mockData = [
            { monHoc: 'Tiếng Việt', uuTien: 1, soTiet: [12, 12, 12, 10, 10, 10, 7, 7, 7] },
            { monHoc: 'Toán', uuTien: 1, soTiet: [3, 3, 3, 5, 5, 5, 5, 5, 5] },
            { monHoc: 'Đạo đức', uuTien: 4, soTiet: [1, 1, 1, 1, 1, 1, 1, 1, 1] }
        ];
        xuLyDuLieuKhungChuongTrinhThanhCong({ classes: mockClasses, data: mockData });
    }
}

function xuLyDuLieuKhungChuongTrinhThanhCong(response) {
    if (!response) return;
    danhSachLopKCT = response.classes || [];
    duLieuBangKCT = response.data || [];
    veBangKhungChuongTrinh();
}

// ==========================================
// 3. VẼ BẢNG VÀ XỬ LÝ SỰ KIỆN GIAO DIỆN
// ==========================================
function veBangKhungChuongTrinh() {
    const thead = document.getElementById('tieuDeBangKCT');
    const tbody = document.getElementById('duLieuBangKCT');
    
    if (!thead || !tbody) return;

    // Dựng tiêu đề
    let chuoiThead = '<tr>';
    chuoiThead += '<th class="w-28 p-2 border border-gray-400 bg-slate-200">Điều chỉnh</th>';
    chuoiThead += '<th class="w-48 p-2 border border-gray-400 bg-slate-200">Môn học</th>';
    chuoiThead += '<th class="w-24 p-2 border border-gray-400 bg-slate-200">Ưu tiên</th>';
    
    danhSachLopKCT.forEach(lop => {
        chuoiThead += `<th class="w-16 p-2 border border-gray-400 bg-blue-100">${lop}</th>`;
    });
    chuoiThead += '</tr>';
    thead.innerHTML = chuoiThead;

    // Dựng nội dung
    tbody.innerHTML = '';
    if (duLieuBangKCT.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${3 + danhSachLopKCT.length}" class="text-center py-6 text-slate-500">Chưa có dữ liệu. Vui lòng thêm dòng.</td></tr>`;
        return;
    }

    duLieuBangKCT.forEach((dong, indexDong) => {
        let tr = document.createElement('tr');
        tr.className = 'hover:bg-yellow-50 transition-colors';
        
        // Nút thao tác (Di chuyển, Xóa)
        let cotThaoTac = `
            <td class="p-1.5 border border-gray-400 text-center">
                <div class="flex justify-center items-center gap-1">
                    <button onclick="diChuyenDongKCT(${indexDong}, -1)" class="p-1 bg-slate-100 hover:bg-blue-200 rounded border border-gray-300 shadow-sm" title="Lên trên">
                        <img src="https://www.svgrepo.com/show/520556/up-arrow.svg" class="w-4 h-4" alt="Up">
                    </button>
                    <button onclick="diChuyenDongKCT(${indexDong}, 1)" class="p-1 bg-slate-100 hover:bg-blue-200 rounded border border-gray-300 shadow-sm" title="Xuống dưới">
                        <img src="https://www.svgrepo.com/show/520551/down-arrow.svg" class="w-4 h-4" alt="Down">
                    </button>
                    <button onclick="xoaDongKhungChuongTrinh(${indexDong})" class="p-1 bg-slate-100 hover:bg-red-200 rounded border border-gray-300 shadow-sm" title="Xóa môn">
                        <img src="https://www.svgrepo.com/show/499881/delete.svg" class="w-4 h-4" alt="Del">
                    </button>
                </div>
            </td>
        `;

        // Cột Môn học và Ưu tiên
        let cotMonHoc = `<td class="p-0 border border-gray-400"><input type="text" class="w-full h-full px-3 py-2 outline-none focus:bg-blue-50 text-left font-semibold text-slate-800" value="${dong.monHoc || ''}" onchange="capNhatGiaTriKCT(${indexDong}, 'monHoc', this.value)"></td>`;
        let cotUuTien = `<td class="p-0 border border-gray-400"><input type="number" class="w-full h-full px-2 py-2 outline-none text-center focus:bg-blue-50 font-semibold text-slate-800" value="${dong.uuTien || ''}" onchange="capNhatGiaTriKCT(${indexDong}, 'uuTien', this.value)"></td>`;

        // Cột các lớp
        let cotCacLop = '';
        danhSachLopKCT.forEach((lop, indexCot) => {
            let giaTriTiet = dong.soTiet[indexCot] !== undefined ? dong.soTiet[indexCot] : '';
            cotCacLop += `<td class="p-0 border border-gray-400"><input type="number" class="w-full h-full px-1 py-2 outline-none text-center focus:bg-blue-50 text-slate-700" value="${giaTriTiet}" onchange="capNhatSoTietKCT(${indexDong}, ${indexCot}, this.value)"></td>`;
        });

        tr.innerHTML = cotThaoTac + cotMonHoc + cotUuTien + cotCacLop;
        tbody.appendChild(tr);
    });
}

// ==========================================
// 4. CÁC HÀM XỬ LÝ LOGIC DỮ LIỆU
// ==========================================
function capNhatGiaTriKCT(indexDong, truong, giaTri) {
    duLieuBangKCT[indexDong][truong] = giaTri;
}

function capNhatSoTietKCT(indexDong, indexCot, giaTri) {
    let soTiet = parseInt(giaTri, 10);
    duLieuBangKCT[indexDong].soTiet[indexCot] = isNaN(soTiet) ? '' : soTiet;
}

function themDongKhungChuongTrinh() {
    let dongMoi = {
        monHoc: '',
        uuTien: '',
        soTiet: new Array(danhSachLopKCT.length).fill('')
    };
    duLieuBangKCT.push(dongMoi);
    veBangKhungChuongTrinh();
    
    // Cuộn xuống dòng cuối và focus
    const tbody = document.getElementById('duLieuBangKCT');
    if (tbody && tbody.lastElementChild) {
        setTimeout(() => {
            tbody.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const inputDauTien = tbody.lastElementChild.querySelector('input');
            if (inputDauTien) inputDauTien.focus();
        }, 150);
    }
}

function xoaDongKhungChuongTrinh(indexDong) {
    if(confirm('Đồng chí có chắc chắn muốn xóa môn học này khỏi khung chương trình không?')) {
        duLieuBangKCT.splice(indexDong, 1);
        veBangKhungChuongTrinh();
    }
}

function diChuyenDongKCT(indexDong, huong) {
    if (huong === -1 && indexDong > 0) { // Lên
        let tam = duLieuBangKCT[indexDong];
        duLieuBangKCT[indexDong] = duLieuBangKCT[indexDong - 1];
        duLieuBangKCT[indexDong - 1] = tam;
        veBangKhungChuongTrinh();
    } else if (huong === 1 && indexDong < duLieuBangKCT.length - 1) { // Xuống
        let tam = duLieuBangKCT[indexDong];
        duLieuBangKCT[indexDong] = duLieuBangKCT[indexDong + 1];
        duLieuBangKCT[indexDong + 1] = tam;
        veBangKhungChuongTrinh();
    }
}

// ==========================================
// 5. ĐỒNG BỘ DỮ LIỆU LÊN MÁY CHỦ (APPS SCRIPT)
// ==========================================
function luuDuLieuKhungChuongTrinh(event) {
    const nutBam = event.currentTarget;
    const noiDungGoc = nutBam.innerHTML;
    
    // Hiệu ứng trạng thái lưu
    nutBam.innerHTML = '<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Đang đồng bộ...';
    nutBam.disabled = true;
    nutBam.classList.replace('bg-blue-600', 'bg-slate-500');

    // Chẩn hóa dữ liệu trước khi gửi
    const duLieuDongBo = {
        classes: danhSachLopKCT,
        data: duLieuBangKCT
    };

    if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
            .withSuccessHandler(() => {
                alert('Đã đồng bộ Khung chương trình thành công!');
                khoiPhucNutBamLuu(nutBam, noiDungGoc);
            })
            .withFailureHandler((loi) => {
                alert('Lỗi trong quá trình đồng bộ: ' + loi);
                khoiPhucNutBamLuu(nutBam, noiDungGoc);
            })
            .saveDuLieuKhungChuongTrinh(duLieuDongBo); // Hàm Apps Script cần được định nghĩa
    } else {
        setTimeout(() => {
            alert('Lưu giả lập thành công (Chế độ môi trường không có Google Apps Script).');
            khoiPhucNutBamLuu(nutBam, noiDungGoc);
        }, 800);
    }
}

function khoiPhucNutBamLuu(nutBam, noiDungGoc) {
    nutBam.innerHTML = noiDungGoc;
    nutBam.disabled = false;
    nutBam.classList.replace('bg-slate-500', 'bg-blue-600');
}
