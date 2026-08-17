// =========================================================================
// KHỐI 1: KHỞI TẠO GIAO DIỆN VÀ ĐIỀU HƯỚNG TAB
// =========================================================================
let cayDanhMucThongKe = {};
let duLieuThongKeHienTai = [];

// Hàm khởi tạo Giao diện Thống kê (Chèn động vào DOM để không phá vỡ HTML cũ)
function dungGiaoDienThongKe() {
    let container = document.createElement('div');
    container.id = 'tabThongKe';
    container.className = 'hidden flex-col flex-1 h-full bg-gray-100 absolute inset-0 z-20 overflow-hidden';
    
    container.innerHTML = `
        <div class="flex-none p-2 pb-0">
            <!-- THANH CÔNG CỤ THỐNG KÊ -->
            <div class="bg-white shadow-sm border border-gray-400 p-3 flex flex-wrap items-center gap-4 reactbits-fade-in delay-100">
                <div class="flex items-center gap-2 font-bold text-blue-900">
                    <img src="https://www.svgrepo.com/show/521782/pie-chart.svg" class="w-6 h-6">
                    <span class="text-lg uppercase tracking-wide">Bộ Lọc Tra Cứu</span>
                </div>
                
                <div class="h-6 w-px bg-gray-300 hidden md:block"></div>

                <div class="flex flex-wrap items-center gap-3 w-full md:w-auto text-sm font-semibold text-slate-800">
                    <!-- NĂM HỌC -->
                    <div class="flex flex-col">
                        <label class="text-[11px] text-gray-500 uppercase tracking-widest mb-0.5">Năm học</label>
                        <input type="text" id="inputNamHocTk" list="dlNamHocTk" onchange="xuLyDoiNamHocTk()" class="w-32 px-2 py-1.5 border border-gray-400 rounded outline-none focus:border-blue-500 bg-slate-50">
                        <datalist id="dlNamHocTk"></datalist>
                    </div>

                    <!-- THÁNG -->
                    <div class="flex flex-col">
                        <label class="text-[11px] text-gray-500 uppercase tracking-widest mb-0.5">Tháng</label>
                        <input type="text" id="inputThangTk" list="dlThangTk" onchange="xuLyDoiThangTk()" class="w-32 px-2 py-1.5 border border-gray-400 rounded outline-none focus:border-blue-500 bg-slate-50">
                        <datalist id="dlThangTk"></datalist>
                    </div>

                    <!-- TUẦN -->
                    <div class="flex flex-col">
                        <label class="text-[11px] text-gray-500 uppercase tracking-widest mb-0.5">Tuần</label>
                        <input type="text" id="inputTuanTk" list="dlTuanTk" class="w-36 px-2 py-1.5 border border-gray-400 rounded outline-none focus:border-blue-500 bg-slate-50">
                        <datalist id="dlTuanTk"></datalist>
                    </div>

                    <!-- GIÁO VIÊN -->
                    <div class="flex flex-col">
                        <label class="text-[11px] text-gray-500 uppercase tracking-widest mb-0.5">Giáo viên</label>
                        <input type="text" id="inputGiaoVienTk" list="dlGiaoVienTk" class="w-40 px-2 py-1.5 border border-gray-400 rounded outline-none focus:border-blue-500 bg-slate-50">
                        <datalist id="dlGiaoVienTk"></datalist>
                    </div>
                </div>

                <div class="ml-auto flex items-center gap-2 mt-2 md:mt-0">
                    <button onclick="goiTraCuuThongKe()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 text-sm shadow transition duration-200 rounded flex items-center gap-2">
                        <img src="https://www.svgrepo.com/show/521826/search.svg" class="w-4 h-4 filter invert brightness-0"> Tra cứu
                    </button>
                    <button onclick="dongTabThongKe()" class="bg-gray-500 hover:bg-gray-600 text-white font-bold px-3 py-2 text-sm shadow transition duration-200 rounded">Đóng</button>
                </div>
            </div>
        </div>

        <!-- VÙNG HIỂN THỊ KẾT QUẢ -->
        <main class="flex-1 overflow-hidden px-2 pb-2 mt-2 flex flex-col reactbits-fade-in delay-200">
            <div id="vungKetQuaThongKe" class="bg-white shadow-inner border border-gray-400 flex-1 overflow-auto p-4 flex flex-col relative">
                <div class="text-center text-slate-400 mt-20 font-bold">
                    <img src="https://www.svgrepo.com/show/521782/pie-chart.svg" class="w-16 h-16 opacity-30 mx-auto mb-4">
                    Vui lòng chọn bộ lọc và bấm "Tra cứu" để hiển thị dữ liệu thống kê.
                </div>
            </div>
        </main>
    `;
    
    // Gắn vào vùng làm việc chính
    let phanPhai = document.querySelector('.flex-1.h-screen.flex.flex-col');
    if (phanPhai) {
        phanPhai.style.position = 'relative';
        phanPhai.appendChild(container);
    }
}

