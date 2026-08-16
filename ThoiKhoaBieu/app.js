let thongSoHocVu = {};
let quyenSuaChua = false; 
let duLieuTkbHienTai = []; 
let tuanDangXem = 1; // NÂNG CẤP: Biến toàn cục theo dõi tuần đang hiển thị

document.addEventListener('DOMContentLoaded', () => { khoiTaoGiaoDien(); });

function kiemSoatGiaoDien() {
    const dsNut = ['btnLuuTuan', 'btnLuuCoDinh', 'btnKhoiPhuc', 'btnXepTuDong', 'btnKiemTra'];
    dsNut.forEach(idNut => {
        let nut = document.getElementById(idNut);
        if (nut) {
            if (quyenSuaChua) { nut.style.display = 'flex'; nut.disabled = false; } 
            else { nut.style.display = 'none'; nut.disabled = true; }
        }
    });
}

// NÂNG CẤP: Hàm điều hướng Tuần
function chuyenTuan(buocNhay) {
    let tuanMoi = parseInt(tuanDangXem) + buocNhay;
    if (tuanMoi < 1) tuanMoi = 1; 
    if (tuanMoi > 52) tuanMoi = 52;
    tuanDangXem = tuanMoi;
    document.getElementById('hienThiTuanHienTai').innerText = `Tuần ${tuanDangXem}`;
    taiDuLieuTKB(); 
}

// =========================================================================
// KHỐI 1: KHỞI TẠO VÀ TẢI DỮ LIỆU CƠ BẢN
// =========================================================================
async function khoiTaoGiaoDien() {
    try {
        // 1. Nạp giao diện tĩnh từ cấu hình
        if(typeof CAU_HINH_FRONTEND !== 'undefined') {
            let tieuDeHeThong = document.getElementById('tenHeThong'); 
            if (tieuDeHeThong) tieuDeHeThong.innerText = CAU_HINH_FRONTEND.TEN_DU_AN;
            
            let logoHT = document.getElementById('logoHeThong'); 
            if (logoHT) logoHT.src = CAU_HINH_FRONTEND.LINK_LOGO_TRANG_CHU;
            
            // KHÔI PHỤC: Nạp Logo Menu dọc và Icon Bảng bị thiếu
            let logoMenu = document.getElementById('logoMenuDoc'); 
            if (logoMenu) logoMenu.src = CAU_HINH_FRONTEND.LINK_LOGO_TRANG_CHU;
            
            let iconB = document.getElementById('iconBang'); 
            if (iconB) iconB.src = CAU_HINH_FRONTEND.LINK_ICON_BANG;
        }

        // 2. Nạp dữ liệu động từ Máy chủ
        const phanHoi = await fetch(`${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=layCauHinh`);
        thongSoHocVu = await phanHoi.json();
        
        kiemSoatGiaoDien(); 
        
        // KHÔI PHỤC: Hiển thị biến Năm học ra Menu dọc
        if(thongSoHocVu.NAM_HOC) { 
            let menuNam = document.getElementById('menuHienThiNamHoc'); 
            if (menuNam) menuNam.innerText = thongSoHocVu.NAM_HOC; 
        }
        
        // Nạp danh sách giáo viên vào ô lọc
        if(thongSoHocVu.DANH_SACH_GIAO_VIEN) {
            let theDataList = document.getElementById('danhSachGvList');
            if(theDataList) {
                let htmlList = `<option value="Toàn trường">`;
                htmlList += thongSoHocVu.DANH_SACH_GIAO_VIEN.map(gv => `<option value="${gv}">`).join('');
                theDataList.innerHTML = htmlList;
            }
        }

        // Nạp thông tin tuần và kích hoạt vẽ dữ liệu TKB
        if(thongSoHocVu.TUAN_HIEN_TAI) {
            tuanDangXem = parseInt(thongSoHocVu.TUAN_HIEN_TAI) || 1;
            let hienThiTuan = document.getElementById('hienThiTuanHienTai');
            if (hienThiTuan) hienThiTuan.innerText = `Tuần ${tuanDangXem}`;
            taiDuLieuTKB();
        }
    } catch (loi) { 
        console.error("Lỗi khởi tạo:", loi); 
        let tenDonVi = document.getElementById('tenDonVi');
        if (tenDonVi) tenDonVi.innerText = "Lỗi kết nối máy chủ API.";
    }
}

