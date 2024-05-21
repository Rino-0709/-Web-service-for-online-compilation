#!/bin/bash

code=$1
input=$2

code_file=$(mktemp --suffix=.cpp)
input_file=$(mktemp --suffix=.txt)

echo "$code" > "$code_file"
echo "$input" > "$input_file"

g++ "$code_file" -o "${code_file%.cpp}.out"

if [ $? -eq 0 ]; then
    output=$(cat "$input_file" | "${code_file%.cpp}.out")
    exit_code=$?
    error=""
else
    output=""
    error=$(g++ "$code_file" -o "${code_file%.cpp}.out" 2>&1)
    exit_code=1
fi

response=$(jq -n --arg output "$output" --arg error "$error" --argjson exit_code "$exit_code" '{output: $output, error: $error, exit_code: $exit_code}')
echo "$response"

rm "$code_file" "$input_file" "${code_file%.cpp}.out"
