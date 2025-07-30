#!/bin/bash

mkdir /usr/src/app/lab

cat <<EOF > /usr/src/app/lab/email1.txt
From: support@secure-bank.com
Click here to verify your account: http://badsite.xyz/login
EOF

cat <<EOF > /usr/src/app/lab/email2.txt
From: hr@company.com
Please review your benefits document.
EOF

echo "Phishing lab ready at /usr/src/app/lab"