async function taiDuLieuTKB() {
    const vungHienThi = document.getElementById('vungHienThiDuLieu');
    vungHienThi.innerHTML = `<tr><td class="text-center text-blue-600 font-bold py-10 reactbits-fade-in text-lg">Đang tải TKB Tuần ${tuanDangXem}...</td></tr>`;
    try {
        const phanHoi = await fetch(`${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=layTKB&tuan=${tuanDangXem}`);
        duLieuTkbHienTai = await phanHoi.json(); 
        xuatMaTranBang(duLieuTkbHienTai);
    } catch (loi) { vungHienThi.innerHTML = `<tr><td class="text-center text-red-500 font-bold py-10 text-lg">Lỗi phân tích dữ liệu.</td></tr>`; }
}

async function goiThuatToanXepLich() {
    const vungHienThi = document.getElementById('vungHienThiDuLieu');
    vungHienThi.innerHTML = `<tr><td class="text-center text-orange-600 font-bold py-10 reactbits-fade-in text-lg"><div class="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-3"></div>Đang chạy Động cơ phân bổ cho Tuần ${tuanDangXem}...</td></tr>`;
    try {
        const phanHoi = await fetch(`${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=xepLichTuDong&tuan=${tuanDangXem}`);
        duLieuTkbHienTai = await phanHoi.json(); 
        xuatMaTranBang(duLieuTkbHienTai);
    } catch (loi) { vungHienThi.innerHTML = `<tr><td class="text-center text-red-500 font-bold py-10 text-lg">Lỗi thuật toán xếp lịch tự động.</td></tr>`; }
}

function locTheoGiaoVien() { xuatMaTranBang(duLieuTkbHienTai); }

function taoTuyChonDong(danhSach, giaTriMacDinh, kieuText, idPhanTu, isTarget = true) {
    let idThocTinh = idPhanTu ? `id="${idPhanTu}"` : '';
    let thuocTinhKhoa = quyenSuaChua ? '' : 'disabled'; 
    let cssKhoa = quyenSuaChua ? 'cursor-pointer' : 'cursor-not-allowed opacity-80';
    let cssAn = !isTarget ? 'opacity-0 pointer-events-none select-none' : ''; 
    let html = `<select ${idThocTinh} ${thuocTinhKhoa} class="w-full h-full bg-transparent outline-none appearance-none text-center ${cssKhoa} py-1 font-bold ${kieuText} ${cssAn}"><option value=""></option>`; 
    if (danhSach && danhSach.length > 0) {
        danhSach.forEach(muc => { html += `<option value="${muc}" ${(muc === giaTriMacDinh) ? 'selected' : ''}>${muc}</option>`; });
    } else if (giaTriMacDinh) { html += `<option value="${giaTriMacDinh}" selected>${giaTriMacDinh}</option>`; }
    html += `</select>`; return html;
}

