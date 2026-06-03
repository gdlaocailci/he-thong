// --- CẤU HÌNH HỆ THỐNG GIAO TIẾP VÀ ĐỊNH DANH UI ---
var QLNS_CONFIG_GAS_URL = "https://script.google.com/macros/s/AKfycbwLFjHvjGSLMFvdGLYaj6W4Cu-Da3KFsLHBOgezQKtPwSzBT65CIaJG9frfS-vM7PVsTg/exec"; 
var QLNS_HAN_DUNG = "31/12/2026"; 

var QLNS_LINK_LOGO = "https://i.ibb.co/d0JNW94Z/logo-l-a-ch-n6.png"; 
var QLNS_TEN_TRUONG = "Trường TH&THCS Hợp Thành";
var QLNS_TEN_TRUONG_UP = "TRƯỜNG TH&THCS HỢP THÀNH";
var QLNS_TEN_PM = "Quản lý nhân sự";
var QLNS_TEN_PM_UP = "QUẢN LÝ CHẤT LƯỢNG ĐỘI NGŨ";
var QLNS_PHIEN_BAN = "V2.5.2026";
var QLNS_TAC_GIA_UP = "HOÀNG NGỌC LÂM";
var QLNS_GOOGLE_CLIENT_ID = "1097384743947-1jdc5rhhmbu0s9jp5vgt814g4f4id7lu.apps.googleusercontent.com";
var QLNS_MO_TA = "Hệ thống quản lý chất lượng đội ngũ nội bộ - " + QLNS_TEN_TRUONG;

/* ========================================================================= */
/* KHỞI TẠO CẤU TRÚC HEADER TỰ ĐỘNG TỪ FILE JS                               */
/* ========================================================================= */
(function() {
    var metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = "description";
        document.head.appendChild(metaDesc);
    }
    metaDesc.content = QLNS_MO_TA;
    
    document.title = QLNS_TEN_PM + " - " + QLNS_TEN_TRUONG;
    
    var linkIcon = document.getElementById('page_favicon');
    if (!linkIcon) {
        linkIcon = document.createElement('link');
        linkIcon.rel = 'icon';
        linkIcon.id = 'page_favicon';
        document.head.appendChild(linkIcon);
    }
    linkIcon.href = QLNS_LINK_LOGO;
})();
