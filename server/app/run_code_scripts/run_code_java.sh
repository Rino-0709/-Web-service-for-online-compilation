#!/bin/bash

code=$1
input=$2

code_file=$(mktemp --suffix=.java)
input_file=$(mktemp --suffix=.txt)

echo "$code" > "$code_file"
echo "$input" > "$input_file"

javac "$code_file"

if [ $? -eq 0 ]; then
    output=$(cat "$input_file" | java -cp "$(dirname "$code_file")" "$(basename "$code_file" .java)")
    exit_code=$?
    error=""
else
    output=""
    error=$(javac "$code_file" 2>&1)
    exit_code=1
fi

response=$(jq -n --arg output "$output" --arg error "$error" --argjson exit_code "$exit_code" '{output: $output, error: $error, exit_code: $exit_code}')
echo "$response"

rm "$code_file" "$input_file" "$(dirname "$code_file")"/*.class
