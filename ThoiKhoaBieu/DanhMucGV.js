let duLieuDanhMucGV = [];
const TIEU_DE_DM_GV = ['Mã GV', 'Họ Tên', 'Tổ Chuyên Môn', 'Định Mức Tuần', 'Trạng Thái', 'Hộp Thư'];

// =========================================================================
// KHỐI 1: GIAO TIẾP MÁY CHỦ (NÂNG CẤP ĐỘNG CƠ FIREBASE WEBSOCKETS)
// =========================================================================
async function taiDuLieuDanhMucGV() {
    const tbody = document.getElementById('vungDuLieuDanhMucGV');
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-10 text-slate-500 font-bold"><div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>Đang tải Danh mục Giáo viên từ CSDL...</td></tr>`;
    
    try {
        let duLieuS = null;

        if (typeof khoDuLieuRealtime !== 'undefined') {
            // Đọc dữ liệu Master từ Firebase
            const snapshot = await khoDuLieuRealtime.ref('DANH_MUC_GIAO_VIEN_MASTER').once('value');
            duLieuS = snapshot.val();
            
            // Thuật toán Auto-Migration: Kéo từ Google Sheets nếu Firebase rỗng
            if (!duLieuS) {
                console.log("⚡ [Auto-Migration]: Kéo dữ liệu Danh mục Giáo viên từ Google Sheets...");
                const phanHoi = await fetch(`${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=layDanhMucGV`);
                duLieuS = await phanHoi.json();
                if (duLieuS) {
                    await khoDuLieuRealtime.ref('DANH_MUC_GIAO_VIEN_MASTER').set(duLieuS);
                }
            }
        } else {
            // Dự phòng REST API
            const phanHoi = await fetch(`${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=layDanhMucGV`);
            duLieuS = await phanHoi.json();
        }
        
        duLieuDanhMucGV = [];
        if (duLieuS && duLieuS.length > 1) {
            for (let i = 1; i < duLieuS.length; i++) {
                duLieuDanhMucGV.push({
                    maGv: duLieuS[i][0] || '',
                    hoTen: duLieuS[i][1] || '',
                    toChuyenMon: duLieuS[i][2] || '',
                    dinhMuc: duLieuS[i][3] || '',
                    trangThai: duLieuS[i][4] || 'Đang công tác',
                    hopThu: duLieuS[i][5] || '' 
                });
            }
        }
        veBangDanhMucGV();
    } catch (loi) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center py-10 text-red-600 font-bold">Lỗi kết nối máy chủ dữ liệu.</td></tr>`;
        console.error(loi);
    }
}

