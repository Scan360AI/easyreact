# 🔗 Frontend-Backend Integration Guide

Guida completa per integrare e testare il frontend React con il backend API.

---

## ✅ **Implementazione Completata**

### **Backend API**
✅ Node.js + Express + PostgreSQL
✅ Autenticazione JWT
✅ Multi-user con isolamento dati
✅ API complete (auth, companies, reports, stats)
✅ Integrazione n8n webhook

### **Frontend React**
✅ Login e Register pages
✅ Protected routes con autenticazione
✅ Service layer aggiornato per API
✅ Hooks aggiornati per nuove API
✅ Navbar con user info e logout
✅ Gestione token JWT in localStorage

---

## 🚀 **Setup Completo**

### **1. Setup Backend**

```bash
cd backend

# Installa dipendenze
npm install

# Crea database PostgreSQL
createdb finreport_db

# Esegui migrations
psql -U postgres -d finreport_db -f migrations/001_initial_schema.sql

# Configura environment
cp .env.example .env
# Modifica .env con le tue credenziali PostgreSQL

# Avvia backend
npm start
```

Backend disponibile su: `http://localhost:3001`

### **2. Setup Frontend**

```bash
cd ..  # Torna alla root del progetto

# Installa dipendenze (se non già fatto)
npm install

# Configura environment
cp .env.example .env
# Il file .env conterrà:
# REACT_APP_API_URL=http://localhost:3001

# Avvia frontend
npm start
```

Frontend disponibile su: `http://localhost:3000`

---

## 🧪 **Testing End-to-End**

### **Scenario 1: Primo Utilizzo (Registrazione)**

1. **Apri** `http://localhost:3000`
2. **Vieni reindirizzato** a `/login` (non sei autenticato)
3. **Click** su "Registrati"
4. **Compila** il form:
   - Nome: Mario Rossi
   - Email: mario@example.com
   - Password: password123
   - Conferma: password123
5. **Click** "Registrati"
6. **Successo**: Vieni autenticato e reindirizzato alla home

### **Scenario 2: Login con Account Demo**

1. **Apri** `http://localhost:3000/login`
2. **Usa credenziali demo**:
   - Email: `demo@finreport.com`
   - Password: `demo123`
3. **Click** "Accedi"
4. **Successo**: Vieni autenticato e reindirizzato alla home

### **Scenario 3: Richiedi Nuovo Report**

1. **Login** (vedi Scenario 2)
2. **Nella home page**, compila il form:
   - P.IVA: 03748590928
   - Ragione Sociale: KITZANOS SOC COOP
   - Email: info@kitzanos.it
   - Telefono: (opzionale)
3. **Click** "Richiedi Report"
4. **Risultato**:
   - Backend crea report con status "processing"
   - Backend chiama webhook n8n (se configurato)
   - Vieni reindirizzato a `/report/rep-{timestamp}`
5. **Polling automatico**:
   - Frontend controlla ogni 5 secondi se report è pronto
   - Mostra progress bar
   - Quando pronto (n8n completa), mostra il report completo

### **Scenario 4: Visualizza Lista Report**

1. **Login**
2. **Nella home page**, vedi la lista dei tuoi report
3. **Funzionalità**:
   - Search: Cerca per nome azienda o P.IVA
   - Filtro status: Tutti / Completati / In elaborazione / Falliti
   - Ordinamento: Data, Nome azienda, Risk score
4. **Click** su "Visualizza Report" per vedere un report completato

### **Scenario 5: Logout**

1. **Click** sul pulsante "Esci" nella navbar
2. **Conferma** il logout
3. **Risultato**: Token rimosso, reindirizzato a `/login`

---

## 🔄 **Flusso Completo con n8n**

### **Setup n8n (Opzionale per testing completo)**

1. **Crea workflow n8n** con:
   - Webhook trigger
   - Nodi per elaborazione dati (API esterne, calcoli, etc.)
   - HTTP Request node per callback

2. **Webhook URL**:
   ```
   https://n8n.tuodominio.com/webhook/create-report
   ```

3. **n8n riceve** POST da backend:
   ```json
   {
     "reportId": "rep-1730718000000",
     "piva": "03748590928",
     "companyName": "KITZANOS SOC COOP",
     "email": "info@kitzanos.it",
     "callbackUrl": "http://localhost:3001/api/reports/rep-1730718000000/complete"
   }
   ```

4. **n8n elabora** i dati (2-5 minuti)

5. **n8n chiama** callback URL:
   ```bash
   POST http://localhost:3001/api/reports/rep-1730718000000/complete?secret=YOUR_SECRET
   {
     "status": "completed",
     "payload": {
       "company": {...},
       "metrics": [...],
       "charts": {...},
       // ... tutto il JSON del report
     }
   }
   ```

6. **Backend aggiorna** DB con payload

7. **Frontend polling** rileva il cambiamento e mostra il report

### **Testing Senza n8n (Mock)**

