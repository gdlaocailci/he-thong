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
            throw new Error("API layDanhMucSGK chưa khai báo trên máy chủ.");
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
// KHỐI 2: KÍCH HOẠT VÀ ĐIỀU HƯỚNG HIỂN THỊ UI
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
        setTimeout(() => { alert(`Hệ thống chưa tìm thấy dữ liệu SGK cho Khối ${tenKhoiGoc} - Môn ${tenMonGoc}.`); }, 300);
        return;
    }

    idTepHienTai = idTepTin;
    tenBaiHienTai = chuanHoaTenTimKiem(tenBaiHoc) || 'TaiLieu';
    
    hienThiModalXemTruoc(tenKhoiGoc, tenMonGoc, tenBaiHoc);
    await xuLyDocPDF(idTepTin);
};

// =========================================================================
// HÀM XÂY DỰNG GIAO DIỆN (CẬP NHẬT: MỞ KHÓA THANH CUỘN DỌC)
// =========================================================================
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
                    <div id="cumNutTaiXuong" class="hidden flex items-center gap-2 bg-white/10 p-1 rounded-lg mr-3 border border-white/20">
                        <span id="nhanTrangTai" class="text-white text-xs font-bold pl-2">Trang tải:</span>
                        <input type="number" id="trangTaiXuong" value="1" min="1" class="w-14 text-center text-sm font-bold text-blue-900 rounded outline-none py-1 bg-blue-50">
                        <button onclick="taiXuongBaiHocPDF()" id="btnTienHanhTai" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 px-3 rounded shadow transition text-sm flex items-center gap-1.5" title="Tải PDF">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            <span id="chuNutTai">Tải</span>
                        </button>
                    </div>
                    <button onclick="dieuChinhThuPhong(0.2)" class="p-1.5 bg-white/10 hover:bg-white/20 rounded-md text-white transition"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg></button>
                    <button onclick="dieuChinhThuPhong(-0.2)" class="p-1.5 bg-white/10 hover:bg-white/20 rounded-md text-white transition mr-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"></path></svg></button>
                    <button onclick="dongModalXemTruoc()" class="p-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-white shadow-sm transition"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                </div>
            </div>

            <!-- [ĐÃ SỬA]: Chuyển từ "flex justify-center" sang "block text-center" và mở khóa overflow-x-auto -->
            <div class="flex-1 bg-slate-300 overflow-y-auto overflow-x-auto relative block text-center p-4 border-t border-slate-400" id="vungVeTaiLieu">
                <div class="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-800/90 backdrop-blur text-white px-5 py-2 rounded-full shadow-xl flex items-center gap-4 z-20 border border-slate-600">
                    <button onclick="chuyenTrangPdf(-1)" class="hover:text-blue-400 font-bold px-2 transition text-lg">◀</button>
                    <span class="text-sm font-semibold tracking-wide">Trang <span id="soTrangHienTai" class="font-extrabold text-blue-400 text-base">1</span> / <span id="tongSoTrang">--</span></span>
                    <button onclick="chuyenTrangPdf(1)" class="hover:text-blue-400 font-bold px-2 transition text-lg">▶</button>
                </div>

                <div id="khoiTrangThaiSgk" class="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 z-10">
                    <div class="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                    <p id="vanBanTrangThaiSgk" class="text-slate-700 font-bold text-lg">Đang trích xuất học liệu số...</p>
                </div>

                <!-- [ĐÃ SỬA]: Thêm class "mx-auto" để căn giữa trang sách khi đổi thẻ cha sang block -->
                <canvas id="canvasHienThiPdf" class="shadow-2xl bg-white hidden mx-auto max-w-full h-auto mb-10"></canvas>
                
                <div id="vungIframeDuPhong" class="hidden w-full h-full relative">
                    <div class="absolute top-0 right-0 w-[60px] h-[55px] bg-[#131313] z-50 flex items-center justify-center cursor-not-allowed border-b border-l border-slate-700/50" title="Tính năng mở tab mới đã bị Quản trị viên khóa">
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
// KHỐI 3: ĐỘNG CƠ TẢI ĐỆM VÀ XỬ LÝ VĂN BẢN PDF
// =========================================================================
async function taiDuLieuPdfAnToan(idPdf) {
    const dsProxy = [
        'https://corsproxy.io/?',
        'https://api.allorigins.win/raw?url='
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
    throw new Error("Tất cả cổng trung chuyển bị từ chối.");
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
        document.getElementById('trangTaiXuong').max = theHienPdfHienTai.numPages;

        document.getElementById('khoiTrangThaiSgk').classList.add('hidden');
        document.getElementById('canvasHienThiPdf').classList.remove('hidden');
        
        // Phục hồi giao diện Cắt Trang (Nếu mạng khỏe)
        document.getElementById('cumNutTaiXuong').classList.remove('hidden');
        document.getElementById('nhanTrangTai').classList.remove('hidden');
        document.getElementById('trangTaiXuong').classList.remove('hidden');
        document.getElementById('chuNutTai').innerText = "Tải trang này";
        
        veTrangCanVasPdf(trangHienTaiPDF);

    } catch (loi) {
        console.warn("Lỗi phân giải Buffer, chuyển sang Iframe dự phòng.", loi);
        kichHoatLuoiAnToanIframe(idPdf);
    }
}

