#!/bin/bash

# สร้าง directory lab พร้อมไฟล์ตัวอย่าง
mkdir -p /tmp/lab-test-dir

# สร้างไฟล์ข้อความ
echo "This is a test file for Linux Lab." > /tmp/lab-test-dir/info.txt

# สร้างผู้ใช้จำลอง (ถ้ายังไม่มี)
id labuser &>/dev/null || useradd labuser

# เปลี่ยน owner ของไฟล์ให้กับ labuser
chown labuser:labuser /tmp/lab-test-dir/info.txt

# ให้ permission แก่ทุกคนอ่านไฟล์ได้
chmod 644 /tmp/lab-test-dir/info.txt

# บันทึกว่า lab เริ่มแล้ว
echo "Lab setup complete." > /tmp/lab-setup-status.txt
