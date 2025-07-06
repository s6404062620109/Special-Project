#!/bin/bash

mkdir /root/Desktop/lab

cat <<EOF > /root/Desktop/lab/email1.txt
From: support@secure-bank.com
Click here to verify your account: http://badsite.xyz/login
EOF

cat <<EOF > /root/Desktop/lab/email2.txt
From: hr@company.com
Please review your benefits document.
EOF

echo "Phishing lab ready at /root/Desktop/lab"