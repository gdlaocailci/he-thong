let boNhoHocLieuSGK = {}; 
let theHienPdfHienTai = null;
let trangHienTaiPDF = 1;
let heSoThuPhong = 1.2;
let idTepHienTai = '';
let tenBaiHienTai = '';

document.addEventListener('DOMContentLoaded', () => {
    // [ĐÃ SỬA]: Loại bỏ hàm khoiTaoBoNhoHocLieu() ở đây để chống đụng độ API lúc khởi động
    xayDungKhungGiaoDienXemTruoc();
});

// =========================================================================
// KHỐI 1: KHỞI TẠO BỘ NHỚ VÀ XỬ LÝ CHUỖI (LAZY LOADING)
// =========================================================================
async function khoiTaoBoNhoHocLieu() {
    try {
        // [BẢN NÂNG CẤP]: Dùng hàm fetch có cơ chế lùi bước (chống lỗi 404) nếu app.js đã tải
        const fetchFunc = (typeof fetchVoiCoCheThuLai === 'function') ? fetchVoiCoCheThuLai : fetch;
        const phanHoi = await fetchFunc(`${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=layDanhMucSGK`);
        const duLieu = await phanHoi.json();
        
        if (duLieu.trangThai === 'loi_he_thong' || duLieu.trangThai === 'khong_ro_thao_tac') {
            throw new Error("API layDanhMucSGK chưa được khai báo trên máy chủ Google Apps Script.");
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
        throw loi; // Ném lỗi ra để hàm kích hoạt bắt được và báo cho GV
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

    // 1. TẢI DỮ LIỆU ON-DEMAND (Chỉ chạy 1 lần duy nhất khi bộ nhớ đang trống)
    if (Object.keys(boNhoHocLieuSGK).length === 0) {
        hienThiModalXemTruoc(tenKhoiGoc, tenMonGoc, tenBaiHoc, null);
        document.getElementById('vanBanTrangThaiSgk').innerText = "Đang kết nối CSDL Danh mục Sách giáo khoa...";
        try {
            await khoiTaoBoNhoHocLieu();
        } catch (loi) {
            dongModalXemTruoc();
            setTimeout(() => { alert(`Sự cố hệ thống: ${loi.message}\nĐồng chí vui lòng kiểm tra lại tệp code.html trên máy chủ đã có hàm layDanhMucSGK chưa, và nhớ Deploy lại phiên bản mới.`); }, 300);
            return;
        }
    }

    // 2. KIỂM TRA SÁCH GIÁO KHOA
    const idTepTin = boNhoHocLieuSGK[khoaTimKiem];
    if (!idTepTin) {
        dongModalXemTruoc();
        setTimeout(() => {
            alert(`Hệ thống chưa tìm thấy dữ liệu SGK cho Khối ${tenKhoiGoc} - Môn ${tenMonGoc}.\nKhóa truy xuất hiện tại: "${khoaTimKiem}".\nVui lòng kiểm tra lại bảng DANH_MUC_SGK có nhập đúng số Khối và Tên môn học chưa.`);
        }, 300);
        return;
    }

    // 3. XỬ LÝ GIAO DIỆN VÀ MỞ PDF
    const tenBaiDaLoc = chuanHoaTenTimKiem(tenBaiHoc);
    idTepHienTai = idTepTin;
    tenBaiHienTai = tenBaiDaLoc || 'TaiLieu';
    
    hienThiModalXemTruoc(tenKhoiGoc, tenMonGoc, tenBaiHoc, tenBaiDaLoc);
    await xuLyĐocVaTimKiemPDF(idTepTin, tenBaiDaLoc);
};

function xayDungKhungGiaoDienXemTruoc() {
    const modalHTML = `
    <div id="modalXemTruocSGK" class="hidden fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[9999] flex items-center justify-center font-sans transition-opacity reactbits-fade-in">
        <div class="bg-white w-11/12 md:w-5/6 lg:w-3/4 h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-300 transform scale-95 transition-transform duration-300" id="khungNoiDungModal">
            
            <!-- Thanh Tiêu Đề -->
            <div class="bg-gradient-to-r from-blue-800 to-indigo-900 px-5 py-3 flex justify-between items-center shadow-md z-10 flex-none border-b border-indigo-700">
                <div class="flex items-center gap-3 overflow-hidden">
                    <div class="bg-white/20 p-1.5 rounded-lg">
                        <!-- Icon Book Open -->
                        <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                    </div>
                    <div class="truncate">
                        <h3 id="tieuDeMonSgk" class="text-white font-extrabold text-lg leading-tight truncate">Đang tải học liệu...</h3>
                        <p id="tieuDeBaiSgk" class="text-blue-100 text-sm font-semibold truncate">Vui lòng chờ hệ thống phân tích</p>
                    </div>
                </div>
                
                <div class="flex items-center gap-2 flex-none">
                    <!-- Nút Tải Bài Học PDF -->
                    <button onclick="taiXuongBaiHocPDF()" id="nutTaiBaiHoc" class="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded shadow transition duration-200 mr-4" title="Tải trang bài học này về máy">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        <span class="text-sm hidden md:inline">Tải bài này</span>
                    </button>

                    <button onclick="dieuChinhThuPhong(0.2)" class="p-1.5 bg-white/10 hover:bg-white/20 rounded-md text-white transition" title="Phóng to">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
                    </button>
                    <button onclick="dieuChinhThuPhong(-0.2)" class="p-1.5 bg-white/10 hover:bg-white/20 rounded-md text-white transition mr-2" title="Thu nhỏ">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"></path></svg>
                    </button>
                    <button onclick="dongModalXemTruoc()" class="p-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-white shadow-sm transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
            </div>

            <!-- Vùng Hiển thị Tài liệu -->
            <div class="flex-1 bg-slate-200 overflow-auto relative flex justify-center p-4" id="vungVeTaiLieu">
                
                <!-- Bảng điều khiển trang -->
                <div class="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-800/90 backdrop-blur text-white px-5 py-2 rounded-full shadow-xl flex items-center gap-4 z-20 border border-slate-600">
                    <button onclick="chuyenTrangPdf(-1)" class="hover:text-blue-400 font-bold px-2 transition text-lg">◀</button>
                    <span class="text-sm font-semibold tracking-wide">Trang <span id="soTrangHienTai" class="font-extrabold text-blue-400 text-base">1</span> / <span id="tongSoTrang">--</span></span>
                    <button onclick="chuyenTrangPdf(1)" class="hover:text-blue-400 font-bold px-2 transition text-lg">▶</button>
                </div>

                <!-- Cảnh báo Trạng thái -->
                <div id="khoiTrangThaiSgk" class="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 z-10">
                    <div class="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                    <p id="vanBanTrangThaiSgk" class="text-slate-700 font-bold text-lg">Đang trích xuất học liệu số...</p>
                    <p id="tuKhoaTimKiemSgk" class="text-indigo-600 font-semibold text-sm mt-1"></p>
                </div>

                <canvas id="canvasHienThiPdf" class="shadow-2xl bg-white hidden max-w-full h-auto"></canvas>
                <div id="vungIframeDuPhong" class="hidden w-full h-full"></div>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function hienThiModalXemTruoc(tenKhoi, tenMon, tenBaiGoc, tenDaLoc) {
    document.getElementById('tieuDeMonSgk').innerText = `Khối ${tenKhoi} - Môn ${tenMon}`;
    document.getElementById('tieuDeBaiSgk').innerText = tenBaiGoc;
    
    document.getElementById('khoiTrangThaiSgk').classList.remove('hidden');
    document.getElementById('canvasHienThiPdf').classList.add('hidden');
    document.getElementById('vungIframeDuPhong').classList.add('hidden');
    document.getElementById('nutTaiBaiHoc').classList.remove('hidden');
    document.getElementById('vungIframeDuPhong').innerHTML = '';
    
    if (tenDaLoc) {
        document.getElementById('vanBanTrangThaiSgk').innerText = "Đang quét dữ liệu, định vị bài học...";
        document.getElementById('tuKhoaTimKiemSgk').innerText = `Từ khóa trích xuất: "${tenDaLoc}"`;
    }

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
// KHỐI 3: ĐỘNG CƠ XỬ LÝ VÀ TRÍCH XUẤT VĂN BẢN PDF (PDF.JS)
// =========================================================================
async function xuLyĐocVaTimKiemPDF(idPdf, tuKhoaTimKiem) {
    if (typeof pdfjsLib === 'undefined') {
        await new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
            script.onload = resolve;
            document.head.appendChild(script);
        });
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    }

    const urlProxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://drive.google.com/uc?export=download&id=${idPdf}`)}`;

    try {
        const loadingTask = pdfjsLib.getDocument(urlProxy);
        theHienPdfHienTai = await loadingTask.promise;
        
        document.getElementById('tongSoTrang').innerText = theHienPdfHienTai.numPages;
        trangHienTaiPDF = 1;

        if (tuKhoaTimKiem && tuKhoaTimKiem.length > 2) {
            let timThay = false;
            const gioiHanQuet = Math.min(theHienPdfHienTai.numPages, 60); 
            
            for (let i = 1; i <= gioiHanQuet; i++) {
                document.getElementById('tuKhoaTimKiemSgk').innerText = `Đang quét nội dung SGK: Trang ${i}...`;
                const trang = await theHienPdfHienTai.getPage(i);
                const textContent = await trang.getTextContent();
                const chuoiTrang = textContent.items.map(item => item.str).join(' ').toLowerCase();
                
                if (chuoiTrang.includes(tuKhoaTimKiem)) {
                    trangHienTaiPDF = i;
                    timThay = true;
                    break;
                }
            }
            if (!timThay) {
                document.getElementById('tuKhoaTimKiemSgk').innerText = `Chưa tìm thấy khớp lệnh. Hiển thị Trang 1.`;
                await new Promise(r => setTimeout(r, 1200));
            }
        }

        document.getElementById('khoiTrangThaiSgk').classList.add('hidden');
        document.getElementById('canvasHienThiPdf').classList.remove('hidden');
        
        veTrangCanVasPdf(trangHienTaiPDF);

    } catch (loi) {
        console.warn("Chuyển sang Iframe dự phòng.", loi);
        kichHoatLuoiAnToanIframe(idPdf);
    }
}

async function veTrangCanVasPdf(soTrang) {
    if (!theHienPdfHienTai) return;
    document.getElementById('soTrangHienTai').innerText = soTrang;
    
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
    document.getElementById('khoiTrangThaiSgk').classList.add('hidden');
    document.getElementById('canvasHienThiPdf').classList.add('hidden');
    // Ẩn nút tải xuống vì Iframe gốc của Google Drive không cho cắt trang
    document.getElementById('nutTaiBaiHoc').classList.add('hidden'); 
    
    const vungIframe = document.getElementById('vungIframeDuPhong');
    vungIframe.classList.remove('hidden');
    vungIframe.innerHTML = `<iframe src="https://drive.google.com/file/d/${idPdf}/preview" class="w-full h-full border-0 rounded shadow-inner" allow="autoplay"></iframe>`;
}

// =========================================================================
// KHỐI 4: [NÂNG CẤP BỔ SUNG] CẮT TRANG VÀ TẢI XUỐNG PDF (PDF-LIB)
// =========================================================================
async function taiXuongBaiHocPDF() {
    const nutTai = document.getElementById('nutTaiBaiHoc');
    const noiDungGoc = nutTai.innerHTML;
    
    // Hiển thị hiệu ứng tải
    nutTai.innerHTML = `<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span class="text-sm hidden md:inline">Đang xử lý...</span>`;
    nutTai.disabled = true;

    try {
        // Nạp thư viện pdf-lib động nếu chưa có
        if (typeof PDFLib === 'undefined') {
            await new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
                script.onload = resolve;
                document.head.appendChild(script);
            });
        }

        const urlProxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://drive.google.com/uc?export=download&id=${idTepHienTai}`)}`;
        
        // Trích xuất File PDF dưới dạng ArrayBuffer
        const res = await fetch(urlProxy);
        const pdfBytesGoc = await res.arrayBuffer();

        // Nạp tài liệu gốc và tạo tài liệu mới
        const { PDFDocument } = PDFLib;
        const docGoc = await PDFDocument.load(pdfBytesGoc);
        const docMoi = await PDFDocument.create();

        // Sao chép đúng trang bài học hiện tại (pdf-lib dùng chỉ số mảng bắt đầu từ 0)
        const chiSoTrang = trangHienTaiPDF - 1;
        const [trangSaoChep] = await docMoi.copyPages(docGoc, [chiSoTrang]);
        docMoi.addPage(trangSaoChep);

        // Xuất mảng byte và tải về máy
        const pdfBytesMoi = await docMoi.save();
        const blob = new Blob([pdfBytesMoi], { type: 'application/pdf' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        // Làm sạch tên file tải về
        const tenFile = tenBaiHienTai.replace(/[^a-zA-Z0-9]/g, '_') || 'BaiHoc';
        link.download = `TrichXuat_${tenFile}.pdf`;
        link.click();

    } catch (loi) {
        console.error("Lỗi cắt file PDF:", loi);
        alert("Có lỗi xảy ra khi xử lý trích xuất PDF. Vui lòng kiểm tra kết nối mạng.");
    } finally {
        nutTai.innerHTML = noiDungGoc;
        nutTai.disabled = false;
    }
}
