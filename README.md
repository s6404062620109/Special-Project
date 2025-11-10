# Special Project - ระบบการเรียนรู้ออนไลน์

โปรเจกต์นี้เป็นเว็บแอปพลิเคชันสำหรับสร้างและจัดการคอร์สเรียนออนไลน์ โดยเน้นเนื้อหาเกี่ยวกับความปลอดภัยทางไซเบอร์ (Cybersecurity) ผู้ใช้สามารถเรียนรู้ผ่านบทเรียนต่างๆ ทำแบบทดสอบก่อนเรียนและหลังเรียน รวมถึงทำแบบทดสอบในห้องปฏิบัติการ (Lab) เพื่อวัดความเข้าใจเชิงปฏิบัติ

## โครงสร้างโปรเจกต์

โปรเจกต์ประกอบด้วย 3 ส่วนหลัก:

1.  **Frontend**: พัฒนาด้วย React เป็นส่วนติดต่อผู้ใช้งาน (User Interface) สำหรับผู้เรียน, ผู้สอน, และผู้ดูแลระบบ
2.  **Backend**: พัฒนาด้วย Node.js และ Express.js ทำหน้าที่เป็น API Server จัดการตรรกะทางธุรกิจ, การเข้าถึงฐานข้อมูล, และการยืนยันตัวตน
3.  **Database**: ใช้ MySQL สำหรับจัดเก็บข้อมูลทั้งหมดของระบบ เช่น ข้อมูลผู้ใช้, คอร์สเรียน, บทเรียน, คำถาม และผลการทดสอบ

## เทคโนโลยีที่ใช้

- **Frontend**: React
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Containerization**: Docker, Docker Compose
- **Database Management**: phpMyAdmin

---

## 🚀 ขั้นตอนการติดตั้งและใช้งานผ่าน Docker

ส่วนนี้จะอธิบายขั้นตอนการติดตั้งโปรเจกต์ทั้งหมด (Frontend, Backend, Database) โดยใช้ Docker Desktop

### สิ่งที่ต้องมี (Prerequisites)

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) ติดตั้งบนเครื่องคอมพิวเตอร์ของคุณ

### ขั้นตอนการติดตั้ง

1.  **Clone Repository**

    ทำการ clone โปรเจกต์นี้ลงบนเครื่องของคุณ (หากยังไม่มี)

2.  **สร้างไฟล์ Environment (.env)**

    ภายในไดเรกทอรี `backend` ให้สร้างไฟล์ใหม่ชื่อ `.env` และคัดลอกเนื้อหาด้านล่างไปวาง ไฟล์นี้ใช้สำหรับกำหนดค่าตัวแปรต่างๆ ที่จำเป็นสำหรับ Backend Server

    ```.env
    # Server Configuration
    # Ip public address
    DEV_URL=public_address

    # Frontend port
    FRONTEND_PORT=3003
    # Backend port
    BACKEND_PORT=3002
    
    # Database Connection
    DATABASE_HOST=db
    DATABASE_USER=root
    DATABASE_PASSWORD=password_1234
    DATABASE_NAME=SAT
    DATABASE_PORT=3306

    # Email for auto send auth.
    EMAIL_USER=email@address.com
    EMAIL_PASS=auth_app_pass
    ```

3.  **Start Services ด้วย Docker Compose**

    - เปิด Terminal หรือ Command Prompt
    - นำทาง (Navigate) ไปยังไดเรกทอรี `backend` ซึ่งเป็นที่อยู่ของไฟล์ `docker-compose.yml`
      ```sh
      cd path/to/your/project/special-project/backend
      ```
    - รันคำสั่งต่อไปนี้เพื่อสร้าง (build) และเริ่มต้นการทำงานของ service ทั้งหมดในพื้นหลัง (detached mode)
      ```sh
      docker-compose up -d --build
      ```
    - Docker Compose จะทำการสร้าง image และ container สำหรับ `react-frontend`, `node-server`, `db` (MySQL), และ `phpmyadmin` ตามที่กำหนดไว้ในไฟล์ `docker-compose.yml`

4.  **เข้าถึงแอปพลิเคชัน**

    เมื่อ container ทั้งหมดทำงานเรียบร้อยแล้ว คุณสามารถเข้าถึงส่วนต่างๆ ของโปรเจกต์ได้ผ่านทางเว็บเบราว์เซอร์:
    - **Frontend (เว็บแอปพลิเคชัน)**: http://localhost:3003
    - **Backend (API Server)**: ทำงานอยู่ที่ `http://localhost:3002` แต่โดยทั่วไปจะถูกเรียกใช้งานผ่าน Frontend
    - **phpMyAdmin (จัดการฐานข้อมูล)**: http://localhost:8081
      - **Server**: `db`
      - **Username**: `root`
      - **Password**: `password_1234`

5.  **การหยุดการทำงาน**

    หากต้องการหยุดการทำงานของ container ทั้งหมด ให้รันคำสั่งต่อไปนี้ในไดเรกทอรี `backend`:
    ```sh
    docker-compose down
    ```

