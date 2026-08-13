# HeartQuest — คู่มือติดตั้ง Cloudflare ฉบับเต็ม

โปรเจกต์นี้เป็นเว็บ Full-stack ไม่ใช่เว็บ Static จึงไม่สามารถใช้เมนู **Upload static files** ได้ ต้อง Deploy ด้วย Wrangler ตามขั้นตอนด้านล่าง โดยใช้บัญชี Cloudflare ของคุณเอง

## สิ่งที่ระบบมี

- Love Quest Builder และเกมเก็บหัวใจ
- ลิงก์เกม/ลิงก์แก้ไข/สถิติ
- การ์ด IG Story และระบบแนะนำ
- D1 สำหรับเกม สถิติ ออเดอร์ และสถานะเงิน
- R2 สำหรับสลิปแบบส่วนตัว
- PromptPay โอนตรงพร้อมตรวจสลิปหลังบ้าน
- Stripe PromptPay พร้อม Webhook อนุมัติอัตโนมัติ
- หลังบ้านที่ `/admin/login`

## 1. เตรียมเครื่อง (ครั้งแรกครั้งเดียว)

ติดตั้ง Node.js 22.13 ขึ้นไป แตก ZIP แล้วเปิด Terminal ในโฟลเดอร์นี้:

```powershell
npm install
npx wrangler login
```

คำสั่งที่สองจะเปิด Cloudflare ให้ล็อกอินใน Browser

## 2. สร้างฐานข้อมูลและที่เก็บสลิป (ครั้งแรกครั้งเดียว)

```powershell
npx wrangler d1 create heartquest-db
npx wrangler r2 bucket create heartquest-slips
```

คำสั่งแรกจะแสดง `database_id` ให้นำค่าไปแทน `00000000-0000-4000-8000-000000000000` ใน `wrangler.jsonc`

จากนั้นสร้างตาราง:

```powershell
npx wrangler d1 migrations apply heartquest-db --remote
```

## 3. ตั้งความลับ (ครั้งแรก และเมื่อเปลี่ยนค่า)

```powershell
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put ADMIN_SESSION_SECRET
```

- `ADMIN_PASSWORD`: รหัสผ่านสำหรับ `/admin/login`
- `ADMIN_SESSION_SECRET`: ข้อความสุ่มยาวอย่างน้อย 32 ตัวอักษรและต้องไม่เหมือนรหัสผ่าน

เมื่อ Stripe พร้อม ให้เพิ่ม:

```powershell
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
```

ระบบจะถามค่าใน Terminal ให้พิมพ์หรือวางตรงนั้น ห้ามใส่ Secret ลงไฟล์หรือ ZIP

## 4. Deploy

```powershell
npm run deploy
```

Worker ชื่อ `love` จะได้ URL ประมาณ `https://love.just4u.workers.dev`

หากชื่อ `love` ถูกใช้แล้ว เปลี่ยน `name` ใน `wrangler.jsonc` แล้ว Deploy อีกครั้ง

## 5. ตั้ง Stripe Webhook

ใน Stripe Workbench สร้าง Webhook endpoint:

```text
https://love.just4u.workers.dev/api/stripe/webhook
```

เลือก Events:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`

นำ Signing secret ที่ขึ้นต้นด้วย `whsec_` ไปใส่ผ่าน `wrangler secret put STRIPE_WEBHOOK_SECRET`

## การแก้เว็บครั้งต่อไป

แก้ไฟล์ใน `app/` แล้วรัน:

```powershell
npm run deploy
```

URL, D1 และ R2 เดิมยังอยู่ ข้อมูลลูกค้าไม่หาย

ถ้าแก้ `db/schema.ts` ให้รันเพิ่มก่อน Deploy:

```powershell
npm run db:generate
npx wrangler d1 migrations apply heartquest-db --remote
```

## จุดสำคัญด้านความปลอดภัย

- อย่าแจก ZIP ที่มี `.env`, `.dev.vars` หรือ API keys
- อย่าเปิด R2 bucket เป็น Public
- สำรอง D1 ก่อนแก้ migration ใหญ่
- ใช้ Stripe test keys ก่อนเปลี่ยนเป็น live keys
