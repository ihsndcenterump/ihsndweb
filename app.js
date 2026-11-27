// ============================================================
// HỆ THỐNG DỮ LIỆU & PHÂN QUYỀN (IHSND - UMP)
// ============================================================

const DEFAULT_USERS = [
  {
    username: "admin",
    password: "admin123",
    role: "admin", // admin | member | guest
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
    // Admin có thể tùy chỉnh quyền riêng cho từng tài khoản guest
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

const DB_KEY = "IHSND_USERS_DB";
const SESSION_KEY = "IHSND_CURRENT_USER";

// Lấy danh sách user
function getUsers() {
  const data = localStorage.getItem(DB_KEY);
  if (!data) {
    localStorage.setItem(DB_KEY, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
  return JSON.parse(data);
}

// Lưu danh sách user
function saveUsers(users) {
  localStorage.setItem(DB_KEY, JSON.stringify(users));
}

// Đăng nhập
function login(username, password, remember) {
  const users = getUsers();
  const found = users.find(
    u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
  );
  if (!found) return null;

  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(SESSION_KEY, found.username);
  return found;
}

// Lấy thông tin người đang đăng nhập
function getCurrentUser() {
  const username = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
  if (!username) return null;
  return getUsers().find(u => u.username === username) || null;
}

// Bắt buộc đăng nhập (dùng cho các trang từ trang 2 trở đi)
function requireAuth(requiredModule = null) {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = "index.html";
    return null;
  }
  if (requiredModule && user.role !== "admin" && !user.permissions.includes(requiredModule)) {
    alert("Tài khoản của bạn không có quyền truy cập mục này.");
    window.location.href = "menu.html";
    return null;
  }
  renderTopUserBar(user);
  return user;
}

// Đăng xuất
function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
  window.location.href = "index.html";
}

// Hiển thị tên tài khoản, chuông thông báo và nút đăng xuất ở góc trên phải
function renderTopUserBar(user) {
  const bar = document.getElementById("topUserBar");
  if (!bar) return;
  bar.innerHTML = `
    <span>${user.fullName} (${user.role.toUpperCase()})</span>
    <button class="icon-btn" title="Thông báo" onclick="alert('Chưa có thông báo mới.')">🔔</button>
    <button class="icon-btn" title="Đăng xuất" onclick="logout()">↪️</button>
  `;
}

// ============================================================
// ĐỒNG BỘ FILE EXCEL (DÀNH CHO ADMIN)
// ============================================================
function downloadExcelTemplate() {
  const sample = [
    {
      username: "21120002",
      password: "123456",
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
  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(firstSheet);

    if (!rows.length) {
      alert("File Excel không có dữ liệu!");
      return;
    }

    const users = getUsers();
    let updatedCount = 0;
    let addedCount = 0;

    rows.forEach(row => {
      if (!row.username) return;
      const usernameStr = String(row.username).trim();
      const perms = row.permissions
        ? String(row.permissions).split(",").map(s => s.trim())
        : ["member", "activities", "programs", "info-station", "milestones", "contact"];

      const userObj = {
        username: usernameStr,
        password: String(row.password || "123456"),
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

      const idx = users.findIndex(u => u.username.toLowerCase() === usernameStr.toLowerCase());
      if (idx >= 0) {
        users[idx] = { ...users[idx], ...userObj };
        updatedCount++;
      } else {
        users.push(userObj);
        addedCount++;
      }
    });

    saveUsers(users);
    alert(`Đồng bộ thành công! Thêm mới: ${addedCount}, Cập nhật: ${updatedCount}.`);
    if (onSuccess) onSuccess();
  };
  reader.readAsArrayBuffer(file);
}
