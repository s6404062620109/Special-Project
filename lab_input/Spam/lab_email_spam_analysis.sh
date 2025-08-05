
#!/bin/bash
echo "You received two emails. Analyze their headers to identify which is SPAM."
mkdir -p /usr/src/app
cat <<EOF > /usr/src/app/email_header.txt
Received: from spambot.badsite.com (unknown [203.0.113.200])
    by mail.receiver.com with ESMTP id spam123xyz
    for <victim@receiver.com>; Fri, 5 Aug 2025 09:00:00 +0700
Message-ID: <spam987654321@spambot.badsite.com>
Subject: Congratulations! You won a prize!
From: "Prize Department" <claim@freeprizes.com>
To: victim@receiver.com
Date: Fri, 5 Aug 2025 09:00:00 +0700
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8
EOF

cat <<EOF > /usr/src/app/email2_header.txt
Received: from mail.google.com (mail.google.com [172.217.0.0])
    by mail.receiver.com with ESMTP id legit123abc
    for <victim@receiver.com>; Fri, 5 Aug 2025 08:00:00 +0700
Message-ID: <legit123456789@mail.google.com>
Subject: Monthly Account Statement
From: RealBank <noreply@realbank.com>
To: victim@receiver.com
Date: Fri, 5 Aug 2025 08:00:00 +0700
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8
EOF

cd /usr/src/app
echo "Files created at /usr/src/app/email_header.txt and /usr/src/app/email2_header.txt"
echo "Use commands like 'grep', 'cat', 'diff' to analyze the differences."
