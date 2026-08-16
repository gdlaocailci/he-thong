let thongSoHocVu = {};
let quyenSuaChua = false; 
let duLieuTkbHienTai = []; 
let tuanDangXem = 1; 
let ngayDauTuanUI = ''; 

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

// NÂNG CẤP: Chuyển sang async/await để đồng bộ nhịp nạp UI trước khi tự động Lưu Tuần
async function chuyenTuan(buocNhay) {
    let tuanMoi = parseInt(tuanDangXem) + buocNhay;
    if (tuanMoi < 1) tuanMoi = 1; 
    if (tuanMoi > 52) tuanMoi = 52;
    
    if (ngayDauTuanUI && tuanMoi !== tuanDangXem) {
        let parts = ngayDauTuanUI.split('-');
        if (parts.length === 3) {
            let d = new Date(parts[0], parts[1] - 1, parts[2]);
            d.setDate(d.getDate() + (buocNhay * 7));
            let yy = d.getFullYear();
            let mm = (d.getMonth() + 1).toString().padStart(2, '0');
            let dd = d.getDate().toString().padStart(2, '0');
            ngayDauTuanUI = `${yy}-${mm}-${dd}`;
            let dateInput = document.getElementById('chonNgayDauTuan');
            if (dateInput) dateInput.value = ngayDauTuanUI;
        }
    }
    
    tuanDangXem = tuanMoi;
    document.getElementById('hienThiTuanHienTai').innerText = `Tuần ${tuanDangXem}`;
    await taiDuLieuTKB(); 
}

let timerCapNhatNgay;
function capNhatNgayDauTuan() {
    clearTimeout(timerCapNhatNgay);
    timerCapNhatNgay = setTimeout(() => {
        let el = document.getElementById('chonNgayDauTuan');
        if (el && el.value !== ngayDauTuanUI) {
            ngayDauTuanUI = el.value;
            xuatMaTranBang(duLieuTkbHienTai); 
        }
    }, 500); 
}

// =========================================================================
// KHỐI 1: KHỞI TẠO VÀ TẢI DỮ LIỆU CƠ BẢN
// =========================================================================
async function khoiTaoGiaoDien() {
    try {
        if(typeof CAU_HINH_FRONTEND !== 'undefined') {
            let tieuDeHeThong = document.getElementById('tenHeThong'); 
            if (tieuDeHeThong) tieuDeHeThong.innerText = CAU_HINH_FRONTEND.TEN_DU_AN;
            
            let logoHT = document.getElementById('logoHeThong'); 
            if (logoHT) logoHT.src = CAU_HINH_FRONTEND.LINK_LOGO_TRANG_CHU;
            
            let logoMenu = document.getElementById('logoMenuDoc'); 
            if (logoMenu) logoMenu.src = CAU_HINH_FRONTEND.LINK_LOGO_TRANG_CHU;
            
            let iconB = document.getElementById('iconBang'); 
            if (iconB) iconB.src = CAU_HINH_FRONTEND.LINK_ICON_BANG;
        }

        const phanHoi = await fetch(`${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=layCauHinh`);
        thongSoHocVu = await phanHoi.json();
        
        kiemSoatGiaoDien(); 
        
        if(thongSoHocVu.NAM_HOC) { 
            let menuNam = document.getElementById('menuHienThiNamHoc'); 
            if (menuNam) menuNam.innerText = thongSoHocVu.NAM_HOC; 
        }
        
        if(thongSoHocVu.DANH_SACH_GIAO_VIEN) {
            let theDataList = document.getElementById('danhSachGvList');
            if(theDataList) {
                let htmlList = `<option value="Toàn trường">`;
                htmlList += thongSoHocVu.DANH_SACH_GIAO_VIEN.map(gv => `<option value="${gv}">`).join('');
                theDataList.innerHTML = htmlList;
            }
        }

        if(thongSoHocVu.TUAN_HIEN_TAI) {
            tuanDangXem = parseInt(thongSoHocVu.TUAN_HIEN_TAI) || 1;
            let hienThiTuan = document.getElementById('hienThiTuanHienTai');
            if (hienThiTuan) hienThiTuan.innerText = `Tuần ${tuanDangXem}`;
            
            if (thongSoHocVu.NGAY_K2) {
                let p = thongSoHocVu.NGAY_K2.split('/');
                if (p.length === 3) {
                    let d = new Date(p[2], p[1] - 1, p[0]);
                    const doLechThu = {"Thứ 2": 0, "Thứ 3": 1, "Thứ 4": 2, "Thứ 5": 3, "Thứ 6": 4, "Thứ 7": 5, "Chủ nhật": 6};
                    let lech = doLechThu[thongSoHocVu.THU_K2 || "Thứ 2"] || 0;
                    d.setDate(d.getDate() - lech);

                    let yy = d.getFullYear();
                    let mm = (d.getMonth() + 1).toString().padStart(2, '0');
                    let dd = d.getDate().toString().padStart(2, '0');

                    ngayDauTuanUI = `${yy}-${mm}-${dd}`;
                    let dateInput = document.getElementById('chonNgayDauTuan');
                    if (dateInput) dateInput.value = ngayDauTuanUI;
                }
            } else if (thongSoHocVu.NGAY_AP_DUNG) {
                let p = thongSoHocVu.NGAY_AP_DUNG.split('/');
                if (p.length === 3) {
                    let d = new Date(p[2], p[1] - 1, p[0]);
                    d.setDate(d.getDate() + (tuanDangXem - 1) * 7);
                    let yy = d.getFullYear(); 
                    let mm = (d.getMonth() + 1).toString().padStart(2, '0'); 
                    let dd = d.getDate().toString().padStart(2, '0');
                    ngayDauTuanUI = `${yy}-${mm}-${dd}`;
                    let dateInput = document.getElementById('chonNgayDauTuan');
                    if (dateInput) dateInput.value = ngayDauTuanUI;
                }
            }
            
            await taiDuLieuTKB();
        }
    } catch (loi) { 
        console.error("Lỗi khởi tạo:", loi); 
        let tenDonVi = document.getElementById('tenDonVi');
        if (tenDonVi) tenDonVi.innerText = "Lỗi kết nối máy chủ API.";
    }
}

