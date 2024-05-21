import subprocess

def compile_and_run(code, input_data):
    try:
        process = subprocess.Popen(
            ['python3', '-c', code],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        output, error = process.communicate(input=input_data, timeout=5)
        return {'output': output, 'error': error}
    except subprocess.TimeoutExpired:
        return {'error': 'Execution timed out'}