async function veTrangCanVasPdf(soTrang) {
    if (!theHienPdfHienTai) return;
    document.getElementById('soTrangHienTai').innerText = soTrang;
    document.getElementById('trangTaiXuong').value = soTrang;
    
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

function dieuChinhThuPhong(heSoThuThayDoi) {
    if (!theHienPdfHienTai) return;
    heSoThuPhong += heSoThuThayDoi;
    if (heSoThuPhong < 0.6) heSoThuPhong = 0.6;
    if (heSoThuPhong > 3.0) heSoThuPhong = 3.0;
    veTrangCanVasPdf(trangHienTaiPDF);
}

function kichHoatLuoiAnToanIframe(idPdf) {
    boNhoTrangPdfGoc = null; // Xác nhận mất đệm
    document.getElementById('khoiTrangThaiSgk').classList.add('hidden');
    document.getElementById('canvasHienThiPdf').classList.add('hidden');
    
    const vungIframe = document.getElementById('vungIframeDuPhong');
    vungIframe.classList.remove('hidden');
    document.getElementById('iframeTaiLieuGoc').src = `https://drive.google.com/file/d/${idPdf}/preview`;

    // Biến đổi Nút tải thành "Tải nguyên sách"
    document.getElementById('cumNutTaiXuong').classList.remove('hidden');
    document.getElementById('nhanTrangTai').classList.add('hidden');
    document.getElementById('trangTaiXuong').classList.add('hidden');
    document.getElementById('chuNutTai').innerText = "Tải toàn bộ SGK";
}

// =========================================================================
// KHỐI 4: TRÍCH XUẤT VÀ TẢI XUỐNG PDF (THÍCH ỨNG)
// =========================================================================
async function taiXuongBaiHocPDF() {
    const nutTai = document.getElementById('btnTienHanhTai');
    const noiDungGoc = nutTai.innerHTML;

    // NHÁNH 1: Chế độ Iframe (Sập mạng) -> Tải nguyên cuốn
    if (!boNhoTrangPdfGoc) {
        window.open(`https://drive.google.com/uc?export=download&id=${idTepHienTai}`, '_blank');
        return;
    }

    // NHÁNH 2: Chế độ Canvas (Mạng khỏe) -> Cắt trang
    const trangMuonTai = parseInt(document.getElementById('trangTaiXuong').value, 10);
    if (isNaN(trangMuonTai) || trangMuonTai < 1 || trangMuonTai > theHienPdfHienTai.numPages) {
        alert("Vui lòng nhập số trang hợp lệ để tải.");
        return;
    }

    nutTai.innerHTML = `<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>`;
    nutTai.disabled = true;

    try {
        if (typeof PDFLib === 'undefined') {
            await new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
                script.onload = resolve;
                document.head.appendChild(script);
            });
        }

        const { PDFDocument } = PDFLib;
        const docGoc = await PDFDocument.load(boNhoTrangPdfGoc);
        const docMoi = await PDFDocument.create();

        const chiSoTrang = trangMuonTai - 1;
        const [trangSaoChep] = await docMoi.copyPages(docGoc, [chiSoTrang]);
        docMoi.addPage(trangSaoChep);

        const pdfBytesMoi = await docMoi.save();
        const blob = new Blob([pdfBytesMoi], { type: 'application/pdf' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        const tenFile = tenBaiHienTai.replace(/[^a-zA-Z0-9]/g, '_') || 'TaiLieu';
        link.download = `${tenFile}_Trang_${trangMuonTai}.pdf`;
        link.click();

    } catch (loi) {
        console.error("Lỗi cắt file PDF:", loi);
        alert("Có lỗi xảy ra khi xử lý trích xuất PDF.");
    } finally {
        nutTai.innerHTML = noiDungGoc;
        nutTai.disabled = false;
    }
}
