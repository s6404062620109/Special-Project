#!/usr/bin/env bash
set -e

# สร้างโฟลเดอร์ log ถ้ายังไม่มี
mkdir -p server_logs
LOG_FILE="server_logs/access.log"

# ล้าง log เก่า
> "$LOG_FILE"

echo "เริ่มจำลองการโจมตี DDoS ไปยังพอร์ต 8080 ..."

# สุ่มให้มี request 2 IP: ปกติ 1, โจมตี 1
NORMAL_IP="192.168.1.10"
ATTACK_IP="192.168.1.99"

# สร้าง log ปกติ (10 request)
for i in $(seq 1 10); do
  echo "$NORMAL_IP - - [$(date)] \"GET /index.html HTTP/1.1\" 200 512" >> "$LOG_FILE"
done

# สร้าง log โจมตี (2000 request)
for i in $(seq 1 2000); do
  echo "$ATTACK_IP - - [$(date)] \"GET /login.php HTTP/1.1\" 200 1024" >> "$LOG_FILE"
done

echo "✅ log ถูกสร้างแล้ว: $LOG_FILE"
echo "ลองใช้คำสั่ง wc, awk, sort, uniq เพื่อตรวจสอบ"
