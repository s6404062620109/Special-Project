FROM ubuntu:22.04

# ติดตั้งสิ่งจำเป็น
RUN apt-get update && apt-get install -y \
    curl wget build-essential cmake git \
    libjson-c-dev libwebsockets-dev libssl-dev \
    zlib1g-dev pkg-config bash && \
    apt-get clean

# ติดตั้ง ttyd
RUN git clone https://github.com/tsl0922/ttyd.git && \
    cd ttyd && mkdir build && cd build && \
    cmake .. && make && make install

# สร้าง dir
WORKDIR /usr/src/app

# คำสั่งรัน ttyd ตอน container start
CMD sh -c "exec ttyd --writable -p ${TTYD_PORT} bash"


