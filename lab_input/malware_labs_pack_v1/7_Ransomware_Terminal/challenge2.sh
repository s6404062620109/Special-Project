#!/usr/bin/env bash
set -e

# เตรียมโฟลเดอร์
rm -rf ransomware_lab
mkdir -p ransomware_lab/files

# สร้างไฟล์ปกติ
echo "รายงานการเงินปี 2025" > ransomware_lab/files/report.txt
echo "บันทึกการประชุม" > ransomware_lab/files/meeting.txt

# สร้างไฟล์ที่ถูกเข้ารหัส
openssl enc -aes-256-cbc -salt -in ransomware_lab/files/report.txt \
  -out ransomware_lab/files/report.txt.encrypted -pass pass:12345 2>/dev/null
rm ransomware_lab/files/report.txt

# note เรียกค่าไถ่
cat <<EOF > ransomware_lab/README_RESTORE_FILES.txt
!!! ALL YOUR FILES HAVE BEEN ENCRYPTED !!!
To restore your files, send 1 Bitcoin to the following wallet:
BTC: 1HACK3RFAKEWALLETR4NSOM
Then contact us at hacker@darknet.fake

FLAG{RANSOMWARE_NOTE_FOUND}
EOF

echo "Lab พร้อมแล้ว ✅"
echo "Hint: ลองหาว่ามีไฟล์ .encrypted หรือ README ที่บอกวิธีจ่ายค่าไถ่"
