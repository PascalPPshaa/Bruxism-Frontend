📚 Complete API Documentation

Versi: 3.0.0
Tanggal: 2026-10-02
Base URL: http://localhost:3001/api/admin
Auth: Bearer Token (JWT)
Content-Type: application/json

---

📋 Endpoint Index

No: 1
Category: Auth
Endpoint: /login
Method: POST
Description: Login admin panel
────────────────────────────────────────
No: 2
Category: Dashboard
Endpoint: /stats/count
Method: GET
Description: Total pasien terdaftar
────────────────────────────────────────
No: 3
Category: Dashboard
Endpoint: /stats/recent
Method: GET
Description: 10 jawaban terbaru
────────────────────────────────────────
No: 4
Category: Patients
Endpoint: /patients
Method: GET
Description: List semua pasien
────────────────────────────────────────
No: 5
Category: Patients
Endpoint: /patients/:id
Method: GET
Description: Detail pasien spesifik
────────────────────────────────────────
No: 6
Category: Patients
Endpoint: /patients
Method: POST
Description: Buat pasien baru
────────────────────────────────────────
No: 7
Category: Patients
Endpoint: /patients/:id
Method: PUT
Description: Update pasien
────────────────────────────────────────
No: 8
Category: Patients
Endpoint: /patients/:id
Method: DELETE
Description: Hapus pasien
────────────────────────────────────────
No: 9
Category: Questions
Endpoint: /questions
Method: GET
Description: List semua pertanyaan
────────────────────────────────────────
No: 10
Category: Questions
Endpoint: /questions/:id
Method: GET
Description: Detail pertanyaan
────────────────────────────────────────
No: 11
Category: Questions
Endpoint: /questions
Method: POST
Description: Buat pertanyaan baru
────────────────────────────────────────
No: 12
Category: Questions
Endpoint: /questions/:id
Method: PUT
Description: Update pertanyaan
────────────────────────────────────────
No: 13
Category: Questions
Endpoint: /questions/:id
Method: DELETE
Description: Hapus pertanyaan
────────────────────────────────────────
No: 14
Category: Telegram Monitoring
Endpoint: /telegram/queue-stats
Method: GET
Description: Statistik antrian kirim
────────────────────────────────────────
No: 15
Category: Telegram Monitoring
Endpoint: /telegram/rate-limiter-stats
Method: GET
Description: Statistik rate limiter
────────────────────────────────────────
No: 16
Category: Telegram Monitoring
Endpoint: /telegram/test-broadcast
Method: POST
Description: Test kirim ke N user
────────────────────────────────────────
No: 17
Category: Incoming Queue
Endpoint: /telegram/callback-queue-stats
Method: GET
Description: Statistik antrian jawaban
────────────────────────────────────────
No: 18
Category: Incoming Queue
Endpoint: /telegram/callback-queue-clear
Method: POST
Description: Emergency clear antrian
────────────────────────────────────────
No: 19
Category: Settings
Endpoint: /settings
Method: GET
Description: Semua pengaturan
────────────────────────────────────────
No: 20
Category: Settings
Endpoint: /settings/scheduling-mode
Method: GET
Description: Cek mode scheduling
────────────────────────────────────────
No: 21
Category: Settings
Endpoint: /settings/scheduling-mode
Method: PUT
Description: Ganti mode scheduling
────────────────────────────────────────
No: 22
Category: Settings
Endpoint: /settings/automated-config
Method: GET
Description: Lihat config automated
────────────────────────────────────────
No: 23
Category: Settings
Endpoint: /settings/automated-config
Method: PUT
Description: Update config automated
────────────────────────────────────────
No: 24
Category: Settings
Endpoint: /settings/preview-schedule
Method: GET
Description: Preview jadwal hari ini
────────────────────────────────────────
No: 25
Category: Settings
Endpoint: /settings/generate-schedule
Method: POST
Description: Manual generate jadwal
────────────────────────────────────────
No: 26
Category: Bot Tokens
Endpoint: /telegram/tokens
Method: GET
Description: Dapatkan semua token bot
────────────────────────────────────────
No: 27
Category: Bot Tokens
Endpoint: /telegram/tokens
Method: POST
Description: Tambah token bot baru
────────────────────────────────────────
No: 28
Category: Bot Tokens
Endpoint: /telegram/tokens/:id
Method: PUT
Description: Update token bot
────────────────────────────────────────
No: 29
Category: Bot Tokens
Endpoint: /telegram/tokens/:id
Method: DELETE
Description: Hapus token bot
────────────────────────────────────────
No: 30
Category: Bot Tokens
Endpoint: /telegram/tokens/activate
Method: PUT
Description: Aktifkan token khusus
────────────────────────────────────────
No: 31
Category: Bot Tokens
Endpoint: /telegram/tokens/health
Method: GET
Description: Health check semua token
────────────────────────────────────────
No: 32
Category: Bot Tokens
Endpoint: /telegram/tokens/active/health
Method: GET
Description: Health check token aktif
────────────────────────────────────────
No: 33
Category: Bot Tokens
Endpoint: /telegram/tokens/:id/health
Method: GET
Description: Health check token spesifik
────────────────────────────────────────
No: 34
Category: Admin
Endpoint: /register
Method: POST
Description: Register admin baru

