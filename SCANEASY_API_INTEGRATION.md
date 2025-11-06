# ScanEasy API Integration Guide

Questo documento descrive l'integrazione del frontend con le API reali di ScanEasy Backend.

## Panoramica delle Modifiche

Il frontend è stato completamente adattato per integrarsi con le API REST di ScanEasy. Tutte le chiamate sono state aggiornate per utilizzare gli endpoint corretti e i nuovi schemi dati.

---

## Configurazione

### 1. Variabili d'Ambiente

Crea un file `.env` nella root del progetto frontend:

```env
REACT_APP_API_URL=https://your-backend-api.com
```

Per sviluppo locale:
```env
REACT_APP_API_URL=http://localhost:8000
```

### 2. Installazione e Avvio

```bash
npm install
npm start
```

---

## Architettura e Flussi Principali

### Authentication Flow

#### 1. **Registrazione Utente**
```
Frontend → POST /api/users/
Body: { email, password, nome }
```

**Importante:**
- `tenant_id` NON viene passato dal frontend
- L'utente riceve una email di conferma
- NON può fare login fino alla conferma email

**Frontend Implementation:**
- File: `src/services/authService.js` → `register()`
- File: `src/pages/RegisterPage.jsx`
- Mostra messaggio: "Controlla email per confermare account"

#### 2. **Login**
```
Frontend → POST /api/auth/login
Body: { email, password }
Response: { access_token, token_type }

Poi automaticamente:
Frontend → GET /api/auth/me
Headers: { Authorization: Bearer <token> }
Response: { id, email, nome, tenant_id, role, ... }
```

**Frontend Implementation:**
- File: `src/services/authService.js` → `login()`
- Salva token in localStorage
- Salva user data in localStorage
- Redirect a homepage

#### 3. **Password Reset**
```
1. Request reset:
Frontend → POST /api/auth/password-reset-request
Body: { email, frontend_url }

2. User clicks email link → /password-reset?token=xxx

3. Reset password:
Frontend → POST /api/auth/password-reset
Body: { token, new_password, confirm_password }
```

**Frontend Implementation:**
- File: `src/pages/PasswordResetRequestPage.jsx`
- File: `src/pages/PasswordResetPage.jsx`

---

### Report Creation Flow

Il flusso di creazione report è stato completamente rivisto per adattarsi al modello multi-tenant:

```
1. User compila form con PIVA e Ragione Sociale (opzionale)
   ↓
2. Frontend chiama companyService.findOrCreate()
   ↓
   2a. Cerca company per PIVA: GET /api/companies/by-piva/{piva}
   ↓
   2b. Se non esiste, crea: POST /api/companies/
       Body: { piva, ragione_sociale }
   ↓
3. Frontend chiama reportService.createReport()
   ↓
   3a. Ottiene user_id da localStorage
   ↓
   3b. Crea report: POST /api/reports/
       Body: { user_id, company_id, status: "PROCESSING" }
   ↓
4. Backend automaticamente triggera n8n (NON gestito dal frontend)
   ↓
5. Frontend reindirizza a /report/{reportId} per monitoring
```

**Frontend Implementation:**
- File: `src/services/companyService.js` → `findOrCreate()`
- File: `src/services/reportService.js` → `createReport()`
- File: `src/components/reports/ReportRequestForm.jsx`

**Schema Form Richiesta:**
```javascript
{
  piva: "12345678901",           // Required, 11 digits
  ragione_sociale: "ACME S.r.l." // Optional
}
```

---

### Report Monitoring Flow (Polling)

```
1. Frontend apre /report/{reportId}
   ↓
2. useReportPolling hook inizia polling ogni 5 secondi
   ↓
   Chiama: GET /api/reports/{reportId}
   ↓
3. Controlla report.status (case-insensitive):
   - "PROCESSING" → continua polling (max 10 min)
   - "COMPLETED" + payload presente → mostra report
   - "FAILED" / "ERROR" → mostra errore
   ↓
4. Quando completato, visualizza report.payload
```

**Frontend Implementation:**
- File: `src/hooks/useReportPolling.js`
- File: `src/pages/ReportViewPage.jsx`

**Report Status Values:**
- `PROCESSING` - Report in elaborazione
- `COMPLETED` - Report completato con successo
- `FAILED` - Report fallito
- `ERROR` - Errore generico

---

## Schemi Dati

### User Schema

**API Response:**
```javascript
{
  id: "uuid4",
  email: "user@example.com",
  nome: "Mario Rossi",        // opzionale
  tenant_id: "uuid4",         // può essere null
  email_confirmed: false,     // true dopo conferma
  deleted: false,
  role: "client",             // "client" | "admin"
  created_at: "2024-01-01T00:00:00",
  updated_at: "2024-01-01T00:00:00",
  last_login: "2024-01-01T00:00:00"
}
```

**Frontend Usage:**
- Salvato in localStorage con chiave `finreport_user`
- Accesso via `authService.getUser()`
- Display: `user.nome || user.email`

### Company Schema

