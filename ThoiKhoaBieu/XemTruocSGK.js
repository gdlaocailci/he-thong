// =========================================================================
// HỆ THỐNG XỬ LÝ HỌC LIỆU SỐ VÀ CẮT TRANG BÀI GIẢNG PDF TRỰC QUAN (V8.0)
// Nâng cấp: Ép luồng tải ngầm để cắt trang ngay cả trong chế độ Iframe dự phòng
// =========================================================================

let boNhoHocLieuSGK = {}; 
let theHienPdfHienTai = null;
let trangHienTaiPDF = 1;
let heSoThuPhong = 1.2;
let idTepHienTai = '';
let tenBaiHienTai = '';
let boNhoTrangPdfGoc = null; 

document.addEventListener('DOMContentLoaded', () => {
    xayDungKhungGiaoDienXemTruoc();
});

// =========================================================================
// KHỐI 1: KHỞI TẠO BỘ NHỚ VÀ XỬ LÝ CHUỖI
// =========================================================================
async function khoiTaoBoNhoHocLieu() {
    try {
        const fetchFunc = (typeof fetchVoiCoCheThuLai === 'function') ? fetchVoiCoCheThuLai : fetch;
        const phanHoi = await fetchFunc(`${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=layDanhMucSGK`);
        const duLieu = await phanHoi.json();
        
        if (duLieu.trangThai === 'loi_he_thong' || duLieu.trangThai === 'khong_ro_thao_tac') {
            throw new Error("API layDanhMucSGK chưa được khai báo trên máy chủ.");
        }

        if (duLieu && duLieu.length > 0) {
            duLieu.forEach(dong => {
                let tenKhoi = dong[0] ? String(dong[0]).trim().toUpperCase() : '';
                let tenMon = dong[1] ? String(dong[1]).trim().toLowerCase() : '';
                let linkDrive = dong[2] ? String(dong[2]).trim() : '';
                
                if (tenKhoi && tenMon && linkDrive) {
                    let khoaTruyXuat = `${tenKhoi}_${tenMon}`;
                    boNhoHocLieuSGK[khoaTruyXuat] = trichXuatIdTuLink(linkDrive);
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

function chuanHoaTenTimKiem(tenGoc) {
    if (!tenGoc) return '';
    let tenDaLoc = tenGoc.toLowerCase();
    tenDaLoc = tenDaLoc.replace(/(?:\b|^)(tiết|t|bài|b)\s*\d+\s*(:|-|\.)?\s*/gi, '');
    return tenDaLoc.trim();
}

// =========================================================================
// KHỐI 2: KÍCH HOẠT VÀ XÂY DỰNG GIAO DIỆN UI
// =========================================================================
window.kichHoatXemTruocSGK = async function(tenKhoiGoc, tenMonGoc, tenBaiHoc) {
    const tenKhoiChuan = String(tenKhoiGoc).trim().toUpperCase();
    const tenMonChuan = String(tenMonGoc).trim().toLowerCase();
    const khoaTimKiem = `${tenKhoiChuan}_${tenMonChuan}`;

    if (Object.keys(boNhoHocLieuSGK).length === 0) {
        hienThiModalXemTruoc(tenKhoiGoc, tenMonGoc, tenBaiHoc);
        document.getElementById('vanBanTrangThaiSgk').innerText = "Đang kết nối CSDL Danh mục Sách giáo khoa...";
        try {
            await khoiTaoBoNhoHocLieu();
        } catch (loi) {
            dongModalXemTruoc();
            setTimeout(() => { alert(`Sự cố hệ thống: ${loi.message}`); }, 300);
            return;
        }
    }

    const idTepTin = boNhoHocLieuSGK[khoaTimKiem];
    if (!idTepTin) {
        dongModalXemTruoc();
        setTimeout(() => { alert(`Hệ thống chưa tìm thấy dữ liệu SGK cho Khối ${tenKhoiGoc} - Môn ${tenMonGoc}. Vui lòng kiểm tra lại bảng DANH_MUC_SGK.`); }, 300);
        return;
    }

    idTepHienTai = idTepTin;
    tenBaiHienTai = chuanHoaTenTimKiem(tenBaiHoc) || 'TaiLieu';
    
    hienThiModalXemTruoc(tenKhoiGoc, tenMonGoc, tenBaiHoc);
    await xuLyDocPDF(idTepTin);
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
                    <!-- KHỐI CHỨC NĂNG: Chọn khoảng trang tải xuống -->
                    <div id="cumNutTaiXuong" class="hidden flex items-center gap-1.5 bg-white/10 p-1 rounded-lg mr-2 border border-white/20">
                        <span class="text-white text-[11px] font-bold pl-2 uppercase tracking-wide">Từ trang</span>
                        <input type="number" id="trangTaiTu" value="1" min="1" class="w-12 text-center text-sm font-bold text-blue-900 rounded outline-none py-1 bg-blue-50 border border-blue-200" title="Trang bắt đầu">
                        <span class="text-white text-[11px] font-bold uppercase">đến</span>
                        <input type="number" id="trangTaiDen" value="1" min="1" class="w-12 text-center text-sm font-bold text-blue-900 rounded outline-none py-1 bg-blue-50 border border-blue-200" title="Trang kết thúc">
                        <button onclick="taiXuongBaiHocPDF()" id="btnTienHanhTai" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 px-2.5 rounded shadow transition text-sm flex items-center gap-1.5 ml-1" title="Cắt và Tải PDF">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            <span id="chuNutTai">Cắt & Tải</span>
                        </button>
                    </div>

                    <button onclick="dieuChinhThuPhong(0.2)" class="p-1.5 bg-white/10 hover:bg-white/20 rounded-md text-white transition" title="Phóng to"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg></button>
                    <button onclick="dieuChinhThuPhong(-0.2)" class="p-1.5 bg-white/10 hover:bg-white/20 rounded-md text-white transition mr-2" title="Thu nhỏ"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"></path></svg></button>
                    <button onclick="dongModalXemTruoc()" class="p-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-white shadow-sm transition" title="Đóng"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                </div>
            </div>

            <div class="flex-1 bg-slate-300 overflow-y-auto overflow-x-auto relative block text-center p-4 border-t border-slate-400" id="vungVeTaiLieu">
                
                <!-- Bảng điều khiển trang lật siêu tốc (Chỉ hiện ở chế độ Canvas) -->
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
                
                <!-- Fallback Iframe (Lưới an toàn) với tọa độ khiên đã tối ưu -->
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

function hienThiModalXemTruoc(tenKhoi, tenMon, tenBaiGoc) {
    document.getElementById('tieuDeMonSgk').innerText = `Khối ${tenKhoi} - Môn ${tenMon}`;
    document.getElementById('tieuDeBaiSgk').innerText = tenBaiGoc;
    
    document.getElementById('khoiTrangThaiSgk').classList.remove('hidden');
    document.getElementById('canvasHienThiPdf').classList.add('hidden');
    document.getElementById('vungIframeDuPhong').classList.add('hidden');
    document.getElementById('cumNutTaiXuong').classList.add('hidden'); 
    document.getElementById('bangDieuKhienTrang').classList.remove('flex');
    document.getElementById('bangDieuKhienTrang').classList.add('hidden');
    
    document.getElementById('iframeTaiLieuGoc').src = '';
    document.getElementById('vanBanTrangThaiSgk').innerText = "Đang tải nguyên bản Sách giáo khoa PDF...";

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
// KHỐI 3: ĐỘNG CƠ TẢI ĐỆM VÀ VẼ VĂN BẢN PDF
// =========================================================================
async function taiDuLieuPdfAnToan(idPdf) {
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
                return boDem;
            }
        } catch (loi) {
            console.warn("Proxy quá tải, chuyển luồng:", proxy);
        }
    }
    throw new Error("Mạng quá tải, không thể tải đệm tệp PDF.");
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
        boNhoTrangPdfGoc = await taiDuLieuPdfAnToan(idPdf);
        
        const loadingTask = pdfjsLib.getDocument({ data: boNhoTrangPdfGoc });
        theHienPdfHienTai = await loadingTask.promise;
        
        document.getElementById('tongSoTrang').innerText = theHienPdfHienTai.numPages;
        trangHienTaiPDF = 1;
        
        document.getElementById('trangTaiTu').max = theHienPdfHienTai.numPages;
        document.getElementById('trangTaiDen').max = theHienPdfHienTai.numPages;
        document.getElementById('nhapSoTrangNhanh').max = theHienPdfHienTai.numPages;
        document.getElementById('thanhTruotTrang').max = theHienPdfHienTai.numPages;

        document.getElementById('khoiTrangThaiSgk').classList.add('hidden');
        document.getElementById('canvasHienThiPdf').classList.remove('hidden');
        
        // Hiện đầy đủ bộ công cụ khi Canvas tải thành công
        document.getElementById('bangDieuKhienTrang').classList.remove('hidden');
        document.getElementById('bangDieuKhienTrang').classList.add('flex');
        document.getElementById('cumNutTaiXuong').classList.remove('hidden');
        document.getElementById('chuNutTai').innerText = "Cắt & Tải";
        
        veTrangCanVasPdf(trangHienTaiPDF);

    } catch (loi) {
        console.warn("Lỗi tải luồng, chuyển sang Iframe dự phòng.", loi);
        kichHoatLuoiAnToanIframe(idPdf);
    }
}

async function veTrangCanVasPdf(soTrang) {
    if (!theHienPdfHienTai) return;
    
    document.getElementById('nhapSoTrangNhanh').value = soTrang;
    document.getElementById('thanhTruotTrang').value = soTrang;
    document.getElementById('trangTaiTu').value = soTrang;
    document.getElementById('trangTaiDen').value = soTrang;
    
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
    boNhoTrangPdfGoc = null; 
    document.getElementById('khoiTrangThaiSgk').classList.add('hidden');
    document.getElementById('canvasHienThiPdf').classList.add('hidden');
    
    // Giấu thanh trượt vì Iframe không hỗ trợ điều khiển
    document.getElementById('bangDieuKhienTrang').classList.remove('flex');
    document.getElementById('bangDieuKhienTrang').classList.add('hidden');
    
    const vungIframe = document.getElementById('vungIframeDuPhong');
    vungIframe.classList.remove('hidden');
    document.getElementById('iframeTaiLieuGoc').src = `https://drive.google.com/file/d/${idPdf}/preview`;

    // [NÂNG CẤP]: Vẫn giữ nguyên 2 ô nhập trang ở chế độ Iframe để giáo viên nhập thủ công
    document.getElementById('cumNutTaiXuong').classList.remove('hidden');
    document.getElementById('chuNutTai').innerText = "Cắt & Tải";
}

// =========================================================================
// KHỐI 4: ÉP LUỒNG TẢI NGẦM ĐỂ CẮT PDF
// =========================================================================
async function taiXuongBaiHocPDF() {
    const nutTai = document.getElementById('btnTienHanhTai');
    const noiDungGoc = nutTai.innerHTML;

    const trangTu = parseInt(document.getElementById('trangTaiTu').value, 10);
    const trangDen = parseInt(document.getElementById('trangTaiDen').value, 10);
    
    // Ở chế độ Iframe, ta không biết trước số trang tối đa, nên lấy 9999 làm mốc chặn lỗi
    let maxTrang = theHienPdfHienTai ? theHienPdfHienTai.numPages : 9999;

    if (isNaN(trangTu) || isNaN(trangDen) || trangTu < 1 || trangTu > trangDen || trangTu > maxTrang || trangDen > maxTrang) {
        alert("Vui lòng nhập khoảng trang hợp lệ (Từ trang phải nhỏ hơn hoặc bằng Đến trang).");
        return;
    }

    nutTai.innerHTML = `<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>`;
    nutTai.disabled = true;

    try {
        let pdfBuffer = boNhoTrangPdfGoc;
        
        // NẾU ĐANG Ở CHẾ ĐỘ NỀN ĐEN (IFRAME): Ép hệ thống kéo luồng tải ngầm để lấy mảng Byte
        if (!pdfBuffer) {
            document.getElementById('chuNutTai').innerText = "Đang kéo dữ liệu...";
            try {
                pdfBuffer = await taiDuLieuPdfAnToan(idTepHienTai);
            } catch(e) {
                alert("Tệp SGK này quá lớn và bị chặn luồng cắt trang bảo mật. Trình duyệt sẽ tải nguyên bản toàn bộ cuốn sách để đảm bảo an toàn.");
                window.open(`https://drive.google.com/uc?export=download&id=${idTepHienTai}`, '_blank');
                nutTai.innerHTML = noiDungGoc;
                nutTai.disabled = false;
                return;
            }
        }

        if (typeof PDFLib === 'undefined') {
            await new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
                script.onload = resolve;
                document.head.appendChild(script);
            });
        }

        const { PDFDocument } = PDFLib;
        const docGoc = await PDFDocument.load(pdfBuffer);
        const docMoi = await PDFDocument.create();
        
        const tongSoTrangThucTe = docGoc.getPageCount();
        if (trangDen > tongSoTrangThucTe) {
             alert(`Lỗi: Cuốn SGK này chỉ có tổng cộng ${tongSoTrangThucTe} trang. Vui lòng nhập lại số trang kết thúc nhỏ hơn.`);
             nutTai.innerHTML = noiDungGoc;
             nutTai.disabled = false;
             return;
        }

        const mangChiSoTrangCat = [];
        for (let i = trangTu; i <= trangDen; i++) {
            mangChiSoTrangCat.push(i - 1); 
        }

        const cacTrangSaoChep = await docMoi.copyPages(docGoc, mangChiSoTrangCat);
        cacTrangSaoChep.forEach((trang) => {
            docMoi.addPage(trang);
        });

        const pdfBytesMoi = await docMoi.save();
        const blob = new Blob([pdfBytesMoi], { type: 'application/pdf' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        const tenFile = tenBaiHienTai.replace(/[^a-zA-Z0-9]/g, '_') || 'TaiLieu';
        
        let tenTaiXuong = `${tenFile}_Trang_${trangTu}.pdf`;
        if (trangTu !== trangDen) {
            tenTaiXuong = `${tenFile}_Trang_${trangTu}_den_${trangDen}.pdf`;
        }
        
        link.download = tenTaiXuong;
        link.click();

    } catch (loi) {
        console.error("Lỗi cắt file PDF:", loi);
        alert("Có lỗi xảy ra khi xử lý trích xuất khoảng trang PDF.");
    } finally {
        nutTai.innerHTML = noiDungGoc;
        nutTai.disabled = false;
    }
}
