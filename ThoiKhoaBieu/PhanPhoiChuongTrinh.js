// =========================================================================
// KHỐI 1: KHỞI TẠO BIẾN TOÀN CỤC VÀ GẮN GIAO DIỆN VÀO DOM
// =========================================================================
let duLieuPpctGoc = []; 
let duLieuTkbTuan = [];
let trangThaiDaTaiGiaoDienPPCT = false;

document.addEventListener('DOMContentLoaded', () => {
    taoMenuPhanPhoiChuongTrinh();
    taoKhungGiaoDienPPCT();
});

function taoMenuPhanPhoiChuongTrinh() {
    const nav = document.querySelector('nav');
    if (nav && !document.getElementById('menuPhanPhoiChuongTrinh')) {
        const menuPPCT = document.createElement('a');
        menuPPCT.id = 'menuPhanPhoiChuongTrinh';
        menuPPCT.onclick = moTabPhanPhoiChuongTrinh;
        menuPPCT.className = 'flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent hover:bg-white/10 transition-all duration-150 cursor-pointer group mt-1';
        menuPPCT.innerHTML = `
            <svg class="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity flex-none text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                <line x1="10" y1="6" x2="16" y2="6"></line>
                <line x1="10" y1="10" x2="16" y2="10"></line>
            </svg>
            <span class="font-bold text-white/80 group-hover:text-white transition-colors text-[14px]">Phân phối Chương trình</span>
        `;
        nav.appendChild(menuPPCT);
    }
}

