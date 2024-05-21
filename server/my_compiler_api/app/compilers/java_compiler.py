import subprocess
import os
import tempfile
import re

def extract_java_class_name(code):
    match = re.search(r'public\s+class\s+(\w+)', code)
    if match:
        return match.group(1)
    else:
        raise ValueError('No public class found in the code')

def compile_and_run_java(code, input_data):
    try:
        class_name = extract_java_class_name(code)
    except ValueError as e:
        return {'output': '', 'error': str(e), 'exit_code': 1}

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
            capture_output=True
        )
        return {'output': process.stdout, 'error': process.stderr, 'exit_code': process.returncode}
    except subprocess.CalledProcessError as e:
        return {'output': e.stdout, 'error': e.stderr, 'exit_code': e.returncode}
    finally:
        os.remove(java_file_path)
        class_file = java_file_path.replace('.java', '.class')
        if os.path.exists(class_file):
            os.remove(class_file)
