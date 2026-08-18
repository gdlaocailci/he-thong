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
    if (nav && !document.getElementById('menuKhungChuongTrinh')) {
        const menuKCT = document.createElement('a');
        menuKCT.id = 'menuKhungChuongTrinh';
        menuKCT.href = 'javascript:void(0)';
        menuKCT.onclick = moTabKhungChuongTrinh;
        menuKCT.style.display = 'none'; // Ẩn mặc định, chờ cấp quyền từ app.js
        menuKCT.className = 'block px-6 py-4 hover:bg-menu-hover border-l-[5px] border-transparent transition-all cursor-pointer border-b border-white/10 group';
        menuKCT.innerHTML = `<span class="font-bold text-white group-hover:text-menu-active transition-colors text-[15px]">Khung chương trình (PA)</span>`;
        nav.appendChild(menuKCT);
    }
}

function capNhatQuyenMenuKhungChuongTrinh(coQuyen) {
    const menuKCT = document.getElementById('menuKhungChuongTrinh');
    if (menuKCT) {
        menuKCT.style.display = coQuyen ? 'block' : 'none';
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
// 2. CHUYỂN ĐỔI TAB VÀ TẢI DỮ LIỆU BẰNG FETCH
// ==========================================
function moTabKhungChuongTrinh() {
    const cacKhung = ['khungTKB', 'khungPhanCong', 'khungThongKe', 'khungKhungChuongTrinh'];
    cacKhung.forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.classList.add('hidden'); el.classList.remove('flex', 'block'); }
    });

    const khungKCT = document.getElementById('khungKhungChuongTrinh');
    if (khungKCT) { khungKCT.classList.remove('hidden'); khungKCT.classList.add('flex'); }

    document.querySelectorAll('nav a').forEach(a => {
        a.classList.remove('border-menu-active', 'bg-menu-hover');
        a.classList.add('border-transparent');
        const span = a.querySelector('span');
        if(span) { span.classList.remove('text-menu-active'); span.classList.add('text-white'); }
    });
    
    const menuKCT = document.getElementById('menuKhungChuongTrinh');
    if (menuKCT) {
        menuKCT.classList.add('border-menu-active', 'bg-menu-hover');
        menuKCT.classList.remove('border-transparent');
        const span = menuKCT.querySelector('span');
        if(span) { span.classList.add('text-menu-active'); span.classList.remove('text-white'); }
    }

    taiDuLieuKhungChuongTrinhTuMayChu();
}

async function taiDuLieuKhungChuongTrinhTuMayChu() {
    const tbody = document.getElementById('duLieuBangKCT');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="100%" class="text-center py-10 text-slate-500 font-bold"><div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>Đang tải dữ liệu Khung chương trình...</td></tr>';
    }

    try {
        const phanHoi = await fetch(`${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=layBanGhiKhungChuongTrinh`);
        const response = await phanHoi.json();
        
        danhSachLopKCT = response.classes || [];
        duLieuBangKCT = response.data || [];
        veBangKhungChuongTrinh();
    } catch (loi) {
        if (tbody) tbody.innerHTML = `<tr><td colspan="100%" class="text-center py-10 text-red-500 font-bold">Đã xảy ra lỗi kết nối: ${loi}</td></tr>`;
    }
}

