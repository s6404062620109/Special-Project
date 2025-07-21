#!/bin/bash

# สร้างโฟลเดอร์เก็บ email header ปลอม
LAB_DIR="/root/Desktop/lab-email-header"
mkdir -p "$LAB_DIR"

# สร้างไฟล์อีเมลจำลอง 2 ฉบับ
cat <<EOF > "$LAB_DIR/email1.eml"
Return-Path: <support@secure-bank.com>
Received: from unknownhost (unknown [123.45.67.89])
Subject: Account Verification
From: Secure Bank <support@secure-bank.com>
To: user@example.com

Please verify your account by clicking:
http://phishing-site.com/verify
EOF

cat <<EOF > "$LAB_DIR/email2.eml"
Return-Path: <hr@company.com>
Received: from mail.company.com (mail.company.com [192.168.1.10])
Subject: Internal HR Notice
From: HR Department <hr@company.com>
To: user@example.com

Please see the attached document.
EOF

# เปลี่ยนสิทธิ์ให้เปิดอ่านได้
chmod -R 755 "$LAB_DIR"

# แจ้งเตือน
echo "📩 Email header lab ready at: $LAB_DIR"
echo "ลองใช้คำสั่ง grep, cat, less เพื่อตรวจสอบ header"
