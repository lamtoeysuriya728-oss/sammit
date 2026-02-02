// 1. ใส่ URL จากการ Deploy ของคุณ
const GAS_URL = "https://script.google.com/macros/s/AKfycbxrtx851Iwh_FkWEBERkTV1_A6Uyhtp9iv1WBCUskdj5pqVt46KFlyREkSzdMeG0k6sCA/exec";

// 2. ระบบ Responsive
function resizeStage() {
  const stage = document.querySelector(".stage");
  if(!stage) return;
  const scale = Math.min(window.innerWidth / 2560, window.innerHeight / 1440);
  stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
}
window.addEventListener("resize", resizeStage);
window.addEventListener("load", resizeStage);
resizeStage();

// 3. จัดการรูปภาพ (iOS/iPad Stable Version)
const fileInput = document.getElementById("fileInput");
const previewImg = document.getElementById("previewImg");
const photoText = document.querySelector(".photo-text");
const uploadBtn = document.getElementById("uploadBtn");

uploadBtn.onclick = () => fileInput.click();

fileInput.onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 10 * 1024 * 1024) {
    alert("⚠️ ขนาดไฟล์ใหญ่เกิน 10MB กรุณาเลือกรูปใหม่");
    fileInput.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      // สร้าง Canvas เพื่อ Resize รูปภาพสำหรับแสดงผล (ลดภาระ RAM ของ iPad)
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      const max_size = 1200; // บีบอัดหน้าแสดงผลให้ลื่นไหล

      if (width > height) {
        if (width > max_size) { height *= max_size / width; width = max_size; }
      } else {
        if (height > max_size) { width *= max_size / height; height = max_size; }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      previewImg.src = canvas.toDataURL('image/jpeg', 0.85); // แปลงเป็น JPG
      previewImg.style.display = "block";
      photoText.style.display = "none";
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
};

// 4. Dropdown
const positionDropdown = document.getElementById("positionDropdown");
const positionSelected = document.getElementById("positionSelected");

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

// 5. ส่งข้อมูล
const submitBtn = document.getElementById("submitBtn");
const popup = document.getElementById("popup");
const loadingOverlay = document.getElementById("loadingOverlay");

submitBtn.onclick = () => {
  const fName = document.getElementById("firstName").value.trim();
  const lName = document.getElementById("lastName").value.trim();
  const pos = positionSelected.textContent;
  const rank = document.getElementById("rankInput").value.trim();

  if (!fName || !lName || pos === "เลือกตำแหน่ง" || !rank || !previewImg.src) {
    alert("❌ กรุณากรอกข้อมูลให้ครบถ้วนและเลือกรูปภาพ");
    return;
  }

  document.getElementById("popupMessage").innerHTML = `
    <b>ตรวจสอบข้อมูลก่อนออกเรือ</b><br>
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
      alert("✅ บันทึกสมบัติสำเร็จ!");
      location.reload();
    })
    .catch(() => {
      loadingOverlay.classList.add("hidden");
      alert("❌ เกิดข้อผิดพลาด กรุณาลองใหม่");
    });
  };
};

document.getElementById("popupCancel").onclick = () => popup.classList.add("hidden");