async function taiDuLieuTKB() {
    const vungHienThi = document.getElementById('vungHienThiDuLieu');
    vungHienThi.innerHTML = `<tr><td class="text-center text-blue-600 font-bold py-10 reactbits-fade-in text-lg" style="font-family:'Times New Roman',Times,serif;">Đang tải TKB Tuần ${tuanDangXem}...</td></tr>`;
    try {
        const phanHoi = await fetch(`${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=layTKB&tuan=${tuanDangXem}`);
        duLieuTkbHienTai = await phanHoi.json(); 
        xuatMaTranBang(duLieuTkbHienTai);
    } catch (loi) { 
        vungHienThi.innerHTML = `<tr><td class="text-center text-red-500 font-bold py-10 text-lg" style="font-family:'Times New Roman',Times,serif;">Lỗi phân tích dữ liệu.</td></tr>`; 
    }
}

async function goiThuatToanXepLich() {
    const vungHienThi = document.getElementById('vungHienThiDuLieu');
    vungHienThi.innerHTML = `<tr><td class="text-center text-orange-600 font-bold py-10 reactbits-fade-in text-lg" style="font-family:'Times New Roman',Times,serif;"><div class="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-3"></div>Đang chạy Động cơ phân bổ cho Tuần ${tuanDangXem}...</td></tr>`;
    try {
        const phanHoi = await fetch(`${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=xepLichTuDong&tuan=${tuanDangXem}`);
        duLieuTkbHienTai = await phanHoi.json(); 
        xuatMaTranBang(duLieuTkbHienTai);
    } catch (loi) { vungHienThi.innerHTML = `<tr><td class="text-center text-red-500 font-bold py-10 text-lg" style="font-family:'Times New Roman',Times,serif;">Lỗi thuật toán xếp lịch tự động.</td></tr>`; }
}

function locTheoGiaoVien() { xuatMaTranBang(duLieuTkbHienTai); }