---

🔐 1. Authentication

Login

POST /api/admin/login
Request Body:
{
  "username": "admin",
  "password": "12345"
}
Response (200):
{
  "success": true,
  "message": "Login berhasil",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin"
  }
}

---

📊 2. Dashboard

Total Pasien

GET /api/admin/stats/count
Response (200):
{
  "success": true,
  "total_patients": 165
}

Recent Activity

GET /api/admin/stats/recent
Response (200):
{
  "success": true,
  "data": [
    {
      "id": 123,
      "telegram_id": "123456789",
      "name": "John Doe",
      "answer": "5",
      "question_id": 3,
      "createdAt": "2026-10-02T10:30:00.000Z"
    }
  ]
}

---

👥 3. Patients

List All Patients

GET /api/patients
Query Parameters:

┌────────────┬───────┬───────┬────────────┐
│   Param    │ Type  │ Defau │ Deskripsi  │
│            │       │  lt   │            │
├────────────┼───────┼───────┼────────────┤
│ isRegister │ boole │       │ Filter by  │
│ ed         │ an    │ -     │ registrati │
│            │       │       │ on status  │
├────────────┼───────┼───────┼────────────┤
│ page       │ numbe │ 1     │ Page       │
│            │ r     │       │ number     │
├────────────┼───────┼───────┼────────────┤
│ limit      │ numbe │ 50    │ Items per  │
│            │ r     │       │ page       │
└────────────┴───────┴───────┴────────────┘

Response (200):
{
  "success": true,
  "total": 165,
  "page": 1,
  "limit": 50,
  "data": [
    {
      "telegram_id": "8900533296",
      "name": "John Doe",
      "birth": "1990-01-15",
      "isRegistered": true,
      "current_question_id": null,
      "createdAt": "2026-10-02T10:30:00.000Z",
      "updatedAt": "2026-10-02T10:30:00.000Z"
    }
  ]
}

Get Patient Detail

GET /api/patients/:telegram_id
Response (200):
{
  "success": true,
  "data": {
    "telegram_id": "8900533296",
    "name": "John Doe",
    "birth": "1990-01-15",
    "isRegistered": true,
    "symptomLogs": [
      {
        "id": 123,
        "answer": "5",
        "question_id": 3,
        "createdAt": "2026-10-02T08:00:00.000Z"
      }
    ]
  }
}

Create Patient

POST /api/patients
Request Body:
{
  "telegram_id": "123456789",
  "name": "Jane Doe",
  "birth": "1985-05-20",
  "isRegistered": true
}
Response (201):
{
  "success": true,
  "message": "Patient created",
  "data": {
    "telegram_id": "123456789",
    "name": "Jane Doe"
  }
}

Update Patient

PUT /api/patients/:telegram_id
Request Body:
{
  "name": "Updated Name",
  "isRegistered": false
}
Response (200):
{
  "success": true,
  "message": "Patient updated",
  "data": {
    "telegram_id": "123456789",
    "name": "Updated Name"
  }
}

Delete Patient

DELETE /api/patients/:telegram_id
Response (200):
{
  "success": true,
  "message": "Patient deleted"
}

---

❓ 4. Questions

List All Questions

GET /api/question
Response (200):
{
  "success": true,
  "data": [
    {
      "id": 1,
      "question_text": "Seberapa sering anda merasakan gigitan gigi saat tidur?",
      "scheduled_time": "08:00:00",
      "is_active": true,
      "createdAt": "2026-10-01T10:00:00.000Z",
      "updatedAt": "2026-10-01T10:00:00.000Z"
    }
  ]
}

