// Demo users for testing (tạm thời, sẽ thay bằng API)
const demoUsers = {
  admin: "admin123",
  pentester: "test123",
  "demo@sectest.com": "demo123",
};

// DOM elements
const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const togglePassword = document.getElementById("togglePassword");
const errorAlert = document.getElementById("errorAlert");
const successAlert = document.getElementById("successAlert");
const rememberMe = document.getElementById("rememberMe");

// Password visibility toggle
togglePassword.addEventListener("click", function () {
  const type =
    passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);
  this.classList.toggle("fa-eye");
  this.classList.toggle("fa-eye-slash");
});

// Form submission
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  attemptLogin();
});

// Login function
async function attemptLogin() {
  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    showError("Vui lòng nhập đầy đủ thông tin đăng nhập!");
    return;
  }

  // Show loading state
  loginBtn.classList.add("loading");
  loginBtn.innerHTML = "";
  hideAlerts();

  try {
    // Thay bằng API thực tế nếu có backend
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      showSuccess("Đăng nhập thành công! Đang chuyển hướng...");
      if (rememberMe.checked) {
        localStorage.setItem("sectest_token", data.token);
        localStorage.setItem("sectest_user", username);
      } else {
        sessionStorage.setItem("sectest_token", data.token);
        sessionStorage.setItem("sectest_user", username);
      }
      sessionStorage.setItem("sectest_authenticated", "true");
      sessionStorage.setItem("sectest_login_time", new Date().toISOString());

      setTimeout(() => {
        redirectToApp();
      }, 1500);
    } else {
      showError(data.message || "Tên đăng nhập hoặc mật khẩu không chính xác!");
      loginBtn.classList.remove("loading");
      loginBtn.innerHTML = "<span>Đăng nhập</span>";
    }
  } catch (error) {
    // Mô phỏng với demoUsers nếu không có API
    if (demoUsers[username] && demoUsers[username] === password) {
      showSuccess("Đăng nhập thành công! Đang chuyển hướng...");
      if (rememberMe.checked) {
        localStorage.setItem("sectest_user", username);
      } else {
        sessionStorage.setItem("sectest_user", username);
      }
      sessionStorage.setItem("sectest_authenticated", "true");
      sessionStorage.setItem("sectest_login_time", new Date().toISOString());

      setTimeout(() => {
        redirectToApp();
      }, 1500);
    } else {
      showError("Tên đăng nhập hoặc mật khẩu không chính xác!");
      loginBtn.classList.remove("loading");
      loginBtn.innerHTML = "<span>Đăng nhập</span>";
    }
  }
}

// Redirect to main application
function redirectToApp() {
  window.location.href = "index.html"; // Chuyển hướng tới trang chính
}

// Social login functions
function socialLogin(provider) {
  showSuccess(`Đang chuyển hướng đến ${provider}...`);
  setTimeout(() => {
    alert(
      `Chức năng đăng nhập với ${provider} sẽ được tích hợp trong phiên bản thực tế.`
    );
  }, 1000);
}

// Additional functions
function showRegister() {
  alert("Form đăng ký sẽ được triển khai trong phiên bản đầy đủ.");
}

function showForgotPassword() {
  const email = prompt("Nhập email của bạn để khôi phục mật khẩu:");
  if (email) {
    showSuccess("Liên kết khôi phục mật khẩu đã được gửi đến email của bạn!");
  }
}

function showHelp() {
  alert(
    "Trang trợ giúp với hướng dẫn sử dụng chi tiết sẽ có trong phiên bản đầy đủ."
  );
}

function showPrivacy() {
  alert(
    "Chính sách bảo mật và điều khoản sử dụng sẽ có trong phiên bản đầy đủ."
  );
}

// Utility functions
function showError(message) {
  errorAlert.style.display = "block";
  document.getElementById("errorMessage").textContent = message;
  successAlert.style.display = "none";
}

function showSuccess(message) {
  successAlert.style.display = "block";
  document.getElementById("successMessage").textContent = message;
  errorAlert.style.display = "none";
}

function hideAlerts() {
  errorAlert.style.display = "none";
  successAlert.style.display = "none";
}

// Check if user is already logged in
window.addEventListener("load", function () {
  if (sessionStorage.getItem("sectest_authenticated") === "true") {
    if (localStorage.getItem("sectest_user")) {
      showSuccess("Chào mừng trở lại! Đang tải ứng dụng...");
      setTimeout(redirectToApp, 1000);
    }
  }
});

// Auto-fill demo credentials on double click
usernameInput.addEventListener("dblclick", function () {
  this.value = "admin";
  passwordInput.value = "admin123";
  showSuccess("Đã điền thông tin demo: admin/admin123");
});

// Add some security features simulation
let loginAttempts = 0;
const maxAttempts = 3;

function checkSecurityLimits() {
  loginAttempts++;
  if (loginAttempts >= maxAttempts) {
    showError(
      "Quá nhiều lần thử đăng nhập thất bại. Vui lòng thử lại sau 5 phút."
    );
    loginBtn.disabled = true;
    setTimeout(() => {
      loginBtn.disabled = false;
      loginAttempts = 0;
    }, 5000); // 5 seconds for demo, would be 5 minutes in production
  }
}

// Keyboard shortcuts
document.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
    attemptLogin();
  }
});
