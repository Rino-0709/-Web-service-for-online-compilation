from flask import Flask, request, jsonify
import subprocess
import tempfile
import os
import json

app = Flask(__name__)

@app.route('/compile', methods=['POST'])
def compile_code():
    data = request.get_json()
    language = data['language']
    code = data['code']
    input_data = data['input']

    if language == 'python':
        script_path = '/app/run_code_scripts/run_code.py'
        command = ['python3', script_path, code, input_data]
    elif language == 'cpp':
        script_path = '/app/run_code_scripts/run_code_cpp.sh'
        command = [script_path, code, input_data]
    elif language == 'java':
        script_path = '/app/run_code_scripts/run_code_java.sh'
        command = [script_path, code, input_data]
    elif language == 'javascript':
        script_path = '/app/run_code_scripts/run_code.js'
        command = ['node', script_path, code, input_data]
    else:
        return jsonify({'error': 'Unsupported language', 'output': '', 'exit_code': 1}), 400

    result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    
    if result.returncode != 0:
        return jsonify({'error': result.stderr.decode('utf-8'), 'output': '', 'exit_code': result.returncode}), 500

    response_data = result.stdout.decode('utf-8')
    response = json.loads(response_data)

    return jsonify(response)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
