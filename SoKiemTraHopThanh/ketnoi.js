/**
 * CẤU HÌNH GIAO DIỆN & KẾT NỐI HỆ THỐNG WEB APP
 * Hệ thống: Sổ Kiểm Tra Nội Bộ (SKT)
 * Tác giả: Hoàng Ngọc Lâm
 */
const SKT_GAS_URL = "https://script.google.com/macros/s/AKfycbxeQAXxsFNGjJlnnaimCshsK8wLVea9wnVePCR-ioB9Xr3Q4mVVUsDXIUIEYQ1vIZHb/exec";
const SKT_LOGO_URL = "https://i.ibb.co/S46wLjDt/logo-tr-ng-TH-THCS-Hop-Thanh3-removebg-preview.png";

const SKT_TEN_TRUONG = "TRƯỜNG TH&THCS HỢP THÀNH";
const SKT_TEN_TRUONG_UP = "TRƯỜNG TH&THCS HỢP THÀNH";
const SKT_TEN_PM = "Sổ Kiểm Tra Nội Bộ";
const SKT_TEN_PM_UP = "SỔ KIỂM TRA NỘI BỘ";
const SKT_TEN_PM_DAY_DU = "PHẦN MỀM KIỂM TRA NỘI BỘ";
const SKT_PHIEN_BAN = "V3.1.2026";
const SKT_TAC_GIA = "Hoàng Ngọc Lâm";
const SKT_TAC_GIA_UP = "HOÀNG NGỌC LÂM";

// MÃ CLIENT ID CỦA GOOGLE ĐĂNG NHẬP
const SKT_GOOGLE_CLIENT_ID = "1097384743947-1jdc5rhhmbu0s9jp5vgt814g4f4id7lu.apps.googleusercontent.com";

// ĐƯỜNG DẪN YOUTUBE HƯỚNG DẪN SỬ DỤNG
const SKT_LINK_YOUTUBE = "https://www.youtube.com/channel/UCdfiTWwv78VITvzlgxnv02Q"; // Thầy thay bằng link Youtube thực tế

/* ========================================================================= */
/* KHỞI TẠO CẤU TRÚC HEADER TỰ ĐỘNG TỪ FILE JS                               */
/* ========================================================================= */
(function() {
    var metaCharset = document.createElement('meta');
    metaCharset.setAttribute('charset', 'utf-8');
    document.head.appendChild(metaCharset);

    document.title = SKT_TEN_PM + " - " + SKT_TEN_TRUONG;

    var linkIcon = document.createElement('link');
    linkIcon.rel = 'icon';
    linkIcon.href = SKT_LOGO_URL;
    document.head.appendChild(linkIcon);
})();
