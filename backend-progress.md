# AudioVibe Backend Progress

เอกสารนี้ใช้ติดตามความคืบหน้า Backend ของ AudioVibe โดยสรุปสิ่งที่ทำเสร็จจริง จุดที่กำลังทำ และงานที่ยังเหลืออยู่จากแผน 28 ข้อ

## สถานะล่าสุด

- **Branch:** `feat/backend-foundation-spotify-users`
- **Commit ล่าสุด:** `e6a38d5`
- **จุดที่หยุด:** เตรียมทำ Spotify OAuth ต่อ โดยงานถัดไปคือ **OAuth state**
- **GitHub:** Push ยังไม่สำเร็จ เนื่องจาก GitHub ตอบ `403 permission` สำหรับบัญชี `pongsakorn-jampasak`
- **ข้อควรระวัง:** เอกสารนี้ไม่เก็บ secret, token หรือค่าจริงจากไฟล์ environment

## Progress Tracker 28 ข้อ

| # | สถานะ | หัวข้อ | คำอธิบายสั้น ๆ |
|---:|:---:|---|---|
| 1 | ✅ | เลือก Backend Core | เลือก NestJS และ TypeScript เป็นแกนหลักของ Backend |
| 2 | ✅ | สร้างโครงสร้างโปรเจกต์ | ตั้งค่า `apps/core-api` และโครงสร้างพื้นฐานของ NestJS แล้ว |
| 3 | ✅ | ตั้งค่า PostgreSQL | ใช้ PostgreSQL 15 ผ่าน Docker พร้อมฐานข้อมูล `audiovibe_db` |
| 4 | ✅ | ออกแบบ Prisma Schema | สร้างโมเดลหลัก User, PromptLog, Playlist, Track, AudioFeature และ PlaylistTrack |
| 5 | ✅ | เชื่อมต่อ Prisma | ทำ migration, generate client และทดสอบการเชื่อมต่อฐานข้อมูลแล้ว |
| 6 | ✅ | ตั้งค่า Redis | ใช้ Redis 7 ผ่าน Docker และทดสอบ `PING` ได้ `PONG` |
| 7 | ✅ | ตั้งค่า Environment Config | เพิ่ม `@nestjs/config`, `.env` และ `.env.example` โดยไม่ใส่ค่าลับในเอกสาร |
| 8 | ✅ | จัดการ Error ระดับ Global | เพิ่ม Global HTTP Exception Filter แล้ว |
| 9 | 🟡 | วางรากฐาน Spotify Users และ OAuth | เริ่มเตรียมส่วน Spotify OAuth แล้ว แต่ยังต้องทำ OAuth state ต่อ |
| 10 | ⬜ | OAuth state | สร้าง state แบบสุ่ม จัดเก็บชั่วคราว และตรวจสอบ state ตอน callback |
| 11 | ⬜ | Spotify Login URL | สร้าง endpoint สำหรับเริ่ม Spotify authorization flow |
| 12 | ⬜ | Spotify OAuth Callback | รับ callback, ตรวจ code และแลก access/refresh token |
| 13 | ⬜ | Token Encryption และ Storage | จัดเก็บ token อย่างปลอดภัยและกำหนดอายุการใช้งาน |
| 14 | ⬜ | User Upsert จาก Spotify | สร้างหรืออัปเดต User จาก Spotify profile และ Spotify user id |
| 15 | ⬜ | Auth Guard และ Current User | ตรวจสิทธิ์ request และดึงผู้ใช้ปัจจุบันจาก token/session |
| 16 | ⬜ | Refresh Token Flow | ต่ออายุ access token เมื่อ token หมดอายุ |
| 17 | ⬜ | Logout และ Token Revocation | ล้าง session/cache และยกเลิกการใช้งาน token ตามความเหมาะสม |
| 18 | ⬜ | Prompt Log Service | บันทึกประวัติ prompt และผลลัพธ์ที่เกี่ยวข้องกับผู้ใช้ |
| 19 | ⬜ | Playlist Service | สร้าง อ่าน แก้ไข และลบ playlist ตามสิทธิ์ของผู้ใช้ |
| 20 | ⬜ | Track Service | จัดการข้อมูลเพลงและการเชื่อมโยงกับ Spotify track |
| 21 | ⬜ | Audio Feature Service | ดึงและจัดเก็บ audio features ของเพลง |
| 22 | ⬜ | Playlist Track Management | เพิ่ม ลบ และจัดลำดับเพลงภายใน playlist |
| 23 | ⬜ | Redis Cache Logic | นำ key structure และ TTL ที่ออกแบบไว้มาใช้จริงกับ service |
| 24 | ⬜ | Search และ Recommendation Flow | ทำ flow สำหรับค้นหาและเตรียมข้อมูล recommendation |
| 25 | ⬜ | Validation และ API Contract | เพิ่ม DTO validation, response shape และ error contract ให้ครบถ้วน |
| 26 | ⬜ | Security และ Rate Limiting | ป้องกัน endpoint สำคัญ, จำกัดความถี่ และตรวจสอบ input เพิ่มเติม |
| 27 | ⬜ | Automated Tests | เพิ่ม unit, integration และ API tests สำหรับ flow สำคัญ |
| 28 | ⬜ | Documentation และ Deployment Readiness | ทำ API docs, health check, logging และตรวจความพร้อมก่อน deploy |

