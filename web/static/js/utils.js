// Framework scan (general scan from header)
function frameworkScan() {
  const target = document.getElementById("framework-target").value;
  const statusSection = document.getElementById("scan-status");
  const statusText = document.getElementById("status-text");
  const statusTarget = document.getElementById("status-target");
  const statusStartTime = document.getElementById("status-start-time");
  const statusElapsed = document.getElementById("status-elapsed");

  const results = {
    critical: 17,
    high: 0,
    medium: 15,
    low: 95,
  };

  if (target) {
    statusSection.style.display = "flex";
    statusTarget.textContent = target;
    statusStartTime.textContent = new Date().toLocaleString();
    statusElapsed.textContent = "Đang thực hiện...";
    statusText.textContent = "Đang chạy...";
    statusSection
      .querySelector(".status-item")
      .classList.remove("completed", "error", "idle");
    statusSection.querySelector(".status-item").classList.add("running");

    document.getElementById("metasploit-target-status").textContent = target;
    document.getElementById("ai-target").textContent = target;

    document.getElementById("critical-count").textContent = results.critical;
    document.getElementById("high-count").textContent = results.high;
    document.getElementById("medium-count").textContent = results.medium;
    document.getElementById("low-count").textContent = results.low;

    setTimeout(() => {
      statusElapsed.textContent = "7.67s";
      statusText.textContent = `Kiểm thử ${target} hoàn tất`;
      statusSection.querySelector(".status-item").classList.remove("running");
      statusSection.querySelector(".status-item").classList.add("completed");
    }, 2000);
  } else {
    alert("Vui lòng nhập URL hoặc IP mục tiêu!");
  }
}
