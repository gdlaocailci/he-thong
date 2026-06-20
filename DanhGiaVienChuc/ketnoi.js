/* ==========================================================================
   TỆP CẤU HÌNH GIAO DIỆN (ketnoi.js)
   CHỨC NĂNG: LƯU TRỮ VÀ ĐỒNG BỘ TOÀN BỘ CÁC THÔNG SỐ ĐỊNH DANH HỆ THỐNG
   ========================================================================== */

var DG_CONFIG_GAS_URL = "https://script.google.com/macros/s/AKfycbyfW0HDpryuXX9HqqEAS7Ggec1iXbSdcUGjMxcZMvnREjhD5CkJuVZFvII899dKwrcV/exec";

var DG_LINK_LOGO = "https://i.ibb.co/6R8Y9DNq/logo-l-a-ch-n6.png"; 

var DG_TEN_TRUONG = "Trường TH&THCS Hợp Thành";
var DG_TEN_TRUONG_UP = "TRƯỜNG TH&THCS HỢP THÀNH";

var DG_TEN_PM = "Hệ Thống Đánh Giá Xếp Loại Viên Chức";
var DG_TEN_PM_UP = "HỆ THỐNG ĐÁNH GIÁ XẾP LOẠI CUỐI NĂM";
var DG_TAC_GIA = "Hoàng Ngọc Lâm";
var DG_TAC_GIA_UP = "HOÀNG NGỌC LÂM";

var DG_GOOGLE_CLIENT_ID = "1097384743947-1jdc5rhhmbu0s9jp5vgt814g4f4id7lu.apps.googleusercontent.com";
var DG_MO_TA = "Hệ thống đánh giá xếp loại viên chức cuối năm - " + DG_TEN_TRUONG;

/* ========================================================================= */
/* KHỞI TẠO CẤU TRÚC HEADER VÀ ĐỒNG BỘ GIAO DIỆN TỰ ĐỘNG                     */
/* ========================================================================= */
(function() {
    // 1. Tạo thẻ Meta Description
    var metaDesc = document.createElement('meta');
    metaDesc.name = "description";
    metaDesc.content = DG_MO_TA;
    document.head.appendChild(metaDesc);
    
    // 2. Cập nhật thẻ Title
    document.title = DG_TEN_PM + " - " + DG_TEN_TRUONG;
    
    // 3. Khởi tạo thẻ Favicon
    var linkIcon = document.createElement('link');
    linkIcon.rel = 'icon';
    linkIcon.id = 'page_favicon';
    linkIcon.href = DG_LINK_LOGO;
    document.head.appendChild(linkIcon);
})();

// Hàm đồng bộ tên, logo vào tất cả các thẻ của phần mềm
function applyDGConfig() {
    if(typeof DG_LINK_LOGO !== 'undefined') {
        document.querySelectorAll('.app-logo').forEach(img => { img.src = DG_LINK_LOGO; img.style.display = 'inline-block'; });
    }
    if(typeof DG_TEN_PM !== 'undefined') {
        document.querySelectorAll('.app-title-name').forEach(el => el.innerText = DG_TEN_PM);
    }
    if(typeof DG_TEN_PM_UP !== 'undefined') {
        document.querySelectorAll('.app-title-name-up').forEach(el => el.innerText = DG_TEN_PM_UP);
    }
    if(typeof DG_TEN_TRUONG !== 'undefined') {
        document.querySelectorAll('.app-school-name').forEach(el => el.innerText = DG_TEN_TRUONG);
    }
    if(typeof DG_TEN_TRUONG_UP !== 'undefined') {
        document.querySelectorAll('.app-school-name-up').forEach(el => el.innerText = DG_TEN_TRUONG_UP);
    }
    if(typeof DG_TAC_GIA !== 'undefined') {
        document.querySelectorAll('.app-author-name').forEach(el => el.innerText = DG_TAC_GIA);
    }
    if(typeof DG_GOOGLE_CLIENT_ID !== 'undefined') {
        let gId = document.getElementById('g_id_onload');
        if(gId) gId.setAttribute('data-client_id', DG_GOOGLE_CLIENT_ID);
    }
}
