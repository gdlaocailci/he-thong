const KET_NOI = {
  // 1. THÔNG SỐ KẾT NỐI MÁY CHỦ
  URL_API_BACKEND: 'https://script.google.com/macros/s/AKfycbzso6qg0bBefy_j5-x7_xP6jRbOz4K5_Vz94e2oW5PGcD-KpnB1JfH3Tj9FnxZs5mmq/exec',
  
  // 2. THÔNG TIN THỂ THỨC VĂN BẢN (NĐ 30/2020/NĐ-CP)
  CQ_CHU_QUAN: 'UBND XÃ HỢP THÀNH',
  TEN_TO_CHUC: 'TRƯỜNG TH&THCS HỢP THÀNH',
  NOI_BAN_HANH: 'Hợp Thành',
  MA_SO_VAN_BAN: '/BB-THHT', 
  
  // 3. CẤU HÌNH GIAO DIỆN HIỂN THỊ
  TIEU_DE_PHAN_MEM: 'SỔ SOẠN THẢO HÀNH CHÍNH & SƯ PHẠM',
  LOGO_TRUONG: 'https://i.postimg.cc/Hn7bdGg5/Logo-truong-Photoroom.png', 
  CAN_BO_THAO_TAC: 'Cán bộ Hành chính',

  // 4. MÃ ĐỊNH DANH BẢO MẬT GOOGLE IDENTITY
  CLIENT_ID: '1097384743947-1jdc5rhhmbu0s9jp5vgt814g4f4id7lu.apps.googleusercontent.com',
  
  // 5. DANH SÁCH KIỂM DUYỆT BỀ MẶT (Phục hồi để Frontend chặn tức thời)
  DANH_SACH_TAI_KHOAN: [
      'tulieuhopthanh@gmail.com'
  ],

  // 6. DANH MỤC VĂN BẢN
  DANH_MUC_VAN_BAN: [
      { giaTri: '1', tenHienThi: '1. Phiếu đánh giá bài dạy' },
      { giaTri: '2', tenHienThi: '2. Biên bản sự việc (Hành chính)' },
      { giaTri: '3', tenHienThi: '3. Hồ sơ Đảng (Quyết định thành lập)' },
      { giaTri: '4', tenHienThi: '4. Hồ sơ Đảng (Kế hoạch)' },
      { giaTri: '5', tenHienThi: '5. Hồ sơ Đảng (Biên bản triển khai cuộc kiểm tra)' },
      { giaTri: '6', tenHienThi: '6. Báo cáo (Giải trình)' },
      { giaTri: '7', tenHienThi: '7. Hồ sơ Đảng (Báo cáo thẩm tra)' },
      { giaTri: '8', tenHienThi: '8. Hồ sơ Đảng (Biên bản họp chi bộ)' },
      { giaTri: '9', tenHienThi: '9. Hồ sơ Đảng (Biên bản công bố kết quả kiểm tra)' }
  ]
};