Get Question Detail

GET /api/question/:id
Response (200):
{
  "success": true,
  "data": {
    "id": 1,
    "question_text": "Seberapa sering anda merasakan gigitan gigi saat tidur?",
    "scheduled_time": "08:00:00",
    "is_active": true
  }
}

Create Question

POST /api/question
Request Body:
{
  "question_text": "Seberapa sering anda merasakan gigitan gigi?",
  "scheduled_time": "08:00:00",
  "is_active": true
}
Response (201):
{
  "success": true,
  "message": "Pertanyaan berhasil dibuat",
  "data": {
    "id": 2,
    "question_text": "Seberapa sering anda merasakan gigitan gigi?",
    "scheduled_time": "08:00:00",
    "is_active": true
  }
}

Update Question

PUT /api/question/:id
Request Body:
{
  "question_text": "Pertanyaan yang diupdate",
  "scheduled_time": "09:00:00",
  "is_active": false
}
Response (200):
{
  "success": true,
  "message": "Pertanyaan berhasil diupdate",
  "data": {
    "id": 2,
    "question_text": "Pertanyaan yang diupdate"
  }
}

Delete Question

DELETE /api/question/:id
Response (200):
{
  "success": true,
  "message": "Pertanyaan berhasil dihapus"
}

---

📤 5. Telegram Monitoring (Outgoing)

Queue Statistics

GET /api/admin/telegram/queue-stats
Response (200):
{
  "success": true,
  "data": {
    "enqueued": 1550,
    "processed": 1500,
    "failed": 2,
    "deduplicated": 3,
    "currentQueueSize": 48,
    "queueSizes": {
      "high": 0,
      "normal": 48,
      "low": 0,
      "total": 48
    },
    "rateLimiter": {
      "totalSent": 1500,
      "totalRetried": 12,
      "totalRateLimited": 3,
      "totalFailed": 2
    }
  }
}

Rate Limiter Statistics

GET /api/admin/telegram/rate-limiter-stats
Response (200):
{
  "success": true,
  "data": {
    "totalSent": 1500,
    "totalRetried": 12,
    "totalRateLimited": 3,
    "totalFailed": 2
  }
}

Test Broadcast

POST /api/admin/telegram/test-broadcast
Request Body:
{
  "count": 10,
  "message": "Test broadcast message"
}
Response (200):
{
  "success": true,
  "message": "Broadcast queued for 10 patients",
  "queued": 10,
  "deduplicated": 0,
  "totalPatients": 150
}

---

📥 6. Incoming Queue Monitoring

Callback Queue Statistics

GET /api/admin/telegram/callback-queue-stats
Response (200):
{
  "success": true,
  "data": {
    "received": 3300,
    "processed": 3250,
    "failed": 5,
    "queued": 45,
    "peakQueueSize": 120,
    "avgProcessingTime": 45,
    "currentQueueSize": 45,
    "isProcessing": true
  }
}

Emergency Clear Callback Queue

POST /api/admin/telegram/callback-queue-clear
Response (200):
{
  "success": true,
  "message": "Cleared 45 pending callbacks",
  "data": {
    "dropped": 45
  }
}

---

⚙️ 7. Settings & Scheduling

Get All Settings

GET /api/admin/settings
Response (200):
{
  "success": true,
  "data": [
    {
      "id": 1,
      "key": "scheduling_mode",
      "value": "manual",
      "description": "Scheduling mode: manual or automated"
    }
  ]
}

Get Scheduling Mode

GET /api/admin/settings/scheduling-mode
Response (200):
{
  "success": true,
  "data": {
    "mode": "manual"
  }
}

Set Scheduling Mode

