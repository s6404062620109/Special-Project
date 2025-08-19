#!/usr/bin/env bash
set -e

# Create a clean workspace
rm -rf samples
mkdir -p samples

# generate many files
for i in $(seq 1 60); do
  head -c 256 /dev/urandom > "samples/sample_${i}.bin"
done

# pick a random target
R=$(( (RANDOM % 60) + 1 ))
target="samples/sample_${R}.bin"

# embed a fake virus signature and a FLAG
printf "\nVIRUS_SIG_1337\nFLAG{VIRUS_SIGNATURE_FOUND}\n" >> "$target"

echo "สร้าง samples จำนวน 60 ไฟล์แล้ว ✅"
echo "ค้นหาลายเซ็น 'VIRUS_SIG_1337' ให้พบไฟล์ที่มี FLAG"
