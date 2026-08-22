// =========================================================================
// HỆ THỐNG XỬ LÝ HỌC LIỆU SỐ VÀ HIỂN THỊ BÀI GIẢNG PDF TRỰC QUAN (V11.0)
// Nâng cấp: Nút Đồng bộ (Xóa Cache) giúp cập nhật sách mới mà không đổi Link
// =========================================================================

let boNhoHocLieuSGK = {}; 
let theHienPdfHienTai = null;
let trangHienTaiPDF = 1;
let heSoThuPhong = 1.2;
let idTepHienTai = '';

document.addEventListener('DOMContentLoaded', () => {
    khoiTaoBoNhoCucBoDB(); 
    xayDungKhungGiaoDienXemTruoc();
});

// =========================================================================
// KHỐI 1: CƠ SỞ DỮ LIỆU INDEXEDDB (LƯU TRỮ VÀ QUẢN LÝ BỘ NHỚ ĐỆM)
// =========================================================================
let dbHocLieu = null;

function khoiTaoBoNhoCucBoDB() {
    const request = indexedDB.open("KhoHocLieuSoDB", 1);
    request.onupgradeneeded = function(event) {
        dbHocLieu = event.target.result;
        if (!dbHocLieu.objectStoreNames.contains("BangTepPDF")) {
            dbHocLieu.createObjectStore("BangTepPDF", { keyPath: "idPdf" });
        }
    };
    request.onsuccess = function(event) { dbHocLieu = event.target.result; };
    request.onerror = function(event) { console.warn("Không hỗ trợ IndexedDB."); };
}

function luuTepVaoBoNhoCucBo(idPdf, mangByte) {
    if (!dbHocLieu) return;
    try {
        const transaction = dbHocLieu.transaction(["BangTepPDF"], "readwrite");
        const store = transaction.objectStore("BangTepPDF");
        store.put({ idPdf: idPdf, duLieu: mangByte, thoiGian: new Date().getTime() });
    } catch (e) { console.warn("Đầy bộ nhớ cục bộ:", e); }
}

function docTepTuBoNhoCucBo(idPdf) {
    return new Promise((resolve, reject) => {
        if (!dbHocLieu) return resolve(null);
        const transaction = dbHocLieu.transaction(["BangTepPDF"], "readonly");
        const store = transaction.objectStore("BangTepPDF");
        const request = store.get(idPdf);
        request.onsuccess = function(event) { resolve(request.result ? request.result.duLieu : null); };
        request.onerror = function(event) { resolve(null); };
    });
}

// [TÍNH NĂNG MỚI]: Hàm xóa bộ nhớ đệm của một cuốn sách cụ thể
function lamMoiBoNhoDemPdf() {
    if (!dbHocLieu || !idTepHienTai) {
        alert("Hệ thống đang tải hoặc không có dữ liệu để làm mới.");
        return;
    }
    
    const transaction = dbHocLieu.transaction(["BangTepPDF"], "readwrite");
    const store = transaction.objectStore("BangTepPDF");
    store.delete(idTepHienTai);
    
    transaction.oncomplete = function() {
        // Sau khi xóa cache, ép hệ thống tải lại file
        boNhoTrangPdfGoc = null; // Xóa cả RAM
        document.getElementById('khoiTrangThaiSgk').classList.remove('hidden');
        document.getElementById('canvasHienThiPdf').classList.add('hidden');
        document.getElementById('bangDieuKhienTrang').classList.add('hidden');
        document.getElementById('cumNutTaiXuong').classList.add('hidden');
        document.getElementById('vanBanTrangThaiSgk').innerText = "Đang đồng bộ tải lại phiên bản sách mới nhất...";
        
        xuLyDocPDF(idTepHienTai);
    };
}

