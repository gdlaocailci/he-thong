let dsThamSo = [];
let dsQuanTri = [];
const TIEU_DE_CAI_DAT = ['MaThamSo', 'GiaTri', 'GhiChu', '', 'Quyền Admin'];

// =========================================================================
// KHỐI 1: GIAO TIẾP MÁY CHỦ (NÂNG CẤP ĐỘNG CƠ FIREBASE WEBSOCKETS)
// =========================================================================
async function taiDuLieuCaiDatHeThong() {
    const tbThamSo = document.getElementById('vungThamSo');
    const tbQuanTri = document.getElementById('vungQuanTri');
    
    tbThamSo.innerHTML = `<tr><td colspan="3" class="text-center py-10 font-bold text-slate-500"><div class="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>Đang kết nối cơ sở dữ liệu...</td></tr>`;
    tbQuanTri.innerHTML = `<tr><td colspan="2" class="text-center py-10 font-bold text-slate-500"><div class="w-6 h-6 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-2"></div>Đang tải cấu hình Admin...</td></tr>`;

    try {
        let duLieu = null;

        if (typeof khoDuLieuRealtime !== 'undefined') {
            // [NÂNG CẤP LÕI]: Đọc dữ liệu Cài đặt từ Firebase
            const snapshot = await khoDuLieuRealtime.ref('CAI_DAT').once('value');
            duLieu = snapshot.val();
            
            // Thuật toán Auto-Migration: Nếu Firebase chưa có, kéo từ Google Sheets sang
            if (!duLieu) {
                console.log("⚡ [Auto-Migration]: Kéo dữ liệu Cài Đặt Hệ Thống từ Google Sheets...");
                const phanHoi = await fetch(`${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=layCaiDat`);
                duLieu = await phanHoi.json();
                if (duLieu && !duLieu.trangThai) {
                    await khoDuLieuRealtime.ref('CAI_DAT').set(duLieu);
                }
            }
        } else {
            // Dự phòng REST API nếu mất kết nối Firebase
            const phanHoi = await fetch(`${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=layCaiDat`);
            duLieu = await phanHoi.json();
        }
        
        dsThamSo = []; dsQuanTri = [];
        
        if (duLieu && duLieu.length > 1) {
            for (let i = 1; i < duLieu.length; i++) {
                let r = duLieu[i];
                if (r[0] && String(r[0]).trim() !== '') {
                    dsThamSo.push({ maThamSo: String(r[0]).trim(), giaTri: r[1] !== undefined ? String(r[1]).trim() : '', ghiChu: r[2] !== undefined ? String(r[2]).trim() : '' });
                }
                if (r[4] && String(r[4]).trim() !== '') {
                    dsQuanTri.push(String(r[4]).trim());
                }
            }
        }
        veGiaoDienThamSo(); veGiaoDienQuanTri();
    } catch (loi) { 
        console.error("Lỗi tải cài đặt:", loi); 
        tbThamSo.innerHTML = `<tr><td colspan="3" class="text-center py-10 font-bold text-red-500">Lỗi kết nối dữ liệu.</td></tr>`;
        tbQuanTri.innerHTML = `<tr><td colspan="2" class="text-center py-10 font-bold text-red-500">Lỗi kết nối dữ liệu.</td></tr>`;
    }
}

