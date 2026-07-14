// DỰ ÁN QUẢN LÝ CHẤT LƯỢNG ĐỘI NGŨ
// File: NS_MinhChung.js (Module Minh Chứng Độc Lập)

const uiMinhChung = `
<style>
  /* Cấu trúc Modal chuẩn an toàn, không chiếm quyền điều khiển trình duyệt */
  /* ÉP z-index: 105055 để đè Modal nhập liệu của Bootstrap */
  #upload_modal_cv { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 105055; justify-content: center; align-items: center; }
  .up-container { background: #fff; padding: 20px; border-radius: 8px; width: 450px; max-width: 95%; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-family: 'Times New Roman', serif; }
  .up-header { border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px; text-align: center; }
  .up-box { margin-bottom: 15px; }
  .up-dropzone { border: 2px dashed #ccc; padding: 20px; text-align: center; cursor: pointer; border-radius: 6px; transition: 0.3s; background: #fafafa; }
  .up-dropzone:hover { border-color: #0891b2; background: #f0f9ff; }
  .close-up { width: 100%; padding: 10px; background: #64748b; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; margin-top: 10px; }
  .close-up:hover { background: #475569; }
  .btn-create-folder { border: 1px solid #ccc; background: #f0fdf4; color: #16a34a; width: 40px; cursor: pointer; border-radius: 4px; font-weight: bold; font-size: 18px; margin-left: 5px; }
  
  #warnDeleteCV { display:none; color:#d97706; font-size:13px; text-align:center; margin-bottom:10px; font-weight:bold; background: #fffbeb; padding: 8px; border-radius: 4px; border: 1px dashed #d97706; }
</style>

<div id="upload_modal_cv">
  <div class="up-container">
    <div class="up-header"><h2 style="margin:0; color:#b91c1c;" id="tdeModalCV">📁 VĂN BẢN KÈM THEO</h2></div>
    
    <div class="up-box" id="vungChonThuMucCV">
       <label><b>1. Thư mục lưu trữ (Chỉ dùng khi Tải File):</b></label>
       <div style="display:flex; gap:5px; margin-top:5px;">
           <select id="folderSelectCV" style="flex:1; padding:8px; border:1px solid #ccc; border-radius:4px;"><option>⏳ Đang kết nối...</option></select>
           <button class="btn-create-folder" onclick="toggleNewFolderUI()" title="Tạo thư mục con mới">➕</button>
       </div>
       <div id="newFolderArea" style="display:none; margin-top:8px; background:#f9fafb; padding:10px; border:1px solid #e5e7eb; border-radius:4px;">
           <label style="font-size:13px; font-weight:bold; color:#065f46;">Tên thư mục mới:</label>
           <div style="display:flex; gap:5px; margin-top:5px;">
               <input type="text" id="txtNewFolderName" placeholder="Ví dụ: Tháng 03/2026" style="flex:1; padding:6px; border:1px solid #ccc; border-radius:4px;">
               <button onclick="doCreateNewFolder()" style="background:#059669; color:white; border:none; padding:6px 10px; border-radius:4px; cursor:pointer;">Tạo</button>
               <button onclick="toggleNewFolderUI()" style="background:#ef4444; color:white; border:none; padding:6px 10px; border-radius:4px; cursor:pointer;">Hủy</button>
           </div>
           <div id="createFolderStatus" style="font-size:12px; margin-top:5px; color:#666;"></div>
       </div>
    </div>

    <div class="up-box">
      <label style="display:block; margin-bottom:5px;"><b>2. Chọn phương thức đính kèm:</b></label>
      <div style="display:flex; gap:15px; justify-content:center; margin-bottom:10px; font-weight:bold; flex-wrap: wrap;">
        <label id="lblModeFileCV"><input type="radio" name="upModeCV" value="file" checked onchange="toggleUpModeCV()"> 📄 Tải File lẻ</label>
        <label id="lblModeFolderCV"><input type="radio" name="upModeCV" value="folder" onchange="toggleUpModeCV()"> 📂 Cả thư mục</label>
        <label style="color: #047857;"><input type="radio" name="upModeCV" value="link" onchange="toggleUpModeCV()"> 🔗 Gán link Web/Drive</label>
      </div>
      
      <div style="display:flex; gap:20px; justify-content:center; padding:8px; background:#e0f2fe; border-radius:6px; margin-bottom:10px; font-size: 14px;">
        <label style="color:#0369a1; cursor:pointer;" title="Xóa tài liệu cũ, thay bằng tài liệu mới">
          <input type="radio" name="writeMode" value="replace" checked onchange="updateWarnDisplayCV()"> 🔄 Thay thế cũ
        </label>
        <label style="color:#0369a1; cursor:pointer;" title="Giữ tài liệu cũ, nối thêm tài liệu mới vào sau">
          <input type="radio" name="writeMode" value="append" onchange="updateWarnDisplayCV()"> ➕ Chèn thêm
        </label>
      </div>
      
      <div class="up-dropzone" id="dropzoneAreaCV" onclick="document.getElementById('fileInCV').click()">
        <span id="fileLabelCV">Nhấn vào đây để chọn file</span>
        <input type="file" id="fileInCV" style="display:none" onchange="fileSelCV(this)" multiple>
      </div>

      <div id="linkInputAreaCV" style="display:none; text-align: left;">
          <input type="text" id="txtDirectLinkCV" placeholder="Dán đường link (Google Drive hoặc link web trực tiếp .pdf, .jpg...) vào đây..." style="width:100%; padding:10px; border:1px solid #ccc; border-radius:6px; font-family: Arial, sans-serif;" oninput="checkDirectLinkCV()" autocomplete="off" spellcheck="false">
          <div style="font-size:12px; color:#666; margin-top:5px; font-style: italic;">* Lưu ý: Hỗ trợ link Google Drive đã mở quyền (Bất kỳ ai có liên kết) hoặc link file web trực tiếp. AI chỉ đọc được nếu file không bị khóa mật khẩu.</div>
      </div>

    </div>

    <div id="warnDeleteCV">⚠️ Tài liệu/Liên kết cũ sẽ bị thay thế (Hệ thống tự động dọn dẹp file Drive cũ nếu có để giảm tải bộ nhớ).</div>

    <div id="upStatusCV" style="text-align:center; font-weight:bold; min-height:20px; color:#333;"></div>
    
    <div style="margin-top:10px;">
      <button id="uploadBtnCV" style="width: 100%; padding: 12px; background: #0891b2; color: white; border: none; font-weight: bold; border-radius: 6px; cursor: pointer; opacity: 0.5; pointer-events: none;" onclick="doUploadCV()">TẢI LÊN NGAY</button>
      <button class="close-up" onclick="closeUploadModalCV()">ĐÓNG</button>
      <div style="clear:both"></div>
    </div>
  </div>
</div>
`;