function taoKhungGiaoDienPPCT() {
    const vungHienThi = document.getElementById('vungHienThiChinh');
    if (vungHienThi) {
        const khungPPCT = document.createElement('div');
        khungPPCT.id = 'khungPhanPhoiChuongTrinh';
        khungPPCT.className = 'hidden p-4 w-full h-full flex-col font-sans bg-gray-50 reactbits-fade-in relative';
        
        khungPPCT.innerHTML = `
            <!-- Tiêu đề & Công cụ -->
            <div class="flex flex-col lg:flex-row justify-between items-center mb-4 gap-3 flex-none">
                <div class="flex items-center gap-3">
                    <img src="${typeof CAU_HINH_FRONTEND !== 'undefined' ? CAU_HINH_FRONTEND.LINK_LOGO_TRANG_CHU : 'https://www.svgrepo.com/show/309489/document-report.svg'}" class="w-10 h-10 object-contain drop-shadow-md">
                    <h2 class="text-xl font-extrabold text-blue-900 uppercase tracking-wide">Quản lý Phân Phối Chương Trình</h2>
                </div>
                
                <div class="flex flex-wrap items-center gap-2">
                    <input type="file" id="fileNhapPPCT" accept=".xlsx, .xls" class="hidden" onchange="xuLyNhapExcelPPCT(event)">
                    
                    <button onclick="document.getElementById('fileNhapPPCT').click()" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded shadow transition duration-200 flex items-center gap-1.5 text-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                        Nhập Excel
                    </button>
                    
                    <button onclick="xuLyXuatExcelPPCT()" class="bg-green-700 hover:bg-green-800 text-white font-bold py-1.5 px-3 rounded shadow transition duration-200 flex items-center gap-1.5 text-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Xuất Excel
                    </button>
                    
                    <button onclick="luuDuLieuPPCTLenMayChu(event)" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-4 rounded shadow transition duration-200 flex items-center gap-1.5 text-sm ml-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                        Lưu PPCT
                    </button>
                </div>
            </div>

            <!-- Bộ lọc điều hướng -->
            <div class="bg-white border border-gray-300 shadow-sm p-3 rounded flex flex-wrap items-end gap-4 mb-4 flex-none">
                <div class="flex flex-col w-24">
                    <label class="text-[11px] text-gray-500 uppercase font-bold mb-1">Tuần học</label>
                    <input type="number" id="locTuanUI" min="1" max="35" value="1" class="w-full px-2 py-1.5 border border-blue-300 rounded outline-none focus:ring-2 focus:ring-blue-500 font-extrabold text-blue-900 bg-blue-50 text-center">
                </div>

                <div class="flex flex-col w-32">
                    <label class="text-[11px] text-gray-500 uppercase font-bold mb-1">Lớp</label>
                    <input type="text" id="locLopPPCT" list="listLopPPCT" onchange="tuDongTinhKhoiLop()" class="w-full px-2 py-1.5 border border-blue-300 rounded outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-900 bg-blue-50" placeholder="Chọn lớp">
                    <datalist id="listLopPPCT"></datalist>
                </div>

                <div class="flex flex-col w-24">
                    <label class="text-[11px] text-gray-500 uppercase font-bold mb-1">Khối Lớp</label>
                    <input type="text" id="locKhoiPPCT" readonly class="w-full px-2 py-1.5 border border-gray-300 rounded bg-gray-100 font-extrabold text-slate-700 text-center select-none" title="Tự động trích xuất từ Tên Lớp" placeholder="--">
                </div>

                <div class="flex flex-col w-48">
                    <label class="text-[11px] text-gray-500 uppercase font-bold mb-1">Môn học</label>
                    <input type="text" id="locMonPPCT" list="listMonPPCT" class="w-full px-2 py-1.5 border border-blue-300 rounded outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-900 bg-blue-50" placeholder="Chọn môn">
                    <datalist id="listMonPPCT"></datalist>
                </div>
                
                <button onclick="taiDuLieuTkbVaPpct()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-6 rounded shadow transition duration-200 text-sm ml-auto flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    Hiển thị Lịch
                </button>
            </div>

            <!-- Bảng Dữ Liệu Lưới Ma Trận -->
            <div class="flex-1 overflow-auto border border-gray-400 shadow-sm bg-white relative">
                <table class="bang-excel w-full text-center border-collapse">
                    <thead class="sticky top-0 z-20 bg-slate-200 text-slate-900 shadow-sm border-b-2 border-slate-400">
                        <tr>
                            <th class="py-2.5 px-2 border border-slate-400 w-28">Thứ / Ngày</th>
                            <th class="py-2.5 px-2 border border-slate-400 w-20">Buổi</th>
                            <th class="py-2.5 px-2 border border-slate-400 w-12">Tiết</th>
                            <th class="py-2.5 px-2 border border-slate-400 w-20">Tiết PPC</th>
                            <th class="py-2.5 px-2 border border-slate-400 w-32">Môn</th>
                            <th class="py-2.5 px-4 border border-slate-400 text-left min-w-[250px]">Tên bài học</th>
                            <th class="py-2.5 px-4 border border-slate-400 text-left min-w-[200px]">Điều chỉnh</th>
                        </tr>
                    </thead>
                    <tbody id="vungDuLieuLichPPCT">
                        <tr><td colspan="7" class="text-center py-10 text-slate-500 font-bold italic">Vui lòng chọn Tuần, Lớp, Môn và bấm "Hiển thị Lịch"</td></tr>
                    </tbody>
                </table>
            </div>
        </div>`;
        vungHienThi.appendChild(khungPPCT);
    }
}

// =========================================================================
// KHỐI 2: ĐIỀU HƯỚNG TAB VÀ XỬ LÝ LAZY LOADING
// =========================================================================
function moTabPhanPhoiChuongTrinh() {
    document.querySelectorAll('nav a').forEach(a => {
        a.classList.remove('border-menu-active', 'bg-menu-hover');
        a.classList.add('border-transparent');
        const span = a.querySelector('span');
        if (span) { span.classList.remove('text-menu-active'); span.classList.add('text-white'); }
    });
    
    const menuPPCT = document.getElementById('menuPhanPhoiChuongTrinh');
    if (menuPPCT) {
        menuPPCT.classList.add('border-menu-active', 'bg-menu-hover');
        menuPPCT.classList.remove('border-transparent');
        const span = menuPPCT.querySelector('span');
        if (span) { span.classList.add('text-menu-active'); span.classList.remove('text-white'); }
    }

    ['khungTKB', 'khungThongKe', 'khungPhanCong', 'khungKhungChuongTrinh', 'khungDanhMucGV', 'khungCaiDat', 'khungDanhMucLop'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.classList.remove('flex', 'block'); el.classList.add('hidden'); }
    });
    
    const thanhCongCu = document.getElementById('thanhCongCuTKB');
    if (thanhCongCu) { thanhCongCu.classList.remove('flex'); thanhCongCu.classList.add('hidden'); }

    const khungPPCT = document.getElementById('khungPhanPhoiChuongTrinh');
    if (khungPPCT) { khungPPCT.classList.remove('hidden'); khungPPCT.classList.add('flex'); }

    if (!trangThaiDaTaiGiaoDienPPCT) {
        bomDuLieuVaoBoLoc();
        if (typeof tuanDangXem !== 'undefined') {
            document.getElementById('locTuanUI').value = tuanDangXem;
        }
        trangThaiDaTaiGiaoDienPPCT = true;
    }
}

