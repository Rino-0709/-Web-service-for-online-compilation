import subprocess
import os

def compile_and_run(code, input_data):
    try:
        with open('Main.java', 'w') as file:
            file.write(code)
        subprocess.run(['javac', 'Main.java'], check=True)
        process = subprocess.Popen(
            ['java', 'Main'],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        output, error = process.communicate(input=input_data, timeout=10)
        os.remove('Main.java')
        os.remove('Main.class')
        return {'output': output, 'error': error}
    except subprocess.CalledProcessError as e:
        return {'error': str(e)}
    except subprocess.TimeoutExpired:
        return {'error': 'Execution timed out'}