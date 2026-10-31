# AudioVibe Backend Progress

เอกสารนี้ใช้ติดตามความคืบหน้า Backend ของ AudioVibe โดยอ้างอิงจากโค้ดใน repository และการตรวจสอบที่ทำจริงล่าสุด

## สถานะล่าสุด

- **Branch:** `feat/backend-foundation-spotify-users`
- **Commit ล่าสุด:** `2e440dd` — `แก้ไข OAuth และส่งออกเพลย์ลิสต์ Spotify`
- **GitHub:** Push branch สำเร็จแล้ว และยังไม่ได้ merge เข้า `main`
- **Backend:** อยู่ที่ `apps/core-api`
- **UI ตรวจสอบงาน:** `http://localhost:3000/ui/`
- **ข้อควรระวัง:** เอกสารนี้ไม่เก็บ secret, access token หรือ refresh token

## Progress Tracker 28 ข้อ

| # | สถานะ | หัวข้อ | สถานะตามโค้ดปัจจุบัน |
|---:|:---:|---|---|
| 1 | ✅ | เลือก Backend Core | ใช้ NestJS และ TypeScript |
| 2 | ✅ | สร้างโครงสร้างโปรเจกต์ | มี `apps/core-api` และโครงสร้างพื้นฐานของ NestJS |
| 3 | ✅ | ตั้งค่า PostgreSQL | ใช้ PostgreSQL 15 ผ่าน Docker ที่ port `5432` |
| 4 | ✅ | ออกแบบ Prisma Schema | มี User, PromptLog, Playlist, Track, AudioFeature และ PlaylistTrack |
| 5 | ✅ | เชื่อมต่อ Prisma | มี PrismaService, adapter และ schema พร้อมใช้งาน |
| 6 | ✅ | ตั้งค่า Redis | ใช้ Redis 7 ผ่าน Docker ที่ port `6379` |
| 7 | ✅ | ตั้งค่า Environment Config | มี environment ที่จำเป็นและ `.env.example` |
| 8 | ✅ | จัดการ Error ระดับ Global | มี Global HTTP Exception Filter |
| 9 | ✅ | Spotify Users และ OAuth พื้นฐาน | Login, callback, profile และการผูก Spotify user กับ internal user ทำงานแล้ว |
| 10 | ✅ | OAuth state | สร้าง state แบบสุ่ม เก็บใน Redis 10 นาที และตรวจสอบแบบใช้ครั้งเดียวตอน callback |
| 11 | ✅ | Spotify Login URL | มี `GET /auth/spotify/login` และขอ scopes สำหรับ profile/email/playlist |
| 12 | ✅ | Spotify OAuth Callback | มี `GET /auth/spotify/callback`, แลก authorization code และสร้าง/อัปเดต user |
| 13 | 🟡 | Token Encryption และ Storage | เก็บ token ใน PostgreSQL และ Redis พร้อม TTL แต่ยังไม่ได้เข้ารหัส token at rest |
| 14 | ✅ | User Upsert จาก Spotify | มี `UsersService.findOrCreateUser()` และบันทึก Spotify profile |
| 15 | ⬜ | Auth Guard และ Current User | ยังใช้ `userId` จาก request โดยตรง ยังไม่มี guard/session middleware |
| 16 | ✅ | Refresh Token Flow | มีการ refresh access token เมื่อหมดอายุและอัปเดต cache/database |
| 17 | 🟡 | Logout และ Token Revocation | มี local logout สำหรับล้าง access-token cache แล้ว; ยังไม่มี Spotify revoke และ token state ถาวร |
| 18 | ✅ | Prompt Log Service | มี `POST /prompt-logs` และ `GET /prompt-logs?userId=...` พร้อมตรวจ user และ DTO validation |
| 19 | ✅ | Playlist Service | สร้าง อ่าน แก้ไข ลบ และตรวจ ownership ของ playlist แล้ว |
| 20 | ✅ | Track Service | มีการ upsert เพลงและแปลงเป็น TrackDTO แล้ว |
| 21 | 🟡 | Audio Feature Service | มี endpoint, persistence และ Redis cache แล้ว แต่การเรียก Spotify Audio Features ยังพบ `403` ใน environment ปัจจุบัน |
| 22 | ✅ | Playlist Track Management | เพิ่ม ลบ และจัดลำดับเพลงใน playlist ได้ |
| 23 | ✅ | Redis Cache Logic | ใช้ cache จริงสำหรับ token 55 นาที, search 24 ชั่วโมง, audio features 7 วัน และ OAuth state 10 นาที |
| 24 | 🟡 | Search และ Recommendation Flow | Spotify Search ทำงานแล้ว; Recommendation/ML ยังไม่ได้ทำ |
| 25 | 🟡 | Validation และ API Contract | มี DTO validation, global `ValidationPipe` และ API contract บางส่วน แต่ contract ยังไม่ครอบคลุมทุก endpoint |
| 26 | 🟡 | Security และ Rate Limiting | มี OAuth state และ Redis rate limit 120 requests/route/IP/minute แล้ว; ยังไม่มี Auth Guard และ token encryption |
| 27 | 🟡 | Automated Tests | มี targeted unit test สำหรับ search cache; ยังไม่มี integration, E2E และ coverage ครบชุด |
| 28 | 🟡 | Documentation และ Deployment Readiness | มี setup guide, progress document และ `GET /health`; ยังขาด API docs และ deployment configuration |