// =========================================================================
// KHỐI 2: VẼ BẢNG VÀ XỬ LÝ SỰ KIỆN GIAO DIỆN
// =========================================================================
function veBangDanhMucGV() {
    const tbody = document.getElementById('vungDuLieuDanhMucGV');
    if (duLieuDanhMucGV.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center py-10 text-slate-500 font-bold italic">Danh sách đang trống. Hãy thêm giáo viên mới hoặc Nhập từ Excel.</td></tr>`;
        return;
    }

    let html = '';
    duLieuDanhMucGV.forEach((gv, index) => {
        let optionsTrangThai = `
            <option value="Đang công tác" ${gv.trangThai === 'Đang công tác' ? 'selected' : ''}>Đang công tác</option>
            <option value="Nghỉ chế độ" ${gv.trangThai === 'Nghỉ chế độ' ? 'selected' : ''}>Nghỉ chế độ</option>
            <option value="Đã chuyển công tác" ${gv.trangThai === 'Đã chuyển công tác' ? 'selected' : ''}>Đã chuyển công tác</option>
        `;

        html += `
        <tr class="hover:bg-slate-50 transition-colors">
            <td class="py-1 px-2 border border-gray-300 font-bold text-slate-500">${index + 1}</td>
            <td class="p-0 border border-gray-300"><input type="text" value="${gv.maGv}" onchange="capNhatGv(${index}, 'maGv', this.value)" class="w-full h-full min-h-[30px] px-2 outline-none bg-transparent text-center font-bold text-blue-900"></td>
            <td class="p-0 border border-gray-300"><input type="text" value="${gv.hoTen}" onchange="capNhatGv(${index}, 'hoTen', this.value)" class="w-full h-full min-h-[30px] px-2 outline-none bg-transparent text-left font-semibold text-slate-800"></td>
            <td class="p-0 border border-gray-300"><input type="text" value="${gv.hopThu}" onchange="capNhatGv(${index}, 'hopThu', this.value)" class="w-full h-full min-h-[30px] px-2 outline-none bg-transparent text-left font-semibold text-indigo-700 placeholder-indigo-200" placeholder="...@gmail.com"></td>
            <td class="p-0 border border-gray-300"><input type="text" value="${gv.toChuyenMon}" onchange="capNhatGv(${index}, 'toChuyenMon', this.value)" class="w-full h-full min-h-[30px] px-2 outline-none bg-transparent text-center"></td>
            <td class="p-0 border border-gray-300"><input type="number" value="${gv.dinhMuc}" onchange="capNhatGv(${index}, 'dinhMuc', this.value)" class="w-full h-full min-h-[30px] px-2 outline-none bg-transparent text-center font-bold text-purple-700"></td>
            <td class="p-0 border border-gray-300">
                <select onchange="capNhatGv(${index}, 'trangThai', this.value)" class="w-full h-full min-h-[30px] outline-none bg-transparent text-center cursor-pointer ${gv.trangThai === 'Đang công tác' ? 'text-green-700 font-bold' : 'text-gray-500 italic'}">
                    ${optionsTrangThai}
                </select>
            </td>
            <td class="py-1 px-2 border border-gray-300 space-x-1">
                <button onclick="dichChuyenGv(${index}, -1)" title="Lên" class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold p-1 rounded leading-none transition">▲</button>
                <button onclick="dichChuyenGv(${index}, 1)" title="Xuống" class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold p-1 rounded leading-none transition">▼</button>
                <button onclick="xoaGv(${index})" title="Xoá" class="bg-red-100 hover:bg-red-200 text-red-600 font-bold px-2 py-1 rounded leading-none transition ml-1">✕</button>
            </td>
        </tr>`;
    });
    tbody.innerHTML = html;
}

// Hàm vét cạn dữ liệu DOM trước khi lưu (Đảm bảo không mất dữ liệu chưa blur)
function dongBoDomGvSangState() {
    duLieuDanhMucGV = [];
    document.querySelectorAll('#vungDuLieuDanhMucGV tr').forEach(tr => {
        let cacInput = tr.querySelectorAll('input');
        let selectTrangThai = tr.querySelector('select');
        if (cacInput && cacInput.length === 5 && selectTrangThai) {
            duLieuDanhMucGV.push({ 
                maGv: cacInput[0].value, 
                hoTen: cacInput[1].value, 
                hopThu: cacInput[2].value,
                toChuyenMon: cacInput[3].value,
                dinhMuc: cacInput[4].value,
                trangThai: selectTrangThai.value
            });
        }
    });
}

function capNhatGv(index, truong, giaTri) { 
    if (truong === 'maGv') {
        let maMoi = giaTri.trim();
        if (maMoi !== '') {
            let biTrung = duLieuDanhMucGV.some((gv, idx) => idx !== index && gv.maGv.trim().toLowerCase() === maMoi.toLowerCase());
            if (biTrung) {
                alert(`⚠️ LỖI DỮ LIỆU:\nMã giáo viên "${maMoi}" đã tồn tại trong hệ thống. Vui lòng nhập một mã khác để tránh xung đột thuật toán xếp lịch!`);
                veBangDanhMucGV(); 
                return; 
            }
        }
        duLieuDanhMucGV[index][truong] = maMoi; 
    } else {
        duLieuDanhMucGV[index][truong] = giaTri; 
    }
}