PUT /api/admin/settings/scheduling-mode
Request Body:
{
  "mode": "automated"
}
Response (200):
{
  "success": true,
  "message": "Mode scheduling diubah ke 
{
  "success": true,
  "message": "Mode scheduling diubah ke automated",
  "data": {
    "mode": "automated"
  }
}

Get Automated Config

GET /api/admin/settings/automated-config
Response (200):
{
  "success": true,
  "data": {
    "questionsPerDay": 20,
    "startHour": 8,
    "endHour": 20,
    "timezone": "Asia/Jakarta",
    "minIntervalMinutes": 30,
    "maxQuestionsPerBatch": 3
  }
}

Set Automated Config

PUT /api/admin/settings/automated-config
Request Body:
{
  "questionsPerDay": 25,
  "startHour": 7,
  "endHour": 21,
  "minIntervalMinutes": 25
}
Response (200):
{
  "success": true,
  "message": "Konfigurasi automated scheduling diperbarui",
  "data": { "questionsPerDay": 25, "startHour": 7 }
}

Preview Schedule

GET /api/admin/settings/preview-schedule
Response (200):
{
  "success": true,
  "message": "Preview jadwal untuk 20 pertanyaan",
  "data": {
    "schedule": [
      {
        "question_id": 1,
        "scheduled_time": "08:00:00",
        "question_text": "Pertanyaan pertama..."
      },
      {
        "question_id": 2,
        "scheduled_time": "08:36:00",
        "question_text": "Pertanyaan kedua..."
      }
    ]
  }
}

Generate Schedule (Manual Trigger)

POST /api/admin/settings/generate-schedule
Response (200):
{
  "success": true,
  "message": "Berhasil menjadwalkan 20/20 pertanyaan",
  "schedule": [{...}, {...}],
  "results": [{...}, {...}]
}

---

🔐 8. Bot Token Management

Get All Tokens

GET /api/admin/telegram/tokens
Response (200):
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "name": "Main Bruxism Bot",
      "token": "732910:***:***:Ok",
      "is_active": true,
      "is_default": true,
      "created_at": "2026-10-01T10:00:00.000Z",
      "updated_at": "2026-10-01T10:00:00.000Z"
    }
  ]
}

Create Token

POST /api/admin/telegram/tokens
Request Body:
{
  "token": "123456789:AAHkGaLxl0EUyUIk_d11lw-MCo88uD4kGOk",
  "name": "Backup Bot",
  "is_active": false,
  "is_default": false
}
Response (201):
{
  "success": true,
  "message": "Token bot berhasil ditambahkan",
  "data": {
    "token": "732910:***:***:Ok",
    "bot_info": {
      "id": 123456789,
      "is_bot": true,
      "first_name": "Bruxism Bot",
      "username": "bruxism_main_bot"
    }
  }
}

Update Token

PUT /api/admin/telegram/tokens/:id
Request Body:
{
  "name": "Updated Bot Name",
  "is_active": true
}
Response (200):
{
  "success": true,
  "message": "Token bot berhasil diperbarui",
  "data": {
    "token": "732910:***:***:Ok",
    "bot_info": {...}
  }
}

Delete Token

DELETE /api/admin/telegram/tokens/:id
Response (200):
{
  "success": true,
  "message": "Token bot berhasil dihapus"
}

Activate Token

PUT /api/admin/telegram/tokens/activate
Request Body:
{
  "token": "123456789:AAHkGaLxl0EUyUIk_d11lw-MCo88uD4kGOk"
}
Response (200):
{
  "success": true,
  "message": "Token telah diaktifkan: 732910:***:***:Ok"
}

Get All Tokens Health

GET /api/admin/telegram/tokens/health
Response (200):
{
  "success": true,
  "summary": {
    "total": 2,
    "healthy": 1,
    "unhealthy": 1,
    "statuses": {
      "active": 1,
      "invalid_token": 1
    }
  },
  "data": [
    {
      "id": 1,
      "name": "Main Bot",
      "token_preview": "732910:***:***:Ok",
      "is_active": true,
      "is_default": true,
      "available": true,
      "status": "active",
      "error": null
    },
    {
      "id": 2,
      "name": "Backup Bot",
      "token_preview": "123456:***:***:Ok",
      "is_active": false,
      "is_default": false,
      "available": false,
      "status": "invalid_token",
      "error": "Token bot tidak valid (401 Unauthorized)"
    }
  ]
}

Get Active Token Health

GET /api/admin/telegram/tokens/active/health
Response (200):
{
  "success": true,
  "active_token": "732910:***:***:Ok",
  "data": {
    "available": true,
    "status": "active",
    "bot_info": {
      "id": 123456789,
      "first_name": "Bruxism Bot",
      "username": "bruxism_main_bot"
    },
    "diagnosis": "Token active dan siap digunakan",
    "recommended_action": "Tidak ada tindakan diperlukan",
    "webhook_info": {
      "url": "",
      "pending_update_count": 0,
      "last_error_message": null
    },
    "pending_updates": 0
  }
}

Get Specific Token Health

