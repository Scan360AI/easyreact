# FinReport Backend API - Professional MVP

Backend API per la piattaforma FinReport Dashboard multi-tenant.

## 🚀 Quick Start

### Prerequisiti

- Node.js 18+
- PostgreSQL 14+
- npm o yarn

### 1. Installazione Dipendenze

```bash
cd backend
npm install
```

### 2. Configurazione Database

Crea un database PostgreSQL:

```bash
# Accedi a PostgreSQL
psql -U postgres

# Crea database
CREATE DATABASE finreport_db;

# Esci
\q
```

Esegui le migrations per creare le tabelle:

```bash
psql -U postgres -d finreport_db -f migrations/001_initial_schema.sql
```

Oppure:

```bash
# Import manualmente
\i migrations/001_initial_schema.sql
```

### 3. Configurazione Ambiente

Copia `.env.example` in `.env`:

```bash
cp .env.example .env
```

Modifica `.env` con le tue configurazioni:

```env
PORT=3001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finreport_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=change_this_to_a_random_secret_key
JWT_EXPIRES_IN=7d

# n8n
N8N_WEBHOOK_URL=https://n8n.tuodominio.com/webhook/create-report
N8N_CALLBACK_SECRET=your_callback_secret

# CORS
FRONTEND_URL=http://localhost:3000
```

### 4. Avvio Server

```bash
npm start
```

O in development mode con auto-reload:

```bash
npm run dev
```

Il server sarà disponibile su: `http://localhost:3001`

---

## 📋 API Endpoints

### **Authentication**

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "Mario Rossi"
}
```

Response:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Mario Rossi"
  },
  "token": "jwt_token_here"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "demo@finreport.com",
  "password": "demo123"
}
```

Response:
```json
{
  "message": "Login successful",
  "user": { ... },
  "token": "jwt_token_here"
}
```

### **Companies**

Tutti gli endpoint richiedono autenticazione: `Authorization: Bearer {token}`

#### Get Companies
```http
GET /api/companies?piva=03748590928&search=KITZANOS
Authorization: Bearer {token}
```

#### Create Company
```http
POST /api/companies
Authorization: Bearer {token}
Content-Type: application/json

{
  "piva": "03748590928",
  "name": "KITZANOS SOC COOP",
  "email": "info@kitzanos.it",
  "phone": "+39 333 1234567"
}
```

#### Autocomplete
```http
GET /api/companies/autocomplete?q=KITZ
Authorization: Bearer {token}
```

### **Reports**

#### Create Report
```http
POST /api/reports
Authorization: Bearer {token}
Content-Type: application/json

{
  "piva": "03748590928",
  "companyName": "KITZANOS SOC COOP",
  "email": "info@kitzanos.it",
  "phone": "+39 333 1234567"
}
```

Response:
```json
{
  "message": "Report created successfully",
  "reportId": "rep-1730718000000",
  "status": "processing",
  "createdAt": "2024-11-04T10:00:00.000Z"
}
```

#### Get My Reports
```http
GET /api/my/reports?status=completed&search=KITZANOS&limit=50&offset=0
Authorization: Bearer {token}
```

Query params:
- `status`: `processing` | `completed` | `failed`
- `search`: Cerca in nome azienda o P.IVA
- `from`: Data inizio (ISO format)
- `to`: Data fine (ISO format)
- `limit`: Numero risultati (default: 50, max: 100)
- `offset`: Offset per paginazione (default: 0)

#### Get Report Detail
```http
GET /api/reports/rep-1730718000000
Authorization: Bearer {token}
```

#### Complete Report (n8n callback)
```http
POST /api/reports/rep-1730718000000/complete?secret=your_callback_secret
Content-Type: application/json

{
  "status": "completed",
  "payload": {
    "company": { ... },
    "metrics": [ ... ],
    "charts": { ... }
  }
}
```

O per report fallito:
```json
{
  "status": "failed",
  "error": "Dati azienda non trovati"
}
```

### **Statistics**

