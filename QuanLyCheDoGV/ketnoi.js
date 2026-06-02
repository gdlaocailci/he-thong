// ==========================================
// CẤU HÌNH GIAO DIỆN & KẾT NỐI API MÁY CHỦ
// ==========================================

const HT_DUONG_DAN_API = "https://script.google.com/macros/s/AKfycbzuvwPLKjGmcxqtwsur2h9GLJMsG0vayOcnTxgeiaZT0shYWhaj6dO__WGmGKV93HE3/exec";

// Cấu hình định danh hành chính nhà trường
const HT_LOGO = "https://i.ibb.co/XkjLVJFt/logo-TH-THCS-v3.png";
const HT_TEN_TRUONG = "Trường TH&THCS Hợp Thành";
const HT_TIEU_DE_TRANG = "Quản lý Lương & Thâm niên - Trường TH&THCS Hợp Thành";

// Cấu hình API Google Login (Xác thực nội bộ)
const HT_CLIENT_ID = "1097384743947-1jdc5rhhmbu0s9jp5vgt814g4f4id7lu.apps.googleusercontent.com";

// Khởi tạo đối tượng truyền dẫn API an toàn
window.google = window.google || {};
window.google.script = window.google.script || {};

window.google.script.run = {
  _xuLyThanhCong: null,
  _xuLyThatBai: null,
  
  withSuccessHandler: function(hamXuLy) {
    this._xuLyThanhCong = hamXuLy;
    return this;
  },
  
  withFailureHandler: function(hamXuLy) {
    this._xuLyThatBai = hamXuLy;
    return this;
  },
  
  _goiMayChu: function(tenGoiHam, cacThamSo) {
    const maXacThuc = sessionStorage.getItem("CD_TOKEN") || sessionStorage.getItem("CD_TAI_KHOAN") || "";
    const thamSoTruyen = {
      method: 'POST',
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        tenHam: tenGoiHam,
        thamSo: cacThamSo,
        token: maXacThuc
      })
    };
    
    const thanhCong = this._xuLyThanhCong;
    const thatBai = this._xuLyThatBai;
    
    this._xuLyThanhCong = null;
    this._xuLyThatBai = null;
    
    fetch(HT_DUONG_DAN_API, thamSoTruyen)
      .then(ph => ph.json())
      .then(kq => {
        if (kq.error && thatBai) {
          thatBai(new Error(kq.error));
        } else if (thanhCong) {
          thanhCong(kq.data);
        }
      })
      .catch(loi => {
        if (thatBai) thatBai(loi);
      });
  }
};
