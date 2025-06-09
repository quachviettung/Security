// metasploit.js

// Khi click vào config-card, gán module vào ô nhập
function selectModule(element) {
  document
    .querySelectorAll(".config-card")
    .forEach((card) => card.classList.remove("selected"));
  element.classList.add("selected");
  const module = element.getAttribute("data-module");
  document.getElementById("metasploit-module-input").value = module;

  // Hiển thị/ẩn trường session ID dựa trên loại module
  const sessionInput = document.getElementById("metasploit-session-id");
  const sessionLabel = document.querySelector(
    "label[for='metasploit-session-id']"
  );
  if (module.includes("post/")) {
    sessionInput.style.display = "block";
    sessionLabel.style.display = "block";
  } else {
    sessionInput.style.display = "none";
    sessionLabel.style.display = "none";
  }
}

// Hàm chính để chạy Metasploit
async function runMetasploit() {
  // Lấy giá trị từ các trường nhập liệu
  const target =
    document.getElementById("framework-target")?.value.trim() ||
    document.getElementById("metasploit-rhost").value.trim();
  const rhost = document.getElementById("metasploit-rhost").value.trim();
  const moduleInput = document
    .getElementById("metasploit-module-input")
    .value.trim();
  const lhost = document.getElementById("metasploit-lhost").value.trim();
  const lport = document.getElementById("metasploit-lport").value.trim();
  const rport = document.getElementById("metasploit-rport").value.trim();
  const payloadInput = document
    .getElementById("metasploit-payload")
    .value.trim();
  const sessionId = document
    .getElementById("metasploit-session-id")
    .value.trim();
  const statusDiv = document.getElementById("metasploit-status");
  const outputDiv = document.getElementById("metasploit-output");
  const startTime = new Date().toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
  });

  // Kiểm tra rhost bắt buộc cho module không phải hậu khai thác
  if (!rhost && !moduleInput.includes("post/")) {
    alert("Vui lòng nhập RHOST!");
    return;
  }

  // Kiểm tra session ID cho module hậu khai thác
  if (moduleInput.includes("post/") && !sessionId) {
    alert("Vui lòng nhập Session ID cho module hậu khai thác!");
    return;
  }

  // Module do người dùng nhập, hoặc mặc định
  let selectedModule = moduleInput || "exploit/multi/samba/usermap_script";

  // Kiểm tra nếu module bắt đầu bằng "payload/" để chuyển sang handler
  let useHandler = false;
  let handlerPayload = "";
  if (selectedModule.startsWith("payload/")) {
    useHandler = true;
    handlerPayload = selectedModule;
    selectedModule = "exploit/multi/handler";
  }

  // Kiểm tra nếu module là quét cổng TCP
  const isPortScan = selectedModule === "auxiliary/scanner/portscan/tcp";

  // Cập nhật trạng thái: đang chạy, sử dụng target từ framework-target
  statusDiv.innerHTML = `
    <div class="status-item running">
      <i class="fas fa-spinner loading-spinner"></i> Trạng thái: Đang thực thi
    </div>
    <div class="status-item idle">
      <i class="fas fa-crosshairs"></i> Mục tiêu: ${target || "Không xác định"}
    </div>
    <div class="status-item idle">
      <i class="fas fa-clock"></i> Thời gian bắt đầu: ${startTime}
    </div>
  `;

  // Hiển thị lệnh trong terminal
  outputDiv.innerHTML = `
    <div class="terminal-line">
      <span class="terminal-prompt">msf6 ></span> use ${selectedModule}
    </div>
    ${
      !moduleInput.includes("post/")
        ? `
    <div class="terminal-line">
      <span class="terminal-prompt">msf6 (${selectedModule}) ></span> set RHOSTS ${rhost}
    </div>`
        : ""
    }
    <div class="terminal-output" id="metasploit-result-lines"></div>
  `;
  const resultLinesDiv = document.getElementById("metasploit-result-lines");

  // Tạo object dữ liệu gửi lên server
  const data = {
    module: selectedModule,
    rhost: rhost || undefined,
    lhost: lhost || undefined,
    lport: lport || undefined,
    rport: isPortScan ? undefined : rport || undefined,
    payload: useHandler ? handlerPayload : payloadInput || undefined,
    session_id: sessionId || undefined,
  };

  if (isPortScan) {
    data.rport = undefined;
    data.ports = rport || "1-65535";
  }

  try {
    const response = await fetch("http://localhost:5001/metasploit/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.error) {
      const errorLine = document.createElement("div");
      errorLine.className = "terminal-line terminal-error";
      errorLine.textContent = `Lỗi: ${result.error}`;
      resultLinesDiv.appendChild(errorLine);
      statusDiv.innerHTML = `
        <div class="status-item error">
          <i class="fas fa-exclamation-circle"></i> Trạng thái: Lỗi
        </div>
        <div class="status-item idle">
          <i class="fas fa-crosshairs"></i> Mục tiêu: ${
            target || "Không xác định"
          }
        </div>
        <div class="status-item idle">
          <i class="fas fa-clock"></i> Thời gian bắt đầu: ${startTime}
        </div>
      `;
    } else {
      const outputLines = result.output
        .split("\n")
        .filter((line) => line.trim() !== "");
      const displayLineWithDelay = (lines, index) => {
        if (index < lines.length) {
          const lineDiv = document.createElement("div");
          lineDiv.className = "terminal-line terminal-output";
          lineDiv.textContent = lines[index].trim();
          resultLinesDiv.appendChild(lineDiv);
          outputDiv.scrollTop = outputDiv.scrollHeight;
          setTimeout(() => displayLineWithDelay(lines, index + 1), 500);
        } else {
          statusDiv.innerHTML = `
            <div class="status-item completed">
              <i class="fas fa-check"></i> Trạng thái: Hoàn tất
            </div>
            <div class="status-item idle">
              <i class="fas fa-crosshairs"></i> Mục tiêu: ${
                target || "Không xác định"
              }
            </div>
            <div class="status-item idle">
              <i class="fas fa-clock"></i> Thời gian bắt đầu: ${startTime}
            </div>
          `;
          if (result.session_created && result.sessions) {
            const sessionLine = document.createElement("div");
            sessionLine.className = "terminal-line terminal-info";
            sessionLine.textContent =
              "[*] Meterpreter session created! Sessions: " +
              JSON.stringify(result.sessions);
            resultLinesDiv.appendChild(sessionLine);
          }
        }
      };
      displayLineWithDelay(outputLines, 0);
    }
  } catch (error) {
    const errorLine = document.createElement("div");
    errorLine.className = "terminal-line terminal-error";
    errorLine.textContent = `Lỗi: Không thể kết nối tới server! ${error.message}`;
    resultLinesDiv.appendChild(errorLine);
    statusDiv.innerHTML = `
      <div class="status-item error">
        <i class="fas fa-exclamation-circle"></i> Trạng thái: Lỗi
      </div>
      <div class="status-item idle">
        <i class="fas fa-crosshairs"></i> Mục tiêu: ${
          target || "Không xác định"
        }
      </div>
      <div class="status-item idle">
        <i class="fas fa-clock"></i> Thời gian bắt đầu: ${startTime}
      </div>
    `;
  }
}

// Hàm xuất báo cáo
function exportReport() {
  const outputDiv = document.getElementById("metasploit-output");
  const statusDiv = document.getElementById("metasploit-status");
  const moduleInput =
    document.getElementById("metasploit-module-input").value ||
    "exploit/multi/samba/usermap_script";
  const target =
    document.getElementById("framework-target")?.value ||
    document.getElementById("metasploit-rhost").value ||
    "Unknown";
  let startTime = "Unknown";
  const timeNode = statusDiv.querySelector(".status-item:nth-child(3)");
  if (timeNode) {
    startTime = timeNode.textContent.replace("Thời gian bắt đầu: ", "").trim();
  }

  const outputLines = Array.from(outputDiv.querySelectorAll(".terminal-line"))
    .map((line) => line.textContent)
    .join("\n");

  const reportContent = `
Metasploit Report
================
Module: ${moduleInput}
Target: ${target}
Start Time: ${startTime}
================
Output:
${outputLines}
`;

  const blob = new Blob([reportContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `metasploit_report_${new Date()
    .toISOString()
    .replace(/[:.]/g, "-")}.txt`;
  a.click();
  URL.revokeObjectURL(url);

  alert("Báo cáo đã được xuất thành công!");
}