## สิ่งที่ทำเสร็จและตรวจสอบแล้ว

### Spotify OAuth และ User

- มี `GET /auth/spotify/login`
- มี `GET /auth/spotify/callback`
- ขอ Spotify scopes สำหรับ profile, email และการแก้ไข public/private playlist
- สร้างหรืออัปเดต User จาก Spotify profile
- เก็บ access token และ refresh token ใน database ตามโครงสร้างปัจจุบัน
- Cache access token ใน Redis ด้วย key `user:token:{userId}` และ TTL 55 นาที
- มี refresh flow เมื่อ access token หมดอายุ
- มี `GET /users/:id` สำหรับส่งข้อมูล profile ที่ปลอดภัยต่อ UI โดยไม่ส่ง token
- มี OAuth state แบบสุ่ม เก็บใน Redis 10 นาที และล้างหลังใช้งาน
- มี `POST /auth/spotify/logout?userId=...` สำหรับล้าง access-token cache ภายในระบบ

### Spotify Search

Flow ปัจจุบัน:

```text
Controller
  -> PlaylistService
  -> SpotifyAdapter
  -> SpotifyApiClient
  -> Spotify Search API
```

- Endpoint: `GET /playlists/search?userId={internalUserId}&query={query}&limit={1-50}`
- ค้นหาเฉพาะประเภท `track`
- จำกัดผลลัพธ์สูงสุด 50 เพลง
- ใช้ Redis key รูปแบบ `search:{query_hash}`
- Search cache มี TTL 24 ชั่วโมง
- Cache hit จะคืนข้อมูลจาก Redis โดยไม่เรียก Spotify
- Cache miss จะเรียก Spotify แล้วบันทึกผลลัพธ์ลง Redis
- ทดสอบ unit test ของ cache hit/cache miss แล้ว
- รองรับ `offset` สำหรับค้นหาหน้าถัดไป และรวม `offset` ใน cache key

### Backend Infrastructure

- มี `GET /health` ตรวจ PostgreSQL และ Redis พร้อมตอบสถานะ `503` เมื่อระบบใดระบบหนึ่งไม่พร้อม
- มี Redis rate limit ระดับ global ที่ 120 requests ต่อ route/IP ต่อ 1 นาที
- มี error mapping สำหรับ Spotify `401`, `403` และ `429` โดยไม่เปิดเผย response body หรือ token
- มี Prompt Log API พร้อมตรวจสอบ user ownership และ validation ของค่า audio-feature targets

### Playlist และ Export