// Nạp giao diện vào trang web
document.addEventListener("DOMContentLoaded", function() {
    if (!document.getElementById("upload_modal_cv")) {
        document.body.insertAdjacentHTML('beforeend', uiMinhChung);
    }
});

// Chuyển let thành var, gắn vào window để hàm toàn cục nhận diện
var GLOBAL_BTN_TRIGGER = null; 
var FILES_CV = [];
var LINK_CAN_XOA_CV = ""; 
var CURRENT_ROOT_ID = ""; 

window.SCV_OpenUploadModal = function(btnElement, currentLink, rootId, onlyLink = false) {
    if (typeof GLOBAL_PERM !== 'undefined' && !GLOBAL_PERM) { 
        if (typeof hienTbao === 'function') hienTbao("⚠️ Không có quyền thao tác!", "loi");
        return; 
    }
    
    GLOBAL_BTN_TRIGGER = btnElement;
    LINK_CAN_XOA_CV = currentLink || "";
    CURRENT_ROOT_ID = rootId || ""; 
    
    if(!CURRENT_ROOT_ID && !onlyLink) { alert("Lỗi hệ thống: Không xác định được thư mục gốc!"); return; }

    document.getElementById('upStatusCV').innerText = "";
    document.getElementById('fileInCV').value = "";
    document.getElementById('fileLabelCV').innerText = "Nhấn vào đây để chọn file minh chứng";
    
    const txtLink = document.getElementById('txtDirectLinkCV');
    txtLink.value = "";
    
    document.getElementById('uploadBtnCV').style.opacity = 0.5;
    document.getElementById('uploadBtnCV').style.pointerEvents = "none";
    document.getElementById('newFolderArea').style.display = 'none';
    FILES_CV = [];

    // CHẾ ĐỘ CHỈ LINK CHO ĐÁNH GIÁ
    if(onlyLink) {
        document.getElementById('tdeModalCV').innerText = "🔗 MINH CHỨNG LINK";
        document.getElementById('vungChonThuMucCV').style.display = 'none';
        document.getElementById('lblModeFileCV').style.display = 'none';
        document.getElementById('lblModeFolderCV').style.display = 'none';
        document.querySelector('input[name="upModeCV"][value="link"]').checked = true;
    } else {
        document.getElementById('tdeModalCV').innerText = "📁 VĂN BẢN KÈM THEO";
        document.getElementById('vungChonThuMucCV').style.display = 'block';
        document.getElementById('lblModeFileCV').style.display = 'inline-block';
        document.getElementById('lblModeFolderCV').style.display = 'inline-block';
        document.querySelector('input[name="upModeCV"][value="file"]').checked = true;
    }

    window.toggleUpModeCV();
    window.updateWarnDisplayCV();
    document.getElementById('upload_modal_cv').style.display = 'flex';
    
    // Tự động đẩy con trỏ chuột vào ô dán link
    if(onlyLink) {
        setTimeout(function() {
            const textLinkInput = document.getElementById('txtDirectLinkCV');
            if (textLinkInput) textLinkInput.focus();
        }, 200);
    }

    if(!onlyLink) window.loadFoldersCV();
};

