const GAS_URL = "https://script.google.com/macros/s/AKfycbxvpZphGelq1_JCgVlqJ4qjvzFGiB3JlnZLluURcgVozxED9DUEUKrqTuCEClnGzK3X0g/exec";

// ระบบ Scale สำหรับ iPad/คอม
function resize() {
  const stage = document.querySelector(".stage");
  const s = Math.min(window.innerWidth / 2560, window.innerHeight / 1440);
  stage.style.transform = `translate(-50%, -50%) scale(${s})`;
}
window.onresize = resize;
window.onload = resize;
resize();

// เลือกรูปภาพ
const fileInput = document.getElementById("fileInput");
const previewImg = document.getElementById("previewImg");
const photoStatus = document.getElementById("photoStatus");

document.getElementById("uploadBtn").onclick = () => fileInput.click();

fileInput.onchange = () => {
  const file = fileInput.files[0];
  if (!file) return;

  if (file.size > 10 * 1024 * 1024) {
    alert("ไฟล์ใหญ่เกิน 10MB!");
    return;
  }

  photoStatus.innerText = "กำลังประมวลผลรูปภาพ...";
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      // สร้าง Canvas เพื่อบังคับให้ iPad แสดงผลรูป (แก้ปัญหาเลือกรูปแล้วไม่ขึ้น)
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const max = 1200;
      let w = img.width;
      let h = img.height;

      if (w > h) { if (w > max) { h *= max / w; w = max; } }
      else { if (h > max) { w *= max / h; h = max; } }

      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);
      
      previewImg.src = canvas.toDataURL("image/jpeg", 0.8);
      previewImg.style.display = "block";
      photoStatus.style.display = "none";
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

// Dropdown
const posBox = document.getElementById("positionDropdown");
const posSel = document.getElementById("positionSelected");
posSel.onclick = (e) => { e.stopPropagation(); posBox.classList.toggle("open"); };
posBox.querySelectorAll(".dropdown-list div").forEach(d => {
  d.onclick = () => { posSel.innerText = d.innerText; posBox.classList.remove("open"); };
});

// ส่งข้อมูล
document.getElementById("submitBtn").onclick = () => {
  const f = document.getElementById("firstName").value;
  const l = document.getElementById("lastName").value;
  const p = posSel.innerText;
  const r = document.getElementById("rankInput").value;

  if (!f || !l || p === "เลือกตำแหน่ง" || !r || !previewImg.src) {
    alert("กรอกข้อมูลให้ครบและเลือกรูปก่อนครับ!");
    return;
  }

  document.getElementById("popupMessage").innerHTML = `ยืนยันข้อมูล<br>${f} ${l}<br>ตำแหน่ง: ${p}<br>อันดับ: ${r}`;
  document.getElementById("popup").classList.remove("hidden");

  document.getElementById("popupConfirm").onclick = () => {
    document.getElementById("popup").classList.add("hidden");
    document.getElementById("loadingOverlay").classList.remove("hidden");

    fetch(GAS_URL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify({ firstName: f, lastName: l, position: p, rank: r, imageBase64: previewImg.src })
    }).then(() => {
      alert("บันทึกสำเร็จ!");
      location.reload();
    }).catch(() => {
      alert("เกิดข้อผิดพลาด!");
      document.getElementById("loadingOverlay").classList.add("hidden");
    });
  };
};

document.getElementById("popupCancel").onclick = () => document.getElementById("popup").classList.add("hidden");