- มี Playlist CRUD พร้อมตรวจว่า playlist เป็นของ user ที่ร้องขอ
- เพิ่ม ลบ และจัดลำดับเพลงใน playlist ได้
- Export ไป Spotify ผ่าน `POST /playlists/export`
- ใช้ Spotify endpoint ปัจจุบัน `POST /me/playlists`
- เพิ่ม track เข้า Spotify playlist ได้
- ทดสอบ Export จริงสำเร็จแล้ว และบันทึกสถานะ `isExported` กับ `exportedAt`

### UI สำหรับตรวจสอบงาน

หน้า `http://localhost:3000/ui/` สามารถ:

- แสดงชื่อและรูป Spotify user
- สร้างและเลือก playlist
- ค้นหาเพลงจาก Spotify
- เพิ่มเพลงเข้า playlist
- Preview เพลงเมื่อ Spotify มี `previewUrl`
- จัดลำดับและลบเพลง
- เปลี่ยนชื่อและลบ playlist
- Export playlist เข้า Spotify จริง

## ข้อจำกัดและสิ่งที่ยังไม่เสร็จ

- OAuth state validation มีแล้ว แต่ยังไม่ควรถือว่าเป็น production-ready authentication จนกว่าจะมี Auth Guard/session และการป้องกัน CSRF ครบถ้วน
- ยังไม่มี Auth Guard หรือการอ่าน current user จาก session/JWT
- Token ใน database/Redis ยังไม่ได้เข้ารหัส at rest
- Local logout มีแล้ว แต่ยังไม่มี Spotify token revocation และสถานะ revoked ถาวรใน database
- Recommendation, ML และการสร้าง playlist จาก mood/prompt ยังไม่ได้ทำ
- Audio Features มีโค้ดรองรับแล้ว แต่ Spotify API ตอบ `403` ใน environment ที่ทดสอบล่าสุด จึงยังต้องตรวจสิทธิ์/ข้อจำกัดของ Spotify app ต่อ
- มี rate limiting เบื้องต้นแล้ว แต่ยังไม่มี Auth Guard และ API security layer ครบถ้วน
- API contract ยังมีรายการตัวอย่างของ Generate/Refine แต่ endpoint เหล่านั้นยังไม่ได้ implement ครบ
- Automated test ยังไม่ครบ integration/E2E/coverage
- ยังไม่มี health check และ deployment configuration สำหรับ production

## ผลการตรวจสอบล่าสุด

- `npm run build`: **PASS**
- Search endpoint: **PASS**
- Search cache unit test: **PASS**
- Targeted PlaylistService tests: **PASS (2/2)**
- Export ไป Spotify จริง: **PASS**
- Health check, OAuth state, rate limiting และ Prompt Log: **เพิ่มในโค้ดแล้ว แต่ยังไม่ได้ runtime test ครบทุกเส้นทาง**
- Audio Features endpoint: **ยังติด Spotify API `403` ใน environment ที่ทดสอบ**

## Git และการส่งขึ้น Remote

- Branch ที่ใช้งาน: `feat/backend-foundation-spotify-users`
- Commit ล่าสุด: `2e440dd`
- Push ไปยัง remote สำเร็จแล้ว
- `main` ไม่ได้ถูกแก้ไขใน commit ล่าสุด
- ห้าม commit secret, access token หรือ refresh token ลง repository

## ลำดับงานถัดไปที่แนะนำ

1. เพิ่ม Auth Guard และ current-user flow
2. ขอ/กำหนด `TOKEN_ENCRYPTION_KEY` แล้วเข้ารหัส token ใน storage
3. เพิ่ม Spotify token revocation หรือสถานะ revoked ถาวร
4. แก้/ตรวจสิทธิ์ Spotify Audio Features `403`
5. เพิ่ม integration/E2E tests และ deployment configuration

งาน Recommendation, ML และความสามารถนอกเหนือจากรายการข้างต้นยังไม่ควรถูกนับว่าเสร็จ และยังไม่ได้เริ่มในเอกสารนี้