## รายละเอียดงานที่ทำสำเร็จจริง

### 1. เลือก Backend Core

- เลือก **NestJS** เป็น Backend framework
- ใช้ **TypeScript**
- กำหนดให้ Backend อยู่ที่ `apps/core-api`
- ตรวจสอบแล้วว่า Backend start ได้และ `npm run build` ผ่าน

### 2. สร้างโครงสร้างโปรเจกต์

มีโครงสร้างพื้นฐานของ Backend เช่น `src/`, `prisma/`, `test/`, `package.json` และไฟล์ตั้งค่าที่เกี่ยวข้อง พร้อมพัฒนาต่อ

### 3. ตั้งค่า PostgreSQL

- ใช้ PostgreSQL 15 ผ่าน Docker
- Container: `audiovibe-postgres`
- Port: `5432`
- Database: `audiovibe_db`

### 4. ออกแบบ Prisma Schema

สร้าง Schema หลักสำหรับ `User`, `PromptLog`, `Playlist`, `Track`, `AudioFeature` และ `PlaylistTrack` ให้สอดคล้องกับโครงสร้างข้อมูลของโปรเจกต์

### 5. เชื่อมต่อ Prisma

- ใช้ Prisma 7
- สร้าง `schema.prisma`
- ทำ migration และ generate Prisma Client
- ตั้งค่า PostgreSQL adapter
- มี `PrismaService` และ `PrismaModule`
- ทดสอบ connection กับ PostgreSQL แล้ว

### 6. ตั้งค่า Redis

- ใช้ Redis 7 ผ่าน Docker
- Container: `audiovibe-redis`
- Port: `6379`
- ทดสอบการเชื่อมต่อด้วย `PING` ได้ผลลัพธ์ `PONG`
- มี `RedisService` แล้ว

Key structure ที่ออกแบบไว้:

- `track:features:{spotify_track_id}` — TTL 7 วัน
- `user:token:{user_id}` — TTL 55 นาที
- `search:{query_hash}` — TTL 24 ชั่วโมง

> หมายเหตุ: ตอนนี้เชื่อมต่อ Redis แล้ว แต่ยังไม่ได้ผูก Cache Logic เข้ากับ service จริง งานนี้อยู่ในข้อ 23

### 7. ตั้งค่า Environment Config

- ติดตั้ง `@nestjs/config`
- ตั้งค่าตัวแปรแวดล้อมสำหรับ database, Redis และ Spotify
- มี `.env.example` สำหรับใช้เป็นตัวอย่างร่วมกันในทีม
- ไม่มี secret หรือ token จริงอยู่ในเอกสารนี้

ตัวแปรที่เกี่ยวข้อง เช่น `DATABASE_URL`, `REDIS_HOST`, `REDIS_PORT`, `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET` และ `SPOTIFY_REDIRECT_URI` ควรเก็บไว้ใน environment ของแต่ละเครื่องเท่านั้น

### 8. จัดการ Error ระดับ Global

เพิ่ม **Global HTTP Exception Filter** เพื่อจัดรูปแบบ error response ของ API ให้เป็นมาตรฐานเดียวกัน

### 9. วางรากฐาน Spotify Users และ OAuth บางส่วน

เริ่มเตรียมส่วนที่เกี่ยวข้องกับ Spotify users และ OAuth แล้ว แต่ยังไม่ถือว่า OAuth flow เสร็จสมบูรณ์ จนกว่าจะทำ state validation, callback, token handling และการเชื่อม User ให้ครบ

## จุดที่หยุดล่าสุด

งานหยุดที่การเตรียม Spotify OAuth โดยขั้นถัดไปคือ **OAuth state** การทำ state ควรครอบคลุมการสร้างค่าที่คาดเดาไม่ได้ การผูก state กับผู้เริ่ม login การเก็บชั่วคราว และการตรวจสอบ state ใน callback ก่อนแลก authorization code

## งานถัดไป

1. ทำ OAuth state ให้ครบทั้งสร้าง จัดเก็บ ตรวจสอบ และหมดอายุ
2. ทำ Spotify login URL และ callback
3. แลก code เป็น token และเชื่อม token กับ User อย่างปลอดภัย
4. เพิ่ม tests สำหรับกรณี state ไม่ตรง state หมดอายุ และ callback ผิดพลาด

## Git และการส่งขึ้น Remote

สถานะงานล่าสุดอยู่บน branch `feat/backend-foundation-spotify-users` และ commit `e6a38d5`

การ push ไป GitHub ยังไม่สำเร็จ เพราะบัญชี `pongsakorn-jampasak` ยังไม่มีสิทธิ์เขียน repository และได้รับข้อผิดพลาด HTTP `403 permission` เมื่อได้รับสิทธิ์แล้วจึงค่อย push branch เดิมต่อได้ โดยไม่ต้องเริ่ม Git ใหม่