function bomDuLieuVaoBoLoc() {
    if (typeof thongSoHocVu !== 'undefined') {
        const dsLop = thongSoHocVu.DANH_SACH_LOP || [];
        const dsMon = thongSoHocVu.DANH_SACH_MON_HOC || [];
        
        document.getElementById('listLopPPCT').innerHTML = dsLop.map(lop => `<option value="${lop}">`).join('');
        document.getElementById('listMonPPCT').innerHTML = dsMon.map(mon => `<option value="${mon}">`).join('');
    }
}

function tuDongTinhKhoiLop() {
    const inputLop = document.getElementById('locLopPPCT').value.trim();
    const inputKhoi = document.getElementById('locKhoiPPCT');
    if (inputLop === '') { inputKhoi.value = ''; return; }
    
    const ketQuaKhoi = inputLop.match(/\d+/);
    if (ketQuaKhoi && ketQuaKhoi.length > 0) {
        inputKhoi.value = `Khối ${ketQuaKhoi[0]}`;
        inputKhoi.setAttribute('data-khoi-so', ketQuaKhoi[0]);
    } else {
        inputKhoi.value = 'KX';
        inputKhoi.setAttribute('data-khoi-so', 'KX');
    }
}

// =========================================================================
// KHỐI 3: GỌI API KÉP (TKB + PPCT) VÀ VẼ LƯỚI MA TRẬN
// =========================================================================
async function taiDuLieuTkbVaPpct() {
    const tuan = document.getElementById('locTuanUI').value.trim();
    const lop = document.getElementById('locLopPPCT').value.trim();
    const khoi = document.getElementById('locKhoiPPCT').getAttribute('data-khoi-so');
    const mon = document.getElementById('locMonPPCT').value.trim();
    const tbody = document.getElementById('vungDuLieuLichPPCT');

    if (!tuan || !lop || !khoi || !mon) {
        alert("Đồng chí vui lòng điền đầy đủ: Tuần, Lớp, Môn học để truy xuất dữ liệu.");
        return;
    }

    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-10 text-blue-600 font-bold">
        <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
        Đang đồng bộ Lịch giảng dạy và Phân phối chương trình...
    </td></tr>`;

    try {
        // Cần Backend hỗ trợ API layTkbVaPpct:
        // Logic Backend: Dựa vào 'tuan' so sánh với Tuần Hiện Tại để query DATA_TKB, TKB_HIEN_TAI, hoặc TKB_CoDinh.
        const urlAPI = `${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=layTkbVaPpct&tuan=${tuan}&lop=${encodeURIComponent(lop)}&khoi=${khoi}&mon=${encodeURIComponent(mon)}`;
        const phanHoi = await (typeof fetchVoiCoCheThuLai === 'function' ? fetchVoiCoCheThuLai(urlAPI) : fetch(urlAPI));
        
        if (!phanHoi.ok) throw new Error("Mất kết nối máy chủ");
        const ketQua = await phanHoi.json();
        
        duLieuTkbTuan = ketQua.duLieuTkb || [];
        duLieuPpctGoc = ketQua.duLieuPpct || [];
        
        veBangKhungLichPPCT(mon);
    } catch (loi) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-10 text-red-600 font-bold">Lỗi truy xuất dữ liệu. <br><span class="text-sm font-normal text-slate-500">Lưu ý: Yêu cầu Backend bổ sung API 'layTkbVaPpct' để xử lý logic Tuần và gộp dữ liệu.</span></td></tr>`;
    }
}

