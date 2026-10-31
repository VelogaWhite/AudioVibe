# AudioVibe — Project Setup Guide

คู่มือนี้ใช้สำหรับสมาชิกทีมที่เพิ่งเข้าร่วมโปรเจกต์ AudioVibe และยังไม่มีประสบการณ์กับโปรเจกต์นี้

เป้าหมายหลังทำตามคู่มือนี้:

- Clone โปรเจกต์จาก GitHub ได้
- ติดตั้งเครื่องมือที่จำเป็นได้
- เปิดโปรเจกต์ใน VS Code ได้
- รัน PostgreSQL / Redis ผ่าน Docker ได้
- ติดตั้ง Dependencies ได้
- ตั้งค่า `.env` ได้
- รัน Backend ได้
- ตรวจสอบว่า Backend ทำงานได้
- สามารถเริ่มเขียน Code และทำงานบน Branch ของตัวเองได้

---

# 1. สิ่งที่ต้องติดตั้งก่อน

เครื่องที่ใช้พัฒนาโปรเจกต์ต้องมีโปรแกรมเหล่านี้

| โปรแกรม | ใช้ทำอะไร |
|---|---|
| Git | ดาวน์โหลดและจัดการ Code จาก GitHub |
| VS Code | โปรแกรมสำหรับเขียน Code |
| Docker Desktop | รัน PostgreSQL และ Redis |
| Node.js | ใช้รัน Backend |
| npm | ใช้ติดตั้ง Dependencies |

## 1.1 ตรวจสอบว่า Git ติดตั้งแล้ว

เปิด Terminal แล้วพิมพ์

```bash
git --version
```

ถ้าได้ประมาณ

```text
git version 2.x.x
```

แสดงว่าใช้งานได้

---

## 1.2 ตรวจสอบ Node.js

```bash
node --version
```

และ

```bash
npm --version
```

ควรได้ Version ตามที่โปรเจกต์กำหนด

> ถ้าโปรเจกต์มีไฟล์ `.nvmrc` หรือกำหนด Node Version ไว้ใน README ให้ใช้ Version นั้น

---

## 1.3 ติดตั้ง Docker Desktop

ติดตั้ง Docker Desktop ก่อนเริ่มทำงาน

หลังติดตั้งแล้วให้เปิด Docker Desktop และรอจน Docker พร้อมใช้งาน

ตรวจสอบด้วย

```bash
docker --version
```

และ

```bash
docker compose version
```

ถ้าทั้งสองคำสั่งทำงาน แสดงว่า Docker พร้อมใช้งาน

---

# 2. Clone โปรเจกต์

เปิด Terminal ในตำแหน่งที่ต้องการเก็บโปรเจกต์

ตัวอย่าง

```bash
cd D:\CODE
```

Clone Repository

```bash
git clone <GITHUB_REPOSITORY_URL>
```

จากนั้นเข้าโฟลเดอร์

```bash
cd AudioVibe
```

---

# 3. เปิดโปรเจกต์ด้วย VS Code

ถ้าติดตั้ง VS Code แล้ว สามารถใช้คำสั่ง

```bash
code .
```

หรือเปิด VS Code แล้วเลือก

```text
File → Open Folder → AudioVibe
```

---

# 4. ตรวจสอบ Branch

หลัง Clone มาแล้ว ตรวจสอบ Branch

```bash
git branch
```

ตรวจสอบสถานะ

```bash
git status
```

ควรเห็นประมาณ

```text
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

---

# 5. ห้ามทำงานบน main โดยตรง

ก่อนเริ่มเขียน Code ให้สร้าง Branch ของตัวเอง

ตัวอย่าง ถ้าชื่อคุณคือ `john`

```bash
git checkout -b feat/john
```

ตรวจสอบ

```bash
git branch
```

จะเห็น

```text
* feat/john
  main
```

เครื่องหมาย `*` หมายถึง Branch ที่กำลังใช้งานอยู่

---

# 6. เข้าโฟลเดอร์ Backend

สำหรับ Backend ของ AudioVibe อยู่ที่

```text
apps/core-api
```

เข้าไปด้วย

```bash
cd apps/core-api
```

ตรวจสอบไฟล์

```bash
dir
```

หรือถ้าใช้ Git Bash

```bash
ls
```

---

# 7. ติดตั้ง Dependencies

ในโฟลเดอร์ `apps/core-api` ให้รัน

```bash
npm install
```

คำสั่งนี้จะติดตั้ง Packages ที่โปรเจกต์ต้องใช้ตาม `package.json`

หลังติดตั้งเสร็จควรมีโฟลเดอร์

```text
node_modules
```

> ไม่ต้อง Commit `node_modules` เข้า Git

---

# 8. ตั้งค่า Environment Variables

โปรเจกต์จะใช้ไฟล์ `.env` สำหรับค่าที่แตกต่างกันในแต่ละเครื่อง

ตัวอย่างเช่น

```text
DATABASE_URL
REDIS_URL
SPOTIFY_CLIENT_ID
SPOTIFY_CLIENT_SECRET
```

## สำคัญ

**ห้ามสร้างค่า `.env` แบบสุ่มเองถ้าโปรเจกต์ต้องใช้ Secret จริง**

ให้ขอค่า Environment Variables ที่จำเป็นจากหัวหน้าทีมหรือสมาชิกที่ดูแลโปรเจกต์

ตัวอย่างโครงสร้าง

```text
apps/
└── core-api/
    ├── src/
    ├── package.json
    ├── prisma/
    ├── .env
    └── ...
