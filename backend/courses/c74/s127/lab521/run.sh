#!/bin/bash
# MITM Attack Simulation Lab (Safe Version)
# จำลองสถานการณ์ DNS Spoofing โดยไม่แก้ไฟล์จริง

HOSTS_FILE="fake_hosts"

echo "=== MITM Attack Simulation (Safe Mode) ==="
echo "[+] สร้างไฟล์ hosts จำลองที่ $HOSTS_FILE"
echo ""

mkdir -p $LAB_DIR

cat <<EOF > $HOSTS_FILE
127.0.0.1   localhost
192.168.1.10 realbank.com
10.0.0.50   securebank.com
EOF

echo "[+] จำลองว่า securebank.com ถูกเปลี่ยนเส้นทางไปยัง 10.0.0.50"
echo ""
echo "------------------------------------------------------------"
echo "ภารกิจของคุณ:"
echo "1) ตรวจสอบเนื้อหาไฟล์ hosts ปลอม:"
echo "   cat $HOSTS_FILE"
echo ""
echo "2) กรองเฉพาะ securebank.com:"
echo "   grep securebank.com $HOSTS_FILE"
echo ""
echo "3) ลบ record ปลอมออก (แก้ไฟล์ให้เหลือเฉพาะ localhost และ realbank.com)"
echo "   ใช้คำสั่งตัวอย่าง: sed -i '/securebank.com/d' $HOSTS_FILE"
echo ""
echo "4) ตรวจสอบอีกครั้งด้วย cat:"
echo "   cat $HOSTS_FILE"
echo ""
echo "------------------------------------------------------------"
echo "เมื่อเสร็จสิ้น ให้ตอบคำถาม Lab ต่อไป"