GET /api/admin/telegram/tokens/:id/health
Response (200):
{
  "success": true,
  "data": {
    "available": false,
    "status": "rate_limited",
    "bot_info": null,
    "diagnosis": "Bot sedang kena rate limit. Cek apakah bot sedang freeze.",
    "recommended_action": "Tunggu 5-10 menit. Turunkan frekuensi kirim pesan."
  }
}

Token Health Status Classification:

┌──────────────┬─────────────┬────────────┐
│    Status    │   Meaning   │ Recommende │
│              │             │  d Action  │
├──────────────┼─────────────┼────────────┤
│              │ Token       │ None       │
│ active       │ valid, bot  │ needed     │
│              │ running     │            │
├──────────────┼─────────────┼────────────┤
│ network_erro │ Server      │ Check netw │
│ r            │ can't reach │ ork/DNS    │
│              │  Telegram   │            │
├──────────────┼─────────────┼────────────┤
│ invalid_toke │ Token revok │ Regenerate │
│ n            │ ed/invalid  │  at        │
│              │             │ @BotFather │
├──────────────┼─────────────┼────────────┤
│              │ Bot banned  │ Delete     │
│ forbidden    │ or blocked  │ webhook,   │
│              │             │ restart    │
├──────────────┼─────────────┼────────────┤
│ rate_limited │ Temporarily │ Wait 5-10  │
│              │  frozen     │ minutes    │
├──────────────┼─────────────┼────────────┤
│              │ Telegram    │ Check      │
│ api_error    │ API         │ @BotFather │
│              │ maintenance │            │
├──────────────┼─────────────┼────────────┤
│ connection_e │ Connection  │ Check fire │
│ rror         │ issues      │ wall/proxy │
└──────────────┴─────────────┴────────────┘

---

🔐 9. Admin Management

Register New Admin

POST /api/admin/register
Request Body:
{
  "username": "operator1",
  "password": "password123"
}
Response (201):
{
  "success": true,
  "message": "Admin berhasil didaftarkan",
  "data": {
    "id": 2,
    "username": "operator1"
  }
}

---

🟢 10. WebSocket Events (Live Health)

Connection

ws://<host>:3001/socket.io/?EIO=4&transport=websocket

Client → Server Events:

┌───────────────────┬────────┬────────────┐
│       Event       │ Payloa │ Descriptio │
│                   │   d    │     n      │
├───────────────────┼────────┼────────────┤
│                   │        │ Subscribe  │
│ subscribe_health  │ -      │ to health  │
│                   │        │ updates    │
├───────────────────┼────────┼────────────┤
│                   │        │ Unsubscrib │
│ unsubscribe_healt │ -      │ e from     │
│ h                 │        │ health     │
│                   │        │ updates    │
└───────────────────┴────────┴────────────┘

Server → Client Events:

Event: bot_health_update
Payload: HealthPayload
Description: Live health + queue status (every
30s)
────────────────────────────────────────
Event: bot_health_error
Payload: { error: string }
Description: Error during health check

HealthPayload Structure:

{
  "timestamp": "2026-10-02T10:58:58.000Z",
  "active_token": "732910:***:***:Ok",
  "health": {
    "available": true,
    "status": "active",
    "bot_info": {...},
    "diagnosis": "...",
    "recommended_action": "..."
  },
  "all_tokens": [...],
  "queues": {
    "outgoing": {...},
    "incoming": {...}
  }
}

---

🛡️ 11. Global Responses

Success Response Format:

{
  "success": true,
  "message": "Operation completed",
  "data": {...},
  "count": 5
}

Error Response Format:

{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (dev only)"
}

HTTP Status Codes:

┌──────┬───────────────────────┐
│ Code │        Meaning        │
├──────┼───────────────────────┤
│ 200  │ Success               │
├──────┼───────────────────────┤
│ 201  │ Created               │
├──────┼───────────────────────┤
│ 400  │ Bad request           │
├──────┼───────────────────────┤
│ 401  │ Unauthorized          │
├──────┼───────────────────────┤
│ 403  │ Forbidden             │
├──────┼───────────────────────┤
│ 404  │ Not found             │
├──────┼───────────────────────┤
│ 409  │ Conflict              │
├──────┼───────────────────────┤
│ 429  │ Rate limited          │
├──────┼───────────────────────┤
│ 500  │ Internal server error │
└──────┴───────────────────────┘

---

🔐 Credentials

Admin Login:
  Username: admin
  Password: 12345

---

📌 Catatan: Semua endpoint kecuali /login memerlukan authentication via Bearer Token yang didapat dari login.