```

ไฟล์ `.env` **ห้าม Commit เข้า GitHub**

ตรวจสอบ `.gitignore` ว่ามี

```gitignore
.env
.env.*
```

หรือกฎที่เหมาะสมกับโปรเจกต์

---

# 9. เปิด Docker Desktop

ก่อนรัน Backend ให้เปิด Docker Desktop

Docker จะใช้สำหรับ Services ที่โปรเจกต์ต้องการ เช่น

- PostgreSQL
- Redis

ตรวจสอบ Docker

```bash
docker --version
```

---

# 10. Start Database และ Redis

กลับไปที่ Root ของโปรเจกต์

ตัวอย่าง

```bash
cd D:\CODE\AudioVibe
```

จากนั้นรัน

```bash
docker compose up -d
```

ความหมาย:

```text
docker compose
    ↓
อ่าน docker-compose.yml
    ↓
สร้าง / เริ่ม Services
    ↓
PostgreSQL + Redis
```

ตรวจสอบว่า Containers ทำงานอยู่หรือไม่

```bash
docker compose ps
```

ควรเห็น Services ที่เกี่ยวข้องมีสถานะประมาณ

```text
Up
```

---

# 11. ถ้า Docker ยังไม่ทำงาน

ถ้าเจอ Error เช่น

```text
Cannot connect to the Docker daemon
```

ให้ตรวจสอบว่า Docker Desktop เปิดอยู่หรือไม่

เปิด Docker Desktop แล้วรอให้ระบบพร้อม จากนั้นลอง

```bash
docker compose ps
```

อีกครั้ง

---

# 12. Setup Database

Backend ใช้ PostgreSQL เป็น Database

โปรเจกต์ใช้ Prisma สำหรับจัดการ Database Schema

หลังจาก Database พร้อมแล้ว ให้เข้า Backend

```bash
cd apps/core-api
```

ตรวจสอบ Prisma

```bash
npx prisma --version
```

จากนั้นใช้คำสั่ง Database ตามที่กำหนดไว้ในโปรเจกต์

ตัวอย่างเช่น

```bash
npx prisma migrate dev
```

หรือคำสั่งที่ทีมกำหนดไว้

> อย่าสร้าง Migration ใหม่โดยไม่เข้าใจก่อนว่ากำลังเปลี่ยน Database Schema อะไร

---

# 13. Start Backend

ใน

```text
apps/core-api
```

รัน

```bash
npm run start:dev
```

ถ้าสำเร็จ Backend จะเริ่มทำงานและแสดงข้อความประมาณ

```text
Application successfully started
```

หรือ

```text
Nest application successfully started
```

---

# 14. ตรวจสอบว่า Backend ทำงานหรือไม่

เปิด Browser หรือใช้ API Client เช่น Postman / Insomnia

ทดลองเรียก API ที่โปรเจกต์กำหนดไว้ เช่น

```text
http://localhost:<PORT>
```

ถ้า API ตอบกลับ แสดงว่า Backend ทำงานแล้ว

---

# 15. โครงสร้างโปรเจกต์เบื้องต้น

หลัง Setup เสร็จ ไม่จำเป็นต้องเข้าใจทุกไฟล์ทันที

โครงสร้างโดยประมาณ

```text
AudioVibe/
│
├── apps/
│   └── core-api/
│       │
│       ├── src/
│       │   ├── modules/
│       │   ├── controllers/
│       │   ├── services/
│       │   └── ...
│       │
│       ├── prisma/
│       │
│       ├── package.json
│       ├── .env
│       └── ...
│
├── docker-compose.yml
├── README.md
└── ...
```

หน้าที่หลัก:

### `src/`

Source Code ของ Backend

### `prisma/`

Database Schema และ Migration

### `package.json`

กำหนด Dependencies และ Scripts

### `docker-compose.yml`

กำหนด Services ที่ต้องรันด้วย Docker

### `.env`

เก็บ Environment Variables ของเครื่องนั้น

---

# 16. Workflow ในแต่ละวัน

เมื่อกลับมาทำงานในวันถัดไป ไม่จำเป็นต้อง Setup ใหม่ทั้งหมด

## Step 1 — เปิด Docker Desktop

เปิด Docker Desktop และรอให้พร้อม

---

## Step 2 — เปิด VS Code

เปิดโฟลเดอร์

```text
AudioVibe
```

---

## Step 3 — ดึง Code ล่าสุด

เปิด Terminal

```bash
git checkout main
```

จากนั้น

```bash
git pull
```

---

## Step 4 — กลับไป Branch ของตัวเอง

ตัวอย่าง

```bash
git checkout feat/john
```

แล้ว Update Branch จาก `main` ตาม Workflow ของทีม

---

## Step 5 — Start Docker

จาก Root โปรเจกต์

```bash
docker compose up -d
```

---

## Step 6 — Start Backend

```bash
cd apps/core-api
```

แล้ว

```bash
npm run start:dev
```

จากจุดนี้สามารถเริ่มเขียน Code ได้เลย

---

# 17. Workflow เมื่อจะเริ่มทำ Feature ใหม่

สมมติได้รับงาน

```text
สร้าง Spotify Search API
```

อย่าแก้บน `main`

สร้าง Branch ใหม่

```bash
git checkout main
git pull
git checkout -b feat/spotify-search
```

จากนั้นจึงเริ่มเขียน Code

---

# 18. หลังเขียน Code เสร็จ

ตรวจสอบไฟล์ที่เปลี่ยน

```bash
git status
```

ดูรายละเอียดการเปลี่ยนแปลง

```bash
git diff
```

จากนั้น Add

```bash
git add .
```

Commit

```bash
git commit -m "feat: add spotify search api"
```

Push Branch

```bash
git push -u origin feat/spotify-search
```

จากนั้นไปที่ GitHub และสร้าง Pull Request

```text
feat/spotify-search
        ↓
      main