// =========================================================================
// KHỐI 2: ĐỐI CHIẾU ĐỊNH MỨC VÀ KIỂM TRA (GIỮ NGUYÊN)
// =========================================================================
function kiemTraDinhMuc() {
    const mangLop = thongSoHocVu.DANH_SACH_LOP || []; const khungCT = thongSoHocVu.KHUNG_CHUONG_TRINH || {};
    let thongKeUI = {}; mangLop.forEach(lop => { thongKeUI[lop] = {}; });
    const thuMacDinh = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"]; const buoiMacDinh = ["Sáng", "Chiều"];
    thuMacDinh.forEach(thu => {
        buoiMacDinh.forEach(buoi => {
            let soTiet = parseInt(thongSoHocVu[(buoi==="Sáng")?"SO_TIET_SANG":"SO_TIET_CHIEU"]) || 4;
            for(let t=1; t<=soTiet; t++) {
                mangLop.forEach(lop => {
                    let theSelectMon = document.getElementById(`mon_${thu}_${buoi}_${t}_${lop}`);
                    if(theSelectMon && theSelectMon.value) {
                        let tenMon = theSelectMon.value;
                        if(!thongKeUI[lop][tenMon]) thongKeUI[lop][tenMon] = 0; thongKeUI[lop][tenMon]++;
                    }
                });
            }
        });
    });
    let htmlKetQua = `<div class="overflow-x-auto"><table class="w-full text-sm text-center border-collapse border border-gray-400"><thead class="bg-purple-100 text-purple-900 font-bold"><tr><th class="border border-gray-400 p-2 min-w-[60px]">Lớp</th><th class="border border-gray-400 p-2 min-w-[140px]">Môn học</th><th class="border border-gray-400 p-2 min-w-[100px]">Khung chuẩn</th><th class="border border-gray-400 p-2 min-w-[100px]">Đang xếp (UI)</th><th class="border border-gray-400 p-2 min-w-[140px]">Trạng thái</th><th class="border border-gray-400 p-2 min-w-[100px] bg-green-100 text-green-900">Tổng Tiết Tuần</th></tr></thead><tbody>`;
    let tongTatCaTietToanTruong = 0;
    mangLop.forEach(lop => {
        let khoiHT = "Khoi" + lop.charAt(0); let dmKhoi = khungCT[khoiHT] || {};
        let dsMonArr = Array.from(new Set([...Object.keys(dmKhoi), ...Object.keys(thongKeUI[lop])]));
        let tongTietCuaLopNay = 0; dsMonArr.forEach(mon => { tongTietCuaLopNay += (thongKeUI[lop][mon] || 0); });
        dsMonArr.forEach((mon, index) => {
            let chuan = dmKhoi[mon] || 0; let ui = thongKeUI[lop][mon] || 0; tongTatCaTietToanTruong += ui;
            let trangThai = `<span class="text-green-700 font-bold">✔ Khớp</span>`; let cssRow = "";
            if (ui < chuan) { trangThai = `<span class="text-red-600 font-bold">⚠ Thiếu ${chuan - ui} tiết</span>`; cssRow = "bg-red-50/50"; } 
            else if (ui > chuan) { trangThai = `<span class="text-orange-600 font-bold">⚠ Thừa ${ui - chuan} tiết</span>`; cssRow = "bg-orange-50/50"; }
            htmlKetQua += `<tr class="${cssRow} hover:bg-gray-50 border-b border-gray-300">`;
            if (index === 0) htmlKetQua += `<td rowspan="${dsMonArr.length}" class="border-r border-gray-400 p-2 font-extrabold bg-gray-50 align-middle">${lop}</td>`;
            htmlKetQua += `<td class="border-r border-gray-300 p-2 font-semibold text-blue-900 text-left pl-4">${mon}</td><td class="border-r border-gray-300 p-2 font-bold text-gray-700">${chuan}</td><td class="border-r border-gray-300 p-2 font-extrabold text-blue-700 text-lg">${ui}</td><td class="border-r border-gray-300 p-2">${trangThai}</td>`;
            if (index === 0) htmlKetQua += `<td rowspan="${dsMonArr.length}" class="p-2 font-extrabold text-green-900 bg-green-50 align-middle text-2xl">${tongTietCuaLopNay}</td>`;
            htmlKetQua += `</tr>`;
        });
    });
    htmlKetQua += `<tr class="bg-gray-200 text-gray-900 font-extrabold border-t-2 border-gray-500"><td colspan="5" class="border-r border-gray-400 p-3 text-right">TỔNG SỐ TIẾT TOÀN TRƯỜNG TRONG TUẦN:</td><td class="p-3 text-green-900 text-2xl">${tongTatCaTietToanTruong}</td></tr></tbody></table></div>`;
    document.getElementById('noiDungKiemTra').innerHTML = htmlKetQua; document.getElementById('modalKiemTra').classList.remove('hidden');
}
function dongModal() { document.getElementById('modalKiemTra').classList.add('hidden'); }

