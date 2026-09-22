let duLieuDanhMucLop = [];
const TIEU_DE_DM_LOP = ['MaLop', 'TenLop'];

// =========================================================================
// KHỐI 1: GIAO TIẾP MÁY CHỦ (NÂNG CẤP ĐỘNG CƠ FIREBASE WEBSOCKETS)
// =========================================================================
async function taiDuLieuDanhMucLop() {
    const tbody = document.getElementById('vungDuLieuDanhMucLop');
    tbody.innerHTML = `<tr><td colspan="4" class="text-center py-10 text-slate-500 font-bold"><div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>Đang tải Danh mục Lớp từ CSDL...</td></tr>`;
    
    try {
        let duLieuS = null;

        if (typeof khoDuLieuRealtime !== 'undefined') {
            // [NÂNG CẤP LÕI]: Đọc dữ liệu Master từ Firebase
            const snapshot = await khoDuLieuRealtime.ref('DANH_MUC_LOP_MASTER').once('value');
            duLieuS = snapshot.val();

            // Thuật toán Auto-Migration: Kéo từ Google Sheets nếu Firebase rỗng
            if (!duLieuS) {
                console.log("⚡ [Auto-Migration]: Kéo dữ liệu Danh mục Lớp từ Google Sheets...");
                const phanHoi = await (typeof fetchVoiCoCheThuLai === 'function' ? fetchVoiCoCheThuLai(`${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=layDanhMucLop`) : fetch(`${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=layDanhMucLop`));
                duLieuS = await phanHoi.json();
                if (duLieuS) {
                    await khoDuLieuRealtime.ref('DANH_MUC_LOP_MASTER').set(duLieuS);
                }
            }
        } else {
            // Dự phòng REST API
            const phanHoi = await (typeof fetchVoiCoCheThuLai === 'function' ? fetchVoiCoCheThuLai(`${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=layDanhMucLop`) : fetch(`${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=layDanhMucLop`));
            duLieuS = await phanHoi.json();
        }
        
        duLieuDanhMucLop = [];
        if (duLieuS && duLieuS.length > 1) {
            for (let i = 1; i < duLieuS.length; i++) {
                duLieuDanhMucLop.push({
                    maLop: duLieuS[i][0] !== undefined ? String(duLieuS[i][0]).trim() : '',
                    tenLop: duLieuS[i][1] !== undefined ? String(duLieuS[i][1]).trim() : ''
                });
            }
        }
        veBangDanhMucLop();
    } catch (loi) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-10 text-red-600 font-bold">
            ⚠️ Lỗi kết nối máy chủ dữ liệu.<br>
            <span class="text-sm font-normal text-slate-500">Hệ thống đang bận hoặc gián đoạn mạng. Vui lòng thử lại.</span>
        </td></tr>`;
        console.error(loi);
    }
}

// =========================================================================
// KHỐI 2: VẼ BẢNG VÀ XỬ LÝ SỰ KIỆN GIAO DIỆN
// =========================================================================
function veBangDanhMucLop() {
    const tbody = document.getElementById('vungDuLieuDanhMucLop');
    if (duLieuDanhMucLop.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-10 text-slate-500 font-bold italic">Danh sách đang trống. Hãy thêm lớp học mới.</td></tr>`;
        return;
    }

    let html = '';
    duLieuDanhMucLop.forEach((lop, index) => {
        html += `
        <tr class="hover:bg-slate-50 transition-colors">
            <td class="py-1 px-2 border border-gray-300 font-bold text-slate-500">${index + 1}</td>
            <td class="p-0 border border-gray-300"><input type="text" value="${lop.maLop}" onchange="capNhatLop(${index}, 'maLop', this.value)" class="w-full h-full min-h-[35px] px-2 outline-none bg-transparent text-center font-extrabold text-blue-900 uppercase"></td>
            <td class="p-0 border border-gray-300"><input type="text" value="${lop.tenLop}" onchange="capNhatLop(${index}, 'tenLop', this.value)" class="w-full h-full min-h-[35px] px-2 outline-none bg-transparent text-center font-bold text-slate-800 uppercase"></td>
            <td class="py-1 px-2 border border-gray-300 space-x-1">
                <button onclick="diChuyenLop(${index}, -1)" title="Lên" class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold p-1.5 rounded leading-none transition">▲</button>
                <button onclick="diChuyenLop(${index}, 1)" title="Xuống" class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold p-1.5 rounded leading-none transition">▼</button>
                <button onclick="xoaLop(${index})" title="Xoá" class="bg-red-100 hover:bg-red-200 text-red-600 font-bold px-3 py-1.5 rounded leading-none transition ml-1">✕</button>
            </td>
        </tr>`;
    });
    tbody.innerHTML = html;
}

