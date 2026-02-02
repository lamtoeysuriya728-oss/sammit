const GAS_URL = "https://script.google.com/macros/s/AKfycbxvpZphGelq1_JCgVlqJ4qjvzFGiB3JlnZLluURcgVozxED9DUEUKrqTuCEClnGzK3X0g/exec";

function resize() {
  const stage = document.querySelector(".stage");
  const s = Math.min(window.innerWidth / 2560, window.innerHeight / 1440);
  stage.style.transform = `translate(-50%, -50%) scale(${s})`;
}
window.onresize = resize; window.onload = resize; resize();

// ระบบ Popup กลาง
const popup = document.getElementById("popup");
const popupMsg = document.getElementById("popupMessage");
const btnCancel = document.getElementById("popupCancel");
const btnConfirm = document.getElementById("popupConfirm");

function showPopup(text, mode = "confirm", onConfirm = null) {
  popupMsg.innerHTML = text;
  popup.classList.remove("hidden");
  
  if (mode === "alert") {
    btnCancel.classList.add("hidden");
    btnConfirm.innerText = "ตกลง";
    btnConfirm.onclick = () => popup.classList.add("hidden");
  } else {
    btnCancel.classList.remove("hidden");
    btnConfirm.innerText = "ตกลง";
    btnConfirm.onclick = onConfirm;
  }
}

// เลือกรูปภาพ
const fileInput = document.getElementById("fileInput");
const previewImg = document.getElementById("previewImg");
const photoStatus = document.getElementById("photoStatus");
document.getElementById("uploadBtn").onclick = () => fileInput.click();

fileInput.onchange = () => {
  const file = fileInput.files[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) {
    showPopup("❌ รูปภาพใหญ่เกิน 10MB!<br>กรุณาเลือกรูปใหม่", "alert");
    return;
  }
  photoStatus.innerText = "⚓ กำลังเตรียมรูปภาพ...";
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const max = 1200;
      let w = img.width, h = img.height;
      if (w > h) { if (w > max) { h *= max / w; w = max; } }
      else { if (h > max) { w *= max / h; h = max; } }
      canvas.width = w; canvas.height = h;
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
  const f = document.getElementById("firstName").value.trim();
  const l = document.getElementById("lastName").value.trim();
  const p = posSel.innerText;
  const r = document.getElementById("rankInput").value.trim();

  if (!f || !l || p === "เลือกตำแหน่ง" || !r || !previewImg.src) {
    showPopup("⚓ กรุณากรอกข้อมูลให้ครบ<br>และเลือกรูปก่อนออกเรือครับ!", "alert");
    return;
  }

  showPopup(`<b>ตรวจสอบข้อมูล</b><br>${f} ${l}<br>ตำแหน่ง: ${p} | อันดับ: ${r}`, "confirm", () => {
    popup.classList.add("hidden");
    document.getElementById("loadingOverlay").classList.remove("hidden");

    fetch(GAS_URL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify({ firstName: f, lastName: l, position: p, rank: r, imageBase64: previewImg.src })
    }).then(() => {
      document.getElementById("loadingOverlay").classList.add("hidden");
      showPopup("✅ บันทึกสมบัติสำเร็จ!<br>ข้อมูลถูกเก็บเข้าคลังแล้ว", "alert");
      btnConfirm.onclick = () => location.reload();
    }).catch(() => {
      document.getElementById("loadingOverlay").classList.add("hidden");
      showPopup("❌ เกิดข้อผิดพลาด!<br>กรุณาลองใหม่", "alert");
    });
  });
};

btnCancel.onclick = () => popup.classList.add("hidden");
