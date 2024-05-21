from flask import Flask, request, jsonify
from .compilers.python_compiler import compile_and_run_python
from .compilers.cpp_compiler import compile_and_run_cpp
from .compilers.java_compiler import compile_and_run_java
from .compilers.javascript_compiler import compile_and_run_javascript

app = Flask(__name__)

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
        result = {'output': '', 'error': 'Unsupported language', 'exit_code': 1}

    return jsonify(result)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
