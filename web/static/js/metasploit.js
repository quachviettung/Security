async function runMetasploit() {
  const target = document.getElementById("framework-target").value;
  const customModule = document.getElementById(
    "metasploit-custom-module"
  ).value;
  const statusDiv = document.getElementById("metasploit-status");
  const outputDiv = document.getElementById("metasploit-output");
  const startTime = new Date().toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
  });

  if (!target) {
    alert("Vui lòng nhập URL hoặc IP mục tiêu!");
    return;
  }

  // Lấy các tùy chọn từ input
  const lhost =
    document.getElementById("metasploit-lhost").value || "192.168.90.132";
  const lport = document.getElementById("metasploit-lport").value || "4444";
  const rport = document.getElementById("metasploit-rport").value || "";
  const payload = document.getElementById("metasploit-payload").value || "";

  // Ưu tiên module thủ công nếu được nhập, nếu không thì dùng currentModule
  const selectedModule = customModule || currentModule;

  statusDiv.innerHTML = `
      <div class="status-item running">
        <i class="fas fa-spinner loading-spinner"></i> Trạng thái: Đang thực thi
      </div>
      <div class="status-item idle">
        <i class="fas fa-crosshairs"></i> Mục tiêu: ${target}
      </div>
      <div class="status-item idle">
        <i class="fas fa-clock"></i> Thời gian bắt đầu: ${startTime}
      </div>
    `;

  outputDiv.innerHTML = `
      <div class="terminal-line">
        <span class="terminal-prompt">msf6 ></span> use ${selectedModule}
      </div>
      <div class="terminal-line">
        <span class="terminal-prompt">msf6 (${selectedModule}) ></span> set RHOSTS ${target}
      </div>
      <div class="terminal-output" id="metasploit-result-lines"></div>
    `;

  const resultLinesDiv = document.getElementById("metasploit-result-lines");
  const options = {};
  if (lhost) options.LHOST = lhost;
  if (lport) options.LPORT = lport;
  if (rport) options.RPORT = rport;
  if (payload) options.PAYLOAD = payload;

  try {
    const response = await fetch("http://localhost:5001/metasploit/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target, module: selectedModule, options }),
    });

    const data = await response.json();

    if (data.error) {
      const errorLine = document.createElement("div");
      errorLine.className = "terminal-line";
      errorLine.textContent = `Lỗi: ${data.error}`;
      resultLinesDiv.appendChild(errorLine);
      statusDiv.innerHTML = `
          <div class="status-item error">
            <i class="fas fa-exclamation-circle"></i> Trạng thái: Lỗi
          </div>
          <div class="status-item idle">
            <i class="fas fa-crosshairs"></i> Mục tiêu: ${target}
          </div>
          <div class="status-item idle">
            <i class="fas fa-clock"></i> Thời gian bắt đầu: ${startTime}
          </div>
        `;
    } else {
      const outputLines = data.output
        .split("\n")
        .filter((line) => line.trim() !== "");
      const displayLineWithDelay = (lines, index) => {
        if (index < lines.length) {
          const lineDiv = document.createElement("div");
          lineDiv.className = "terminal-line";
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
                <i class="fas fa-crosshairs"></i> Mục tiêu: ${target}
              </div>
              <div class="status-item idle">
                <i class="fas fa-clock"></i> Thời gian bắt đầu: ${startTime}
              </div>
            `;
          if (data.session_created) {
            const sessionLine = document.createElement("div");
            sessionLine.className = "terminal-line";
            sessionLine.textContent = "[*] Meterpreter session created!";
            resultLinesDiv.appendChild(sessionLine);
          }
        }
      };
      displayLineWithDelay(outputLines, 0);
    }
  } catch (error) {
    const errorLine = document.createElement("div");
    errorLine.className = "terminal-line";
    errorLine.textContent = `Lỗi: Không thể kết nối tới server! ${error.message}`;
    resultLinesDiv.appendChild(errorLine);
    statusDiv.innerHTML = `
        <div class="status-item error">
          <i class="fas fa-exclamation-circle"></i> Trạng thái: Lỗi
        </div>
        <div class="status-item idle">
          <i class="fas fa-crosshairs"></i> Mục tiêu: ${target}
        </div>
        <div class="status-item idle">
          <i class="fas fa-clock"></i> Thời gian bắt đầu: ${startTime}
        </div>
      `;
  }
}
