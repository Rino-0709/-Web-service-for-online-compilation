import subprocess
import os

def compile_and_run(code, input_data):
    try:
        with open('main.cpp', 'w') as file:
            file.write(code)
        subprocess.run(['g++', '-o', 'main', 'main.cpp'], check=True)
        process = subprocess.Popen(
            ['./main'],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        output, error = process.communicate(input=input_data, timeout=10)
        os.remove('main.cpp')
        os.remove('main')
        return {'output': output, 'error': error}
    except subprocess.CalledProcessError as e:
        return {'error': str(e)}
    except subprocess.TimeoutExpired:
        return {'error': 'Execution timed out'}