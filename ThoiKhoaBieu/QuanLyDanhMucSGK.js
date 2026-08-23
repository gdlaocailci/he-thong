// =========================================================================
// LÕI THUẬT TOÁN QUẢN LÝ DANH MỤC SGK (Đã tích hợp HTML vào Index)
// =========================================================================

async function taiLaiDuLieuDanhMucSGK() {
    const nutTai = document.getElementById('btnTaiLaiDanhMuc');
    const noiDungGoc = nutTai.innerHTML;
    nutTai.innerHTML = `<div class="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div> Đang tải...`;
    
    try {
        const phanHoi = await fetch(`${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=layDanhMucSGKToanBo`);
        const duLieu = await phanHoi.json();
        
        const datalist = document.getElementById('danhSachMonHocSGK');
        datalist.innerHTML = ''; 
        if (duLieu.monHoc && duLieu.monHoc.length > 0) {
            duLieu.monHoc.forEach(mon => {
                datalist.insertAdjacentHTML('beforeend', `<option value="${mon}">`);
            });
        }

        const tbody = document.getElementById('danhSachDongDuLieuSGK');
        tbody.innerHTML = '';
        
        const mangSGK = duLieu.sgk || [];
        if (mangSGK.length > 1) {
            for (let i = 1; i < mangSGK.length; i++) {
                let khoi = mangSGK[i][0] ? String(mangSGK[i][0]).trim() : '';
                let mon = mangSGK[i][1] ? String(mangSGK[i][1]).trim() : '';
                let link1 = mangSGK[i][2] ? String(mangSGK[i][2]).trim() : '';
                let link2 = mangSGK[i][3] ? String(mangSGK[i][3]).trim() : '';
                taoDongGiaoDienDuLieu(khoi, mon, link1, link2);
            }
        } else {
            themDongMoiDanhMucSGK(); 
        }
    } catch (loi) {
        alert("Sự cố mạng: Không thể kết nối với máy chủ để tải danh mục.");
    } finally {
        nutTai.innerHTML = noiDungGoc;
    }
}

function taoDongGiaoDienDuLieu(khoi = '', mon = '', link1 = '', link2 = '') {
    const tbody = document.getElementById('danhSachDongDuLieuSGK');
    const tr = document.createElement('tr');
    tr.className = "hover:bg-blue-50/60 transition-colors dong-nhap-lieu-sgk";
    
    tr.innerHTML = `
        <td class="px-2 py-2 text-center"><input type="text" class="w-full text-center bg-transparent border-b border-transparent focus:border-blue-500 focus:bg-white outline-none py-1 font-bold text-slate-700" value="${khoi}" placeholder="VD: 3"></td>
        <td class="px-2 py-2"><input type="text" list="danhSachMonHocSGK" class="w-full bg-transparent border-b border-transparent focus:border-blue-500 focus:bg-white outline-none py-1 font-semibold text-slate-800 cursor-pointer" value="${mon}" placeholder="Nhấp đúp chọn môn..." onfocus="this.select()"></td>
        <td class="px-2 py-2"><input type="text" class="w-full bg-transparent border-b border-transparent focus:border-blue-500 focus:bg-white outline-none py-1 text-blue-600 font-mono text-xs" value="${link1}" placeholder="Link Google Drive Kỳ 1..."></td>
        <td class="px-2 py-2"><input type="text" class="w-full bg-transparent border-b border-transparent focus:border-blue-500 focus:bg-white outline-none py-1 text-blue-600 font-mono text-xs" value="${link2}" placeholder="Link Google Drive Kỳ 2..."></td>
        <td class="px-2 py-2 text-center"><button onclick="this.closest('tr').remove()" class="text-red-400 hover:text-red-600 p-1.5 bg-red-50 hover:bg-red-100 rounded transition" title="Xóa dòng này"><svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button></td>
    `;
    tbody.appendChild(tr);
}

function themDongMoiDanhMucSGK() {
    taoDongGiaoDienDuLieu('', '', '', '');
    const khungChua = document.getElementById('danhSachDongDuLieuSGK').parentElement.parentElement;
    setTimeout(() => { khungChua.scrollTop = khungChua.scrollHeight; }, 50);
}

async function luuDongBoDanhMucSGK() {
    const nutLuu = document.getElementById('btnLuuDanhMuc');
    const noiDungGoc = nutLuu.innerHTML;
    nutLuu.innerHTML = `<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Đang lưu...`;
    nutLuu.disabled = true;

    let mangDuLieuGoiDi = [];
    document.querySelectorAll('.dong-nhap-lieu-sgk').forEach(dong => {
        const cacOInput = dong.querySelectorAll('input');
        let khoi = cacOInput[0].value.trim();
        let mon = cacOInput[1].value.trim();
        let link1 = cacOInput[2].value.trim();
        let link2 = cacOInput[3].value.trim();
        if (khoi !== '' && mon !== '') mangDuLieuGoiDi.push([khoi, mon, link1, link2]);
    });

    try {
        const phanHoi = await fetch(CAU_HINH_FRONTEND.URL_API_MAY_CHU, {
            method: 'POST',
            redirect: 'follow',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ thaoTac: 'luuCapNhatDanhMucSGK', duLieuBang: mangDuLieuGoiDi })
        });
        const ketQua = await phanHoi.json();
        
        if (ketQua.trangThai === 'thanh_cong') {
            alert("THÔNG BÁO: Đã đồng bộ thành công danh mục sách lên bảng tính Google Sheets!");
            if (typeof boNhoHocLieuSGK !== 'undefined') boNhoHocLieuSGK = {}; 
        } else {
            alert("Lưu thất bại: " + ketQua.thongBao);
        }
    } catch (loi) {
        alert("Sự cố đường truyền: Không thể gửi lệnh lưu lên máy chủ. Bạn hãy tải lại trang và thử lại.");
    } finally {
        nutLuu.innerHTML = noiDungGoc;
        nutLuu.disabled = false;
    }
}