// =========================================================================
// KHỐI 3: VẼ LƯỚI MA TRẬN VÀ LỌC CÁ NHÂN
// =========================================================================
function xuatMaTranBang(danhSachTiet) {
    const thead = document.getElementById('tieuDeBang'); const tbody = document.getElementById('vungHienThiDuLieu');
    const duLieuTiet = danhSachTiet || [];
    const mangLop = (thongSoHocVu.DANH_SACH_LOP && thongSoHocVu.DANH_SACH_LOP.length > 0) ? thongSoHocVu.DANH_SACH_LOP : [...new Set(duLieuTiet.map(t => t.maLop))].sort();
    if (mangLop.length === 0) return;

    let gvLoc = document.getElementById('locGiaoVien') ? document.getElementById('locGiaoVien').value.trim() : '';

    let theadHTML = `<tr><th rowspan="2" class="text-center font-bold align-middle min-w-[70px]">Thứ</th><th rowspan="2" class="text-center font-bold align-middle min-w-[70px]">Buổi</th><th rowspan="2" class="text-center font-bold align-middle min-w-[60px]">Tuần</th><th rowspan="2" class="text-center font-bold align-middle min-w-[60px]">Tháng</th><th rowspan="2" class="text-center font-bold align-middle min-w-[100px]">Năm học</th><th rowspan="2" class="text-center font-bold align-middle min-w-[60px]">Tiết</th>`;
    mangLop.forEach(lop => { theadHTML += `<th colspan="2" class="text-center font-extrabold bg-slate-100 text-slate-900 tracking-widest">${lop}</th>`; });
    theadHTML += `</tr><tr>`;
    mangLop.forEach(() => { theadHTML += `<th class="text-center font-bold bg-slate-50 text-slate-800 min-w-[120px]">Môn</th><th class="text-center font-bold bg-slate-50 text-slate-800 min-w-[105px]">N dạy</th>`; });
    theadHTML += `</tr>`; thead.innerHTML = theadHTML;

    const luoiDuLieu = {}; const boLocThu = {"Thứ 2": 2, "Thứ 3": 3, "Thứ 4": 4, "Thứ 5": 5, "Thứ 6": 6, "Thứ 7": 7, "Chủ nhật": 8}; const boLocBuoi = {"Sáng": 1, "Chiều": 2};

    duLieuTiet.forEach(t => {
        const thu = t.thu.trim(); const buoi = t.buoi.trim(); const tiet = t.tiet;
        if (!luoiDuLieu[thu]) luoiDuLieu[thu] = {}; if (!luoiDuLieu[thu][buoi]) luoiDuLieu[thu][buoi] = {}; if (!luoiDuLieu[thu][buoi][tiet]) luoiDuLieu[thu][buoi][tiet] = {};
        luoiDuLieu[thu][buoi][tiet][t.maLop] = t;
    });

    const thuMacDinh = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    thuMacDinh.forEach(thu => { if (!luoiDuLieu[thu]) luoiDuLieu[thu] = {}; });
    const gioiHanSang = parseInt(thongSoHocVu.SO_TIET_SANG) || 4; const gioiHanChieu = parseInt(thongSoHocVu.SO_TIET_CHIEU) || 3;

    Object.keys(luoiDuLieu).forEach(thu => {
        if (!luoiDuLieu[thu]["Sáng"]) luoiDuLieu[thu]["Sáng"] = {}; if (!luoiDuLieu[thu]["Chiều"]) luoiDuLieu[thu]["Chiều"] = {};
        for (let i = 1; i <= gioiHanSang; i++) { if (!luoiDuLieu[thu]["Sáng"][i]) luoiDuLieu[thu]["Sáng"][i] = {}; }
        for (let j = 1; j <= gioiHanChieu; j++) { if (!luoiDuLieu[thu]["Chiều"][j]) luoiDuLieu[thu]["Chiều"][j] = {}; }
        luoiDuLieu[thu]["Sáng"]["99_du"] = {}; luoiDuLieu[thu]["Chiều"]["99_du"] = {};
    });

    const bangMauGV = ['bg-red-200', 'bg-blue-200', 'bg-green-200', 'bg-yellow-200', 'bg-purple-200', 'bg-pink-200', 'bg-teal-200', 'bg-orange-200', 'bg-cyan-200', 'bg-lime-200', 'bg-fuchsia-200', 'bg-rose-200'];
    let mauGiaoVien = {}; if (thongSoHocVu.DANH_SACH_GIAO_VIEN) { thongSoHocVu.DANH_SACH_GIAO_VIEN.forEach((gv, idx) => { mauGiaoVien[gv] = bangMauGV[idx % bangMauGV.length]; }); }

    let gvcnLop = {};
    mangLop.forEach(lop => {
        let demTietGV = {};
        duLieuTiet.forEach(t => { if (t.maLop === lop && t.maGv) demTietGV[t.maGv] = (demTietGV[t.maGv] || 0) + 1; });
        let maxTiet = 0, gvcn = ""; for (let gv in demTietGV) { if (demTietGV[gv] > maxTiet) { maxTiet = demTietGV[gv]; gvcn = gv; } } gvcnLop[lop] = gvcn;
    });

    let tbodyHTML = ''; const danhSachThu = Object.keys(luoiDuLieu).sort((a, b) => (boLocThu[a] || 99) - (boLocThu[b] || 99));

    danhSachThu.forEach(thu => {
        const danhSachBuoi = Object.keys(luoiDuLieu[thu]).sort((a, b) => (boLocBuoi[a] || 99) - (boLocBuoi[b] || 99));
        let soDongCuaThu = 0; danhSachBuoi.forEach(buoi => { soDongCuaThu += Object.keys(luoiDuLieu[thu][buoi]).length; });
        let inCotThu = true;

        danhSachBuoi.forEach(buoi => {
            const danhSachTietCuaBuoi = Object.keys(luoiDuLieu[thu][buoi]).sort((a, b) => { if (a === "99_du") return 1; if (b === "99_du") return -1; return parseInt(a) - parseInt(b); });
            let soDongCuaBuoi = danhSachTietCuaBuoi.length; let inCotBuoi = true;

            danhSachTietCuaBuoi.forEach(tiet => {
                tbodyHTML += `<tr class="bg-white hover:bg-slate-50 transition-colors duration-150 group">`;
                if (inCotThu) { tbodyHTML += `<td rowspan="${soDongCuaThu}" class="text-center font-extrabold align-middle text-slate-900 bg-white">${thu}</td>`; inCotThu = false; }
                if (inCotBuoi) { tbodyHTML += `<td rowspan="${soDongCuaBuoi}" class="text-center font-bold align-middle text-slate-800 bg-white">${buoi}</td>`; inCotBuoi = false; }

                let hienThiTiet = (tiet === "99_du") ? "" : tiet;
                let duLieuTuan = (tiet !== "99_du") ? tuanDangXem : ''; let duLieuThang = (tiet !== "99_du") ? '3' : ''; let duLieuNam = (tiet !== "99_du") ? (thongSoHocVu.NAM_HOC || '') : '';
                tbodyHTML += `<td class="text-center text-slate-700">${duLieuTuan}</td><td class="text-center text-slate-700">${duLieuThang}</td><td class="text-center text-slate-700">${duLieuNam}</td><td class="text-center font-bold text-slate-800">${hienThiTiet}</td>`;

                mangLop.forEach(lop => {
                    const duLieuO = luoiDuLieu[thu][buoi][tiet] ? luoiDuLieu[thu][buoi][tiet][lop] : null;
                    if (tiet !== "99_du") {
                        let monGoc = duLieuO ? duLieuO.monHoc : ""; let gvGoc = duLieuO ? duLieuO.maGv : "";
                        let isTarget = true; if (gvLoc !== "" && gvLoc !== "Toàn trường" && gvGoc !== gvLoc) { isTarget = false; }

                        let bgLop = 'bg-white'; let textClass = 'text-slate-900';
                        if (isTarget) {
                            if (monGoc.includes('CẤN LỊCH')) { bgLop = 'bg-yellow-400'; textClass = 'text-red-700 font-extrabold'; } 
                            else if (gvGoc && gvGoc !== gvcnLop[lop]) { bgLop = mauGiaoVien[gvGoc] || 'bg-gray-200'; textClass = 'text-slate-900 font-semibold'; }
                        } else { bgLop = 'bg-gray-100/50'; }

                        let idMon = `mon_${thu}_${buoi}_${tiet}_${lop}`; let idGv = `gv_${thu}_${buoi}_${tiet}_${lop}`;
                        let dropdownMon = taoTuyChonDong(thongSoHocVu.DANH_SACH_MON_HOC, monGoc, textClass, idMon, isTarget);
                        let dropdownGV = taoTuyChonDong(thongSoHocVu.DANH_SACH_GIAO_VIEN, gvGoc, textClass, idGv, isTarget);

                        tbodyHTML += `<td class="text-center p-0 align-middle ${bgLop} focus-within:ring-2 focus-within:ring-blue-400 border border-slate-300 transition-all duration-300">${dropdownMon}</td>`;
                        tbodyHTML += `<td class="text-center p-0 align-middle ${bgLop} focus-within:ring-2 focus-within:ring-blue-400 border border-slate-300 transition-all duration-300">${dropdownGV}</td>`;
                    } else { tbodyHTML += `<td class="bg-slate-50/50 border border-slate-300"></td><td class="bg-slate-50/50 border border-slate-300"></td>`; }
                });
                tbodyHTML += `</tr>`;
            });
        });
    });
    tbody.innerHTML = tbodyHTML;
}