function themDongGiaoVienMoi() { 
    dongBoDomGvSangState(); // Đồng bộ trước khi thêm để giữ nguyên thao tác cũ
    duLieuDanhMucGV.push({ maGv: '', hoTen: '', hopThu: '', toChuyenMon: 'Tiểu học', dinhMuc: '', trangThai: 'Đang công tác' }); 
    veBangDanhMucGV(); 
    setTimeout(() => {
        const tbody = document.getElementById('vungDuLieuDanhMucGV');
        if (tbody && tbody.lastElementChild) {
            tbody.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
}

function xoaGv(index) { 
    if (confirm("Đồng chí có chắc chắn muốn xoá giáo viên này khỏi danh mục?")) { 
        dongBoDomGvSangState();
        duLieuDanhMucGV.splice(index, 1); 
        veBangDanhMucGV(); 
    } 
}

function dichChuyenGv(index, huong) {
    if (index + huong < 0 || index + huong >= duLieuDanhMucGV.length) return;
    dongBoDomGvSangState();
    let tam = duLieuDanhMucGV[index];
    duLieuDanhMucGV[index] = duLieuDanhMucGV[index + huong];
    duLieuDanhMucGV[index + huong] = tam;
    veBangDanhMucGV();
}

// =========================================================================
// KHỐI 3: ĐỒNG BỘ DỮ LIỆU LÊN FIREBASE (CROSS-NODE UPDATE)
// =========================================================================
async function luuDuLieuDanhMucGVSangMayChu() {
    const btn = document.querySelector('#khungDanhMucGV button[onclick="luuDuLieuDanhMucGVSangMayChu()"]');
    let textGoc = btn.innerHTML;
    btn.innerHTML = `<div class="flex items-center justify-center gap-1.5 whitespace-nowrap">
                        <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Đang lưu...</span>
                     </div>`;
    btn.disabled = true;

    try {
        dongBoDomGvSangState(); // Vét cạn dữ liệu từ UI trước khi lưu

        let mangGhi = [TIEU_DE_DM_GV]; 
        let dsGiaoVienUpdate = [];
        let dinhMucUpdate = {};

        duLieuDanhMucGV.forEach(gv => {
            let ma = gv.maGv.trim();
            if (ma !== '') {
                mangGhi.push([ma, gv.hoTen, gv.toChuyenMon, gv.dinhMuc, gv.trangThai, gv.hopThu]);
                dsGiaoVienUpdate.push(ma);
                dinhMucUpdate[ma] = parseInt(gv.dinhMuc) || 0;
            }
        });

        if (typeof khoDuLieuRealtime !== 'undefined') {
            // 1. Ghi đè cấu trúc lưới bảng vào nhánh Master
            await khoDuLieuRealtime.ref('DANH_MUC_GIAO_VIEN_MASTER').set(mangGhi);
            
            // 2. Bắn dữ liệu chéo (Cross-Node) để kích hoạt Realtime trên các thiết bị khác
            await khoDuLieuRealtime.ref('CAU_HINH/DANH_SACH_GIAO_VIEN').set(dsGiaoVienUpdate);
            await khoDuLieuRealtime.ref('CAU_HINH/DINH_MUC_GIAO_VIEN').set(dinhMucUpdate);

            alert("✅ Đã đồng bộ Danh mục Giáo viên lên Firebase! Các hộp thoại chọn GV trên toàn hệ thống đã được cập nhật tức thì.");
        } else {
            // Dự phòng REST API
            const payload = { thaoTac: 'luuDanhMucGV', duLieu: mangGhi };
            const phanHoi = await fetch(CAU_HINH_FRONTEND.URL_API_MAY_CHU, { method: 'POST', body: JSON.stringify(payload) });
            const ketQua = await phanHoi.json();
            
            if (ketQua.trangThai === 'Thành công') { alert("Đã đồng bộ Danh mục Giáo viên lên hệ thống an toàn!"); } 
            else { alert("Lỗi từ máy chủ: " + ketQua.thongBao); }
        }
    } catch(loi) { 
        alert("Lỗi kết nối mạng hoặc máy chủ Firebase."); 
        console.error(loi);
    } finally { 
        btn.innerHTML = textGoc; 
        btn.disabled = false; 
    }
}

// =========================================================================
// KHỐI 4: NHẬP XUẤT EXCEL
// =========================================================================
function xuatExcelDanhMucGV() {
    if (typeof XLSX === 'undefined') { alert("Thư viện Excel chưa sẵn sàng."); return; }
    
    dongBoDomGvSangState();
    let mangXuat = [TIEU_DE_DM_GV];
    duLieuDanhMucGV.forEach(gv => { 
        mangXuat.push([gv.maGv, gv.hoTen, gv.toChuyenMon, gv.dinhMuc, gv.trangThai, gv.hopThu]); 
    });
    
    let wb = XLSX.utils.book_new();
    let ws = XLSX.utils.aoa_to_sheet(mangXuat);
    
    ws['!cols'] = [{wch: 10}, {wch: 25}, {wch: 20}, {wch: 15}, {wch: 20}, {wch: 35}];
    XLSX.utils.book_append_sheet(wb, ws, "DM_GIAOVIEN");
    XLSX.writeFile(wb, "DanhMucGiaoVien.xlsx");
}

function nhapExcelDanhMucGV(e) {
    if (typeof XLSX === 'undefined') { 
        alert("Thư viện Excel chưa sẵn sàng. Đồng chí vui lòng thử lại sau vài giây."); 
        return; 
    }
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            
            const duLieuExcel = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

            if (duLieuExcel.length < 2) {
                alert("Bảng Excel trống hoặc thiếu dòng tiêu đề.");
                return;
            }
            
            let ghiDe = confirm("Đồng chí muốn XÓA TRẮNG danh sách hiện tại để nạp mới (OK), hay THÊM NỐI TIẾP vào danh sách cũ (Cancel)?");
            if (ghiDe) duLieuDanhMucGV = []; 
            else dongBoDomGvSangState(); 

            let soGvBiTrung = 0;

            for (let i = 1; i < duLieuExcel.length; i++) {
                let row = duLieuExcel[i];
                let maGvMoi = row[0] ? String(row[0]).trim() : '';
                
                if (maGvMoi !== '') {
                    let biTrung = duLieuDanhMucGV.some(gv => gv.maGv.trim().toLowerCase() === maGvMoi.toLowerCase());
                    if (biTrung && !ghiDe) {
                        soGvBiTrung++;
                        continue; 
                    }

                    let dinhMuc = row[3] !== '' && !isNaN(row[3]) ? parseInt(row[3], 10) : '';

                    duLieuDanhMucGV.push({
                        maGv: maGvMoi,
                        hoTen: row[1] ? String(row[1]).trim() : '',
                        toChuyenMon: row[2] ? String(row[2]).trim() : 'Tiểu học',
                        dinhMuc: dinhMuc,
                        trangThai: row[4] ? String(row[4]).trim() : 'Đang công tác',
                        hopThu: row[5] ? String(row[5]).trim() : ''
                    });
                }
            }
            
            veBangDanhMucGV();
            
            let thongBao = "Nạp dữ liệu từ Excel lên giao diện thành công!";
            if (soGvBiTrung > 0) {
                thongBao += `\nĐã tự động bỏ qua ${soGvBiTrung} giáo viên bị trùng mã.`;
            }
            thongBao += "\nĐồng chí vui lòng kiểm tra lại bảng và bấm 'Lưu Hệ Thống' để đồng bộ.";
            
            alert(thongBao);
        } catch (loi) { 
            alert("Lỗi khi đọc file Excel: " + loi.message); 
        } finally { 
            e.target.value = ''; 
        }
    };
    reader.readAsArrayBuffer(file);
}

// =========================================================================
// KHỐI ĐIỀU HƯỚNG MÀN HÌNH
// =========================================================================
function moTabDanhMucGV() {
    const cacMenu = ['menuTKB', 'menuThongKe', 'menuPhanCong', 'menuKhungChuongTrinh', 'menuDanhMucGV'];
    cacMenu.forEach(id => {
        let m = document.getElementById(id);
        if (m) {
            m.classList.remove('bg-menu-hover', 'border-menu-active');
            m.classList.add('border-transparent');
            let span = m.querySelector('span');
            if (span) { span.classList.remove('text-menu-active'); span.classList.add('text-white'); }
        }
    });
    
    let mActive = document.getElementById('menuDanhMucGV');
    if (mActive) {
        mActive.classList.remove('border-transparent');
        mActive.classList.add('bg-menu-hover', 'border-menu-active');
        let spanActive = mActive.querySelector('span');
        if (spanActive) { spanActive.classList.remove('text-white'); spanActive.classList.add('text-menu-active'); }
    }

    ['khungTKB', 'khungThongKe', 'khungPhanCong', 'khungKhungChuongTrinh', 'khungCaiDat', 'khungDanhMucLop'].forEach(id => {
        let el = document.getElementById(id);
        if (el) { el.classList.remove('block', 'flex'); el.classList.add('hidden'); }
    });
    
    let thanhCongCu = document.getElementById('thanhCongCuTKB');
    if (thanhCongCu) { thanhCongCu.classList.remove('flex'); thanhCongCu.classList.add('hidden'); }

    let khungDmgv = document.getElementById('khungDanhMucGV');
    if (khungDmgv) { khungDmgv.classList.remove('hidden'); khungDmgv.classList.add('flex'); }

    taiDuLieuDanhMucGV();
}