function veBangKhungLichPPCT(monDangChon) {
    const tbody = document.getElementById('vungDuLieuLichPPCT');
    let html = '';
    
    // Cấu trúc lưới thời gian cố định
    const thuMacDinh = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6"];
    const cauTrucTiet = { "Sáng": [1,2,3,4,5], "Chiều": [1,2,3,4] };
    
    // Tổ chức dữ liệu TKB thành ma trận O(1) truy xuất
    let maTranTkb = {};
    duLieuTkbTuan.forEach(t => {
        if (!maTranTkb[t.thu]) maTranTkb[t.thu] = {};
        if (!maTranTkb[t.thu][t.buoi]) maTranTkb[t.thu][t.buoi] = {};
        maTranTkb[t.thu][t.buoi][t.tiet] = t;
    });

    thuMacDinh.forEach(thu => {
        // Tìm ngày tương ứng của Thứ trong tuần (nếu API có trả về t.ngay)
        let ngayHienThi = '--/--/----';
        if (maTranTkb[thu] && maTranTkb[thu]["Sáng"] && maTranTkb[thu]["Sáng"][1] && maTranTkb[thu]["Sáng"][1].ngay) {
            ngayHienThi = maTranTkb[thu]["Sáng"][1].ngay;
        } else if (typeof tinhNgayDocLap === 'function' && typeof ngayDauTuanUI !== 'undefined') {
            ngayHienThi = tinhNgayDocLap(ngayDauTuanUI, thu).hienThi;
        }

        let soDongCuaThu = cauTrucTiet["Sáng"].length + cauTrucTiet["Chiều"].length;
        let daInCotThu = false;

        ["Sáng", "Chiều"].forEach(buoi => {
            let soDongCuaBuoi = cauTrucTiet[buoi].length;
            let daInCotBuoi = false;

            cauTrucTiet[buoi].forEach(tiet => {
                let tietTkb = (maTranTkb[thu] && maTranTkb[thu][buoi] && maTranTkb[thu][buoi][tiet]) ? maTranTkb[thu][buoi][tiet] : null;
                let tenMonTkb = tietTkb ? tietTkb.monHoc : '';
                
                // Kích hoạt ô nhập nếu môn của thời khóa biểu trùng với môn đang lọc
                let isMonMucTieu = (tenMonTkb.toLowerCase() === monDangChon.toLowerCase() && tenMonTkb !== '');
                
                let valTietPPC = '';
                let valTenBai = '';
                let valDieuChinh = '';
                
                // Nếu API trả về dữ liệu PPCT đã map sẵn vào TKB, nạp vào đây.
                if (isMonMucTieu && tietTkb && tietTkb.tietPpc) {
                    valTietPPC = tietTkb.tietPpc;
                    valTenBai = tietTkb.tenBaiHoc || '';
                    valDieuChinh = tietTkb.dieuChinh || '';
                }

                let classDong = isMonMucTieu ? 'bg-blue-50/50 hover:bg-blue-100' : 'bg-white hover:bg-slate-50';
                html += `<tr class="${classDong} transition-colors border-b border-gray-300">`;
                
                // Rowspan Cột Thứ
                if (!daInCotThu) {
                    html += `<td rowspan="${soDongCuaThu}" class="border-r border-gray-400 bg-white align-middle">
                                <div class="font-extrabold text-slate-800 text-base">${thu}</div>
                                <div class="text-[11px] font-semibold text-gray-500 mt-1">(${ngayHienThi})</div>
                             </td>`;
                    daInCotThu = true;
                }
                
                // Rowspan Cột Buổi
                if (!daInCotBuoi) {
                    html += `<td rowspan="${soDongCuaBuoi}" class="border-r border-gray-400 bg-white align-middle font-bold text-slate-700">
                                ${buoi}
                             </td>`;
                    daInCotBuoi = true;
                }
                
                // Cột Tiết
                html += `<td class="border-r border-gray-400 align-middle font-extrabold text-slate-800">${tiet}</td>`;
                
                // Các ô dữ liệu
                if (isMonMucTieu) {
                    let idKhoa = `${thu}_${buoi}_${tiet}`;
                    html += `
                        <td class="border-r border-gray-300 p-0">
                            <input type="text" data-ppct-id="${idKhoa}" data-loai="tietPpc" value="${valTietPPC}" onchange="tuDongDienTenBai(this)" class="w-full h-full min-h-[32px] outline-none text-center font-extrabold text-blue-900 bg-transparent focus:bg-white placeholder-gray-300" placeholder="--">
                        </td>
                        <td class="border-r border-gray-300 align-middle font-bold text-blue-800">${tenMonTkb}</td>
                        <td class="border-r border-gray-300 p-0">
                            <input type="text" data-ppct-id="${idKhoa}" data-loai="tenBai" value="${valTenBai}" class="w-full h-full min-h-[32px] px-3 outline-none text-left font-semibold text-slate-900 bg-transparent focus:bg-white placeholder-gray-300" placeholder="Nhập tên bài...">
                        </td>
                        <td class="p-0">
                            <input type="text" data-ppct-id="${idKhoa}" data-loai="dieuChinh" value="${valDieuChinh}" class="w-full h-full min-h-[32px] px-3 outline-none text-left italic text-gray-700 bg-transparent focus:bg-white placeholder-gray-300" placeholder="Nội dung điều chỉnh...">
                        </td>
                    `;
                } else {
                    html += `
                        <td class="border-r border-gray-300 bg-gray-100/50"></td>
                        <td class="border-r border-gray-300 align-middle font-semibold text-slate-600">${tenMonTkb}</td>
                        <td class="border-r border-gray-300 bg-gray-100/50"></td>
                        <td class="bg-gray-100/50"></td>
                    `;
                }
                html += `</tr>`;
            });
        });
    });

    tbody.innerHTML = html;
}

