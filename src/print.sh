#!/bin/bash

# Function to recursively print file content
print_files_content() {
    local dir="$1"
    for file in "$dir"/*; do
        if [ -d "$file" ]; then
            # If it's a directory, call the function recursively
            print_files_content "$file"
        elif [ -f "$file" ]; then
            # If it's a file, print its name and content
            echo "$(basename "$file")"
            cat "$file"
            echo -e " "
        fi
    done
}

# Call the function on the current directory
print_files_content "$(pwd)"