// Gọi dựng UI ngay khi file được nạp
document.addEventListener('DOMContentLoaded', () => { dungGiaoDienThongKe(); });

// =========================================================================
// KHỐI 2: ĐIỀU KHIỂN LOGIC TAB VÀ MENU
// =========================================================================
function moTabThongKe() {
    let tabTk = document.getElementById('tabThongKe');
    if (tabTk) {
        tabTk.classList.remove('hidden');
        tabTk.classList.add('flex');
        if (Object.keys(cayDanhMucThongKe).length === 0) {
            taiCayDanhMucThongKe();
        }
    }
}

function dongTabThongKe() {
    let tabTk = document.getElementById('tabThongKe');
    if (tabTk) {
        tabTk.classList.add('hidden');
        tabTk.classList.remove('flex');
    }
}

// =========================================================================
// KHỐI 3: GIAO TIẾP MÁY CHỦ VÀ LOGIC DROPDOWN LIÊN HOÀN
// =========================================================================
async function taiCayDanhMucThongKe() {
    const btn = document.querySelector('button[onclick="goiTraCuuThongKe()"]');
    if (btn) btn.innerHTML = `<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Đang tải...`;
    
    try {
        const phanHoi = await fetch(`${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=layCayQuanHeThongKe`);
        cayDanhMucThongKe = await phanHoi.json();
        
        let dsNam = Object.keys(cayDanhMucThongKe);
        if (dsNam.length > 0) {
            document.getElementById('dlNamHocTk').innerHTML = dsNam.map(n => `<option value="${n}">`).join('');
            document.getElementById('inputNamHocTk').value = dsNam[dsNam.length - 1]; // Chọn năm mới nhất
            xuLyDoiNamHocTk();
        }
    } catch (loi) {
        console.error("Lỗi tải cây danh mục:", loi);
    } finally {
        if (btn) btn.innerHTML = `<img src="https://www.svgrepo.com/show/521826/search.svg" class="w-4 h-4 filter invert brightness-0"> Tra cứu`;
    }
}

function xuLyDoiNamHocTk() {
    let nam = document.getElementById('inputNamHocTk').value.trim();
    let duLieuNam = cayDanhMucThongKe[nam];
    if (!duLieuNam) return;

    // Cập nhật Tháng
    let htmlThang = `<option value="Cả năm">`;
    htmlThang += duLieuNam.danhSachThang.map(th => `<option value="Tháng ${th}">`).join('');
    document.getElementById('dlThangTk').innerHTML = htmlThang;
    document.getElementById('inputThangTk').value = "Cả năm";

    // Cập nhật Giáo viên
    let htmlGv = `<option value="Toàn trường">`;
    htmlGv += duLieuNam.danhSachGiaoVien.map(gv => `<option value="${gv}">`).join('');
    document.getElementById('dlGiaoVienTk').innerHTML = htmlGv;
    document.getElementById('inputGiaoVienTk').value = "Toàn trường";

    xuLyDoiThangTk();
}

