#!/bin/bash

# Số lần lặp
COUNT=100

# URL cần gọi
URL="http://localhost:3007"

# Dữ liệu POST (nếu cần)
POST_DATA="your_post_data_here"

# Thực hiện vòng lặp
for ((i=1; i<=$COUNT; i++)); do
    echo "Making request $i..."
    # Gửi request POST đến URL
    curl -X POST -d "$POST_DATA" "$URL"
    echo "Request $i completed."
done

echo "All requests completed."
