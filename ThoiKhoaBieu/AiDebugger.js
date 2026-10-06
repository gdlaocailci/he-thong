// =========================================================================
// LƯỚI BẢO VỆ ĐA TẦNG (GITHUB PAGES): BẮT MỌI SỰ KIỆN THẤT BẠI
// =========================================================================

window.addEventListener('error', function(event) {
    // Chỉ kích hoạt khi biến quản trị được thiết lập (Tránh user thường gửi rác lên API)
    if (typeof window.coToanQuyenSDB !== 'undefined' && !window.coToanQuyenSDB) return; 
    let thongBaoLoi = "Lỗi Runtime: " + event.message;
    let viTri = `Tệp: ${event.filename} (Dòng ${event.lineno})`;
    guiLoiChoGeminiPhanTich(thongBaoLoi, viTri);
});

window.addEventListener('unhandledrejection', function(event) {
    if (typeof window.coToanQuyenSDB !== 'undefined' && !window.coToanQuyenSDB) return; 
    let thongBaoLoi = "Lỗi Bất đồng bộ (Promise/API): " + (event.reason ? (event.reason.message || event.reason) : "Không xác định");
    let viTri = "Khối Async/Await hoặc Fetch API";
    guiLoiChoGeminiPhanTich(thongBaoLoi, viTri);
});

async function guiLoiChoGeminiPhanTich(thongBaoLoi, viTri) {
    if (typeof CAU_HINH_FRONTEND === 'undefined' || !CAU_HINH_FRONTEND.URL_API_MAY_CHU) return;

    hienThiBangDieuKhienAI("Đang đóng gói lỗi và gửi cho AI máy chủ phân tích...", thongBaoLoi);

    let payloadLoi = {
        thaoTac: 'goiGeminiSuaLoi',
        thongBaoLoi: thongBaoLoi,
        viTri: viTri,
        doanMaLienQuan: "Lỗi phát sinh trên giao diện GitHub Pages. Bối cảnh không rõ, AI hãy phân tích theo Log."
    };

    try {
        let response = await fetch(CAU_HINH_FRONTEND.URL_API_MAY_CHU, {
            method: 'POST',
            body: JSON.stringify(payloadLoi)
        });
        
        let ketQua = await response.json();
        if (ketQua.trangThai === 'thanh_cong') {
            hienThiBangDieuKhienAI(ketQua.phanHoi, thongBaoLoi);
        } else {
            hienThiBangDieuKhienAI("AI Máy chủ báo lỗi: " + ketQua.thongBao, thongBaoLoi);
        }
    } catch (e) {
        hienThiBangDieuKhienAI("Đứt kết nối với Máy chủ Google Apps Script: " + e.message, thongBaoLoi);
    }
}

function hienThiBangDieuKhienAI(phanHoiAI, logLoi) {
    let bangAI = document.getElementById('ai-debugger-panel');
    if (!bangAI) {
        bangAI = document.createElement('div');
        bangAI.id = 'ai-debugger-panel';
        // Sử dụng class Tailwind CSS hiện có của hệ thống
        bangAI.className = 'fixed bottom-4 right-4 w-[600px] max-h-[80vh] overflow-y-auto bg-slate-900 text-slate-100 p-4 rounded shadow-2xl z-[9999] border border-emerald-600 font-mono text-sm leading-relaxed';
        document.body.appendChild(bangAI);
    }
    
    let formatPhanHoi = phanHoiAI
        .replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/```javascript/g, '<div class="bg-black p-3 rounded mt-2 mb-2 text-emerald-400 overflow-x-auto"><code>')
        .replace(/```/g, '</code></div>');

    bangAI.innerHTML = `
        <div class="flex justify-between items-center border-b border-slate-700 pb-3 mb-3">
            <span class="font-extrabold text-emerald-500 uppercase tracking-wider flex items-center gap-2">
                <svg class="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                Trợ lý Gemini Debugger
            </span>
            <button onclick="this.parentElement.parentElement.remove()" class="text-red-500 hover:text-red-400 font-bold bg-slate-800 px-3 py-1 rounded">ĐÓNG</button>
        </div>
        <div class="text-amber-400 mb-4 bg-amber-900/30 p-2 rounded border-l-4 border-amber-500">
            <strong>[SỰ KIỆN LỖI]:</strong> ${logLoi}
        </div>
        <div class="text-slate-300">${formatPhanHoi}</div>
    `;
}