// =========================================================================
// KHỐI 2: KHỞI TẠO VÀ XỬ LÝ LƯỚI GIAO DIỆN (GIỮ NGUYÊN BẢN 100%)
// =========================================================================
function veGiaoDienThamSo() {
    const tbody = document.getElementById('vungThamSo');
    let html = '';
    dsThamSo.forEach((ts, idx) => {
        let chuMoGiaTri = '';
        let classChuMo = '';
        
        if (ts.maThamSo.trim() === 'TRANG_THAI_WEB') {
            chuMoGiaTri = 'placeholder="Hoạt động/Bảo trì"';
            classChuMo = 'placeholder:text-gray-400 placeholder:italic placeholder:font-normal';
        }

        html += `<tr class="hover:bg-slate-50">
            <td class="p-0 border border-gray-300"><input type="text" value="${ts.maThamSo}" readonly class="w-full h-full min-h-[35px] px-2 outline-none bg-transparent font-extrabold text-blue-900 text-left uppercase cursor-not-allowed"></td>
            <td class="p-0 border border-gray-300"><input type="text" ${chuMoGiaTri} value="${ts.giaTri}" onchange="capNhatThamSo(${idx}, 'giaTri', this.value)" class="w-full h-full min-h-[35px] px-2 outline-none bg-transparent text-center font-bold text-slate-800 ${classChuMo}"></td>
            <td class="p-0 border border-gray-300"><input type="text" value="${ts.ghiChu}" onchange="capNhatThamSo(${idx}, 'ghiChu', this.value)" class="w-full h-full min-h-[35px] px-2 outline-none bg-transparent text-left italic text-gray-600"></td>
        </tr>`;
    });
    tbody.innerHTML = html;
}

function veGiaoDienQuanTri() {
    const tbody = document.getElementById('vungQuanTri');
    let html = '';
    dsQuanTri.forEach((qt, idx) => {
        html += `<tr class="hover:bg-slate-50">
            <td class="p-0 border border-gray-300"><input type="text" value="${qt}" onchange="capNhatQuanTri(${idx}, this.value)" class="w-full h-full min-h-[35px] px-2 outline-none bg-transparent text-left font-bold text-purple-800"></td>
            <td class="p-1 border border-gray-300">
                <button onclick="xoaQuanTri(${idx})" title="Xoá" class="bg-red-100 hover:bg-red-200 text-red-600 font-bold px-2 py-1.5 rounded transition shadow-sm">✕</button>
            </td>
        </tr>`;
    });
    tbody.innerHTML = html;
}

// =========================================================================
// KHỐI ĐỒNG BỘ & THAO TÁC CÀI ĐẶT
// =========================================================================

function dongBoDomSangState() {
    dsThamSo = [];
    document.querySelectorAll('#vungThamSo tr').forEach(tr => {
        let cacInput = tr.querySelectorAll('input');
        if (cacInput && cacInput.length === 3) {
            dsThamSo.push({ 
                maThamSo: cacInput[0].value, 
                giaTri: cacInput[1].value, 
                ghiChu: cacInput[2].value 
            });
        }
    });
    
    dsQuanTri = [];
    document.querySelectorAll('#vungQuanTri tr').forEach(tr => {
        let input = tr.querySelector('input');
        if (input) {
            dsQuanTri.push(input.value);
        }
    });
}

function capNhatThamSo(idx, truong, giaTri) { dsThamSo[idx][truong] = giaTri; }

function capNhatQuanTri(idx, giaTri) { dsQuanTri[idx] = giaTri; }
function themDongQuanTri() { dongBoDomSangState(); dsQuanTri.push(''); veGiaoDienQuanTri(); }
function xoaQuanTri(idx) { if(confirm("Hủy quyền Admin của tài khoản này?")) { dongBoDomSangState(); dsQuanTri.splice(idx, 1); veGiaoDienQuanTri(); } }