// =========================================================================
// KHỐI 2: KHỞI TẠO BỘ NHỚ RAM VÀ XỬ LÝ CHUỖI TỪ MÁY CHỦ
// =========================================================================
async function khoiTaoBoNhoHocLieu() {
    try {
        const fetchFunc = (typeof fetchVoiCoCheThuLai === 'function') ? fetchVoiCoCheThuLai : fetch;
        const phanHoi = await fetchFunc(`${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=layDanhMucSGK`);
        const duLieu = await phanHoi.json();
        
        if (duLieu.trangThai === 'loi_he_thong' || duLieu.trangThai === 'khong_ro_thao_tac') {
            throw new Error("API layDanhMucSGK chưa được khai báo.");
        }

        if (duLieu && duLieu.length > 0) {
            duLieu.forEach(dong => {
                let tenKhoi = dong[0] ? String(dong[0]).trim().toUpperCase() : '';
                let tenMon = dong[1] ? String(dong[1]).trim().toLowerCase() : '';
                let linkKy1 = dong[2] ? String(dong[2]).trim() : ''; 
                let linkKy2 = dong[3] ? String(dong[3]).trim() : ''; 
                
                if (tenKhoi && tenMon && linkKy1) {
                    let khoaTruyXuat = `${tenKhoi}_${tenMon}`;
                    boNhoHocLieuSGK[khoaTruyXuat] = {
                        idKy1: trichXuatIdTuLink(linkKy1),
                        idKy2: trichXuatIdTuLink(linkKy2) || trichXuatIdTuLink(linkKy1)
                    };
                }
            });
        }
    } catch (loi) { 
        console.error("Lỗi tải Danh mục SGK:", loi);
        throw loi; 
    }
}

function trichXuatIdTuLink(url) {
    let ketQua = url.match(/[-\w]{25,}/);
    return ketQua ? ketQua[0] : null;
}

// =========================================================================
// KHỐI 3: KÍCH HOẠT VÀ XÂY DỰNG GIAO DIỆN UI
// =========================================================================
window.kichHoatXemTruocSGK = async function(tenKhoiGoc, tenMonGoc, tenBaiHoc, thamSoTuan) {
    const tenKhoiChuan = String(tenKhoiGoc).trim().toUpperCase();
    const tenMonChuan = String(tenMonGoc).trim().toLowerCase();
    const khoaTimKiem = `${tenKhoiChuan}_${tenMonChuan}`;

    let tuanHienTai = parseInt(thamSoTuan, 10);
    if (isNaN(tuanHienTai)) {
        let oNhapTuan = document.querySelector('input[id*="tuan"], select[id*="tuan"], input[id*="Tuan"]');
        tuanHienTai = oNhapTuan ? parseInt(oNhapTuan.value, 10) : 1;
    }
    if (isNaN(tuanHienTai)) tuanHienTai = 1; 

    if (Object.keys(boNhoHocLieuSGK).length === 0) {
        hienThiModalXemTruoc(tenKhoiGoc, tenMonGoc, tenBaiHoc, tuanHienTai);
        document.getElementById('vanBanTrangThaiSgk').innerText = "Đang kết nối CSDL Danh mục Sách giáo khoa...";
        try {
            await khoiTaoBoNhoHocLieu();
        } catch (loi) {
            dongModalXemTruoc();
            setTimeout(() => { alert(`Sự cố hệ thống: ${loi.message}`); }, 300);
            return;
        }
    }

    const duLieuMonHoc = boNhoHocLieuSGK[khoaTimKiem];
    if (!duLieuMonHoc) {
        dongModalXemTruoc();
        setTimeout(() => { alert(`Hệ thống chưa tìm thấy dữ liệu SGK cho Khối ${tenKhoiGoc} - Môn ${tenMonGoc}.`); }, 300);
        return;
    }

    if (tuanHienTai > 17) {
        idTepHienTai = duLieuMonHoc.idKy2;
    } else {
        idTepHienTai = duLieuMonHoc.idKy1;
    }
    
    hienThiModalXemTruoc(tenKhoiGoc, tenMonGoc, tenBaiHoc, tuanHienTai);
    await xuLyDocPDF(idTepHienTai);
};