#### Get Dashboard Stats
```http
GET /api/my/stats
Authorization: Bearer {token}
```

Response:
```json
{
  "summary": {
    "totalReports": 127,
    "reportsThisMonth": 23,
    "completedThisMonth": 20,
    "failedLastWeek": 1,
    "processingNow": 3,
    "avgCompletionTime": 180
  },
  "byStatus": {
    "processing": 3,
    "completed": 120,
    "failed": 4
  },
  "topCompanies": [ ... ],
  "recentActivity": [ ... ]
}
```

---

## 🗄️ Database Schema

### Users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Companies
```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY,
  piva VARCHAR(11) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Reports
```sql
CREATE TABLE reports (
  id VARCHAR(50) PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  user_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'processing',
  payload JSONB,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔐 Security

### Password Hashing
Le password sono hashate con bcrypt (10 rounds).

### JWT Tokens
I token JWT scadono dopo 7 giorni (configurabile in `.env`).

### Rate Limiting
- Endpoints generali: 100 req/15 min per IP
- Endpoints auth: 5 req/15 min per IP

### CORS
Configurato per accettare richieste solo dal frontend (`FRONTEND_URL` in `.env`).

---

## 🧪 Testing

### Test manuale con curl

Login:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@finreport.com","password":"demo123"}'
```

Create Report:
```bash
curl -X POST http://localhost:3001/api/reports \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "piva":"03748590928",
    "companyName":"KITZANOS SOC COOP",
    "email":"info@kitzanos.it"
  }'
```

Get Reports:
```bash
curl http://localhost:3001/api/my/reports \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔄 Integrazione n8n

### Setup Webhook n8n

1. Crea workflow n8n con webhook trigger
2. URL webhook: configurato in `.env` come `N8N_WEBHOOK_URL`
3. n8n riceve POST con:
   ```json
   {
     "reportId": "rep-1730718000000",
     "piva": "03748590928",
     "companyName": "KITZANOS SOC COOP",
     "email": "info@kitzanos.it",
     "callbackUrl": "http://localhost:3001/api/reports/rep-1730718000000/complete"
   }
   ```

4. n8n elabora il report

5. n8n chiama callback URL:
   ```bash
   POST http://localhost:3001/api/reports/rep-1730718000000/complete?secret=YOUR_SECRET
   {
     "status": "completed",
     "payload": { ... }
   }
   ```

---

## 📝 Demo User

Un utente demo è già creato nel database:

- **Email**: `demo@finreport.com`
- **Password**: `demo123`

Due aziende di esempio sono già presenti:
- KITZANOS SOCIETA COOPERATIVA (03748590928)
- ACME Corporation S.r.l. (12345678901)

---

## 🐛 Troubleshooting

### Database connection failed
Verifica che PostgreSQL sia in esecuzione e che le credenziali in `.env` siano corrette.

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -U postgres -d finreport_db -c "SELECT 1"
```

### Port already in use
Cambia `PORT` in `.env` o termina il processo sulla porta 3001:

```bash
# Find process
lsof -i :3001

# Kill process
kill -9 PID
```

### JWT token invalid
Verifica che `JWT_SECRET` sia lo stesso tra riavvii del server.

---

## 📦 Production Deployment

### Variabili Ambiente Produzione

```env
NODE_ENV=production
PORT=3001
DB_HOST=your-production-db-host
JWT_SECRET=generate_strong_random_secret_here
N8N_WEBHOOK_URL=https://n8n.yourdomain.com/webhook/create-report
FRONTEND_URL=https://yourfrontend.com
```

### Raccomandazioni

1. **HTTPS**: Usa HTTPS in produzione (Nginx/Caddy reverse proxy)
2. **Database**: Usa connection pooling e backup automatici
3. **Logging**: Aggiungi Winston o Pino per logging strutturato
4. **Monitoring**: Usa PM2 per process management
5. **Secrets**: Non committare `.env` - usa secret manager

---

## 📄 License

ISC

---

**Made with ❤️ for FinReport Dashboard**
