from flask import Flask, request, jsonify
from flask_cors import CORS
from pymetasploit3.msfrpc import MsfRpcClient
import time
import logging

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.DEBUG)

# Kết nối với MSFRPC
try:
    client = MsfRpcClient(password='quach', username='tung', host='127.0.0.1', port=55553)
    logging.info("Kết nối tới MSFRPC thành công!")
except Exception as e:
    logging.error(f"Không thể kết nối tới MSFRPC: {e}")
    client = None

@app.route('/')
def index():
    return "Metasploit RPC Flask API đang hoạt động."

@app.route('/metasploit/run', methods=['POST'])
def run_metasploit():
    if not client:
        return jsonify({'error': 'Không thể kết nối tới Metasploit! Vui lòng kiểm tra MSFRPC.'}), 500

    data = request.get_json()
    module = data.get('module')
    rhost = data.get('rhost')
    lhost = data.get('lhost')
    lport = data.get('lport')
    rport = data.get('rport')
    payload = data.get('payload')

    if not module:
        return jsonify({'error': 'Vui lòng cung cấp module Metasploit!'}), 400
    if not rhost and 'auxiliary' not in module and 'post' not in module:
        return jsonify({'error': 'Vui lòng cung cấp RHOST cho module khai thác!'}), 400
    if 'post' in module and not data.get('session_id'):
        return jsonify({'error': 'Vui lòng cung cấp session ID cho module hậu khai thác!'}), 400

    try:
        logging.info(f"Thực thi module {module} với RHOST {rhost}")
        console = client.call('console.create')
        console_id = console['id']

        commands = []

        # Giai đoạn 1: Quét tiền khai thác (auxiliary)
        if 'auxiliary' in module:
            commands.append(f"use {module}\n")
            commands.append(f"set RHOSTS {rhost}\n")
            if module == "auxiliary/scanner/portscan/tcp":
                commands.append(f"set PORTS {rport or '1-65535'}\n")
            else:
                commands.append(f"set RPORT {rport or '445'}\n")
            commands.append("set THREADS 10\n")
            commands.append("run\n")

        # Giai đoạn 2: Khai thác (exploit)
        elif 'exploit' in module:
            commands.append(f"use {module}\n")
            commands.append(f"set RHOSTS {rhost}\n")
            commands.append(f"set RPORT {rport or '445'}\n")
            if lhost:
                commands.append(f"set LHOST {lhost}\n")
            if lport:
                commands.append(f"set LPORT {lport}\n")
            if payload:
                commands.append(f"set PAYLOAD {payload}\n")
            commands.append("exploit\n")

        # Giai đoạn 3: Payload (handler)
        elif module == "exploit/multi/handler":
            commands.append(f"use {module}\n")
            if payload:
                commands.append(f"set PAYLOAD {payload}\n")
            if lhost:
                commands.append(f"set LHOST {lhost}\n")
            if lport:
                commands.append(f"set LPORT {lport}\n")
            commands.append("exploit\n")

        # Giai đoạn 4: Hậu khai thác (post)
        elif 'post' in module:
            commands.append(f"use {module}\n")
            commands.append(f"set SESSION {data['session_id']}\n")
            commands.append("run\n")

        output = []
        for cmd in commands:
            client.call('console.write', [console_id, cmd])
            wait_time = 5 if "run\n" in cmd or "exploit\n" in cmd else 1
            time.sleep(wait_time)
            result = client.call('console.read', [console_id])
            if result and 'data' in result:
                output.append(result['data'].strip())

        client.call('console.destroy', [console_id])
        logging.info("Thực thi hoàn tất")

        sessions = client.call('session.list')
        return jsonify({
            'output': '\n'.join(output),
            'session_created': bool(sessions),
            'sessions': sessions
        })
    except Exception as e:
        logging.error(f"Lỗi khi thực thi: {e}")
        return jsonify({
            'error': str(e),
            'output': '\n'.join(output) if 'output' in locals() else 'Không có đầu ra'
        }), 500

@app.route('/metasploit/sessions', methods=['GET'])
def get_sessions():
    if not client:
        return jsonify({'error': 'Không thể kết nối tới Metasploit!'}), 500
    try:
        sessions = client.call('session.list')
        return jsonify({'sessions': sessions})
    except Exception as e:
        logging.error(f"Lỗi khi lấy danh sách session: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)