```

อย่า Push Feature เข้า `main` โดยตรง

---

# 19. ถ้าเพื่อนต้องการทำงานต่อจาก Branch ของตัวเอง

ไม่ต้อง Clone Repository ใหม่

ใช้ Repository เดิมที่ Clone ไว้

เช่น

```bash
git checkout feat/spotify-search
```

จากนั้นทำงานต่อได้เลย

---

# 20. ถ้าเพื่อนเข้ามาทำงานใหม่ครั้งแรก

ให้ทำตาม Checklist นี้

```text
[ ] ติดตั้ง Git
[ ] ติดตั้ง Node.js
[ ] ติดตั้ง VS Code
[ ] ติดตั้ง Docker Desktop
[ ] Clone Repository
[ ] เปิดโปรเจกต์ด้วย VS Code
[ ] สร้าง Branch ของตัวเอง
[ ] npm install
[ ] ตั้งค่า .env
[ ] เปิด Docker Desktop
[ ] docker compose up -d
[ ] Setup Database
[ ] npm run start:dev
[ ] ตรวจสอบ API
[ ] พร้อมเริ่มเขียน Code
```

---

# 21. ปัญหาที่พบบ่อย

## `git` ไม่พบคำสั่ง

```text
git is not recognized...
```

ให้ติดตั้ง Git และเปิด Terminal ใหม่

---

## `docker` ไม่ทำงาน

ตรวจสอบว่า Docker Desktop เปิดอยู่

จากนั้น

```bash
docker --version
```

---

## Database เชื่อมต่อไม่ได้

ตรวจสอบ

```bash
docker compose ps
```

ดูว่า PostgreSQL ทำงานอยู่หรือไม่

และตรวจสอบค่า

```text
DATABASE_URL
```

ใน `.env`

---

## Redis เชื่อมต่อไม่ได้

ตรวจสอบ

```bash
docker compose ps
```

และตรวจสอบ

```text
REDIS_URL
```

ใน `.env`

---

## `npm install` มีปัญหา

ตรวจสอบ Node Version ก่อน

```bash
node --version
```

ต้องตรงกับ Version ที่โปรเจกต์กำหนด

---

# 22. กฎสำคัญสำหรับสมาชิกทีม

### 1. ห้าม Push เข้า `main` โดยตรง

ใช้ Branch + Pull Request

### 2. ห้าม Commit `.env`

เพราะอาจมี Secret

### 3. ห้าม Commit `node_modules`

Dependencies สามารถติดตั้งใหม่ด้วย

```bash
npm install
```

### 4. ก่อนเริ่มทำงาน ให้ Update Code

```bash
git pull
```

### 5. ก่อนสร้าง Feature ให้สร้าง Branch

ตัวอย่าง

```bash
git checkout -b feat/ชื่อ-feature
```

### 6. ถ้าไม่เข้าใจ Error อย่าแก้แบบสุ่ม

ให้ส่ง Error ที่เกิดขึ้นให้ทีมช่วยตรวจสอบ

---

# 23. เป้าหมายหลัง Setup

เมื่อทำตามคู่มือนี้ครบ สมาชิกใหม่ควรสามารถทำสิ่งต่อไปนี้ได้:

```text
GitHub
   ↓
Clone Repository
   ↓
เปิด VS Code
   ↓
สร้าง Branch
   ↓
npm install
   ↓
ตั้งค่า .env
   ↓
Docker Desktop
   ↓
PostgreSQL + Redis
   ↓
Prisma
   ↓
Start Backend
   ↓
เขียน Code
   ↓
git add
   ↓
git commit
   ↓
git push
   ↓
Pull Request
```

**ถ้าทำถึงขั้นนี้ได้ ถือว่า Environment พร้อมสำหรับการพัฒนาแล้ว**