const API_URL = "https://script.google.com/macros/s/你的AppsScriptID/exec";

document.getElementById("checkinBtn").addEventListener("click", () => getLocation("checkin"));
document.getElementById("checkoutBtn").addEventListener("click", () => getLocation("checkout"));
document.getElementById("noteBtn").addEventListener("click", sendNote);

function getLocation(type) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => sendRequest(type, position),
      error => showResult("無法取得位置: " + error.message)
    );
  } else {
    showResult("此瀏覽器不支援定位功能。");
  }
}

function sendRequest(type, pos) {
  const name = document.getElementById("name").value;
  const project = document.getElementById("project").value;
  const note = document.getElementById("note").value;
  const lat = pos.coords.latitude;
  const lng = pos.coords.longitude;

  const url = `${API_URL}?name=${encodeURIComponent(name)}&project=${encodeURIComponent(project)}&lat=${lat}&lng=${lng}&type=${type}&note=${encodeURIComponent(note)}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.status === "needCheckIn") {
        showResult(`⚠ 沒有前一筆簽到資料的簽退！\n此簽退時間：${data.time}\n請在備註填寫補簽簽到時間與專案。`);
      } else if (data.status === "needCheckOut") {
        showResult(`⚠ 沒有前一筆簽退的簽到資料！\n上一筆簽到時間：${data.lastCheckIn}\n請在備註填寫上一筆簽退時間。`);
      } else if (data.status === "successCheckIn") {
        showResult(`簽到成功：${data.time}`);
      } else if (data.status === "successCheckOut") {
        showResult(`簽退成功：${data.time}`);
      } else {
        showResult(data.message || "打卡完成");
      }
    })
    .catch(err => {
      showResult("請求失敗: " + err.message);
    });
}

function sendNote() {
  const name = document.getElementById("name").value;
  const note = document.getElementById("note").value;

  if (!note.trim()) {
    showResult("⚠ 請輸入備註內容再提交！");
    return;
  }

  const url = `${API_URL}?name=${encodeURIComponent(name)}&type=note&note=${encodeURIComponent(note)}`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      showResult(data.message || "備註已更新");
    })
    .catch(err => {
      showResult("備註更新失敗: " + err.message);
    });
}

function showResult(msg) {
  document.getElementById("result").innerText = msg;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}
