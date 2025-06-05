async function runNmapScan() {
  const target = document.getElementById("framework-target").value;
  const statusContainer = document.getElementById("nmap-status");
  const targetStatus = document.getElementById("nmap-target-status");
  const startTimeStatus = document.getElementById("nmap-start-time");
  const statusText = statusContainer.querySelector(".status-item:first-child");
  const output = document.getElementById("nmap-output");

  if (target) {
    // Cập nhật trạng thái
    statusText.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Trạng thái: Đang quét';
    statusText.classList.remove("idle");
    statusText.classList.add("active");

    targetStatus.textContent = target;
    targetStatus.parentElement.classList.remove("idle");
    targetStatus.parentElement.classList.add("active");

    const startTime = new Date().toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
    });
    startTimeStatus.textContent = startTime;
    startTimeStatus.parentElement.classList.remove("idle");
    startTimeStatus.parentElement.classList.add("active");

    // Hiển thị lệnh quét dựa trên loại quét
    let command = "";
    switch (currentScanType) {
      case "quick":
        command = "nmap -F";
        break;
      case "full":
        command = "nmap -p-";
        break;
      case "stealth":
        command = "nmap -sS";
        break;
      case "service":
        command = "nmap -sV";
        break;
      case "os":
        command = "nmap -O";
        break;
      case "script":
        command = "nmap -sC";
        break;
    }
    output.innerHTML = `
      <div class="terminal-line">
        <span class="terminal-prompt">root@kali:~#</span> ${command} ${target}
      </div>
      <div class="terminal-output" id="nmap-result-lines"></div>
    `;

    const resultLinesDiv = document.getElementById("nmap-result-lines");

    try {
      // Gọi API backend để lấy kết quả quét
      const response = await fetch("http://localhost:5000/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target: target,
          scan_type: currentScanType,
        }),
      });

      const data = await response.json();

      if (response.status !== 200 || data.error) {
        throw new Error(data.error || "Lỗi không xác định từ backend");
      }

      // Lấy đầu ra Nmap từ API và chia thành từng dòng
      const nmapOutputLines = data.output
        .split("\n")
        .filter((line) => line.trim() !== "");

      // Hàm hiển thị từng dòng với độ trễ
      const displayLineWithDelay = (lines, index) => {
        if (index < lines.length) {
          // Tạo một div mới cho mỗi dòng
          const lineDiv = document.createElement("div");
          lineDiv.className = "terminal-line";
          lineDiv.textContent = lines[index].trim();
          resultLinesDiv.appendChild(lineDiv);
          // Cuộn xuống cuối để xem dòng mới nhất
          output.scrollTop = output.scrollHeight;
          // Gọi lại hàm để hiển thị dòng tiếp theo sau 500ms
          setTimeout(() => displayLineWithDelay(lines, index + 1), 500);
        } else {
          // Khi hoàn tất hiển thị, cập nhật trạng thái
          statusText.innerHTML =
            '<i class="fas fa-check"></i> Trạng thái: Hoàn tất';
          statusText.classList.remove("active");
          statusText.classList.add("completed");
        }
      };

      // Bắt đầu hiển thị từng dòng
      displayLineWithDelay(nmapOutputLines, 0);
    } catch (error) {
      // Xử lý lỗi nếu API thất bại
      const errorDiv = document.createElement("div");
      errorDiv.className = "terminal-line";
      errorDiv.textContent = `Error: ${error.message}`;
      resultLinesDiv.appendChild(errorDiv);
      statusText.innerHTML =
        '<i class="fas fa-exclamation-triangle"></i> Trạng thái: Lỗi';
      statusText.classList.remove("active");
      statusText.classList.add("error");
    }
  } else {
    alert("Vui lòng nhập mục tiêu quét!");
  }
}
