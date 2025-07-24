#!/bin/bash

# เตรียมโฟลเดอร์
LAB_DIR="/root/Desktop/lab"
mkdir -p "$LAB_DIR"

# สร้างอีเมลตัวอย่างที่มีลิงก์ปลอม
cat <<EOF > "$LAB_DIR/email-links.txt"
Subject: Important - Account Verification Required

Dear user,

We noticed suspicious activity in your account.
Please verify your identity by clicking the link below:

👉 https://secure-yourbank-login.com

Or visit: http://192.168.0.15/fake-login

Best regards,
Security Team
EOF

echo "Lab: ตรวจสอบลิงก์ปลอมในอีเมล พร้อมแล้วที่ $LAB_DIR/email-links.txt"
