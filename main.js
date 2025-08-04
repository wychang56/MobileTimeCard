
const API_URL = "https://script.google.com/macros/s/AKfycbzPEgpoA9D40KZIuy98vBE532TgrpoHt4tSbg6VzXdzh5tCHbiE66fbXfVIZahb8thy/exec";
const nameSelect = document.getElementById("name");
const noteInput = document.getElementById("note");

const names = ["LiXiaoHua", "PengGuoShun", "XuCongYun"];

function lockName(name) {
  localStorage.setItem("lockedName", name);
  nameSelect.innerHTML = `<option>${name}</option>`;
  nameSelect.disabled = true;
}
function loadNameOptions() {
  const locked = localStorage.getItem("lockedName");
  if (locked) {
    nameSelect.innerHTML = `<option>${locked}</option>`;
    nameSelect.disabled = true;
  } else {
    names.forEach(n => {
      const opt = document.createElement("option");
      opt.textContent = n;
      nameSelect.appendChild(opt);
    });
  }
}
function checkIn() { getLocation("checkin"); }
function checkOut() { getLocation("checkout"); }
function addNote() { sendRequest("note"); }
function showWeekly() { sendRequest("weekly"); }

function getLocation(type) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => sendRequest(type, pos),
      err => document.getElementById("result").innerText = "無法定位：" + err.message
    );
  } else {
    document.getElementById("result").innerText = "不支援定位";
  }
}

function sendRequest(type, pos) {
  const name = nameSelect.value;
  if (!name) return alert("請選擇姓名");
  if (!localStorage.getItem("lockedName")) lockName(name);

  let lat = "", lng = "";
  if (pos && pos.coords) {
    lat = pos.coords.latitude;
    lng = pos.coords.longitude;
  }

  let url = `${API_URL}?name=${encodeURIComponent(name)}&type=${type}`;
  if (type === "checkin" || type === "checkout") {
    url += `&lat=${lat}&lng=${lng}&project=${document.getElementById("project").value}`;
  }
  if (type === "note") {
    const note = noteInput.value.trim();
    if (!note) return alert("請輸入備註");
    url += `&note=${encodeURIComponent(note)}`;
  }

  fetch(url).then(res => res.json()).then(data => {
    document.getElementById("result").innerText = data.message || "完成";
    if (type === "weekly" && data.records) {
      let html = `<h3>本週工時</h3><ul>`;
      data.records.forEach(r => {
        html += `<li>${r.date}: ${r.hours} 小時</li>`;
      });
      html += `</ul><b>總計: ${data.total} 小時</b>`;
      document.getElementById("weekly").innerHTML = html;
    }
  });
}

window.onload = loadNameOptions;
