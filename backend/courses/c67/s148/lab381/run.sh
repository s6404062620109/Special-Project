#!/bin/bash

mkdir -p /tmp/lab-phishing
cat <<EOF > /tmp/lab-phishing/email1.txt
From: support@secure-bank.com
Click here to verify your account: http://badsite.xyz/login
EOF

cat <<EOF > /tmp/lab-phishing/email2.txt
From: hr@company.com
Please review your benefits document.
EOF

echo "Phishing lab ready at /tmp/lab-phishing"