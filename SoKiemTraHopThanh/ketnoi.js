/**
 * CẤU HÌNH GIAO DIỆN & KẾT NỐI HỆ THỐNG WEB APP (MÔ HÌNH ĐA TRƯỜNG)
 * Hệ thống: Sổ Kiểm Tra Nội Bộ (SKT)
 * Thiết kế và phát triển: Hoàng Ngọc Lâm
 */

/* KHỐI CÁC BIẾN CỐ ĐỊNH TÒAN HỆ THỐNG */
const SKT_GAS_URL = "https://script.google.com/macros/s/AKfycbxeQAXxsFNGjJlnnaimCshsK8wLVea9wnVePCR-ioB9Xr3Q4mVVUsDXIUIEYQ1vIZHb/exec";
const SKT_GOOGLE_CLIENT_ID = "1097384743947-1jdc5rhhmbu0s9jp5vgt814g4f4id7lu.apps.googleusercontent.com";
const SKT_LINK_YOUTUBE = "https://www.youtube.com/channel/UCdfiTWwv78VITvzlgxnv02Q"; 
const SKT_TEN_PM = "Sổ Kiểm Tra Nội Bộ";
const SKT_TEN_PM_UP = "SỔ KIỂM TRA NỘI BỘ";
const SKT_TEN_PM_DAY_DU = "PHẦN MỀM KIỂM TRA NỘI BỘ";
const SKT_PHIEN_BAN = "V3.2.2026 (Multi-tenant)";
const SKT_TAC_GIA = "Thiết kế và phát triển\nHoàng Ngọc Lâm";
const SKT_TAC_GIA_UP = "THIẾT KẾ VÀ PHÁT TRIỂN\nHOÀNG NGỌC LÂM";

/* KHỐI MA TRẬN CẤU HÌNH GIAO DIỆN TRÌNH DUYỆT */
const MA_TRAN_UI_CLIENT = {
  "TRUONG_A": {
    TEN_TRUONG: "TRƯỜNG TH&THCS HỢP THÀNH",
    TEN_TRUONG_UP: "TRƯỜNG TH&THCS HỢP THÀNH",
    LOGO_URL: "https://i.postimg.cc/Hn7bdGg5/Logo-truong-Photoroom.png"
  },
  "TRUONG_B": {
    TEN_TRUONG: "TRƯỜNG THCS B (DEMO)",
    TEN_TRUONG_UP: "TRƯỜNG THCS B (DEMO)",
    LOGO_URL: "https://i.postimg.cc/Hn7bdGg5/Logo-truong-Photoroom.png" 
  }
};

/* KHỐI BIẾN HOẠT ĐỘNG LINH HOẠT THEO TỪNG ĐƠN VỊ */
var SKT_TEN_TRUONG = MA_TRAN_UI_CLIENT["TRUONG_A"].TEN_TRUONG;
var SKT_TEN_TRUONG_UP = MA_TRAN_UI_CLIENT["TRUONG_A"].TEN_TRUONG_UP;
var SKT_LOGO_URL = MA_TRAN_UI_CLIENT["TRUONG_A"].LOGO_URL;

/* KHỐI NÂNG CẤP: HÀM CẬP NHẬT GIAO DIỆN TỨC THÌ KHI CHỌN TRƯỜNG */
function capNhatGiaoDienClient(ma_don_vi) {
    var cau_hinh = MA_TRAN_UI_CLIENT[ma_don_vi] || MA_TRAN_UI_CLIENT["TRUONG_A"];
    
    SKT_TEN_TRUONG = cauHinh.TEN_TRUONG;
    SKT_TEN_TRUONG_UP = cauHinh.TEN_TRUONG_UP;
    SKT_LOGO_URL = cauHinh.LOGO_URL;

    // Thay đổi hiển thị tức thì trên DOM
    document.title = SKT_TEN_PM + " - " + SKT_TEN_TRUONG;
    
    document.querySelectorAll('.login-logo, .sys-logo, .sidebar-logo').forEach(function(img) { 
        img.src = SKT_LOGO_URL; 
    });
    
    const loginSubTitle = document.getElementById('login-subtitle-main');
    if (loginSubTitle) loginSubTitle.innerText = SKT_TEN_TRUONG_UP;

    const sidebarSubtitle = document.getElementById('menu_subtitle');
    if (sidebarSubtitle) sidebarSubtitle.innerText = SKT_TEN_TRUONG;

    const loaderText = document.querySelector('.loader-text');
    if (loaderText) loaderText.innerText = SKT_TEN_PM_DAY_DU + " " + SKT_TEN_TRUONG_UP;
    
    const favicon = document.getElementById('skt_favicon');
    if (favicon) favicon.href = SKT_LOGO_URL;
}

/* ========================================================================= */
/* KHỞI TẠO CẤU TRÚC HEADER TỰ ĐỘNG KHI LOAD TRANG BAN ĐẦU                   */
/* ========================================================================= */
(function() {
    var metaCharset = document.createElement('meta');
    metaCharset.setAttribute('charset', 'utf-8');
    document.head.appendChild(metaCharset);

    // Tự động khôi phục cấu hình trường đã chọn từ phiên làm việc trước
    var maLuu = null;
    try { maLuu = sessionStorage.getItem("SKT_MA_DON_VI"); } catch(e) {}
    
    if (maLuu && MA_TRAN_UI_CLIENT[maLuu]) {
        SKT_TEN_TRUONG = MA_TRAN_UI_CLIENT[maLuu].TEN_TRUONG;
        SKT_TEN_TRUONG_UP = MA_TRAN_UI_CLIENT[maLuu].TEN_TRUONG_UP;
        SKT_LOGO_URL = MA_TRAN_UI_CLIENT[maLuu].LOGO_URL;
    }

    document.title = SKT_TEN_PM + " - " + SKT_TEN_TRUONG;

    var linkIcon = document.createElement('link');
    linkIcon.rel = 'icon';
    linkIcon.id = 'skt_favicon';
    linkIcon.href = SKT_LOGO_URL;
    document.head.appendChild(linkIcon);
})();