Per testare senza n8n, puoi simulare manualmente il callback:

```bash
# Dopo aver creato un report, esegui questo comando per completarlo

curl -X POST "http://localhost:3001/api/reports/REP_ID_QUI/complete?secret=your_callback_secret" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "payload": {
      "company": {
        "name": "KITZANOS SOCIETA COOPERATIVA",
        "piva": "03748590928"
      },
      "riskAssessment": {
        "score": 72.61,
        "category": "B",
        "rating": "B3"
      },
      "metrics": []
    }
  }'
```

Sostituisci `REP_ID_QUI` con l'ID del report generato.

---

## 🔍 **Verifica Funzionamento**

### **Backend Health Check**

```bash
curl http://localhost:3001/health
```

Risposta:
```json
{
  "status": "ok",
  "timestamp": "2024-11-04T...",
  "uptime": 123.45,
  "environment": "development"
}
```

### **Test Login API**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@finreport.com","password":"demo123"}'
```

Risposta:
```json
{
  "message": "Login successful",
  "user": {
    "id": "...",
    "email": "demo@finreport.com",
    "fullName": "Demo User"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### **Test Get Reports API**

```bash
# Usa il token ricevuto dal login
TOKEN="eyJhbGciOiJIUzI1NiIs..."

curl http://localhost:3001/api/my/reports \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 **Verifica Database**

```bash
# Connettiti al database
psql -U postgres -d finreport_db

# Vedi utenti
SELECT id, email, full_name FROM users;

# Vedi aziende
SELECT id, piva, name FROM companies;

# Vedi report
SELECT id, status, created_at FROM reports ORDER BY created_at DESC;

# Dettaglio report con payload
SELECT id, status, payload FROM reports WHERE id = 'rep-xxx';
```

---

## 🐛 **Troubleshooting**

### **Problema: Frontend non si connette al backend**

**Errore**: `Failed to fetch` o `Network error`

**Soluzione**:
1. Verifica che backend sia avviato su porta 3001
2. Verifica file `.env` frontend contenga `REACT_APP_API_URL=http://localhost:3001`
3. Riavvia frontend dopo aver modificato `.env`

### **Problema: 401 Unauthorized**

**Errore**: `Authentication required`

**Soluzione**:
1. Fai logout e login nuovamente
2. Verifica che token non sia scaduto (controlla console browser)
3. Clear localStorage e riprova

### **Problema: Reports non si caricano**

**Errore**: `Report non trovato`

**Soluzione**:
1. Verifica che l'utente loggato sia proprietario del report
2. Controlla nel database: `SELECT * FROM reports WHERE user_id = '...'`
3. Verifica che `reportId` nella URL sia corretto

### **Problema: Report rimane in "processing" per sempre**

**Causa**: n8n non ha chiamato il callback

**Soluzione Mock**:
```bash
# Completa manualmente il report con curl
curl -X POST "http://localhost:3001/api/reports/REP_ID/complete?secret=xxx" \
  -H "Content-Type: application/json" \
  -d '{"status":"completed","payload":{...}}'
```

---

## 📱 **Testing Mobile/Responsive**

1. Apri DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Testa su:
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop (1920px)

Verifica:
- ✅ Login form responsive
- ✅ Navbar mobile-friendly
- ✅ Report list responsive
- ✅ Report detail leggibile

---

## 🔐 **Security Checklist**

Prima di andare in produzione:

- [ ] Cambia `JWT_SECRET` in backend con valore random forte
- [ ] Usa HTTPS in produzione
- [ ] Configura CORS correttamente (solo frontend URL)
- [ ] Abilita rate limiting
- [ ] Valida tutti gli input
- [ ] Non committare file `.env`
- [ ] Usa variabili ambiente per secrets
- [ ] Abilita Helmet security headers
- [ ] Fai backup database regolari
- [ ] Monitora logs per attività sospette

---

## 📝 **Next Steps**

Dopo aver verificato che tutto funziona:

1. **Deploy Backend**:
   - Railway.app / Render.com / DigitalOcean
   - Configura PostgreSQL production
   - Imposta variabili ambiente

2. **Deploy Frontend**:
   - Vercel / Netlify
   - Configura `REACT_APP_API_URL` con URL backend production

3. **Configura n8n**:
   - Setup workflow production
   - Configura callback URL con backend production
   - Testa flusso end-to-end

4. **Monitoraggio**:
   - Aggiungi logging (Winston/Pino)
   - Setup error tracking (Sentry)
   - Configura analytics

---

## 🎉 **Conclusione**

Ora hai un'applicazione multi-tenant completamente funzionante con:

✅ **Autenticazione JWT** sicura
✅ **Multi-user** con isolamento dati
✅ **Frontend-Backend integration** completa
✅ **n8n webhook** per report generation
✅ **Real-time polling** per status update
✅ **Professional UI/UX** responsive

**Made with ❤️ for FinReport Dashboard**