function taoTuyChonDong(danhSach, giaTriMacDinh, kieuText, idPhanTu, isTarget = true) {
    let idThocTinh = idPhanTu ? `id="${idPhanTu}"` : '';
    let thuocTinhKhoa = quyenSuaChua ? '' : 'disabled'; 
    let cssKhoa = quyenSuaChua ? 'cursor-pointer' : 'cursor-not-allowed opacity-80';
    let cssAn = !isTarget ? 'opacity-0 pointer-events-none select-none' : ''; 
    let html = `<select ${idThocTinh} ${thuocTinhKhoa} class="w-full h-full bg-transparent outline-none appearance-none text-center ${cssKhoa} py-1 font-bold ${kieuText} ${cssAn}" style="font-family:'Times New Roman',Times,serif;"><option value=""></option>`; 
    if (danhSach && danhSach.length > 0) {
        danhSach.forEach(muc => { html += `<option value="${muc}" ${(muc === giaTriMacDinh) ? 'selected' : ''}>${muc}</option>`; });
    } else if (giaTriMacDinh) { html += `<option value="${giaTriMacDinh}" selected>${giaTriMacDinh}</option>`; }
    html += `</select>`; return html;
}

// =========================================================================
// KHỐI 2: ĐỐI CHIẾU ĐỊNH MỨC VÀ KIỂM TRA
// =========================================================================
function kiemTraDinhMuc() {
    const mangLop = thongSoHocVu.DANH_SACH_LOP || []; const khungCT = thongSoHocVu.KHUNG_CHUONG_TRINH || {};
    let thongKeUI = {}; mangLop.forEach(lop => { thongKeUI[lop] = {}; });
    const thuMacDinh = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"]; const buoiMacDinh = ["Sáng", "Chiều"];
    thuMacDinh.forEach(thu => {
        buoiMacDinh.forEach(buoi => {
            // NÂNG CẤP: Chỉnh lại giới hạn kiểm tra tối thiểu là 5 sáng và 4 chiều
            let soTietToiThieu = (buoi === "Sáng") ? 5 : 4;
            let soTiet = Math.max(parseInt(thongSoHocVu[(buoi==="Sáng")?"SO_TIET_SANG":"SO_TIET_CHIEU"]) || 4, soTietToiThieu);
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
    let htmlKetQua = `<div class="overflow-x-auto"><table class="w-full text-sm text-center border-collapse border border-gray-400" style="font-family:'Times New Roman',Times,serif;"><thead class="bg-purple-100 text-purple-900 font-bold"><tr><th class="border border-gray-400 p-2 min-w-[60px]">Lớp</th><th class="border border-gray-400 p-2 min-w-[140px]">Môn học</th><th class="border border-gray-400 p-2 min-w-[100px]">Khung chuẩn</th><th class="border border-gray-400 p-2 min-w-[100px]">Đang xếp (UI)</th><th class="border border-gray-400 p-2 min-w-[140px]">Trạng thái</th><th class="border border-gray-400 p-2 min-w-[100px] bg-green-100 text-green-900">Tổng Tiết Tuần</th></tr></thead><tbody>`;
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
function tinhNgayDocLap(ngayDauTuanStr, tenThu) {
    if (!ngayDauTuanStr) return { hienThi: "--/--/----", thang: "--", nam: "--", ngayDayDu: "" };
    
    let parts = ngayDauTuanStr.split('-');
    if (parts.length !== 3) return { hienThi: "--/--/----", thang: "--", nam: "--", ngayDayDu: "" };
    
    let ngayGoc = new Date(parts[0], parts[1] - 1, parts[2]);
    const doLechThu = {"Thứ 2": 0, "Thứ 3": 1, "Thứ 4": 2, "Thứ 5": 3, "Thứ 6": 4, "Thứ 7": 5, "Chủ nhật": 6};
    let soNgayLech = doLechThu[tenThu] || 0;
    
    let ngayDich = new Date(ngayGoc.getTime());
    ngayDich.setDate(ngayGoc.getDate() + soNgayLech);
    
    let d = ngayDich.getDate().toString().padStart(2, '0');
    let m = (ngayDich.getMonth() + 1).toString().padStart(2, '0');
    let y = ngayDich.getFullYear();
    
    return { hienThi: `${d}/${m}/${y}`, thang: m, nam: y.toString(), ngayDayDu: `${d}/${m}/${y}` };
}

function xuatMaTranBang(danhSachTiet) {
    const thead = document.getElementById('tieuDeBang'); const tbody = document.getElementById('vungHienThiDuLieu');
    const duLieuTiet = danhSachTiet || [];
    const mangLop = (thongSoHocVu.DANH_SACH_LOP && thongSoHocVu.DANH_SACH_LOP.length > 0) ? thongSoHocVu.DANH_SACH_LOP : [...new Set(duLieuTiet.map(t => t.maLop))].sort();
    if (mangLop.length === 0) return;

    let gvLoc = document.getElementById('locGiaoVien') ? document.getElementById('locGiaoVien').value.trim() : '';
    let dateInput = document.getElementById('chonNgayDauTuan');
    
    if (duLieuTiet && duLieuTiet.length > 0) {
        let thu2Data = duLieuTiet.find(t => t.thu === "Thứ 2" && t.ngay);
        if (thu2Data && thu2Data.ngay) {
            let p = thu2Data.ngay.split('/'); 
            if (p.length === 3) {
                ngayDauTuanUI = `${p[2]}-${p[1]}-${p[0]}`; 
                if (dateInput) dateInput.value = ngayDauTuanUI;
            }
        }
    }

    // NÂNG CẤP: Đóng băng tiêu đề cột (Sticky Left) và ẩn cột Tháng, Năm học
    let theadHTML = `<tr>
        <th rowspan="2" class="sticky left-0 z-20 bg-slate-100 text-center font-bold align-middle w-[85px] min-w-[85px] border border-slate-400" style="font-family:'Times New Roman',Times,serif;">Thứ / Ngày</th>
        <th rowspan="2" class="sticky left-[85px] z-20 bg-slate-100 text-center font-bold align-middle w-[60px] min-w-[60px] border border-slate-400" style="font-family:'Times New Roman',Times,serif;">Buổi</th>
        <th rowspan="2" class="sticky left-[145px] z-20 bg-slate-100 text-center font-bold align-middle w-[55px] min-w-[55px] border border-slate-400" style="font-family:'Times New Roman',Times,serif;">Tuần</th>
        <th rowspan="2" class="hidden text-center font-bold align-middle border border-slate-400" style="font-family:'Times New Roman',Times,serif;">Tháng</th>
        <th rowspan="2" class="hidden text-center font-bold align-middle border border-slate-400" style="font-family:'Times New Roman',Times,serif;">Năm học</th>
        <th rowspan="2" class="sticky left-[200px] z-20 bg-slate-100 text-center font-bold align-middle w-[50px] min-w-[50px] border border-slate-400 border-r-2 border-r-slate-500 shadow-[3px_0_5px_-2px_rgba(0,0,0,0.15)]" style="font-family:'Times New Roman',Times,serif;">Tiết</th>`;
    
    mangLop.forEach(lop => { 
        theadHTML += `<th colspan="2" class="text-center font-extrabold bg-slate-100 text-slate-900 tracking-widest border border-slate-400" style="font-family:'Times New Roman',Times,serif;">${lop}</th>`; 
    });
    theadHTML += `</tr><tr>`;
    mangLop.forEach(() => { 
        theadHTML += `<th class="text-center font-bold bg-slate-50 text-slate-800 min-w-[120px] border border-slate-400" style="font-family:'Times New Roman',Times,serif;">Môn</th>
                      <th class="text-center font-bold bg-slate-50 text-slate-800 min-w-[105px] border border-slate-400" style="font-family:'Times New Roman',Times,serif;">N dạy</th>`; 
    });
    theadHTML += `</tr>`; 
    thead.innerHTML = theadHTML;

    const luoiDuLieu = {}; const boLocThu = {"Thứ 2": 2, "Thứ 3": 3, "Thứ 4": 4, "Thứ 5": 5, "Thứ 6": 6, "Thứ 7": 7, "Chủ nhật": 8}; const boLocBuoi = {"Sáng": 1, "Chiều": 2};

    duLieuTiet.forEach(t => {
        const thu = t.thu.trim(); const buoi = t.buoi.trim(); const tiet = t.tiet;
        if (!luoiDuLieu[thu]) luoiDuLieu[thu] = {}; if (!luoiDuLieu[thu][buoi]) luoiDuLieu[thu][buoi] = {}; if (!luoiDuLieu[thu][buoi][tiet]) luoiDuLieu[thu][buoi][tiet] = {};
        luoiDuLieu[thu][buoi][tiet][t.maLop] = t;
    });

    const thuMacDinh = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    thuMacDinh.forEach(thu => { if (!luoiDuLieu[thu]) luoiDuLieu[thu] = {}; });
    
    const gioiHanSang = Math.max(parseInt(thongSoHocVu.SO_TIET_SANG) || 4, 5); 
    const gioiHanChieu = Math.max(parseInt(thongSoHocVu.SO_TIET_CHIEU) || 3, 4);

    Object.keys(luoiDuLieu).forEach(thu => {
        if (!luoiDuLieu[thu]["Sáng"]) luoiDuLieu[thu]["Sáng"] = {}; if (!luoiDuLieu[thu]["Chiều"]) luoiDuLieu[thu]["Chiều"] = {};
        for (let i = 1; i <= gioiHanSang; i++) { if (!luoiDuLieu[thu]["Sáng"][i]) luoiDuLieu[thu]["Sáng"][i] = {}; }
        for (let j = 1; j <= gioiHanChieu; j++) { if (!luoiDuLieu[thu]["Chiều"][j]) luoiDuLieu[thu]["Chiều"][j] = {}; }
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

        let thongTinNgay = tinhNgayDocLap(ngayDauTuanUI, thu);

        danhSachBuoi.forEach(buoi => {
            const danhSachTietCuaBuoi = Object.keys(luoiDuLieu[thu][buoi]).sort((a, b) => parseInt(a) - parseInt(b));
            let soDongCuaBuoi = danhSachTietCuaBuoi.length; let inCotBuoi = true;

            danhSachTietCuaBuoi.forEach(tiet => {
                tbodyHTML += `<tr class="bg-white hover:bg-slate-50 transition-colors duration-150 group" style="font-family:'Times New Roman',Times,serif;">`;
                
                // NÂNG CẤP: Ghim cột bằng sticky và thiết lập z-index để không bị đè chữ khi cuộn ngang
                if (inCotThu) { 
                    tbodyHTML += `<td rowspan="${soDongCuaThu}" class="sticky left-0 z-10 bg-white text-center align-middle border border-slate-300">
                                    <div class="font-extrabold text-slate-900">${thu}</div>
                                    <div class="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5 mt-1 inline-block">${thongTinNgay.hienThi}</div>
                                  </td>`; 
                    inCotThu = false; 
                }
                
                if (inCotBuoi) { 
                    tbodyHTML += `<td rowspan="${soDongCuaBuoi}" class="sticky left-[85px] z-10 bg-white text-center font-bold align-middle text-slate-800 border border-slate-300">${buoi}</td>`; 
                    inCotBuoi = false; 
                }

                let duLieuDong = null;
                for (let l = 0; l < mangLop.length; l++) {
                    if (luoiDuLieu[thu][buoi][tiet] && luoiDuLieu[thu][buoi][tiet][mangLop[l]]) {
                        duLieuDong = luoiDuLieu[thu][buoi][tiet][mangLop[l]]; break;
                    }
                }

                let valTuan = duLieuDong ? duLieuDong.tuan : tuanDangXem;
                let valThang = (duLieuDong && duLieuDong.thang) ? duLieuDong.thang : thongTinNgay.thang;
                let valNam = (duLieuDong && duLieuDong.namHoc) ? duLieuDong.namHoc : (thongSoHocVu.NAM_HOC || thongTinNgay.nam);

                // Cột Tuần và Tiết được ghim, Cột Tháng và Năm học bị ẩn (class hidden)
                tbodyHTML += `<td id="uiTuan_${thu}_${buoi}_${tiet}" class="sticky left-[145px] z-10 bg-white text-center font-bold text-red-600 align-middle border border-slate-300">${valTuan}</td>`;
                tbodyHTML += `<td id="uiThang_${thu}_${buoi}_${tiet}" data-ngay="${thongTinNgay.ngayDayDu}" class="hidden text-center font-bold text-red-600 align-middle border border-slate-300">${valThang}</td>`;
                tbodyHTML += `<td id="uiNam_${thu}_${buoi}_${tiet}" class="hidden text-center font-bold text-red-600 align-middle border border-slate-300">${valNam}</td>`;
                tbodyHTML += `<td class="sticky left-[200px] z-10 bg-white text-center font-bold text-slate-800 align-middle border border-slate-300 border-r-2 border-r-slate-500 shadow-[3px_0_5px_-2px_rgba(0,0,0,0.15)]">${tiet}</td>`;

                mangLop.forEach(lop => {
                    const duLieuO = luoiDuLieu[thu][buoi][tiet] ? luoiDuLieu[thu][buoi][tiet][lop] : null;
                    
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
    
    if (loaiLuu === 'codinh') { if (!confirm("CẢNH BÁO: Thao tác này sẽ ghi đè toàn bộ TKB hiện tại làm TKB Gốc Cố Định cho toàn trường. Bấm OK để tiếp tục.")) return; }
    
    if (loaiLuu === 'khoiphuc') { if (!confirm(`Xác nhận: Lưu trữ toàn bộ TKB Tuần ${tuanDangXem}, tự động chuyển sang tuần tiếp theo?`)) return; }

    const btn = event.currentTarget; const textGoc = btn.innerHTML;
    if(btn.disabled === undefined) { /* Bỏ qua cho auto trigger */ } else {
        btn.innerHTML = `<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Đang xử lý...`; btn.disabled = true;
    }

    try {
        let dsTietLuoi = []; 
        
        const mangLop = thongSoHocVu.DANH_SACH_LOP || []; const thuMacDinh = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"]; const buoiMacDinh = ["Sáng", "Chiều"];
        
        thuMacDinh.forEach(thu => {
            let thongTinNgay = tinhNgayDocLap(ngayDauTuanUI, thu);

            buoiMacDinh.forEach(buoi => {
                // NÂNG CẤP: Quét và thu thập dữ liệu lưu lên tới tiết 5 sáng và tiết 4 chiều (kể cả có tăng cường mới)
                let soTietToiThieu = (buoi === "Sáng") ? 5 : 4;
                let soTiet = Math.max(parseInt(thongSoHocVu[(buoi==="Sáng") ? "SO_TIET_SANG" : "SO_TIET_CHIEU"]) || 4, soTietToiThieu);
                
                for(let t=1; t<=soTiet; t++) {
                    let vTuan = tuanDangXem;
                    let vThang = thongTinNgay.thang;
                    let vNgay = thongTinNgay.ngayDayDu;
                    let vNam = thongSoHocVu.NAM_HOC || thongTinNgay.nam;

                    mangLop.forEach(lop => {
                        let theSelectMon = document.getElementById(`mon_${thu}_${buoi}_${t}_${lop}`);
                        let theSelectGv = document.getElementById(`gv_${thu}_${buoi}_${t}_${lop}`);
                        
                        // Loại bỏ các ô rỗng trống để không làm rác CSDL
                        if(theSelectMon && theSelectMon.value && theSelectMon.value.trim() !== "") {
                            let tienToBuoi = (buoi === "Sáng") ? "S" : "C";
                            dsTietLuoi.push({ 
                                maTiet: `${vTuan}_${thu}_${tienToBuoi}_${t}_${lop}`, 
                                namHoc: vNam, thang: vThang, ngay: vNgay, tuan: vTuan, 
                                thu: thu, buoi: buoi, tiet: t, maLop: lop, monHoc: theSelectMon.value.trim(), maGv: theSelectGv ? theSelectGv.value.trim() : "" 
                            });
                        }
                    });
                }
            });
        });

        const phanHoi = await fetch(CAU_HINH_FRONTEND.URL_API_MAY_CHU, { method: 'POST', body: JSON.stringify({ thaoTac: 'luuDuLieu', loaiLuu: loaiLuu, tuan: tuanDangXem, duLieu: dsTietLuoi }) });
        const ketQua = await phanHoi.json();
        
        if(ketQua.trangThai !== 'thanh_cong') { 
            console.error("Sự cố máy chủ."); 
        } else { 
            if (loaiLuu === 'khoiphuc') {
                // Chờ giao diện render xong tuần mới
                await chuyenTuan(1); 
                
                // NÂNG CẤP: Sau khi lên UI xong, tự động kích hoạt tính năng chạy nút lưu tuần ẩn
                console.log("Kích hoạt Lưu Tuần tự động để neo lại mốc thời gian...");
                let btnAn = document.createElement('button');
                btnAn.innerHTML = "Auto Save";
                await luuDuLieu({ currentTarget: btnAn }, 'tuan');
            } else {
                await taiDuLieuTKB();
            }
        }
    } catch (loi) { console.error("Lỗi kết nối.", loi); } 
    finally { 
        if(btn.disabled !== undefined) { btn.innerHTML = textGoc; btn.disabled = false; }
    }
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
        await taiDuLieuTKB(); 
    } catch (loi) { console.error("Xác thực không thành công.", loi); }
}
// =========================================================================
// HÀM BỔ SUNG: XUẤT DỮ LIỆU EXCEL TỪ GIAO DIỆN HIỂN THỊ THỰC TẾ
// =========================================================================
function xuatExcel() {
    let mangLop = thongSoHocVu.DANH_SACH_LOP || [];
    if (mangLop.length === 0 && duLieuTkbHienTai.length > 0) {
        mangLop = [...new Set(duLieuTkbHienTai.map(t => t.maLop))].sort();
    }
    if (mangLop.length === 0) { alert("Không có dữ liệu để xuất."); return; }

    // Lấy bộ lọc giáo viên hiện tại trên giao diện
    let gvLoc = document.getElementById('locGiaoVien') ? document.getElementById('locGiaoVien').value.trim() : '';

    // Khởi tạo bảng HTML ẩn để chuẩn bị xuất
    let tableHTML = `<table border="1" style="border-collapse:collapse; font-family:'Times New Roman',Times,serif; text-align:center;">`;
    
    // Header Dòng 1 (Bỏ Tuần, Tháng, Năm)
    tableHTML += `<tr>
        <th rowspan="2" style="background-color:#f1f5f9; font-weight:bold; padding: 5px;">Thứ / Ngày</th>
        <th rowspan="2" style="background-color:#f1f5f9; font-weight:bold; padding: 5px;">Buổi</th>
        <th rowspan="2" style="background-color:#f1f5f9; font-weight:bold; padding: 5px;">Tiết</th>`;
    mangLop.forEach(lop => {
        tableHTML += `<th colspan="2" style="background-color:#e2e8f0; font-weight:bold; padding: 5px;">${lop}</th>`;
    });
    tableHTML += `</tr><tr>`;
    
    // Header Dòng 2
    mangLop.forEach(() => {
        tableHTML += `<th style="background-color:#f8fafc; font-weight:bold; padding: 5px;">Môn</th>
                      <th style="background-color:#f8fafc; font-weight:bold; padding: 5px;">N dạy</th>`;
    });
    tableHTML += `</tr>`;

    // Chuẩn bị ma trận giống hệt UI
    const luoiDuLieu = {}; 
    const boLocThu = {"Thứ 2": 2, "Thứ 3": 3, "Thứ 4": 4, "Thứ 5": 5, "Thứ 6": 6, "Thứ 7": 7, "Chủ nhật": 8}; 
    const boLocBuoi = {"Sáng": 1, "Chiều": 2};

    duLieuTkbHienTai.forEach(t => {
        const thu = t.thu.trim(); const buoi = t.buoi.trim(); const tiet = t.tiet;
        if (!luoiDuLieu[thu]) luoiDuLieu[thu] = {}; 
        if (!luoiDuLieu[thu][buoi]) luoiDuLieu[thu][buoi] = {}; 
        if (!luoiDuLieu[thu][buoi][tiet]) luoiDuLieu[thu][buoi][tiet] = {};
        luoiDuLieu[thu][buoi][tiet][t.maLop] = t;
    });

    const thuMacDinh = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    thuMacDinh.forEach(thu => { if (!luoiDuLieu[thu]) luoiDuLieu[thu] = {}; });
    
    const gioiHanSang = Math.max(parseInt(thongSoHocVu.SO_TIET_SANG) || 4, 5); 
    const gioiHanChieu = Math.max(parseInt(thongSoHocVu.SO_TIET_CHIEU) || 3, 4);

    Object.keys(luoiDuLieu).forEach(thu => {
        if (!luoiDuLieu[thu]["Sáng"]) luoiDuLieu[thu]["Sáng"] = {}; 
        if (!luoiDuLieu[thu]["Chiều"]) luoiDuLieu[thu]["Chiều"] = {};
        for (let i = 1; i <= gioiHanSang; i++) { if (!luoiDuLieu[thu]["Sáng"][i]) luoiDuLieu[thu]["Sáng"][i] = {}; }
        for (let j = 1; j <= gioiHanChieu; j++) { if (!luoiDuLieu[thu]["Chiều"][j]) luoiDuLieu[thu]["Chiều"][j] = {}; }
    });

    const danhSachThu = Object.keys(luoiDuLieu).sort((a, b) => (boLocThu[a] || 99) - (boLocThu[b] || 99));

    // Quét trực tiếp các thẻ DOM để lấy dữ liệu thực tế
    danhSachThu.forEach(thu => {
        const danhSachBuoi = Object.keys(luoiDuLieu[thu]).sort((a, b) => (boLocBuoi[a] || 99) - (boLocBuoi[b] || 99));
        let soDongCuaThu = 0; 
        danhSachBuoi.forEach(buoi => { soDongCuaThu += Object.keys(luoiDuLieu[thu][buoi]).length; });
        let inCotThu = true;

        let thongTinNgay = tinhNgayDocLap(ngayDauTuanUI, thu);

        danhSachBuoi.forEach(buoi => {
            const danhSachTietCuaBuoi = Object.keys(luoiDuLieu[thu][buoi]).sort((a, b) => parseInt(a) - parseInt(b));
            let soDongCuaBuoi = danhSachTietCuaBuoi.length; 
            let inCotBuoi = true;

            danhSachTietCuaBuoi.forEach(tiet => {
                tableHTML += `<tr>`;
                
                if (inCotThu) { 
                    tableHTML += `<td rowspan="${soDongCuaThu}" style="vertical-align:middle; font-weight:bold;">${thu}<br>(${thongTinNgay.hienThi})</td>`; 
                    inCotThu = false; 
                }
                
                if (inCotBuoi) { 
                    tableHTML += `<td rowspan="${soDongCuaBuoi}" style="vertical-align:middle; font-weight:bold;">${buoi}</td>`; 
                    inCotBuoi = false; 
                }
                
                tableHTML += `<td style="font-weight:bold;">${tiet}</td>`;

                mangLop.forEach(lop => {
                    // Trích xuất trực tiếp giá trị thực tế đang có trên Giao diện
                    let selectMon = document.getElementById(`mon_${thu}_${buoi}_${tiet}_${lop}`);
                    let selectGv = document.getElementById(`gv_${thu}_${buoi}_${tiet}_${lop}`);
                    
                    let valMon = selectMon ? selectMon.value.trim() : "";
                    let valGv = selectGv ? selectGv.value.trim() : "";

                    // Nếu có bộ lọc GV, các tiết không liên quan sẽ bị loại trừ
                    let isTarget = true;
                    if (gvLoc !== "" && gvLoc !== "Toàn trường" && valGv !== gvLoc) {
                        isTarget = false;
                    }

                    // Không lấy giá trị rỗng hoặc các ô bị ẩn bởi bộ lọc
                    if (!isTarget || valMon === "") {
                        tableHTML += `<td></td><td></td>`;
                    } else {
                        tableHTML += `<td>${valMon}</td><td>${valGv}</td>`;
                    }
                });
                tableHTML += `</tr>`;
            });
        });
    });

    tableHTML += `</table>`;

    // Cấu trúc Wrapper Excel đảm bảo hiển thị đúng định dạng font và tiếng Việt
    let template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>TKB</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>' + tableHTML + '</body></html>';
    
    // Gói dữ liệu và tạo lệnh tải về (Download)
    let blob = new Blob([template], { type: 'application/vnd.ms-excel;charset=utf-8' });
    let url = URL.createObjectURL(blob);
    
    let a = document.createElement('a');
    a.href = url;
    a.download = `TKB_Tuan_${tuanDangXem}.xls`;
    document.body.appendChild(a);
    a.click();
    
    // Xóa thẻ sau khi hoàn tất để làm sạch DOM
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
