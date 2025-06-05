// Schedule scan
function scheduleScan() {
  const target = document.getElementById("schedule-target").value;
  const tool = document.getElementById("schedule-tool").value;
  const frequency = document.getElementById("schedule-frequency").value;

  if (!target) {
    alert("Vui lòng nhập mục tiêu!");
    return;
  }

  alert(
    `Lịch kiểm thử đã được lên cho ${target} với công cụ ${tool} (${frequency})`
  );
  // Backend integration for scheduling would go here
}

// Export report
function exportReport(tool) {
  const target = document.getElementById("framework-target").value || "unknown";
  let reportContent = "";
  const timestamp = new Date().toLocaleString();

  switch (tool) {
    case "dashboard":
      reportContent = `
  SecTest Framework - Báo cáo Tổng quan
  Mục tiêu: ${target}
  Thời gian: ${timestamp}
  Kết quả kiểm thử:
  - Thông tin mục tiêu: 0
  - Lỗ hổng nghiêm trọng: 17
  - Lỗ hổng mức cao: 0
  - Lỗ hổng mức trung bình: 15
  - Lỗ hổng mức thấp: 95
        `;
      break;
    case "nmap":
      const nmapOutput = document.getElementById("nmap-output").innerText;
      reportContent = `
  SecTest Framework - Báo cáo Nmap
  Mục tiêu: ${target}
  Thời gian: ${timestamp}
  Kết quả:
  ${nmapOutput}
        `;
      break;
    case "metasploit":
      const metasploitOutput =
        document.getElementById("metasploit-output").innerText;
      reportContent = `
  SecTest Framework - Báo cáo Metasploit
  Mục tiêu: ${target}
  Thời gian: ${timestamp}
  Kết quả:
  ${metasploitOutput}
        `;
      break;
    case "aircrack":
      const aircrackOutput =
        document.getElementById("aircrack-output").innerText;
      reportContent = `
  SecTest Framework - Báo cáo Aircrack-ng
  Mục tiêu: WiFi Network
  Thời gian: ${timestamp}
  Kết quả:
  ${aircrackOutput}
        `;
      break;
    case "ai":
      const aiOutput = document.getElementById("ai-output").innerText;
      reportContent = `
  SecTest Framework - Báo cáo AI Tự động
  Mục tiêu: ${document.getElementById("ai-target").textContent}
  Thời gian: ${timestamp}
  Kết quả:
  ${aiOutput}
        `;
      break;
    case "schedule":
      reportContent = `
  SecTest Framework - Báo cáo Lập lịch
  Thời gian: ${timestamp}
  Kế hoạch kiểm thử:
  - Mục tiêu: ${
    document.getElementById("schedule-target").value || "Chưa xác định"
  }
  - Công cụ: ${document.getElementById("schedule-tool").value}
  - Tần suất: ${document.getElementById("schedule-frequency").value}
        `;
      break;
    default:
      reportContent = "Không có dữ liệu báo cáo";
  }

  const blob = new Blob([reportContent], { type: "text/plain" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `report_${tool}_${timestamp.replace(/[:,\s]/g, "-")}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);

  alert(`Báo cáo cho ${tool} đã được xuất!`);
}