// Logic tự động điền Tên bài học dựa trên mốc Tiết PPCT
function tuDongDienTenBai(inputTietElement) {
    const valTiet = inputTietElement.value.trim();
    if (!valTiet || duLieuPpctGoc.length === 0) return;

    const idKhoa = inputTietElement.getAttribute('data-ppct-id');
    const inputTenBai = document.querySelector(`input[data-ppct-id="${idKhoa}"][data-loai="tenBai"]`);
    const inputDieuChinh = document.querySelector(`input[data-ppct-id="${idKhoa}"][data-loai="dieuChinh"]`);

    // Tìm kiếm trong mảng PPCT gốc. (Giả định mảng có trường tiet và tenBaiHoc)
    const baiHoc = duLieuPpctGoc.find(b => String(b.tiet) === valTiet);
    if (baiHoc && inputTenBai) {
        if (inputTenBai.value === '') inputTenBai.value = baiHoc.tenBaiHoc || '';
        if (inputDieuChinh && inputDieuChinh.value === '') inputDieuChinh.value = baiHoc.dieuChinh || '';
    }
}

// =========================================================================
// KHỐI 4: GIAO TIẾP EXCEL BẰNG SHEETJS (XLSX)
// =========================================================================
function xuLyXuatExcelPPCT() {
    if (typeof XLSX === 'undefined') { alert("Thư viện Excel chưa tải xong."); return; }
    
    const khoi = document.getElementById('locKhoiPPCT').getAttribute('data-khoi-so') || 'KX';
    const mon = document.getElementById('locMonPPCT').value.trim() || 'Mon';
    
    const header = ["Khối", "Tiết PPCT", "Tên môn học", "Tên bài học", "Điều chỉnh"];
    let rowsArr = [header];
    
    // Thu thập dữ liệu từ lưới UI
    const cacOInputTiet = document.querySelectorAll('input[data-loai="tietPpc"]');
    cacOInputTiet.forEach(inp => {
        let valTiet = inp.value.trim();
        if (valTiet !== '') {
            let idKhoa = inp.getAttribute('data-ppct-id');
            let valTenBai = document.querySelector(`input[data-ppct-id="${idKhoa}"][data-loai="tenBai"]`).value.trim();
            let valDieuChinh = document.querySelector(`input[data-ppct-id="${idKhoa}"][data-loai="dieuChinh"]`).value.trim();
            rowsArr.push([khoi, valTiet, mon, valTenBai, valDieuChinh]);
        }
    });

    if (rowsArr.length === 1) { alert("Không có dữ liệu Tiết PPCT nào trên lưới để xuất."); return; }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(rowsArr);
    ws['!cols'] = [{wch: 10}, {wch: 15}, {wch: 20}, {wch: 40}, {wch: 30}];
    XLSX.utils.book_append_sheet(wb, ws, "Lich_Bao_Giang");
    XLSX.writeFile(wb, `LichBaoGiang_Khoi${khoi}_${mon.replace(/\s+/g, '')}.xlsx`);
}

