// --- ĐƯỜNG DẪN HỆ THỐNG ---
// Nhớ thay đổi đường dẫn này thành link App Script Deployment mới nhất của thầy sau khi Cập nhật (Deploy)
const linkapi = "https://script.google.com/macros/s/AKfycbz0gfE1OyUna38urS0l154uAdD_j8ghD6oRCbbhJ63M7n28QlgiP-8TdZQeOsiAfL3J/exec";

// --- HÀM TRUYỀN TẢI DỮ LIỆU ---
async function callServer(tenYeuCau, duLieuTai = {}) {
    duLieuTai.yeuCau = tenYeuCau;
    try {
        const phanHoi = await fetch(linkapi, {
            method: 'POST',
            headers: {
                "Content-Type": "text/plain;charset=utf-8",
            },
            body: JSON.stringify(duLieuTai)
        });
        return await phanHoi.json();
    } catch (loiMang) {
        console.error("Mất kết nối:", loiMang);
        throw new Error("Lỗi đường truyền đến máy chủ. Hãy kiểm tra mạng hoặc liên kết triển khai!");
    }
}