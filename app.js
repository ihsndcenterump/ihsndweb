// ============================================================
// KẾT NỐI FIREBASE FIRESTORE (IHSND - UMP)
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyA8DJHQBsak8zgEgyD0VYGTYzIVfsoUS60",
  authDomain: "ihsndweb.firebaseapp.com",
  projectId: "ihsndweb",
  storageBucket: "ihsndweb.firebasestorage.app",
  messagingSenderId: "1071733740150",
  appId: "1:1071733740150:web:d39a4064562702816d4557",
  measurementId: "G-V47T2YQTWB"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

const DEFAULT_USERS = [
  {
    username: "admin",
    password: "admin123",
    role: "admin",
    permissions: ["member", "activities", "programs", "info-station", "milestones", "contact"],
    fullName: "Quản trị viên IHSND",
    className: "Ban Điều Hành",
    faculty: "Đại học Y Dược TP.HCM",
    mssv: "ADMIN01",
    dob: "2003-08-08",
    joinDate: "2023-01-01",
    phone: "0900000000",
    email: "ihsnd.center.ump@gmail.com",
    quote: "Kết nối sinh viên Y Dược vươn tầm quốc tế.",
    avatar: ""
  },
  {
    username: "21120001",
    password: "123456",
    role: "member",
    permissions: ["member", "activities", "programs", "info-station", "milestones", "contact"],
    fullName: "Nguyễn Văn A",
    className: "Y2022A",
    faculty: "Khoa Y",
    mssv: "21120001",
    dob: "2004-05-12",
    joinDate: "2024-09-15",
    phone: "0912345678",
    email: "nva@ump.edu.vn",
    quote: "Học hết sức, chơi hết mình!",
    avatar: ""
  },
  {
    username: "guest1",
    password: "guest",
    role: "guest",
    permissions: ["programs", "info-station", "milestones", "contact"],
    fullName: "Khách mời Đối tác",
    className: "-",
    faculty: "Khách",
    mssv: "GUEST1",
    dob: "-",
    joinDate: "-",
    phone: "-",
    email: "-",
    quote: "",
    avatar: ""
  }
];

const SESSION_KEY = "IHSND_CURRENT_USER";

async function getUsers() {
  const snap = await db.collection("users").get();
  if (snap.empty) {
    const batch = db.batch();
    DEFAULT_USERS.forEach(u => {
      const ref = db.collection("users").doc(u.username.toLowerCase());
      batch.set(ref, u);
    });
    await batch.commit();
    return DEFAULT_USERS;
  }
  return snap.docs.map(doc => doc.data());
}

async function saveUser(userObj) {
  const docId = userObj.username.trim().toLowerCase();
  await db.collection("users").doc(docId).set(userObj, { merge: true });
}

async function login(username, password, remember) {
  const users = await getUsers();
  const found = users.find(
    u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
  );
  if (!found) return null;

  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(SESSION_KEY, found.username.toLowerCase());
  return found;
}

async function getCurrentUser() {
  const username = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
  if (!username) return null;
  const doc = await db.collection("users").doc(username.toLowerCase()).get();
  return doc.exists ? doc.data() : null;
}

async function requireAuth(requiredModule = null) {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = "index.html";
    return null;
  }
  if (requiredModule && user.role !== "admin" && !(user.permissions || []).includes(requiredModule)) {
    alert("Tài khoản của bạn không có quyền truy cập mục này.");
    window.location.href = "menu.html";
    return null;
  }
  renderAppLayout(user);
  return user;
}

function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
  window.location.href = "index.html";
}

// Tự động vẽ Header (thanh trắng mờ + logonew.PNG + tài khoản) & Footer chung cho mọi trang con
function renderAppLayout(user) {
  const headerEl = document.getElementById("appHeader");
  if (headerEl) {
    headerEl.className = "sub-header";
    headerEl.innerHTML = `
      <a href="menu.html" class="sub-header-brand" title="Về trang Menu">
        <img src="logonew.PNG" alt="Logo IHSND" class="sub-header-logo" />
        <span class="sub-header-title">TRUNG TÂM PHÁT TRIỂN MẠNG LƯỚI SINH VIÊN QUỐC TẾ</span>
      </a>
      <div class="sub-header-user">
        <span>${user.fullName} (${user.role.toUpperCase()})</span>
        <button class="icon-btn" title="Thông báo" aria-label="Thông báo" onclick="alert('Chưa có thông báo mới.')">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </button>
        <button class="icon-btn" title="Đăng xuất" aria-label="Đăng xuất" onclick="logout()">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    `;
  }

  const footerEl = document.getElementById("appFooter");
  if (footerEl) {
    footerEl.className = "app-footer";
    footerEl.innerHTML = `
      <div>© 2026 TRUNG TÂM PHÁT TRIỂN MẠNG LƯỚI SINH VIÊN QUỐC TẾ</div>
      <div>ĐẠI HỌC Y DƯỢC THÀNH PHỐ HỒ CHÍ MINH</div>
    `;
  }
}


// ============================================================
// ĐỒNG BỘ FILE EXCEL LÊN FIREBASE (DÀNH CHO ADMIN)
// ============================================================
function downloadExcelTemplate() {
  const sample = [
    {
      username: "21120002",
      password: "",
      role: "member",
      permissions: "member,activities,programs,info-station,milestones,contact",
      fullName: "Trần Thị B",
      className: "Y2023B",
      faculty: "Khoa Y",
      mssv: "21120002",
      dob: "2005-01-20",
      joinDate: "2025-10-01",
      phone: "0988777666",
      email: "ttb@ump.edu.vn",
      quote: "Luôn tiến về phía trước"
    }
  ];
  const ws = XLSX.utils.json_to_sheet(sample);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "ThanhVien");
  XLSX.writeFile(wb, "Mau_Dong_Bo_Thanh_Vien_IHSND.xlsx");
}

function importUsersFromExcel(file, onSuccess) {
  const reader = new FileReader();
  reader.onload = async function (e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(firstSheet);

      if (!rows.length) {
        alert("File Excel không có dữ liệu!");
        return;
      }

      const existingUsers = await getUsers();
      const existingSet = new Set(existingUsers.map(u => u.username.toLowerCase()));
      const batch = db.batch();
      let count = 0;

      rows.forEach(row => {
        if (!row.username) return;
        const usernameStr = String(row.username).trim();
        const perms = row.permissions
          ? String(row.permissions).split(",").map(s => s.trim())
          : ["member", "activities", "programs", "info-station", "milestones", "contact"];

        const userObj = {
          username: usernameStr,
          role: String(row.role || "member").toLowerCase(),
          permissions: perms,
          fullName: String(row.fullName || ""),
          className: String(row.className || ""),
          faculty: String(row.faculty || ""),
          mssv: String(row.mssv || usernameStr),
          dob: String(row.dob || ""),
          joinDate: String(row.joinDate || ""),
          phone: String(row.phone || ""),
          email: String(row.email || ""),
          quote: String(row.quote || ""),
          avatar: String(row.avatar || "")
        };

        if (row.password && String(row.password).trim() !== "") {
          userObj.password = String(row.password).trim();
        } else if (!existingSet.has(usernameStr.toLowerCase())) {
          userObj.password = "123456";
        }

        const ref = db.collection("users").doc(usernameStr.toLowerCase());
        batch.set(ref, userObj, { merge: true });
        count++;
      });

      await batch.commit();
      alert(`Đã đồng bộ thành công ${count} tài khoản lên hệ thống!`);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi đồng bộ Excel: " + err.message);
    }
  };
  reader.readAsArrayBuffer(file);
}