function xuLyNhapExcelPPCT(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (typeof XLSX === 'undefined') return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const rowsArr = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });
            
            // Xử lý nạp dữ liệu từ file vào mảng gốc duLieuPpctGoc để auto-fill
            if (rowsArr.length > 1) {
                duLieuPpctGoc = [];
                for (let i = 1; i < rowsArr.length; i++) {
                    let r = rowsArr[i];
                    if (r[1] !== undefined) {
                        duLieuPpctGoc.push({
                            tiet: r[1],
                            tenBaiHoc: r[3] || '',
                            dieuChinh: r[4] || ''
                        });
                    }
                }
                alert("Đã nạp bộ PPCT từ Excel làm nguồn dữ liệu. Hãy gõ số Tiết PPC trên lưới để tự động điền Tên Bài.");
            }
        } catch (loi) { alert("Lỗi đọc file Excel."); }
        finally { event.target.value = ''; }
    };
    reader.readAsArrayBuffer(file);
}

// =========================================================================
// KHỐI 5: LƯU TRỮ DỮ LIỆU PPCT LÊN HỆ THỐNG MÁY CHỦ
// =========================================================================
async function luuDuLieuPPCTLenMayChu(event) {
    const nutBam = event.currentTarget;
    const noiDungGoc = nutBam.innerHTML;
    
    const khoi = document.getElementById('locKhoiPPCT').getAttribute('data-khoi-so');
    const mon = document.getElementById('locMonPPCT').value.trim();
    const tuan = document.getElementById('locTuanUI').value.trim();
    const lop = document.getElementById('locLopPPCT').value.trim();
    
    if (!khoi || !mon || !tuan || !lop) {
        alert("Lỗi: Phải xác định rõ Tuần, Lớp, Môn học trên bộ lọc trước khi Lưu.");
        return;
    }
    
    // Quét toàn bộ lưới giao diện để gom dữ liệu
    let mangGhi = [];
    const cacOInputTiet = document.querySelectorAll('input[data-loai="tietPpc"]');
    
    cacOInputTiet.forEach(inp => {
        let valTiet = inp.value.trim();
        if (valTiet !== '') {
            let idKhoa = inp.getAttribute('data-ppct-id');
            let parts = idKhoa.split('_'); // [Thu, Buoi, Tiet]
            let thu = parts[0]; let buoi = parts[1]; let tietTkb = parts[2];
            
            let valTenBai = document.querySelector(`input[data-ppct-id="${idKhoa}"][data-loai="tenBai"]`).value.trim();
            let valDieuChinh = document.querySelector(`input[data-ppct-id="${idKhoa}"][data-loai="dieuChinh"]`).value.trim();
            
            // Cấu trúc mảng 5 cột: Khối lớp, Tiết theo PPCT, Tên môn học, Tên bài học, Điều chỉnh.
            // Bổ sung thêm data TKB (Tuần, Lớp, Thứ, Buổi, Tiết) để Backend định vị nếu cần cập nhật ngược lại Sổ báo giảng
            mangGhi.push({
                khoi: khoi, 
                tietPpc: valTiet, 
                mon: mon, 
                tenBai: valTenBai, 
                dieuChinh: valDieuChinh,
                thongTinTkb: { tuan: tuan, lop: lop, thu: thu, buoi: buoi, tietTkb: tietTkb }
            });
        }
    });
    
    nutBam.innerHTML = `<div class="flex items-center gap-1.5"><div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span>Đang lưu...</span></div>`;
    nutBam.disabled = true;

    try {
        const payload = { thaoTac: 'luuPPCT', duLieu: mangGhi };
        
        const phanHoi = await fetch(CAU_HINH_FRONTEND.URL_API_MAY_CHU, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const ketQua = await phanHoi.json();
        
        if (ketQua.trangThai === 'Thành công') {
            alert(`Đã lưu tiến độ giảng dạy Môn ${mon} - Tuần ${tuan} lên hệ thống thành công!`);
        } else {
            alert(`Sự cố lưu trữ: ${ketQua.thongBao}`);
        }
    } catch (loi) {
        alert('Lỗi đường truyền mạng hoặc máy chủ không phản hồi.');
    } finally {
        nutBam.innerHTML = noiDungGoc;
        nutBam.disabled = false;
    }
}