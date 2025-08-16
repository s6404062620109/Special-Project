#!/bin/bash

mkdir /tmp

# สร้างไฟล์ข้อความ
echo "This is a test file for Linux Lab." > /tmp/info.txt

# สร้างผู้ใช้จำลอง (ถ้ายังไม่มี)
id labuser &>/dev/null || useradd labuser

# เปลี่ยน owner ของไฟล์ให้กับ labuser
chown labuser:labuser /tmp/info.txt

# ให้ permission แก่ทุกคนอ่านไฟล์ได้
chmod 644 /tmp/info.txt

# บันทึกว่า lab เริ่มแล้ว
echo "Lab setup complete." > /tmp/README.txt
