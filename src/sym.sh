#!/bin/bash

# Функция для подсчета символов в файле
count_chars() {
    local file="$1"
    if [[ -f "$file" ]]; then
        # Игнорируем бинарные файлы
        if [[ "$(file -b "$file")" != *"binary"* ]]; then
            local chars=$(wc -m < "$file")
            echo "$chars"
        else
            echo "0"
        fi
    else
        echo "0"
    fi
}

# Рекурсивный обход папок
count_chars_recursive() {
    local dir="$1"
    local total=0
    
    for item in "$dir"/*; do
        if [[ -d "$item" ]]; then
            # Рекурсивный вызов для подпапок
            total=$((total + $(count_chars_recursive "$item")))
        elif [[ -f "$item" ]]; then
            total=$((total + $(count_chars "$item")))
        fi
    done
    
    echo "$total"
}

# Основная программа
if [[ $# -eq 0 ]]; then
    start_dir="."
else
    start_dir="$1"
fi

if [[ ! -d "$start_dir" ]]; then
    echo "Ошибка: '$start_dir' не является папкой"
    exit 1
fi

echo "Подсчет символов в папке: $start_dir"
total_chars=$(count_chars_recursive "$start_dir")
echo "Общее количество символов: $total_chars"