window.updateWarnDisplayCV = function() {
    const wMode = document.querySelector('input[name="writeMode"]:checked').value;
    const warnDiv = document.getElementById('warnDeleteCV');
    if(wMode === 'replace' && LINK_CAN_XOA_CV && LINK_CAN_XOA_CV.trim() !== "") {
        warnDiv.style.display = 'block';
    } else {
        warnDiv.style.display = 'none';
    }
};

window.loadFoldersCV = function() {
   const s = document.getElementById('folderSelectCV');
   if(!s) return;
   s.innerHTML = `<option value="${CURRENT_ROOT_ID}">⏳ Đang tải cấu trúc thư mục...</option>`; 
   s.disabled = true;
   if (typeof google !== 'undefined' && typeof google.script !== 'undefined') {
       google.script.run.withSuccessHandler(fs => {
          s.disabled = false; 
          s.innerHTML = `<option value="${CURRENT_ROOT_ID}">📂 THƯ MỤC GỐC</option>`;
          if(fs && fs.length > 0) { fs.forEach(f => { s.add(new Option(f.name, f.id)); }); }
       }).SCV_getSubFolders(CURRENT_ROOT_ID);
   } else {
       s.innerHTML = `<option value="${CURRENT_ROOT_ID}">📂 THƯ MỤC GỐC</option>`;
       s.disabled = false;
   }
};

window.toggleNewFolderUI = function() { 
    const a = document.getElementById('newFolderArea'); 
    a.style.display = a.style.display === 'none' ? 'block' : 'none'; 
    if(a.style.display === 'block') document.getElementById('txtNewFolderName').focus(); 
};

window.doCreateNewFolder = function() {
    const n = document.getElementById('txtNewFolderName').value;
    const p = document.getElementById('folderSelectCV').value; 
    if(!n) return;
    document.getElementById('createFolderStatus').innerText = "⏳ Đang khởi tạo thư mục nội bộ...";
    if (typeof google !== 'undefined') {
        google.script.run.withSuccessHandler(res => {
            if(res.success){
                const s = document.getElementById('folderSelectCV');
                s.add(new Option("📂 " + res.name, res.id), s.selectedIndex + 1); 
                s.value = res.id;
                window.toggleNewFolderUI();
            }
        }).SCV_createNewFolder(p, n);
    }
};

window.closeUploadModalCV = function() {
   document.getElementById('upload_modal_cv').style.display = 'none';
   GLOBAL_BTN_TRIGGER = null;
};