**API Response:**
```javascript
{
  id: "uuid4",
  piva: "12345678901",
  ragione_sociale: "ACME Corporation S.r.l.",  // opzionale
  created_at: "2024-01-01T00:00:00",
  updated_at: "2024-01-01T00:00:00"
}
```

### Report Schema

**API Response:**
```javascript
{
  id: "uuid4",
  user_id: "uuid4",
  company_id: "uuid4",
  status: "PROCESSING",       // "PROCESSING" | "COMPLETED" | "FAILED"
  payload: { ... },           // Report data JSON (null finché non completato)
  risk_score: 75,             // 0-100 (null finché non calcolato)
  risk_category: "MEDIUM",    // "LOW" | "MEDIUM" | "HIGH" (null inizialmente)
  error_message: null,        // Messaggio errore se status=FAILED
  created_at: "2024-01-01T00:00:00",
  completed_at: "2024-01-01T00:00:00"  // null finché in processing
}
```

---

## Services Layer

### authService.js

```javascript
// Registrazione (richiede conferma email)
await authService.register(email, password, nome);
// Returns: { user, requiresEmailConfirmation: true }

// Login (auto-fetch user data)
await authService.login(email, password);
// Returns: { access_token, token_type, user }

// Get current user
const user = authService.getUser();

// Check if authenticated
const isAuth = authService.isAuthenticated();

// Logout
authService.logout();

// Password reset request
await authService.requestPasswordReset(email, frontendUrl);

// Password reset with token
await authService.resetPassword(token, newPassword, confirmPassword);

// Change password (logged in)
await authService.changePassword(userId, currentPassword, newPassword, confirmPassword);
```

### companyService.js

```javascript
// Cerca company per PIVA
const company = await companyService.getByPiva("12345678901");
// Returns: Company object or null

// Crea nuova company
const company = await companyService.create({
  piva: "12345678901",
  ragione_sociale: "ACME S.r.l."
});

// Trova o crea (helper method)
const company = await companyService.findOrCreate({
  piva: "12345678901",
  ragione_sociale: "ACME S.r.l."
});

// Get company by ID
const company = await companyService.getById(companyId);

// Update company
await companyService.update(companyId, { ragione_sociale: "New Name" });

// Delete company (admin only)
await companyService.delete(companyId);
```

### reportService.js

```javascript
// Crea report (gestisce company creation internamente)
const report = await reportService.createReport({
  piva: "12345678901",
  ragione_sociale: "ACME S.r.l."
});
// Returns: Report object with status "PROCESSING"

// Ottieni report utente corrente
const { reports, total } = await reportService.getMyReports({
  skip: 0,
  limit: 100
});

// Ottieni singolo report
const report = await reportService.getReport(reportId);

// Ottieni report di una company
const reports = await reportService.getCompanyReports(companyId, {
  skip: 0,
  limit: 100
});

// Elimina report
await reportService.deleteReport(reportId);
```

---

## Componenti Chiave

### Authentication Components

- **LoginPage** (`src/pages/LoginPage.jsx`)
  - Login form
  - Link a password reset
  - Demo credentials display

- **RegisterPage** (`src/pages/RegisterPage.jsx`)
  - Registration form con campo `nome` opzionale
  - Mostra messaggio conferma email dopo registrazione
  - Password minimo 8 caratteri

- **PasswordResetRequestPage** (`src/pages/PasswordResetRequestPage.jsx`)
  - Form per richiedere reset password
  - Invia email con link

- **PasswordResetPage** (`src/pages/PasswordResetPage.jsx`)
  - Form per impostare nuova password
  - Gestisce token da query params

### Report Components

- **ReportRequestForm** (`src/components/reports/ReportRequestForm.jsx`)
  - Form semplificato: solo PIVA + Ragione Sociale
  - Gestisce creazione company + report

- **ReportViewPage** (`src/pages/ReportViewPage.jsx`)
  - Usa `useReportPolling` hook per monitoring
  - Mostra progress bar durante elaborazione
  - Display report quando completato

### Layout Components

- **Navbar** (`src/components/layout/Navbar.jsx`)
  - Mostra `user.nome || user.email`
  - Logout button

---

## Known Issues & TODO

### ⚠️ Issue #1: Company Data in Report List

**Problema:**
I report dall'API contengono solo `company_id`, non i dati della company (piva, ragione_sociale).

**File Interessati:**
- `src/components/reports/ReportCard.jsx` (line 8: `companyName`)
- `src/components/reports/ReportList.jsx` (line 17, 35: `report.companyName`)

**Soluzioni Possibili:**

**Opzione A: Backend popola dati company (RACCOMANDATO)**
```python
# Nel backend, quando si restituiscono i report, includere i dati della company
{
  "id": "...",
  "company": {
    "id": "...",
    "piva": "...",
    "ragione_sociale": "..."
  },
  ...
}
```

**Opzione B: Frontend fa chiamate multiple**
```javascript
// Nel componente ReportList
const reportsWithCompanies = await Promise.all(
  reports.map(async (report) => {
    const company = await companyService.getById(report.company_id);
    return { ...report, company };
  })
);
```

