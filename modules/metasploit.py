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
    client = MsfRpcClient(password='nghia')
    logging.info("Kết nối tới MSFRPC thành công!")
except Exception as e:
    logging.error(f"Không thể kết nối tới MSFRPC: {e}")
    client = None

@app.route('/metasploit/run', methods=['POST'])
def run_metasploit():
    if not client:
        return jsonify({'error': 'Không thể kết nối tới Metasploit! Vui lòng kiểm tra MSFRPC.'}), 500

    data = request.get_json()
    target = data.get('target')
    module = data.get('module')
    options = data.get('options', {})  # Thêm tùy chọn động (RPORT, LHOST, PAYLOAD, v.v.)

    if not module:
        return jsonify({'error': 'Vui lòng cung cấp module Metasploit!'}), 400
    if not target:
        return jsonify({'error': 'Vui lòng cung cấp mục tiêu!'}), 400

    try:
        logging.info(f"Thực thi module {module} với mục tiêu {target}")
        console = client.call('console.create')
        console_id = console['id']

        # Thiết lập lệnh cơ bản
        commands = [f"use {module}\n", f"set RHOSTS {target}\n"]

        # Thêm các tùy chọn động từ client
        if "exploit" in module or "payload" in module:
            if options.get('RPORT'):
                commands.append(f"set RPORT {options['RPORT']}\n")
            if options.get('LHOST'):
                commands.append(f"set LHOST {options['LHOST']}\n")
            if options.get('PAYLOAD'):
                commands.append(f"set PAYLOAD {options['PAYLOAD']}\n")
            if options.get('LPORT'):
                commands.append(f"set LPORT {options['LPORT']}\n")
            commands.append("run\n")
        else:  # Auxiliary modules
            commands.append("set THREADS 10\n")
            commands.append("run\n")

        output = []
        for cmd in commands:
            client.call('console.write', [console_id, cmd])
            wait_time = 5 if "run\n" in cmd else 1
            time.sleep(wait_time)
            result = client.call('console.read', [console_id])
            if result and 'data' in result:
                output.append(result['data'].strip())

        client.call('console.destroy', [console_id])
        logging.info("Thực thi hoàn tất")

        sessions = client.call('session.list')
        return jsonify({
            'output': '\n'.join(output),
            'session_created': bool(sessions)
        })
    except Exception as e:
        logging.error(f"Lỗi khi thực thi: {e}")
        return jsonify({'error': str(e), 'output': '\n'.join(output) if output else 'Không có đầu ra'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)