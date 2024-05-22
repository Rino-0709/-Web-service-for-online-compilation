import subprocess

def compile_and_run_python(code, input_data):
    try:
        process = subprocess.run(
            ['timeout', '5', 'python3', '-c', code],
            input=input_data,
            text=True,
            capture_output=True,
            check=True
        )
        return {'output': process.stdout, 'error': process.stderr, 'exit_code': process.returncode}
    except subprocess.CalledProcessError as e:
        return {'output': e.stdout, 'error': e.stderr, 'exit_code': e.returncode}
    except subprocess.TimeoutExpired:
        return {'output': '', 'error': 'Execution timed out', 'exit_code': 1}