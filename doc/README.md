# MagicTypeRoyale - Documentació Tècnica

## Taula de continguts

- [Introducció](#introducció)
- [Arquitectura del sistema](#arquitectura-del-sistema)
- [Estructura del projecte](#estructura-del-projecte)
- [Requisits del sistema](#requisits-del-sistema)
- [Instal·lació i configuració](#instal·lació-i-configuració)
- [Execució en local](#execució-en-local)
- [API Reference](#api-reference)
- [Desplegament a producció](#desplegament-a-producció)
- [Estructura de la base de dades](#estructura-de-la-base-de-dades)

---

## Introducció

**MagicTypeRoyale** és una aplicació web multijugador en temps real on diversos jugadors competeixen escrivint textos el més ràpid possible. L'aplicació incorpora elements de joc de rol amb temàtica màgica, on cada jugador assumeix el paper d'un mag amb poders especials que pot utilitzar per afectar els seus oponents.

### Característiques principals

- **Multijugador en temps real**: Suporta fins a 6 jugadors simultanis per sala
- **Sistema de power-ups**: Cada mag té habilitats especials úniques
- **Sistema de debuffs**: Els jugadors poden afectar els seus oponents amb efectes negatius
- **Classificació en temps real**: Ranking actualitzat durant la partida
- **Sistema de salas**: Creació de sales públiques i privades
- **Mode espectador**: Possibilitat d'observar partides sense participar

---

## 🏗️ Arquitectura bàsica
## 🧱 Tecnologies utilitzades
### Component	Tecnologia
Backend	Node.js + Express + Socket.IO
Frontend	Vite (Vue.js o JS Vanilla)
Contenidors	Docker + Docker Compose
Comunicació	WebSockets (Socket.IO)
## 🧩 Interrelació entre components
   ┌─────────────────────┐
   │     Frontend        │
   │  (Vite + Vue.js)    │
   │  http://localhost:5174  │
   └──────────┬──────────┘
              │
              ▼
   ┌─────────────────────┐
   │     Backend         │
   │  Node.js + Socket.IO│
   │  http://localhost:3001  │
   └──────────┬──────────┘
              │
              ▼
      Comunicació en temps real
           amb Socket.IO

### Tecnologies utilitzades

| Component | Tecnologia | Versió |
|-----------|-----------|--------|
| **Frontend** | Vue.js | 3.5.22 |
| **Build Tool** | Vite | 7.1.11 |
| **Backend** | Node.js | 20+ |
| **Framework Backend** | Express | 4.18.2 |
| **WebSockets** | Socket.IO | 4.7.2 |
| **Base de dades** | MySQL | 8.0 |
| **Contenidors** | Docker | Latest |
| **Orquestració** | Docker Compose | Latest |
| **Reverse Proxy** | Nginx | Latest |

### Flux de comunicació

1. **Connexió inicial**: El client es connecta al servidor via Socket.IO
2. **Registre de jugador**: El client envia el nom del jugador
3. **Gestió de salas**: Creació o unió a sales (públiques o privades)
4. **Preparació**: Els jugadors indiquen que estan preparats
5. **Inici de partida**: L'administrador inicia la partida
6. **Joc en temps real**: Comunicació bidireccional de progress, power-ups i debuffs
7. **Finalització**: El servidor calcula i envia la classificació final

---

## Estructura del projecte

```
tr1-type-racer-royale-tr1-grup-5/
│
├── backend/                    # Servidor Node.js
│   ├── server.js              # Servidor principal Express + Socket.IO
│   ├── Dockerfile             # Imatge Docker del backend
│   ├── package.json           # Dependències del backend
│   ├── .env                   # Variables d'entorn (no versionat)
│   └── init.sql               # Scripts d'inicialització de la BDD
│
├── frontend/                   # Aplicació Vue.js
│   ├── src/
│   │   ├── App.vue            # Component principal de l'aplicació
│   │   ├── main.js            # Punt d'entrada de Vue
│   │   ├── socket.js          # Configuració de Socket.IO client
│   │   └── components/        # Components Vue
│   │       ├── BookAnimation.vue          # Animació d'inici de partida
│   │       ├── RankingComponent.vue       # Taula de classificació
│   │       ├── Game/
│   │       │   ├── GameEngine.vue         # Motor principal del joc
│   │       │   ├── TempsRestant.vue       # Temporitzador
│   │       │   └── *SpellAnimation.vue    # Animacions de hechizos
│   │       └── PreGame/
│   │           └── lobby/
│   │               ├── viewLobby.vue      # Vista del lobby
│   │               └── playerList.vue     # Llista de jugadors
│   ├── public/                # Arxius estàtics
│   ├── Dockerfile             # Imatge Docker del frontend
│   ├── vite.config.js         # Configuració de Vite
│   └── package.json           # Dependències del frontend
│
├── doc/                       # Documentació del projecte
│   ├── README.md              # Aquest fitxer
│   ├── Diagrama de Sistema.jpg
│   ├── Flux de Pantalles.jpg
│   ├── Protocol de Comunicació.jpg
│   └── Wireframe.jpg
│
├── docker-compose.dev.yml     # Configuració Docker per desenvolupament
├── docker-compose.prod.yml    # Configuració Docker per producció
├── nginx.conf                 # Configuració de Nginx
├── nginx.Dockerfile           # Dockerfile per Nginx
└── README.md                  # README principal del repositori
```

### Descripció de carpetes principals

#### `backend/`
Conté tot el codi del servidor Node.js:
- **server.js**: Punt d'entrada principal que configura Express, Socket.IO i gestiona tota la lògica del joc
- **Dockerfile**: Defineix la imatge Docker per al backend
- **package.json**: Gestiona les dependències i scripts del backend

#### `frontend/src/`
Conté tots els components Vue.js:
- **App.vue**: Component arrel que gestiona les diferents vistes (login, lobby, joc, final)
- **components/Game/**: Components relacionats amb la partida activa
- **components/PreGame/**: Components del lobby i preparació
- **socket.js**: Configuració i utilitats per a la comunicació Socket.IO

#### `doc/`
Documentació del projecte incloent diagrames i wireframes.

---

## Requisits del sistema

### Requisits mínims

- **Node.js**: Versió 20.19.0 o superior (o 22.12.0+)
- **Docker**: Versió 20.10 o superior
- **Docker Compose**: Versió 2.0 o superior
- **Git**: Per clonar el repositori

### Requisits recomanats

- **RAM**: Mínim 4GB (8GB recomanat)
- **Espai en disc**: 2GB lliures
- **Sistema operatiu**: Linux, macOS o Windows amb WSL2

---

## Instal·lació i configuració

### 1. Clonar el repositori

```bash
git clone https://github.com/inspedralbes/tr1-type-racer-royale-tr1-grup-5.git
cd tr1-type-racer-royale-tr1-grup-5
```

### 2. Configurar variables d'entorn

#### Backend (`backend/.env`)

Crea el fitxer `backend/.env` amb el següent contingut:

```env
PORT=3001
NODE_ENV=development
DB_HOST=mysql
MYSQL_USER=trr_user_dev
MYSQL_PASSWORD=trr_password_dev
MYSQL_DATABASE=trr_db_dev
```

#### Frontend (`frontend/.env`)

Crea el fitxer `frontend/.env` amb el següent contingut:

```env
VITE_HOST=0.0.0.0
VITE_PORT=5174
VITE_BACKEND_URL=http://localhost:3001
VITE_NODE_ENV=development
```

### 3. Instal·lació de dependències (opcional, si no uses Docker)

Si prefereixes executar l'aplicació sense Docker:

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

## Execució en local

### Opció 1: Utilitzant Docker Compose (Recomanat)

Aquesta és la forma més senzilla d'executar l'aplicació en local:

```bash
# Desenvolupament
docker compose -f docker-compose.dev.yml up --build

# O en mode detach (segon pla)
docker compose -f docker-compose.dev.yml up --build -d
```

Això iniciarà:
- **Frontend**: http://localhost:5174
- **Backend**: http://localhost:3001
- **MySQL**: localhost:3307
- **Adminer** (gestió BDD): http://localhost:8088

### Opció 2: Execució manual (sense Docker)

#### Terminal 1 - Backend

```bash
cd backend
npm install
npm start
```

#### Terminal 2 - Frontend

```bash
cd frontend
npm install
npm run dev
```

#### Terminal 3 - MySQL

Assegura't de tenir MySQL executant-se localment amb les credencials especificades a `backend/.env`.

### Verificació de la instal·lació

1. Obre el navegador i accedeix a http://localhost:5174
2. Hauries de veure la pantalla de login
3. Verifica que el backend respon: http://localhost:3001 (hauria de mostrar "Type Racer Royale backend ready 🏁")

---

## API Reference

### Endpoints REST

#### `GET /`

Comprovació de l'estat del servidor.

**Resposta**:
```json
"Type Racer Royale backend ready 🏁"
```

**Codi d'estat**: `200 OK`

---

### Esdeveniments Socket.IO

La comunicació principal es realitza mitjançant WebSockets utilitzant Socket.IO. Tots els esdeveniments utilitzen JSON com a format de dades.

#### Esdeveniments del Client → Servidor

##### `setPlayerName`

Registra un jugador al servidor.

**Payload**:
```json
{
  "name": "NomDelJugador",
  "id": "uuid-del-jugador"
}
```

**Resposta del servidor**: `playerRegistered`
```json
{
  "id": "uuid-del-jugador",
  "name": "NomDelJugador",
  "role": "player"
}
```

---

##### `createRoom`

Crea una nova sala de joc.

**Payload**:
```json
{
  "roomName": "NomDeLaSala",
  "isPrivate": false
}
```

**Resposta del servidor**: `roomCreated`
```json
{
  "roomName": "NomDeLaSala",
  "isPrivate": false
}
```

**Errors possibles**:
- `error`: "Jugador no registrat."
- `error`: "La sala ja existeix."
- `roomAlreadyCreated`: La sala ja existeix

---

##### `joinRoom`

Uneix un jugador a una sala existent.

**Payload**:
```json
{
  "roomName": "NomDeLaSala",
  "accessCode": "E0249F"  // Opcional, només per sales privades
}
```

**Resposta del servidor**: `roomJoined`
```json
{
  "roomName": "NomDeLaSala"
}
```

**Errors possibles**:
- `error`: "Jugador no registrat."
- `error`: "La sala no existeix."
- `error`: "Codi d'accés incorrecte." (per sales privades)
- `error`: "La sala està plena"

---

##### `getRoomList`

Sol·licita la llista de sales disponibles.

**Payload**: Cap

**Resposta del servidor**: `roomList`
```json
[
  {
    "name": "Sala1",
    "playerCount": 3,
    "maxPlayers": 6,
    "beingPlayed": false,
    "isPrivate": false
  }
]
```

---

##### `setIsReady`

Marca o desmarca un jugador com a preparat.

**Payload**:
```json
{
  "roomName": "NomDeLaSala",
  "id": "uuid-del-jugador"
}
```

**Resposta del servidor**: `updateRoomState` (actualització de l'estat de la sala)

---

##### `configGame`

Configura els paràmetres del joc (només administrador).

**Payload**:
```json
{
  "roomName": "NomDeLaSala",
  "id": "uuid-del-admin",
  "newConfig": {
    "time": 90,
    "language": "cat"
  }
}
```

**Resposta del servidor**: `updateRoomState`

---

##### `startGame`

Inicia la partida (només administrador).

**Payload**:
```json
{
  "roomName": "NomDeLaSala",
  "id": "uuid-del-admin"
}
```

**Resposta del servidor**: `gameStarted`
```json
{
  "spellText": ["paraula1", "paraula2", ...],
  "spellCategory": "foc",
  "time": 90
}
```

---

##### `addPoints`

Suma un punt al jugador (quan completa una paraula correctament).

**Payload**:
```json
{
  "roomName": "NomDeLaSala",
  "id": "uuid-del-jugador"
}
```

**Resposta del servidor**: `updateRoomState`

---

##### `addErrors`

Incrementa el comptador d'errors del jugador.

**Payload**:
```json
{
  "roomName": "NomDeLaSala",
  "id": "uuid-del-jugador"
}
```

**Resposta del servidor**: `updateRoomState`

---

##### `usePowerUp`

Utilitza el power-up del jugador.

**Payload**:
```json
{
  "roomName": "NomDeLaSala",
  "id": "uuid-del-jugador"
}
```

**Resposta del servidor**: `powerUpUsed` o `powerUpFailed`

---

##### `playerGameStatus`

Actualitza l'estat del joc del jugador (progress, paraula actual, etc.).

**Payload**:
```json
{
  "roomName": "NomDeLaSala",
  "data": {
    "id": "uuid-del-jugador",
    "textEntrat": "text introduït",
    "indexParaulaActiva": 2,
    "paraules": [...]
  }
}
```

**Resposta del servidor**: `spectatorGameView` (per espectadors)

---

##### `leaveRoom`

Abandona la sala actual.

**Payload**:
```json
{
  "roomName": "NomDeLaSala",
  "id": "uuid-del-jugador"
}
```

**Resposta del servidor**: `updateRoomState`

---

##### `playAgain`

Prepara el jugador per a una nova partida.

**Payload**:
```json
{
  "roomName": "NomDeLaSala",
  "id": "uuid-del-jugador"
}
```

**Resposta del servidor**: `updateRoomState`

---

#### Esdeveniments del Servidor → Client

##### `playerRegistered`

Confirmació de registre del jugador.

```json
{
  "id": "uuid",
  "name": "NomJugador",
  "role": "player"
}
```

---

##### `updateRoomState`

Actualització de l'estat de la sala.

```json
{
  "name": "NomSala",
  "players": [...],
  "config": {
    "time": 90,
    "language": "cat"
  },
  "isPrivate": false,
  "accessCode": null
}
```

---

##### `gameStarted`

Notificació d'inici de partida.

```json
{
  "spellText": ["paraula1", "paraula2", ...],
  "spellCategory": "foc",
  "time": 90
}
```

---

##### `updateTime`

Actualització del temps restant.

```json
{
  "time": 45
}
```

---

##### `spectatorGameView`

Estat del joc per a espectadors.

```json
[
  {
    "id": "uuid-jugador",
    "textEntrat": "...",
    "indexParaulaActiva": 2,
    "paraules": [...]
  }
]
```

---

##### `powerUpReady`

Notificació que el power-up està disponible.

```json
{
  "powerUp": "Ignicio"
}
```

---

##### `powerUpUsed`

Confirmació d'ús del power-up.

---

##### `powerUpFailed`

Error en l'ús del power-up.

```json
{
  "message": "Missatge d'error"
}
```

---

##### `debuffReceived`

Notificació de rebuda de debuff.

```json
{
  "type": "Congelar",
  "duration": 5000
}
```

---

##### `debuffEnded`

Notificació de finalització de debuff.

---

##### `gameEnded`

Notificació de finalització de la partida.

```json
{
  "ranking": [...]
}
```

---

##### `error`

Error general del servidor.

```json
{
  "message": "Missatge d'error"
}
```

---

## Desplegament a producció

### Requisits per producció

- Servidor amb Docker i Docker Compose instal·lats
- Domini configurat (opcional)
- Certificat SSL (recomanat per HTTPS)

### Configuració

1. **Crear fitxer `.env` a l'arrel del projecte**:

```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://magictyperoyale.daw.inspedralbes.cat
DB_HOST=mysql
MYSQL_ROOT_PASSWORD=password_segur
MYSQL_DATABASE=trr_db_prod
MYSQL_USER=trr_user_prod
MYSQL_PASSWORD=password_segur
```

2. **Construir i executar**:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

### Estructura de producció

En producció, Nginx actua com a reverse proxy:
- Serveix els arxius estàtics del frontend (construït amb Vite)
- Proxifica les peticions API al backend
- Gestiona WebSocket upgrades per Socket.IO

### Verificació post-desplegament

1. Verifica que tots els contenidors estan executant-se:
```bash
docker compose -f docker-compose.prod.yml ps
```

2. Verifica els logs:
```bash
docker compose -f docker-compose.prod.yml logs -f
```

3. Accedeix a l'aplicació via el domini configurat

---

## Estructura de la base de dades

### Taula: `datos_ejemplo`

Aquesta taula emmagatzema els textos dels conjurs (spells) que els jugadors han d'escriure.

| Columna | Tipus | Descripció |
|---------|-------|------------|
| `id` | INT (AUTO_INCREMENT) | Identificador únic |
| `categoria` | VARCHAR(50) | Categoria del mag (foc, gel, aigua, etc.) |
| `mag` | VARCHAR(100) | Nom del mag associat |
| `linea_orden` | INT | Ordre de la línia dins del conjur |
| `titol` | VARCHAR(255) | Títol del conjur |
| `linea_texto` | TEXT | Text de la línia a escriure |

### Exemple de dades

```sql
INSERT INTO datos_ejemplo (categoria, mag, linea_orden, titol, linea_texto) VALUES
('foc', 'Mag de Foc', 1, 'Conjur de Foc', 'la bruixa invoca un esperit elemental'),
('foc', 'Mag de Foc', 2, 'Conjur de Foc', 'de la tundra congelada aquesta criatura');
```

### Inicialització

La base de dades s'inicialitza automàticament quan el backend es connecta per primera vegada. El script d'inicialització es troba a `backend/server.js` i crea la taula si no existeix, i la pobla amb dades d'exemple si està buida.

---

## Solució de problemes

### El frontend no es connecta al backend

1. Verifica que el backend està executant-se: http://localhost:3001
2. Comprova les variables d'entorn a `frontend/.env`
3. Verifica que no hi ha errors de CORS al backend

### Errors de connexió a la base de dades

1. Verifica que MySQL està executant-se
2. Comprova les credencials a `backend/.env`
3. Verifica que el contenidor MySQL està saludable:
```bash
docker compose ps
```

### Problemes amb Docker

1. Assegura't d'tenir Docker i Docker Compose instal·lats correctament
2. Verifica que els ports no estan en ús:
```bash
# Linux/macOS
lsof -i :5174
lsof -i :3001

# Windows
netstat -ano | findstr :5174
netstat -ano | findstr :3001
```

3. Neteja els contenidors i volums antics:
```bash
docker compose down -v
docker system prune -a
```

---

## Contribució

Aquest projecte és part d'un projecte acadèmic. Per a suggeriments o problemes, obre un issue al repositori de GitHub.

---

## Llicència

Consulta el fitxer `LICENSE` per a més informació sobre la llicència d'aquest projecte.

---

## Contacte

- **Grup**: Grup 5
- **Integrants**: Marc, Tony, Biel i Álvaro
- **Repositori**: https://github.com/inspedralbes/tr1-type-racer-royale-tr1-grup-5
