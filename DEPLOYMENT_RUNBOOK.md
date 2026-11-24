# AURIS 2.0 Enterprise Voice AI Platform — Production Launch Runbook

This guide covers everything required to deploy **AURIS 2.0** as a commercial, multi-tenant voice AI platform accessible to the public.

---

## 1. Quick Launch Architecture

```
[Public Internet / Phones]
         │
         ▼
[Cloudflare / Nginx (SSL/TLS)]
         │ (HTTP & WebSocket Upgrade)
         ▼
[Auris 2.0 Node/Bun Engine :3000]
    ├── Multi-Tenant Auth & Sovereign Workspaces
    ├── 20-Second Pulse Slot Billing Engine (₹1.60/slot = ₹4.80/min)
    ├── Plivo Inbound/Outbound Telephony Webhooks
    ├── Sarvam Indic STT (Telugu, Hindi, Indian English)
    ├── Gemini 3.8 Flash Conversational LLM
    └── Cartesia Sonic / Sarvam Bulbul Indic Neural TTS
```

---

## 2. Environment Variables Checklist (`.env`)

Ensure the following variables are configured in your production `.env` file:

```env
NODE_ENV=production
PORT=3000

# Base Public URL (Required for Plivo Webhook Callbacks & Media Streams)
AURIS_PUBLIC_URL=https://your-domain.com

# Telephony Carrier (Plivo India)
PLIVO_AUTH_ID=MAMOCKAUTHID123...
PLIVO_AUTH_TOKEN=mocktokenabc123...
PLIVO_CALLER_ID=+918065534512

# Conversational Brain
GEMINI_API_KEY=AIzaSy...

# Speech Recognition & Synthesis
SARVAM_API_KEY=your_sarvam_key_here
CARTESIA_API_KEY=your_cartesia_key_here

# Persistent Storage & Auth
AURIS_SESSION_SECRET=super_secret_cryptographic_key_here
```

---

## 3. Deployment Options

### Option A: Docker Compose (Recommended)

1. Clone repository and switch to `feat/auris-platform-v2`:
   ```bash
   git clone https://github.com/venkat-karthik/AURIS-VERSION-2.0.git
   cd AURIS-VERSION-2.0
   git checkout feat/auris-platform-v2
   ```

2. Start the container in detached mode:
   ```bash
   docker compose up -d --build
   ```

3. Verify platform health:
   ```bash
   curl -f http://localhost:3000/api/health
   # Returns: {"status":"healthy","uptimeSeconds":...,"database":{"status":"connected",...}}
   ```

---

### Option B: Bare-Metal / VPS (Ubuntu + Bun + Systemd)

1. Install dependencies & build:
   ```bash
   bun install
   bun run build
   ```

2. Setup Systemd Service (`/etc/systemd/system/auris.service`):
   ```ini
   [Unit]
   Description=Auris 2.0 Voice Platform
   After=network.target

   [Service]
   Type=simple
   User=ubuntu
   WorkingDirectory=/home/ubuntu/AURIS-VERSION-2.0
   ExecStart=/usr/local/bin/bun dist/server.cjs
   Restart=always
   RestartSec=5
   Environment=NODE_ENV=production
   EnvironmentFile=/home/ubuntu/AURIS-VERSION-2.0/.env

   [Install]
   WantedBy=multi-user.target
   ```

3. Enable and start:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now auris
   ```

---

## 4. Nginx Reverse Proxy with WebSocket Support

WebSocket support is mandatory for Plivo `<Stream>` audio and in-browser mic calls.

```nginx
server {
    server_name voice.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket timeout extension
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

    listen 443 ssl http2;
    # SSL certificates managed via Certbot / Let's Encrypt
}
```

---

## 5. Plivo Inbound Trunk Configuration

To route incoming phone calls from your Plivo number to Auris:

1. Log into **[Plivo Console](https://console.plivo.com)**.
2. Navigate to **Voice > Numbers > Active Numbers**.
3. Click your number (e.g. `+91 80 6553 4512`).
4. Under **Routing**:
   - **Answer URL:** `https://your-domain.com/api/telephony/plivo/answer`
   - **Answer Method:** `POST`
   - **Hangup URL:** `https://your-domain.com/api/telephony/plivo/hangup`
   - **Hangup Method:** `POST`
5. Click **Save**.

Any customer dialing your number will be answered by Auris within ~280ms in the tenant's chosen dialect!

---

## 6. End-to-End Test Suite Verification

Run all test suites before public release:
```bash
bun test
# 115 tests passing across 13 test suites (100% Pass)
```