**Opzione C: Endpoint dedicato**
```
GET /api/reports/user/{user_id}?include=company
```

### ⚠️ Issue #2: Risk Score Display

I nuovi campi `risk_score` e `risk_category` sono stati aggiunti allo schema Report ma devono essere popolati dal backend/n8n quando il report viene completato.

**File Interessati:**
- `src/components/reports/ReportCard.jsx` (line 104-112: risk score display)

**Endpoint per aggiornamento:**
```
PUT /api/reports/{report_id}/risk-assessment?risk_score=75&risk_category=MEDIUM
```

---

## Testing & Development

### Test con Backend Locale

1. Avvia backend ScanEasy:
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

2. Configura `.env`:
```env
REACT_APP_API_URL=http://localhost:8000
```

3. Avvia frontend:
```bash
npm start
```

### Test Flow Completo

1. **Registrazione:**
   - Vai a `/register`
   - Compila form (email, password, nome opzionale)
   - Verifica messaggio "Controlla email"
   - Conferma email tramite link (gestito da backend)

2. **Login:**
   - Vai a `/login`
   - Inserisci credenziali
   - Verifica redirect a homepage

3. **Creazione Report:**
   - Compila form con PIVA
   - Verifica redirect a `/report/{id}`
   - Verifica polling status

4. **Password Reset:**
   - Vai a `/password-reset-request`
   - Inserisci email
   - Clicca link nell'email
   - Imposta nuova password

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/password-reset-request` - Request password reset
- `POST /api/auth/password-reset` - Reset password with token
- `POST /api/auth/change-password` - Change password (authenticated)

### Users
- `POST /api/users/` - Create new user
- `GET /api/users/confirm-email?token=xxx` - Confirm email
- `GET /api/users/` - List users (admin only)
- `GET /api/users/{user_id}` - Get user by ID
- `PUT /api/users/{user_id}` - Update user
- `DELETE /api/users/{user_id}` - Delete user (admin only)

### Companies
- `POST /api/companies/` - Create company
- `GET /api/companies/` - List companies (admin only)
- `GET /api/companies/{company_id}` - Get company by ID
- `GET /api/companies/by-piva/{piva}` - Get company by PIVA
- `PUT /api/companies/{company_id}` - Update company
- `DELETE /api/companies/{company_id}` - Delete company (admin only)

### Reports
- `POST /api/reports/` - Create report
- `GET /api/reports/` - List all reports (admin only)
- `GET /api/reports/{report_id}` - Get report by ID
- `GET /api/reports/user/{user_id}` - Get user's reports
- `GET /api/reports/company/{company_id}` - Get company's reports
- `PUT /api/reports/{report_id}` - Update report
- `PUT /api/reports/{report_id}/status` - Update report status
- `PUT /api/reports/{report_id}/risk-assessment` - Update risk assessment
- `DELETE /api/reports/{report_id}` - Delete report

---

## Security Considerations

### JWT Token Management
- Token salvato in localStorage con chiave `finreport_token`
- Auto-refresh non implementato (TODO)
- Token expiry controllato client-side
- Logout cancella token e user data

### API Authorization
- Tutti gli endpoint protetti richiedono header:
  ```
  Authorization: Bearer <access_token>
  ```
- Gestito automaticamente da `authService.getAuthHeader()`

### Password Requirements
- Minimo 8 caratteri (come da API)
- Conferma password richiesta
- Reset password con token time-limited

---

## Next Steps

1. **Implementare gestione company data nei report list** (vedi Issue #1)
2. **Testare flusso completo con backend reale**
3. **Aggiungere error boundaries per gestione errori robusta**
4. **Implementare auto-refresh JWT token**
5. **Aggiungere tests E2E**
6. **Implementare export PDF report**
7. **Aggiungere filtri avanzati report list**

---

## Changelog

### v2.0.0 - ScanEasy API Integration (2024-11-06)

**Breaking Changes:**
- Rimosso backend Node.js custom
- Integrato con ScanEasy FastAPI backend
- Cambiati tutti gli endpoint API
- Modificati schemi dati (User, Company, Report)

**Nuove Feature:**
- Email confirmation flow
- Password reset flow
- Multi-tenant architecture support
- Risk assessment display
- Company management via API

**Aggiornamenti:**
- `authService.js` - Adattato per ScanEasy API
- `reportService.js` - Adattato per ScanEasy API
- `companyService.js` - Nuovo service per gestione companies
- `RegisterPage.jsx` - Email confirmation message
- `ReportRequestForm.jsx` - Form semplificato (solo PIVA + ragione sociale)
- `useReportPolling.js` - Case-insensitive status check
- Password reset pages aggiunte

---

## Support

Per problemi o domande sull'integrazione API:
- Consulta la documentazione OpenAPI del backend
- Verifica logs del browser console
- Verifica network tab per chiamate API fallite
- Controlla che REACT_APP_API_URL sia configurato correttamente