function xuLyDoiThangTk() {
    let nam = document.getElementById('inputNamHocTk').value.trim();
    let thangStr = document.getElementById('inputThangTk').value.trim();
    let duLieuNam = cayDanhMucThongKe[nam];
    if (!duLieuNam) return;

    let dsTuan = [];
    if (thangStr === "Cả năm" || thangStr === "") {
        for (let th in duLieuNam.soDoThoiGian) { dsTuan = dsTuan.concat(duLieuNam.soDoThoiGian[th]); }
        dsTuan = [...new Set(dsTuan)].sort((a, b) => a - b);
    } else {
        let thSo = thangStr.replace(/\D/g, '');
        dsTuan = duLieuNam.soDoThoiGian[thSo] || [];
    }

    let htmlTuan = `<option value="Tất cả các tuần">`;
    htmlTuan += dsTuan.map(t => `<option value="Tuần ${t}">`).join('');
    document.getElementById('dlTuanTk').innerHTML = htmlTuan;
    document.getElementById('inputTuanTk').value = "Tất cả các tuần";
}

// =========================================================================
// KHỐI 4: GỌI TRA CỨU VÀ VẼ GIAO DIỆN KẾT QUẢ
// =========================================================================
async function goiTraCuuThongKe() {
    let namHoc = document.getElementById('inputNamHocTk').value.trim();
    let thang = document.getElementById('inputThangTk').value.replace('Tháng ', '').trim();
    let tuan = document.getElementById('inputTuanTk').value.replace('Tuần ', '').trim();
    let giaoVien = document.getElementById('inputGiaoVienTk').value.trim();

    if (thang === "Cả năm") thang = "";
    if (tuan === "Tất cả các tuần") tuan = "";

    const vungKetQua = document.getElementById('vungKetQuaThongKe');
    vungKetQua.innerHTML = `<div class="mt-20 text-center text-blue-600 font-bold"><div class="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>Đang truy xuất CSDL...</div>`;

    try {
        const phanHoi = await fetch(`${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=traCuuThongKe&namHoc=${namHoc}&thang=${thang}&tuan=${tuan}&giaoVien=${giaoVien}`);
        let ketQua = await phanHoi.json();
        
        if (giaoVien === "Toàn trường" || giaoVien === "") {
            veBangThongKeToanTruong(ketQua, namHoc, thang, tuan);
        } else {
            veMaTranThongKeCaNhan(ketQua, giaoVien, namHoc, thang, tuan);
        }
    } catch (loi) {
        vungKetQua.innerHTML = `<div class="mt-20 text-center text-red-500 font-bold">Lỗi kết nối máy chủ dữ liệu.</div>`;
    }
}

// Giao diện Tổng hợp Toàn trường
function veBangThongKeToanTruong(duLieu, nam, thang, tuan) {
    let tDe = `Thống kê Toàn trường - Năm học ${nam}`;
    if (thang) tDe += ` | Tháng ${thang}`;
    if (tuan) tDe += ` | Tuần ${tuan}`;

    let html = `<h2 class="text-xl font-bold text-center text-blue-900 mb-4 uppercase tracking-wide">${tDe}</h2>`;
    html += `<table class="w-full text-sm border-collapse border border-gray-400"><thead class="bg-slate-200"><tr><th class="border border-gray-400 p-2">Giáo viên</th><th class="border border-gray-400 p-2">Số tiết Sáng</th><th class="border border-gray-400 p-2">Số tiết Chiều</th><th class="border border-gray-400 p-2 bg-green-100 text-green-900 font-extrabold text-base">Tổng số tiết</th></tr></thead><tbody>`;
    
    // Gom nhóm dữ liệu theo Giáo viên
    let tongHopGv = {};
    duLieu.forEach(t => {
        if (!tongHopGv[t.maGv]) tongHopGv[t.maGv] = { sang: 0, chieu: 0, tong: 0 };
        if (t.buoi === "Sáng") tongHopGv[t.maGv].sang++;
        else tongHopGv[t.maGv].chieu++;
        tongHopGv[t.maGv].tong++;
    });

    let dsGv = Object.keys(tongHopGv).sort();
    dsGv.forEach(gv => {
        let th = tongHopGv[gv];
        html += `<tr class="hover:bg-slate-50 text-center"><td class="border border-gray-400 p-2 font-bold text-slate-800">${gv}</td><td class="border border-gray-400 p-2">${th.sang}</td><td class="border border-gray-400 p-2">${th.chieu}</td><td class="border border-gray-400 p-2 font-extrabold text-green-700 text-base">${th.tong}</td></tr>`;
    });
    html += `</tbody></table>`;
    document.getElementById('vungKetQuaThongKe').innerHTML = html;
}