function xayDungKhungGiaoDienXemTruoc() {
    const modalHTML = `
    <div id="modalXemTruocSGK" class="hidden fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[9999] flex items-center justify-center font-sans transition-opacity reactbits-fade-in">
        <div class="bg-white w-11/12 md:w-5/6 lg:w-3/4 h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-300 transform scale-95 transition-transform duration-300" id="khungNoiDungModal">
            
            <div class="bg-gradient-to-r from-blue-800 to-indigo-900 px-5 py-3 flex justify-between items-center shadow-md z-10 flex-none border-b border-indigo-700">
                <div class="flex items-center gap-3 overflow-hidden">
                    <div class="bg-white/20 p-1.5 rounded-lg">
                        <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                    </div>
                    <div class="truncate">
                        <h3 id="tieuDeMonSgk" class="text-white font-extrabold text-lg leading-tight truncate">Đang tải học liệu...</h3>
                        <p id="tieuDeBaiSgk" class="text-blue-100 text-sm font-semibold truncate">Vui lòng chờ hệ thống phân tích</p>
                    </div>
                </div>
                
                <div class="flex items-center gap-2 flex-none">
                    <!-- Nút Tải nguyên bản -->
                    <div id="cumNutTaiXuong" class="hidden flex items-center gap-1.5 bg-white/10 p-1 rounded-lg mr-3 border border-white/20">
                        <button onclick="taiToanBoSGK()" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 px-3 rounded shadow transition text-sm flex items-center gap-1.5" title="Tải toàn bộ cuốn sách">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            <span>Tải SGK</span>
                        </button>
                    </div>

                    <!-- [TÍNH NĂNG MỚI]: Nút Đồng bộ lại (Làm mới) -->
                    <button onclick="lamMoiBoNhoDemPdf()" class="p-1.5 bg-yellow-500/20 hover:bg-yellow-500/40 rounded-md text-yellow-300 transition border border-yellow-500/30" title="Tải lại sách (Đồng bộ phiên bản mới nhất)"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg></button>
                    
                    <!-- Dấu gạch chia cách -->
                    <div class="h-6 w-px bg-white/30 mx-1"></div>

                    <button onclick="dieuChinhThuPhong(0.2)" class="p-1.5 bg-white/10 hover:bg-white/20 rounded-md text-white transition" title="Phóng to"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg></button>
                    <button onclick="dieuChinhThuPhong(-0.2)" class="p-1.5 bg-white/10 hover:bg-white/20 rounded-md text-white transition mr-2" title="Thu nhỏ"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"></path></svg></button>
                    <button onclick="dongModalXemTruoc()" class="p-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-white shadow-sm transition" title="Đóng"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                </div>
            </div>

            <div class="flex-1 bg-slate-300 overflow-y-auto overflow-x-auto relative block text-center p-4 border-t border-slate-400" id="vungVeTaiLieu">
                
                <div id="bangDieuKhienTrang" class="hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-800/95 backdrop-blur text-white px-5 py-3 rounded-2xl shadow-2xl flex-col items-center gap-2 z-20 border border-slate-600 min-w-[320px] transition-all">
                    <div class="flex items-center gap-4 w-full justify-center">
                        <button onclick="chuyenTrangPdf(-1)" class="hover:text-blue-400 font-extrabold px-3 transition text-xl">◀</button>
                        <div class="text-sm font-semibold tracking-wide flex items-center gap-1.5">
                            Trang 
                            <input type="number" id="nhapSoTrangNhanh" value="1" min="1" onchange="nhayDenTrangHoc(this.value)" class="w-14 text-center text-blue-900 font-extrabold rounded outline-none py-0.5 focus:ring-2 focus:ring-blue-400 bg-white shadow-inner">
                            / <span id="tongSoTrang">--</span>
                        </div>
                        <button onclick="chuyenTrangPdf(1)" class="hover:text-blue-400 font-extrabold px-3 transition text-xl">▶</button>
                    </div>
                    <input type="range" id="thanhTruotTrang" min="1" max="1" value="1" oninput="nhayDenTrangHoc(this.value)" class="w-full h-1.5 bg-slate-500 rounded-lg appearance-none cursor-pointer accent-blue-400 mt-1">
                </div>

                <div id="khoiTrangThaiSgk" class="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 z-10">
                    <div class="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                    <p id="vanBanTrangThaiSgk" class="text-slate-700 font-bold text-lg">Đang kết nối thư viện học liệu số...</p>
                </div>

                <canvas id="canvasHienThiPdf" class="shadow-2xl bg-white hidden mx-auto max-w-full h-auto mb-10"></canvas>
                
                <div id="vungIframeDuPhong" class="hidden w-full h-full relative">
                    <div class="absolute top-0 right-4 w-[45px] h-[55px] bg-[#131313] z-50 flex items-center justify-center cursor-not-allowed border-b border-l border-r border-slate-700/50" title="Tính năng mở tab mới đã bị khóa">
                        <svg class="w-5 h-5 text-gray-500 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    </div>
                    <iframe id="iframeTaiLieuGoc" src="" class="w-full h-full border-0 rounded shadow-inner" allow="autoplay"></iframe>
                </div>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function hienThiModalXemTruoc(tenKhoi, tenMon, tenBaiGoc, tuanHienTai) {
    let nhanKyHoc = (tuanHienTai > 17) ? "[Tập 2 / Kỳ 2]" : "[Tập 1 / Kỳ 1]";
    
    document.getElementById('tieuDeMonSgk').innerText = `Khối ${tenKhoi} - Môn ${tenMon} ${nhanKyHoc}`;
    document.getElementById('tieuDeBaiSgk').innerText = tenBaiGoc;
    
    document.getElementById('khoiTrangThaiSgk').classList.remove('hidden');
    document.getElementById('canvasHienThiPdf').classList.add('hidden');
    document.getElementById('vungIframeDuPhong').classList.add('hidden');
    document.getElementById('cumNutTaiXuong').classList.add('hidden'); 
    document.getElementById('bangDieuKhienTrang').classList.remove('flex');
    document.getElementById('bangDieuKhienTrang').classList.add('hidden');
    
    document.getElementById('iframeTaiLieuGoc').src = '';
    document.getElementById('vanBanTrangThaiSgk').innerText = "Đang kiểm tra kho lưu trữ cục bộ...";

    const modal = document.getElementById('modalXemTruocSGK');
    modal.classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('khungNoiDungModal').classList.remove('scale-95');
        document.getElementById('khungNoiDungModal').classList.add('scale-100');
    }, 10);
}

function dongModalXemTruoc() {
    const modal = document.getElementById('modalXemTruocSGK');
    document.getElementById('khungNoiDungModal').classList.remove('scale-100');
    document.getElementById('khungNoiDungModal').classList.add('scale-95');
    setTimeout(() => { modal.classList.add('hidden'); }, 300);
}

// =========================================================================
// KHỐI 4: ĐỘNG CƠ TẢI ĐỆM SIÊU TỐC VÀ HIỂN THỊ VĂN BẢN PDF
// =========================================================================
async function taiDuLieuPdfAnToan(idPdf) {
    let mangByteCucBo = await docTepTuBoNhoCucBo(idPdf);
    if (mangByteCucBo) {
        document.getElementById('vanBanTrangThaiSgk').innerText = "Truy xuất thành công từ bộ nhớ đệm tốc độ cao...";
        return mangByteCucBo;
    }

    document.getElementById('vanBanTrangThaiSgk').innerText = "Đang tải Sách giáo khoa từ máy chủ (Chỉ tải 1 lần duy nhất)...";
    const dsProxy = [
        'https://corsproxy.io/?',
        'https://api.allorigins.win/raw?url=',
        'https://api.codetabs.com/v1/proxy?quest='
    ];
    const linkGoc = encodeURIComponent(`https://drive.google.com/uc?export=download&confirm=t&id=${idPdf}`);
    
    for (let proxy of dsProxy) {
        try {
            let phanHoi = await fetch(proxy + linkGoc);
            if (!phanHoi.ok) continue;
            
            let boDem = await phanHoi.arrayBuffer();
            let kiemTra = new Uint8Array(boDem.slice(0, 5));
            if (kiemTra[0]===37 && kiemTra[1]===80 && kiemTra[2]===68 && kiemTra[3]===70 && kiemTra[4]===45) {
                luuTepVaoBoNhoCucBo(idPdf, boDem);
                return boDem;
            }
        } catch (loi) {
            console.warn("Proxy ngắt luồng:", proxy);
        }
    }
    throw new Error("Dung lượng tệp vượt quá giới hạn của máy chủ Proxy.");
}

