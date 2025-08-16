# ใช้ Ubuntu 22.04
FROM ubuntu:22.04

# ติดตั้งสิ่งจำเป็น
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
    curl wget build-essential cmake git \
    libjson-c-dev libwebsockets-dev libssl-dev \
    zlib1g-dev pkg-config bash dos2unix && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# ติดตั้ง ttyd
RUN git clone https://github.com/tsl0922/ttyd.git /tmp/ttyd && \
    cd /tmp/ttyd && mkdir build && cd build && \
    cmake .. && make && make install && \
    cd / && rm -rf /tmp/ttyd

# สร้าง user student ใช้ rbash (restricted bash)
RUN groupadd -g 1000 student && \
    useradd -m -u 1000 -g 1000 -s /bin/rbash student

# สร้าง directory สำหรับ user และกำหนดสิทธิ์
RUN mkdir -p /usr/src/app && chown -R student:student /usr/src/app

# ตั้ง working directory
WORKDIR /usr/src/app

# ใช้ user student
USER student

# รัน ttyd พร้อม rbash
CMD ["sh", "-c", "exec ttyd --writable -p ${TTYD_PORT} /bin/rbash"]