window.toggleUpModeCV = function() {
   const mode = document.querySelector('input[name="upModeCV"]:checked').value;
   const inp = document.getElementById('fileInCV');
   const dropzone = document.getElementById('dropzoneAreaCV');
   const linkArea = document.getElementById('linkInputAreaCV');
   const btn = document.getElementById('uploadBtnCV');

   if (mode === 'link') {
       dropzone.style.display = 'none';
       linkArea.style.display = 'block';
       btn.innerText = "LƯU LINK NÀY NGAY";
       btn.style.background = "#047857"; 
       document.getElementById('txtDirectLinkCV').value = "";
       window.updateWarnDisplayCV(); 
       window.checkDirectLinkCV(); 
   } else {
       dropzone.style.display = 'block';
       linkArea.style.display = 'none';
       btn.innerText = "TẢI LÊN NGAY";
       btn.style.background = "#0891b2";
       inp.value = ""; 
       document.getElementById('fileLabelCV').innerText = "Nhấn vào đây để chọn file minh chứng";
       btn.style.opacity = 0.5;
       btn.style.pointerEvents = "none";

       if (mode === 'folder') { 
           inp.setAttribute('webkitdirectory', ''); 
           inp.setAttribute('directory', '');
           inp.setAttribute('multiple', 'multiple');
           document.getElementById('warnDeleteCV').style.display = 'none';
       } else { 
           inp.removeAttribute('webkitdirectory');
           inp.removeAttribute('directory'); 
           inp.setAttribute('multiple', 'multiple');
           window.updateWarnDisplayCV();
       }
   }
};

window.checkDirectLinkCV = function() {
    const val = document.getElementById('txtDirectLinkCV').value.trim();
    const btn = document.getElementById('uploadBtnCV');
    if (val !== "") {
        btn.style.opacity = 1;
        btn.style.pointerEvents = "auto";
    } else {
        btn.style.opacity = 0.5;
        btn.style.pointerEvents = "none";
    }
};

window.fileSelCV = function(input) {
   if (input.files.length > 0) {
     FILES_CV = input.files;
     const mode = document.querySelector('input[name="upModeCV"]:checked').value;
     if (mode === 'folder') { 
        const n = FILES_CV[0].webkitRelativePath.split('/')[0];
        document.getElementById('fileLabelCV').innerText = `📂 ${n} (${FILES_CV.length} files)`; 
     } else { 
        if(FILES_CV.length === 1) { document.getElementById('fileLabelCV').innerText = "📄 " + FILES_CV[0].name; }
        else { document.getElementById('fileLabelCV').innerText = `📄 Đã chọn ${FILES_CV.length} tệp`; }
     }
     document.getElementById('uploadBtnCV').style.opacity = 1;
     document.getElementById('uploadBtnCV').style.pointerEvents = "auto";
   }
};