// Logic thao tác dòng & Đồng bộ state từ DOM
function dongBoDomLopSangState() {
    duLieuDanhMucLop = [];
    document.querySelectorAll('#vungDuLieuDanhMucLop tr').forEach(tr => {
        let cacInput = tr.querySelectorAll('input');
        if (cacInput && cacInput.length === 2) {
            duLieuDanhMucLop.push({ 
                maLop: cacInput[0].value, 
                tenLop: cacInput[1].value 
            });
        }
    });
}

function capNhatLop(index, truong, giaTri) { 
    if (truong === 'maLop') {
        let maMoi = giaTri.trim().toUpperCase();
        if (maMoi !== '') {
            let biTrung = duLieuDanhMucLop.some((lop, idx) => idx !== index && lop.maLop.trim().toUpperCase() === maMoi);
            if (biTrung) {
                alert(`⚠️ LỖI DỮ LIỆU:\nMã lớp "${maMoi}" đã tồn tại. Vui lòng nhập mã khác!`);
                veBangDanhMucLop(); return; 
            }
        }
        duLieuDanhMucLop[index][truong] = maMoi;
        // Tự động điền Tên Lớp nếu đang trống
        if (duLieuDanhMucLop[index].tenLop.trim() === '') {
            duLieuDanhMucLop[index].tenLop = maMoi;
            veBangDanhMucLop();
        }
    } else {
        duLieuDanhMucLop[index][truong] = giaTri.trim().toUpperCase(); 
    }
}

function themDongLopMoi() { dongBoDomLopSangState(); duLieuDanhMucLop.push({ maLop: '', tenLop: '' }); veBangDanhMucLop(); }
function xoaLop(index) { if (confirm("Đồng chí chắc chắn muốn xoá lớp này khỏi hệ thống?")) { dongBoDomLopSangState(); duLieuDanhMucLop.splice(index, 1); veBangDanhMucLop(); } }
function diChuyenLop(index, huong) {
    if (index + huong < 0 || index + huong >= duLieuDanhMucLop.length) return;
    dongBoDomLopSangState();
    let tam = duLieuDanhMucLop[index];
    duLieuDanhMucLop[index] = duLieuDanhMucLop[index + huong];
    duLieuDanhMucLop[index + huong] = tam;
    veBangDanhMucLop();
}

// =========================================================================
// KHỐI 3: ĐỒNG BỘ DỮ LIỆU LÊN FIREBASE (CROSS-NODE UPDATE)
// =========================================================================
async function luuDuLieuDanhMucLopSangMayChu() {
    const btn = document.querySelector('#khungDanhMucLop button[onclick="luuDuLieuDanhMucLopSangMayChu()"]');
    let textGoc = btn.innerHTML;
    btn.innerHTML = `<div class="flex items-center justify-center gap-1.5 whitespace-nowrap"><div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> <span>Đang lưu...</span></div>`; 
    btn.disabled = true;

    try {
        dongBoDomLopSangState(); // Vét cạn dữ liệu DOM
        let mangGhi = [TIEU_DE_DM_LOP]; 
        let dsLopUpdate = []; // Dành cho Cross-node Update

        duLieuDanhMucLop.forEach(lop => {
            if (lop.maLop.trim() !== '') {
                mangGhi.push([lop.maLop.trim(), lop.tenLop.trim()]);
                dsLopUpdate.push(lop.maLop.trim());
            }
        });

        if (typeof khoDuLieuRealtime !== 'undefined') {
            // 1. Ghi đè cấu trúc lưới bảng vào nhánh Master
            await khoDuLieuRealtime.ref('DANH_MUC_LOP_MASTER').set(mangGhi);
            
            // 2. Bắn dữ liệu chéo (Cross-Node) để kích hoạt Realtime trên các module khác
            await khoDuLieuRealtime.ref('CAU_HINH/DANH_SACH_LOP').set(dsLopUpdate);

            alert("✅ Đã đồng bộ Danh mục Lớp lên Firebase! Lưới Thời khóa biểu và Khung chương trình đã tự động cập nhật cấu trúc.");
            
            // Xóa Cache cục bộ để ép các module khác tái tạo cấu trúc khi người dùng chuyển Tab
            if (typeof thongSoHocVu !== 'undefined') thongSoHocVu.DANH_SACH_LOP = dsLopUpdate;
            if (typeof duLieuBangKCT !== 'undefined') duLieuBangKCT = []; 
            if (typeof danhSachGV !== 'undefined') danhSachGV = []; 
            if (typeof duLieuTkbHienTai !== 'undefined') duLieuTkbHienTai = []; 
        } else {
            // Dự phòng REST API
            const payload = { thaoTac: 'luuDanhMucLop', duLieu: mangGhi };
            const phanHoi = await (typeof fetchVoiCoCheThuLai === 'function' ? 
                fetchVoiCoCheThuLai(CAU_HINH_FRONTEND.URL_API_MAY_CHU, { method: 'POST', body: JSON.stringify(payload) }) : 
                fetch(CAU_HINH_FRONTEND.URL_API_MAY_CHU, { method: 'POST', body: JSON.stringify(payload) })
            );
            
            if (!phanHoi.ok) throw new Error("Từ chối kết nối");
            const ketQua = await phanHoi.json();
            
            if (ketQua.trangThai === 'Thành công') { 
                alert("Đã lưu Danh mục Lớp lên hệ thống an toàn!"); 
                if (typeof thongSoHocVu !== 'undefined') thongSoHocVu.DANH_SACH_LOP = dsLopUpdate;
                if (typeof duLieuBangKCT !== 'undefined') duLieuBangKCT = []; 
                if (typeof danhSachGV !== 'undefined') danhSachGV = []; 
                if (typeof duLieuTkbHienTai !== 'undefined') duLieuTkbHienTai = []; 
            } else { 
                alert("Lỗi từ máy chủ: " + ketQua.thongBao); 
            }
        }
    } catch(loi) { 
        alert("Lỗi kết nối mạng hoặc máy chủ Firebase. Vui lòng thử lưu lại."); 
        console.error(loi);
    } finally { 
        btn.innerHTML = textGoc; 
        btn.disabled = false; 
    }
}