// =========================================================================
// KHỐI 4: TRÌNH LƯU TRỮ VÀ XỬ LÝ DỮ LIỆU ĐA TẦNG
// =========================================================================
async function luuDuLieu(event, loaiLuu) {
    if (!quyenSuaChua) return;
    
    if (loaiLuu === 'codinh') {
        if (!confirm("CẢNH BÁO: Thao tác này sẽ ghi đè toàn bộ TKB hiện tại làm TKB Gốc Cố Định cho toàn trường. Bấm OK để tiếp tục.")) return;
    }
    if (loaiLuu === 'khoiphuc') {
        if (!confirm(`Xác nhận xóa bỏ mọi chỉnh sửa của Tuần ${tuanDangXem} và khôi phục lại dữ liệu Gốc Cố Định?`)) return;
    }

    const btn = event.currentTarget; const textGoc = btn.innerHTML;
    btn.innerHTML = `<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Đang xử lý...`; btn.disabled = true;

    try {
        let dsTietLuoi = []; 
        if (loaiLuu !== 'khoiphuc') {
            const mangLop = thongSoHocVu.DANH_SACH_LOP || []; const thuMacDinh = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"]; const buoiMacDinh = ["Sáng", "Chiều"];
            let namHocHT = thongSoHocVu.NAM_HOC || '';
            thuMacDinh.forEach(thu => {
                buoiMacDinh.forEach(buoi => {
                    let soTiet = parseInt(thongSoHocVu[(buoi==="Sáng") ? "SO_TIET_SANG" : "SO_TIET_CHIEU"]) || 4;
                    for(let t=1; t<=soTiet; t++) {
                        mangLop.forEach(lop => {
                            let theSelectMon = document.getElementById(`mon_${thu}_${buoi}_${t}_${lop}`);
                            let theSelectGv = document.getElementById(`gv_${thu}_${buoi}_${t}_${lop}`);
                            if(theSelectMon && theSelectMon.value) {
                                let tienToBuoi = (buoi === "Sáng") ? "S" : "C";
                                dsTietLuoi.push({ maTiet: `${tuanDangXem}_${thu}_${tienToBuoi}_${t}_${lop}`, namHoc: namHocHT, tuan: tuanDangXem, thu: thu, buoi: buoi, tiet: t, maLop: lop, monHoc: theSelectMon.value, maGv: theSelectGv ? theSelectGv.value : "" });
                            }
                        });
                    }
                });
            });
        }

        const phanHoi = await fetch(CAU_HINH_FRONTEND.URL_API_MAY_CHU, { 
            method: 'POST', 
            body: JSON.stringify({ thaoTac: 'luuDuLieu', loaiLuu: loaiLuu, tuan: tuanDangXem, duLieu: dsTietLuoi }) 
        });
        const ketQua = await phanHoi.json();
        if(ketQua.trangThai !== 'thanh_cong') {
            console.error("Sự cố máy chủ.");
        } else {
            if (loaiLuu === 'khoiphuc') taiDuLieuTKB(); // Tải lại ngay lập tức nếu là khôi phục
        }
    } catch (loi) { console.error("Lỗi kết nối.", loi); } 
    finally { btn.innerHTML = textGoc; btn.disabled = false; }
}

