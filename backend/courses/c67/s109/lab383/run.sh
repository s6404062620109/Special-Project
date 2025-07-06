#!/bin/bash

mkdir /root/Desktop/lab

# สร้างไฟล์ข้อความ
echo "This is a test file for Linux Lab." > /root/Desktop/lab/info.txt

# สร้างผู้ใช้จำลอง (ถ้ายังไม่มี)
id labuser &>/dev/null || useradd labuser

# เปลี่ยน owner ของไฟล์ให้กับ labuser
chown labuser:labuser /root/Desktop/lab/info.txt

# ให้ permission แก่ทุกคนอ่านไฟล์ได้
chmod 644 /root/Desktop/lab/info.txt

# บันทึกว่า lab เริ่มแล้ว
echo "Lab setup complete." > /root/Desktop/lab