window.doUploadCV = function() {
   const mode = document.querySelector('input[name="upModeCV"]:checked').value;
   const wMode = document.querySelector('input[name="writeMode"]:checked').value;
   const btn = document.getElementById('uploadBtnCV'), st = document.getElementById('upStatusCV');
   
   if (mode === 'link') {
       const linkVal = document.getElementById('txtDirectLinkCV').value.trim();
       if (!linkVal) return;
       
       btn.style.opacity = 0.5;
       btn.style.pointerEvents = "none";
       st.style.color = "blue";

       let finalLinkStr = linkVal;

       if (wMode === 'append' && LINK_CAN_XOA_CV && LINK_CAN_XOA_CV.trim() !== "") {
           st.innerText = "⏳ Đang gắn kết thêm đường dẫn...";
           finalLinkStr = LINK_CAN_XOA_CV + "," + linkVal;
           setTimeout(() => { window.handleUpResultCV({ success: true, fileUrl: finalLinkStr, message: "Đã chèn thêm link thành công!" }, st, btn); }, 300);
       } 
       else if (wMode === 'replace' && LINK_CAN_XOA_CV && LINK_CAN_XOA_CV.trim() !== "") {
           st.innerText = "⏳ Đang ghi đè liên kết...";
           if(typeof google !== 'undefined' && typeof google.script !== 'undefined' && typeof google.script.run.SCV_deleteFileByUrl === 'function') {
               google.script.run.withSuccessHandler(function() {}).withFailureHandler(function() {}).SCV_deleteFileByUrl(LINK_CAN_XOA_CV);
           }
           setTimeout(() => { window.handleUpResultCV({ success: true, fileUrl: finalLinkStr, message: "Đã thay thế và gán link mới thành công!" }, st, btn); }, 300);
       } 
       else {
           st.innerText = "⏳ Đang cập nhật và ghi đè đường dẫn...";
           setTimeout(() => { window.handleUpResultCV({ success: true, fileUrl: finalLinkStr, message: "Đã gán link thành công!" }, st, btn); }, 300); 
       }
       return;
   }

   if (!FILES_CV || FILES_CV.length === 0) return;
   const fId = document.getElementById('folderSelectCV').value || CURRENT_ROOT_ID;
   
   btn.style.opacity = 0.5;
   btn.style.pointerEvents = "none"; 
   st.style.color = "blue"; 
   st.innerText = "⏳ Đang chuẩn bị luồng dữ liệu tải lên...";
   
   let filesData = [];
   let count = 0;
   
   if (mode === 'file') {
     st.innerText = `⏳ Đang đọc chuẩn hóa ${FILES_CV.length} tệp...`;
     Array.from(FILES_CV).forEach(file => {
       const r = new FileReader();
       r.onload = e => {
         filesData.push({ fileName: file.name, mimeType: file.type, data: e.target.result.split(',')[1] });
         count++;
         if (count === FILES_CV.length && typeof google !== 'undefined') {
           st.innerText = `⏳ Đang đồng bộ ${FILES_CV.length} tệp lên Hệ thống lưu trữ...`;
           google.script.run.withSuccessHandler(res => { window.handleUpResultCV(res, st, btn); })
           .withFailureHandler(err => { st.style.color="red"; st.innerText="❌ "+err.message; btn.style.opacity=1; btn.style.pointerEvents="auto"; })
           .SCV_uploadMultipleFilesToDrive(filesData, "", fId, LINK_CAN_XOA_CV, wMode);
         }
       };
       r.readAsDataURL(file);
     });
   } else {
     const folderName = FILES_CV[0].webkitRelativePath.split('/')[0];
     st.innerText = `⏳ Đang đọc thư mục chứa ${FILES_CV.length} tệp...`;
     Array.from(FILES_CV).forEach(file => {
       const r = new FileReader();
       r.onload = e => {
         filesData.push({ fileName: file.name, mimeType: file.type, data: e.target.result.split(',')[1] });
         count++;
         if (count === FILES_CV.length && typeof google !== 'undefined') {
           st.innerText = "⏳ Đang đồng bộ cấu trúc thư mục lên Hệ thống...";
           google.script.run.withSuccessHandler(res => { window.handleUpResultCV(res, st, btn); })
           .withFailureHandler(err => { st.style.color="red"; st.innerText="❌ "+err.message; btn.style.opacity=1; btn.style.pointerEvents="auto"; })
           .SCV_uploadFolderEvidence(fId, folderName, filesData, LINK_CAN_XOA_CV, wMode); 
         }
       };
       r.readAsDataURL(file);
     });
   }
};

window.handleUpResultCV = function(res, st, btn) {
   if (res.success) { 
       st.style.color = "green";
       st.innerText = "✅ " + res.message; 
       if (GLOBAL_BTN_TRIGGER) {
           const modalDg = document.getElementById('hopThoaiDg');
           if (modalDg) {
               const inputLink = modalDg.querySelector('.val-link');
               if (inputLink) inputLink.value = res.fileUrl;
           }

           const container = GLOBAL_BTN_TRIGGER.parentElement;
           if(container) {
               let valLink = container.querySelector('.val-link');
               if(valLink) valLink.value = res.fileUrl; 
               
               const links = res.fileUrl.split(',').map(l => l.trim()).filter(l => l !== "");
               let displayArea = container.querySelector('.link-display-area');
               if(displayArea) {
                   displayArea.innerHTML = links.map((url, idx) => `<a href="${url}" target="_blank" class="btn-icon btn-view-icon" title="Xem tài liệu minh chứng ${idx+1}">📎 ${idx+1}</a>`).join('');
               }
           }
           
           if (typeof veGhimModal === 'function') {
               veGhimModal(res.fileUrl);
           }
       }
       setTimeout(window.closeUploadModalCV, 1000);
   } 
   else { 
       st.style.color = "red"; 
       st.innerText = "❌ " + res.message;
       if(btn) {
           btn.style.opacity = 1; 
           btn.style.pointerEvents = "auto"; 
       }
   }
};