// ==========================================
// 3. VẼ BẢNG VÀ XỬ LÝ SỰ KIỆN GIAO DIỆN
// ==========================================
function veBangKhungChuongTrinh() {
    const thead = document.getElementById('tieuDeBangKCT');
    const tbody = document.getElementById('duLieuBangKCT');
    if (!thead || !tbody) return;

    let chuoiThead = '<tr>';
    chuoiThead += '<th class="w-28 p-2 border border-gray-400 bg-slate-200 sticky left-0 z-30">Điều chỉnh</th>';
    chuoiThead += '<th class="w-48 p-2 border border-gray-400 bg-slate-200 sticky left-[112px] z-30">Môn học</th>';
    chuoiThead += '<th class="w-24 p-2 border border-gray-400 bg-slate-200">Ưu tiên</th>';
    
    danhSachLopKCT.forEach(lop => {
        chuoiThead += `<th class="w-16 p-2 border border-gray-400 bg-blue-100">${lop}</th>`;
    });
    chuoiThead += '</tr>';
    thead.innerHTML = chuoiThead;

    tbody.innerHTML = '';
    if (duLieuBangKCT.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${3 + danhSachLopKCT.length}" class="text-center py-6 text-slate-500">Chưa có dữ liệu. Vui lòng thêm dòng.</td></tr>`;
        return;
    }

    duLieuBangKCT.forEach((dong, indexDong) => {
        let tr = document.createElement('tr');
        tr.className = 'hover:bg-yellow-50 transition-colors group';
        
        let cotThaoTac = `
            <td class="p-1.5 border border-gray-400 text-center bg-white sticky left-0 z-10 group-hover:bg-yellow-50 shadow-[1px_0_0_0_#9ca3af]">
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

        let cotMonHoc = `<td class="p-0 border border-gray-400 bg-white sticky left-[112px] z-10 group-hover:bg-yellow-50 shadow-[1px_0_0_0_#9ca3af]"><input type="text" class="w-full h-full px-3 py-2 outline-none focus:bg-blue-50 text-left font-semibold text-slate-800 bg-transparent" value="${dong.monHoc || ''}" onchange="capNhatGiaTriKCT(${indexDong}, 'monHoc', this.value)"></td>`;
        let cotUuTien = `<td class="p-0 border border-gray-400"><input type="number" class="w-full h-full px-2 py-2 outline-none text-center focus:bg-blue-50 font-semibold text-slate-800 bg-transparent" value="${dong.uuTien || ''}" onchange="capNhatGiaTriKCT(${indexDong}, 'uuTien', this.value)"></td>`;

        let cotCacLop = '';
        danhSachLopKCT.forEach((lop, indexCot) => {
            let giaTriTiet = dong.soTiet[indexCot] !== undefined ? dong.soTiet[indexCot] : '';
            cotCacLop += `<td class="p-0 border border-gray-400"><input type="number" class="w-full h-full px-1 py-2 outline-none text-center focus:bg-blue-50 text-slate-700 bg-transparent" value="${giaTriTiet}" onchange="capNhatSoTietKCT(${indexDong}, ${indexCot}, this.value)"></td>`;
        });

        tr.innerHTML = cotThaoTac + cotMonHoc + cotUuTien + cotCacLop;
        tbody.appendChild(tr);
    });
}

// ==========================================
// 4. CÁC HÀM XỬ LÝ LOGIC DỮ LIỆU
// ==========================================
function capNhatGiaTriKCT(indexDong, truong, giaTri) { duLieuBangKCT[indexDong][truong] = giaTri; }

function capNhatSoTietKCT(indexDong, indexCot, giaTri) {
    let soTiet = parseInt(giaTri, 10);
    duLieuBangKCT[indexDong].soTiet[indexCot] = isNaN(soTiet) ? '' : soTiet;
}

function themDongKhungChuongTrinh() {
    if (danhSachLopKCT.length === 0) {
        // Nạp danh sách lớp mặc định nếu chưa có
        danhSachLopKCT = ['1A','1B','1C','2A','2B','2C','3A','3B','3C','4A','4B','4C','5A','5B','5C'];
    }
    duLieuBangKCT.push({ monHoc: '', uuTien: '', soTiet: new Array(danhSachLopKCT.length).fill('') });
    veBangKhungChuongTrinh();
    
    setTimeout(() => {
        const tbody = document.getElementById('duLieuBangKCT');
        if (tbody && tbody.lastElementChild) {
            tbody.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const inputDauTien = tbody.lastElementChild.querySelector('input');
            if (inputDauTien) inputDauTien.focus();
        }
    }, 150);
}

function xoaDongKhungChuongTrinh(indexDong) {
    if(confirm('Đồng chí có chắc chắn muốn xóa môn học này khỏi khung chương trình không?')) {
        duLieuBangKCT.splice(indexDong, 1);
        veBangKhungChuongTrinh();
    }
}

function diChuyenDongKCT(indexDong, huong) {
    if (huong === -1 && indexDong > 0) {
        let tam = duLieuBangKCT[indexDong];
        duLieuBangKCT[indexDong] = duLieuBangKCT[indexDong - 1];
        duLieuBangKCT[indexDong - 1] = tam;
        veBangKhungChuongTrinh();
    } else if (huong === 1 && indexDong < duLieuBangKCT.length - 1) {
        let tam = duLieuBangKCT[indexDong];
        duLieuBangKCT[indexDong] = duLieuBangKCT[indexDong + 1];
        duLieuBangKCT[indexDong + 1] = tam;
        veBangKhungChuongTrinh();
    }
}

// ==========================================
// 5. ĐỒNG BỘ DỮ LIỆU LÊN MÁY CHỦ BẰNG POST FETCH
// ==========================================
async function luuDuLieuKhungChuongTrinh(event) {
    const nutBam = event.currentTarget;
    const noiDungGoc = nutBam.innerHTML;
    
    nutBam.innerHTML = '<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Đang đồng bộ...';
    nutBam.disabled = true;
    nutBam.classList.replace('bg-blue-600', 'bg-slate-500');

    const duLieuDongBo = {
        classes: danhSachLopKCT,
        data: duLieuBangKCT
    };

    try {
        const payload = { thaoTac: 'luuBanGhiKhungChuongTrinh', duLieu: duLieuDongBo };
        const phanHoi = await fetch(CAU_HINH_FRONTEND.URL_API_MAY_CHU, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const ketQua = await phanHoi.json();
        
        if (ketQua.trangThai === 'Thành công') {
            alert('Đã đồng bộ Khung chương trình lên máy chủ thành công!');
        } else {
            alert('Lỗi từ máy chủ: ' + (ketQua.thongBao || 'Không xác định.'));
        }
    } catch (loi) {
        alert('Lỗi kết nối mạng trong quá trình đồng bộ: ' + loi);
    } finally {
        nutBam.innerHTML = noiDungGoc;
        nutBam.disabled = false;
        nutBam.classList.replace('bg-slate-500', 'bg-blue-600');
    }
}