async function luuCaiDatSangMayChu() {
    const btn = document.querySelector('#khungCaiDat button[onclick="luuCaiDatSangMayChu()"]');
    let textGoc = btn.innerHTML;
    btn.innerHTML = `<div class="flex items-center gap-1.5"><div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Đang lưu...</div>`; 
    btn.disabled = true;

    try {
        dongBoDomSangState();

        let mangGhi = [TIEU_DE_CAI_DAT]; // ['MaThamSo', 'GiaTri', 'GhiChu', '', 'Quyền Admin']
        let soDongMax = Math.max(dsThamSo.length, dsQuanTri.length);

        for (let i = 0; i < soDongMax; i++) {
            let ts = dsThamSo[i] || { maThamSo: '', giaTri: '', ghiChu: '' };
            let qt = dsQuanTri[i] || '';
            
            if(ts.maThamSo.trim() !== '' || qt.trim() !== '') {
                mangGhi.push([ts.maThamSo.trim(), ts.giaTri.trim(), ts.ghiChu.trim(), '', qt.trim()]);
            }
        }

        if (typeof khoDuLieuRealtime !== 'undefined') {
            // [NÂNG CẤP LÕI]: Lưu dữ liệu cấu hình thô
            await khoDuLieuRealtime.ref('CAI_DAT').set(mangGhi);
            
            // [CÔNG NGHỆ CHÉO]: Update ngược trở lại node CAU_HINH (Để app.js nhận thay đổi Real-time ngay lập tức)
            let objCauHinhUpdate = { DANH_SACH_QUAN_TRI: [] };
            for (let i = 1; i < mangGhi.length; i++) {
                if (mangGhi[i][0]) objCauHinhUpdate[mangGhi[i][0]] = mangGhi[i][1];
                if (mangGhi[i][4]) objCauHinhUpdate.DANH_SACH_QUAN_TRI.push(mangGhi[i][4]);
            }
            await khoDuLieuRealtime.ref('CAU_HINH').update(objCauHinhUpdate);

            alert("✅ Đã lưu Cấu hình hệ thống lên Firebase thành công! Các thông số đã có hiệu lực ngay lập tức."); 
        } else {
            const payload = { thaoTac: 'luuCaiDat', duLieu: mangGhi };
            const phanHoi = await fetch(CAU_HINH_FRONTEND.URL_API_MAY_CHU, { method: 'POST', body: JSON.stringify(payload) });
            const ketQua = await phanHoi.json();
            
            if (ketQua.trangThai === 'Thành công') { 
                alert("Đã lưu Cấu hình hệ thống thành công! Vui lòng tải lại trang (F5) để các thông số mới có hiệu lực."); 
            } else { alert("Lỗi từ máy chủ: " + ketQua.thongBao); }
        }
    } catch(loi) { 
        alert("Lỗi kết nối mạng hoặc CSDL."); 
        console.error(loi);
    } finally { 
        btn.innerHTML = textGoc; btn.disabled = false; 
    }
}

// =========================================================================
// KHỐI ĐIỀU HƯỚNG MÀN HÌNH
// =========================================================================
function moTabCaiDat() {
    const cacMenu = ['menuTKB', 'menuThongKe', 'menuPhanCong', 'menuKhungChuongTrinh', 'menuDanhMucGV', 'menuCaiDat'];
    cacMenu.forEach(id => {
        let m = document.getElementById(id);
        if (m) {
            m.classList.remove('bg-menu-hover', 'border-menu-active');
            m.classList.add('border-transparent');
            let span = m.querySelector('span');
            if (span) { span.classList.remove('text-menu-active'); span.classList.add('text-white'); }
        }
    });
    
    let mActive = document.getElementById('menuCaiDat');
    if (mActive) {
        mActive.classList.remove('border-transparent');
        mActive.classList.add('bg-menu-hover', 'border-menu-active');
        let spanActive = mActive.querySelector('span');
        if (spanActive) { spanActive.classList.remove('text-white'); spanActive.classList.add('text-menu-active'); }
    }

    ['khungTKB', 'khungThongKe', 'khungPhanCong', 'khungKhungChuongTrinh', 'khungDanhMucGV'].forEach(id => {
        let el = document.getElementById(id);
        if (el) { el.classList.remove('block', 'flex'); el.classList.add('hidden'); }
    });
    
    let thanhCongCu = document.getElementById('thanhCongCuTKB');
    if (thanhCongCu) { thanhCongCu.classList.remove('flex'); thanhCongCu.classList.add('hidden'); }

    let khungCD = document.getElementById('khungCaiDat');
    if (khungCD) { khungCD.classList.remove('hidden'); khungCD.classList.add('flex'); }

    taiDuLieuCaiDatHeThong();
}
