// =========================================================================
// KHỐI 1: CẤU HÌNH HỆ THỐNG FRONTEND
// =========================================================================
const CAU_HINH_FRONTEND = {
    // Giữ lại URL cũ làm dự phòng cho giai đoạn chuyển giao hoặc chạy Webhook
    URL_API_MAY_CHU: 'https://script.google.com/macros/s/AKfycbwZ2s1lF4ABsD4EQBHOJpTaGieUOtnhTRTgukCOlbMSd96f888IiWUu9ocuZfhc2PxN/exec',
    TEN_DU_AN: 'THỜI KHÓA BIỂU & SỔ ĐẦU BÀI THÔNG MINH',
    MA_DU_AN: 'DU_AN_TAPHOI',
    
    // Cấu hình chữ ký Footer hiển thị 2 dòng
    TIEU_DE_TAC_GIA: 'Thiết kế và phát triển',
    TAC_GIA_THIET_KE: 'Hoàng Ngọc Lâm',

    LINK_LOGO_TRANG_CHU: 'https://i.postimg.cc/xjzpvXCm/Logo-HL.png',
    LINK_ICON_BANG: 'https://i.postimg.cc/xjzpvXCm/Logo-HL.png',
    LINK_ICON_DANG_TAI: 'https://i.postimg.cc/xjzpvXCm/Logo-HL.png',
    LINK_ICON_TRONG: 'https://i.postimg.cc/xjzpvXCm/Logo-HL.png',
    LINK_ICON_LAM_MOI: 'https://i.postimg.cc/xjzpvXCm/Logo-HL.png'
};

// =========================================================================
// KHỐI 2: CẤU HÌNH XÁC THỰC (GOOGLE IDENTITY)
// =========================================================================
const SKT_GOOGLE_CLIENT_ID = "1097384743947-1jdc5rhhmbu0s9jp5vgt814g4f4id7lu.apps.googleusercontent.com";

// =========================================================================
// [NÂNG CẤP LÕI]: KHỐI 3: CẤU HÌNH KẾT NỐI FIREBASE REALTIME DATABASE
// Phục vụ cơ chế đồng bộ WebSockets thời gian thực, thay thế Google Sheets
// =========================================================================
const CAU_HINH_FIREBASE = {
    apiKey: "NHAP_API_KEY_CUA_DONG_CHI",
    authDomain: "NHAP_AUTH_DOMAIN.firebaseapp.com",
    databaseURL: "https://NHAP_DATABASE_NAME.firebaseio.com",
    projectId: "NHAP_PROJECT_ID",
    storageBucket: "NHAP_STORAGE_BUCKET.appspot.com",
    messagingSenderId: "NHAP_SENDER_ID",
    appId: "NHAP_APP_ID"
};

// Biến toàn cục quản lý phiên kết nối Database
let heThongFirebaseToanCuc;
let khoDuLieuRealtime;

// Hàm khởi tạo sẽ được gọi ở index.html sau khi tải xong SDK
window.khoiDongBoMayFirebase = function() {
    if (typeof firebase !== 'undefined' && !firebase.apps.length) {
        heThongFirebaseToanCuc = firebase.initializeApp(CAU_HINH_FIREBASE);
        khoDuLieuRealtime = firebase.database();
        console.log("✅ [Smart Sync]: Đã thiết lập thành công luồng WebSockets tới Firebase!");
    } else if (typeof firebase === 'undefined') {
        console.warn("⚠️ Cảnh báo: Thư viện Firebase SDK chưa được nạp vào hệ thống.");
    }
};
