
#!/bin/bash
echo "You received a suspicious email. Analyze its header for phishing indicators."
mkdir -p /tmp
cat <<EOF > /tmp/email_header.txt
Received: from suspicious-domain.fakebank.com (unknown [203.0.113.45])
    by mail.receiver.com with ESMTP id abc123xyz
    for <victim@receiver.com>; Thu, 4 Aug 2025 10:00:00 +0700
Received: from sender.fakebank.com (sender.fakebank.com [198.51.100.10])
    by suspicious-domain.fakebank.com with ESMTP id qwe456rty
    for <victim@receiver.com>; Thu, 4 Aug 2025 09:59:00 +0700
Message-ID: <1234567890@suspicious-domain.fakebank.com>
Subject: Important Account Update - Action Required
From: RealBank <noreply@realbank-security.com>
To: victim@receiver.com
Date: Thu, 4 Aug 2025 09:58:00 +0700
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8
EOF

cd /tmp
echo "File created at /tmp/email_header.txt"
echo "Use commands like 'cat', 'grep', 'less' to investigate email_header.txt"
