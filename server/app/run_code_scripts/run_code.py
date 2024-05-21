import subprocess
import sys
import json
import tempfile

code = sys.argv[1]
input_data = sys.argv[2]

with tempfile.NamedTemporaryFile(delete=False, suffix=".py") as tmp_code:
    tmp_code.write(code.encode('utf-8'))
    tmp_code_path = tmp_code.name

with tempfile.NamedTemporaryFile(delete=False, suffix=".txt") as tmp_input:
    tmp_input.write(input_data.encode('utf-8'))
    tmp_input_path = tmp_input.name

result = subprocess.run(['python3', tmp_code_path], stdin=open(tmp_input_path), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
output = result.stdout.decode('utf-8')
error = result.stderr.decode('utf-8')
exit_code = result.returncode

response = {
    'output': output,
    'error': error,
    'exit_code': exit_code
}

print(json.dumps(response))

os.remove(tmp_code_path)
os.remove(tmp_input_path)