async function xuLyDocPDF(idPdf) {
    if (typeof pdfjsLib === 'undefined') {
        await new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
            script.onload = resolve;
            document.head.appendChild(script);
        });
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    }

    try {
        const duLieuPdf = await taiDuLieuPdfAnToan(idPdf);
        
        const loadingTask = pdfjsLib.getDocument({ 
            data: duLieuPdf,
            cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/cmaps/',
            cMapPacked: true,
            useWorkerFetch: true
        });
        
        theHienPdfHienTai = await loadingTask.promise;
        
        document.getElementById('tongSoTrang').innerText = theHienPdfHienTai.numPages;
        trangHienTaiPDF = 1;
        
        document.getElementById('nhapSoTrangNhanh').max = theHienPdfHienTai.numPages;
        document.getElementById('thanhTruotTrang').max = theHienPdfHienTai.numPages;

        document.getElementById('khoiTrangThaiSgk').classList.add('hidden');
        document.getElementById('canvasHienThiPdf').classList.remove('hidden');
        
        document.getElementById('bangDieuKhienTrang').classList.remove('hidden');
        document.getElementById('bangDieuKhienTrang').classList.add('flex');
        document.getElementById('cumNutTaiXuong').classList.remove('hidden');
        
        veTrangCanVasPdf(trangHienTaiPDF);

    } catch (loi) {
        console.warn("Chuyển lưới an toàn Iframe:", loi);
        kichHoatLuoiAnToanIframe(idPdf);
    }
}

