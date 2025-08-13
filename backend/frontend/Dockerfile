# ใช้ Nginx เสิร์ฟไฟล์ static
FROM nginx:alpine

# copy dist เข้า nginx
COPY dist/ /usr/share/nginx/html

# copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
