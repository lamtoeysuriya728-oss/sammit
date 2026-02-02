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

  // รับรูปได้สูงสุด 10MB
  if (file.size > 10 * 1024 * 1024) {
    alert("⚠️ รูปภาพมีขนาดใหญ่เกิน 10MB");
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      // ใช้ Canvas ย่อขนาดหน้าแสดงผลเพื่อให้ iPad ไม่ RAM เต็ม
      const canvas = document.createElement('canvas');
      const max_preview = 1000;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > max_preview) { height *= max_preview / width; width = max_preview; }
      } else {
        if (height > max_preview) { width *= max_preview / height; height = max_preview; }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // แสดงผลรูป
      previewImg.src = canvas.toDataURL('image/jpeg', 0.8);
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