async function veTrangCanVasPdf(soTrang) {
    if (!theHienPdfHienTai) return;
    
    document.getElementById('nhapSoTrangNhanh').value = soTrang;
    document.getElementById('thanhTruotTrang').value = soTrang;
    
    const trang = await theHienPdfHienTai.getPage(soTrang);
    const canvas = document.getElementById('canvasHienThiPdf');
    const ctx = canvas.getContext('2d');
    
    const viewport = trang.getViewport({ scale: heSoThuPhong });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = { canvasContext: ctx, viewport: viewport };
    await trang.render(renderContext).promise;
}

function chuyenTrangPdf(buocNhay) {
    if (!theHienPdfHienTai) return;
    let trangMoi = trangHienTaiPDF + buocNhay;
    if (trangMoi >= 1 && trangMoi <= theHienPdfHienTai.numPages) {
        trangHienTaiPDF = trangMoi;
        veTrangCanVasPdf(trangHienTaiPDF);
    }
}

function nhayDenTrangHoc(giaTriTrang) {
    if (!theHienPdfHienTai) return;
    let trangMoi = parseInt(giaTriTrang, 10);
    
    if (isNaN(trangMoi)) return;
    if (trangMoi < 1) trangMoi = 1;
    if (trangMoi > theHienPdfHienTai.numPages) trangMoi = theHienPdfHienTai.numPages;
    
    trangHienTaiPDF = trangMoi;
    veTrangCanVasPdf(trangHienTaiPDF);
}

function dieuChinhThuPhong(heSoThuThayDoi) {
    if (!theHienPdfHienTai) return;
    heSoThuPhong += heSoThuThayDoi;
    if (heSoThuPhong < 0.6) heSoThuPhong = 0.6;
    if (heSoThuPhong > 3.0) heSoThuPhong = 3.0;
    veTrangCanVasPdf(trangHienTaiPDF);
}

function kichHoatLuoiAnToanIframe(idPdf) {
    document.getElementById('khoiTrangThaiSgk').classList.add('hidden');
    document.getElementById('canvasHienThiPdf').classList.add('hidden');
    
    document.getElementById('bangDieuKhienTrang').classList.remove('flex');
    document.getElementById('bangDieuKhienTrang').classList.add('hidden');
    
    const vungIframe = document.getElementById('vungIframeDuPhong');
    vungIframe.classList.remove('hidden');
    document.getElementById('iframeTaiLieuGoc').src = `https://drive.google.com/file/d/${idPdf}/preview`;

    document.getElementById('cumNutTaiXuong').classList.remove('hidden');
}

// =========================================================================
// KHỐI 5: TẢI TRỰC TIẾP NGUYÊN BẢN GỐC TỪ GOOGLE DRIVE
// =========================================================================
function taiToanBoSGK() {
    if (!idTepHienTai) {
        alert("Sự cố: Không định vị được ID của tài liệu Sách giáo khoa.");
        return;
    }
    window.open(`https://drive.google.com/uc?export=download&id=${idTepHienTai}`, '_blank');
}
