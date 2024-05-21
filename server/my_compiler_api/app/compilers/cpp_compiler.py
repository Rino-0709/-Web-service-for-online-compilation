import subprocess
import os
import tempfile

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
                capture_output=True
            )
            return {'output': process.stdout, 'error': process.stderr, 'exit_code': process.returncode}
        except subprocess.CalledProcessError as e:
            return {'output': e.stdout, 'error': e.stderr, 'exit_code': e.returncode}
        finally:
            os.remove(temp_cpp_file.name)
            if os.path.exists(temp_executable):
                os.remove(temp_executable)
