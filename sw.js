// Bắt buộc phải có tệp này để Android công nhận là Ứng dụng
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  return self.clients.claim();
});

// Cơ chế luôn tải mới dữ liệu qua mạng, không lưu cache để tránh lỗi
self.addEventListener('fetch', (e) => {
  e.respondWith(fetch(e.request));
});