// Giao diện Ma trận Tần suất Cá nhân
function veMaTranThongKeCaNhan(duLieu, gv, nam, thang, tuan) {
    let tDe = `Lịch Trình Giảng Dạy: <span class="text-red-600">${gv}</span>`;
    let html = `<h2 class="text-xl font-bold text-center text-blue-900 mb-4 uppercase tracking-wide">${tDe} <br><span class="text-sm text-slate-600 normal-case">(Năm học ${nam} ${thang ? '- Tháng ' + thang : ''} ${tuan ? '- Tuần ' + tuan : ''})</span></h2>`;

    let tongSoTiet = duLieu.length;
    html += `<div class="flex justify-center mb-6"><div class="bg-blue-50 border border-blue-200 rounded shadow-sm px-6 py-3 text-center"><p class="text-sm font-bold text-blue-700">TỔNG SỐ TIẾT ĐÃ DẠY</p><p class="text-3xl font-extrabold text-blue-900">${tongSoTiet}</p></div></div>`;

    // Cấu trúc lưới ma trận
    let luoi = {};
    let thuMacDinh = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    thuMacDinh.forEach(thu => { luoi[thu] = { "Sáng": {}, "Chiều": {} }; });

    // Nhồi dữ liệu và gộp (đếm tần suất)
    duLieu.forEach(t => {
        let thu = t.thu; let buoi = t.buoi; let tiet = t.tiet;
        if (luoi[thu] && luoi[thu][buoi]) {
            if (!luoi[thu][buoi][tiet]) luoi[thu][buoi][tiet] = {};
            let khoa = `${t.monHoc} - ${t.maLop}`;
            luoi[thu][buoi][tiet][khoa] = (luoi[thu][buoi][tiet][khoa] || 0) + 1;
        }
    });

    html += `<div class="overflow-x-auto"><table class="w-full text-center border-collapse border border-gray-400"><thead class="bg-slate-200"><tr><th class="border border-gray-400 p-2">Thứ</th><th class="border border-gray-400 p-2">Buổi</th><th class="border border-gray-400 p-2">Tiết</th><th class="border border-gray-400 p-2 w-1/2">Chi tiết Lên Lớp (Môn - Lớp)</th></tr></thead><tbody>`;

    thuMacDinh.forEach(thu => {
        ["Sáng", "Chiều"].forEach(buoi => {
            let dsTiet = Object.keys(luoi[thu][buoi]).sort((a, b) => a - b);
            if (dsTiet.length > 0) {
                dsTiet.forEach((tiet, index) => {
                    html += `<tr class="hover:bg-slate-50">`;
                    if (index === 0 && buoi === "Sáng") html += `<td rowspan="${Object.keys(luoi[thu]["Sáng"]).length + Object.keys(luoi[thu]["Chiều"]).length}" class="border border-gray-400 font-extrabold bg-slate-50">${thu}</td>`;
                    if (index === 0) html += `<td rowspan="${dsTiet.length}" class="border border-gray-400 font-bold">${buoi}</td>`;
                    
                    html += `<td class="border border-gray-400 p-2 font-bold">${tiet}</td><td class="border border-gray-400 p-2 text-left space-y-1">`;
                    
                    // Render danh sách gộp
                    let thongTinTiet = luoi[thu][buoi][tiet];
                    for (let khoa in thongTinTiet) {
                        let soLan = thongTinTiet[khoa];
                        html += `<div class="inline-block bg-white border border-gray-300 rounded px-2 py-1 text-sm font-semibold shadow-sm mr-1 mb-1">
                                    <span class="text-blue-800">${khoa}</span> 
                                    <span class="text-xs bg-red-100 text-red-700 px-1 rounded ml-1" title="Số lần dạy môn này tại tiết này">${soLan} lần</span>
                                 </div>`;
                    }
                    html += `</td></tr>`;
                });
            }
        });
    });

    html += `</tbody></table></div>`;
    document.getElementById('vungKetQuaThongKe').innerHTML = html;
}