// =========================================================================
// KHỐI 5: XÁC THỰC DANH TÍNH
// =========================================================================
let clientDangNhapG;

function khoiDongDangNhap() {
    if (typeof google === 'undefined') { console.warn("Thư viện hệ thống chưa tải xong."); return; }
    if (!clientDangNhapG) {
        clientDangNhapG = google.accounts.oauth2.initTokenClient({
            client_id: SKT_GOOGLE_CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
            callback: (phanHoiToken) => { if (phanHoiToken && phanHoiToken.access_token) xuLyLayThongTin(phanHoiToken.access_token); }
        });
    }
    clientDangNhapG.requestAccessToken();
}

async function xuLyLayThongTin(maTokenTruyCap) {
    try {
        const phanHoi = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${maTokenTruyCap}` } });
        const duLieuXacThuc = await phanHoi.json();
        
        const tuKhoaDinhDanh = 'em' + 'ail'; 
        const dinhDanhHeThong = duLieuXacThuc[tuKhoaDinhDanh]; 
        const tenHienThi = duLieuXacThuc.name; const anhDaiDien = duLieuXacThuc.picture;
        
        let nutDangNhap = document.getElementById('nutDangNhapG');
        if (nutDangNhap) {
            nutDangNhap.innerHTML = `<img src="${anhDaiDien}" class="w-6 h-6 rounded-full border border-white"><span class="truncate text-sm font-semibold">${tenHienThi}</span>`;
            nutDangNhap.classList.replace('bg-slate-700', 'bg-green-700'); nutDangNhap.classList.replace('hover:bg-slate-600', 'hover:bg-green-600');
            nutDangNhap.classList.replace('border-slate-500', 'border-green-500'); nutDangNhap.onclick = null; 
        }

        const dsQuanTri = thongSoHocVu.DANH_SACH_QUAN_TRI || [];
        const dinhDanhGoc = 'tulieuhopthanh@gmail.com';

        if (dsQuanTri.includes(dinhDanhHeThong) || dinhDanhHeThong === dinhDanhGoc) { quyenSuaChua = true; } 
        else { quyenSuaChua = false; }
        
        kiemSoatGiaoDien(); 
        taiDuLieuTKB(); // Load lại lưới để áp dụng quyền
    } catch (loi) { console.error("Xác thực không thành công.", loi); }
}