// =========================================================================
// KHỐI 4: NHẬP XUẤT EXCEL
// =========================================================================
function xuatExcelDanhMucLop() {
    if (typeof XLSX === 'undefined') { 
        alert("Thư viện giải mã Excel chưa sẵn sàng. Vui lòng chờ trong giây lát."); 
        return; 
    }
    
    // Cập nhật trạng thái mới nhất từ các ô nhập liệu trên giao diện vào mảng
    dongBoDomLopSangState();
    
    let mangXuat = [TIEU_DE_DM_LOP];
    duLieuDanhMucLop.forEach(lop => { 
        mangXuat.push([lop.maLop, lop.tenLop]); 
    });
    
    let wb = XLSX.utils.book_new();
    let ws = XLSX.utils.aoa_to_sheet(mangXuat);
    
    // Tinh chỉnh độ rộng các cột hiển thị
    ws['!cols'] = [{wch: 15}, {wch: 25}];
    XLSX.utils.book_append_sheet(wb, ws, "DM_LOP");
    XLSX.writeFile(wb, "DanhMucLop.xlsx");
}

function nhapExcelDanhMucLop(event) {
    if (typeof XLSX === 'undefined') {
        alert("Thư viện Excel chưa phản hồi."); 
        return;
    }
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            
            // Ép cấu trúc mảng, điền chuỗi rỗng để ngăn chặn lỗi undefined
            const duLieuExcel = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

            if (duLieuExcel.length < 2) {
                alert("Tệp Excel tải lên trống hoặc định dạng thiếu dòng tiêu đề.");
                return;
            }
            
            let xoaTrang = confirm("Đồng chí muốn XÓA TRẮNG danh sách lớp hiện tại để nạp mới (OK), hay THÊM NỐI TIẾP vào danh sách cũ (Cancel)?");
            if (xoaTrang) duLieuDanhMucLop = [];
            else dongBoDomLopSangState();
            
            let soLopBiTrung = 0;

            for (let i = 1; i < duLieuExcel.length; i++) {
                let row = duLieuExcel[i];
                let maLopMoi = row[0] ? String(row[0]).trim().toUpperCase() : '';
                let tenLopMoi = row[1] ? String(row[1]).trim().toUpperCase() : '';
                
                if (maLopMoi !== '') {
                    // Thuật toán kiểm tra và chặn trùng lặp mã lớp
                    let biTrung = duLieuDanhMucLop.some(lop => lop.maLop === maLopMoi);
                    if (biTrung && !xoaTrang) {
                        soLopBiTrung++;
                        continue; 
                    }

                    // Tự động sử dụng Mã lớp làm Tên lớp nếu cột Tên lớp bị bỏ trống
                    if (tenLopMoi === '') tenLopMoi = maLopMoi;
                    
                    duLieuDanhMucLop.push({
                        maLop: maLopMoi,
                        tenLop: tenLopMoi
                    });
                }
            }
            
            // Xóa lưới cũ và kết xuất toàn bộ dữ liệu mới lên UI
            veBangDanhMucLop();
            
            let thongBao = "Đã nạp dữ liệu lớp học từ Excel lên giao diện thành công!";
            if (soLopBiTrung > 0) {
                thongBao += `\nĐã tự động loại bỏ ${soLopBiTrung} lớp bị trùng mã.`;
            }
            thongBao += "\nĐồng chí hãy kiểm tra bảng và nhấn nút 'Lưu...' để đồng bộ danh sách lên máy chủ.";
            alert(thongBao);
            
        } catch (loi) { 
            alert("Lỗi trong quá trình giải mã tệp Excel: " + loi.message); 
        } finally { 
            event.target.value = ''; // Giải phóng bộ đệm của thẻ input
        }
    };
    reader.readAsArrayBuffer(file);
}
