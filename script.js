// เปลี่ยน URL นี้เป็น Web App URL ของคุณที่ได้จาก Google Apps Script
const GAS_URL = "https://script.google.com/macros/s/AKfycbxrtx851Iwh_FkWEBERkTV1_A6Uyhtp9iv1WBCUskdj5pqVt46KFlyREkSzdMeG0k6sCA/exec";

// 1. SCALE SYSTEM
function resizeStage() {
  const stage = document.querySelector(".stage");
  const scaleX = window.innerWidth / 2560;
  const scaleY = window.innerHeight / 1440;
  const scale = Math.min(scaleX, scaleY);
  stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
}
window.addEventListener("resize", resizeStage);
window.addEventListener("load", resizeStage);
resizeStage();

// 2. DOM ELEMENTS
const fileInput = document.getElementById("fileInput");
const previewImg = document.getElementById("previewImg");
const photoText = document.querySelector(".photo-text");
const uploadBtn = document.getElementById("uploadBtn");
const submitBtn = document.getElementById("submitBtn");
const loadingOverlay = document.getElementById("loadingOverlay");
const positionDropdown = document.getElementById("positionDropdown");
const positionSelected = document.getElementById("positionSelected");
const popup = document.getElementById("popup");

// 3. IMAGE PREVIEW
uploadBtn.onclick = () => fileInput.click();
fileInput.onchange = (e) => {
  const file = e.target.files[0];
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      alert("รูปภาพใหญ่เกินไป (จำกัดไม่เกิน 2MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      previewImg.src = ev.target.result;
      previewImg.style.display = "block";
      photoText.style.display = "none";
    };
    reader.readAsDataURL(file);
  }
};

// 4. DROPDOWN
positionSelected.onclick = (e) => {
  e.stopPropagation();
  positionDropdown.classList.toggle("open");
};
positionDropdown.querySelectorAll(".dropdown-list div").forEach(item => {
  item.onclick = () => {
    positionSelected.textContent = item.textContent;
    positionDropdown.classList.remove("open");
  };
});
document.addEventListener("click", () => positionDropdown.classList.remove("open"));

// 5. SUBMIT LOGIC
submitBtn.onclick = () => {
  const fName = document.getElementById("firstName").value.trim();
  const lName = document.getElementById("lastName").value.trim();
  const pos = positionSelected.textContent;
  const rank = document.getElementById("rankInput").value.trim();

  if (!fName || !lName || pos === "เลือกตำแหน่ง" || !rank || !previewImg.src) {
    alert("กรุณากรอกข้อมูลและเลือกรูปภาพให้ครบถ้วนก่อนส่ง");
    return;
  }

  document.getElementById("popupMessage").innerHTML = `
    <b>ยืนยันข้อมูลโจรสลัด</b><br>
    คุณ ${fName} ${lName}<br>
    ตำแหน่ง: ${pos} | อันดับ: ${rank}
  `;
  popup.classList.remove("hidden");

  document.getElementById("popupConfirm").onclick = () => {
    popup.classList.add("hidden");
    loadingOverlay.classList.remove("hidden");

    const data = {
      firstName: fName,
      lastName: lName,
      position: pos,
      rank: rank,
      imageBase64: previewImg.src
    };

    fetch(GAS_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify(data)
    })
    .then(() => {
      loadingOverlay.classList.add("hidden");
      alert("🎉 สำเร็จ! ข้อมูลและรูปภาพถูกเก็บเข้าคลังแล้ว");
      location.reload();
    })
    .catch(() => {
      loadingOverlay.classList.add("hidden");
      alert("❌ เกิดข้อผิดพลาด กรุณาลองใหม่");
    });
  };
};

document.getElementById("popupCancel").onclick = () => popup.classList.add("hidden");