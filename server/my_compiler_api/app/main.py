from flask import Flask, request, jsonify
import subprocess
import os
import tempfile
import re

app = Flask(__name__)

def extract_java_class_name(code):
    match = re.search(r'public\s+class\s+(\w+)', code)
    if match:
        return match.group(1)
    else:
        raise ValueError('No public class found in the code')

def compile_and_run_python(code, input_data):
    try:
        process = subprocess.run(
            ['python3', '-c', code],
            input=input_data,
            text=True,
            capture_output=True,
            check=True
        )
        return {'output': process.stdout, 'error': process.stderr}
    except subprocess.CalledProcessError as e:
        return {'output': e.stdout, 'error': e.stderr}

def compile_and_run_cpp(code, input_data):
    with tempfile.NamedTemporaryFile(suffix='.cpp', delete=False) as temp_cpp_file:
        temp_cpp_file.write(code.encode())
        temp_cpp_file.flush()
        temp_executable = temp_cpp_file.name.replace('.cpp', '')
        
        try:
            subprocess.run(
                ['g++', temp_cpp_file.name, '-o', temp_executable],
                check=True,
                capture_output=True,
                text=True
            )
            process = subprocess.run(
                [temp_executable],
                input=input_data,
                text=True,
                capture_output=True,
                check=True
            )
            return {'output': process.stdout, 'error': process.stderr}
        except subprocess.CalledProcessError as e:
            return {'output': e.stdout, 'error': e.stderr}
        finally:
            os.remove(temp_cpp_file.name)
            if os.path.exists(temp_executable):
                os.remove(temp_executable)

def compile_and_run_java(code, input_data):
    try:
        class_name = extract_java_class_name(code)
    except ValueError as e:
        return {'output': '', 'error': str(e)}

    java_file_path = os.path.join(tempfile.gettempdir(), f'{class_name}.java')
    with open(java_file_path, 'w') as temp_java_file:
        temp_java_file.write(code)
        
    try:
        subprocess.run(
            ['javac', java_file_path],
            check=True,
            capture_output=True,
            text=True
        )
        process = subprocess.run(
            ['java', '-cp', tempfile.gettempdir(), class_name],
            input=input_data,
            text=True,
            capture_output=True,
            check=True
        )
        return {'output': process.stdout, 'error': process.stderr}
    except subprocess.CalledProcessError as e:
        return {'output': e.stdout, 'error': e.stderr}
    finally:
        os.remove(java_file_path)
        class_file = java_file_path.replace('.java', '.class')
        if os.path.exists(class_file):
            os.remove(class_file)

def compile_and_run_javascript(code, input_data):
    try:
        process = subprocess.run(
            ['node', '-e', code],
            input=input_data,
            text=True,
            capture_output=True,
            check=True
        )
        return {'output': process.stdout, 'error': process.stderr}
    except subprocess.CalledProcessError as e:
        return {'output': e.stdout, 'error': e.stderr}

@app.route('/compile', methods=['POST'])
def compile_code():
    data = request.json
    language = data['language']
    code = data['code']
    input_data = data['input']

    if language == 'python':
        result = compile_and_run_python(code, input_data)
    elif language == 'cpp':
        result = compile_and_run_cpp(code, input_data)
    elif language == 'java':
        result = compile_and_run_java(code, input_data)
    elif language == 'javascript':
        result = compile_and_run_javascript(code, input_data)
    else:
        result = {'output': '', 'error': 'Unsupported language'}

    return jsonify(result)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
