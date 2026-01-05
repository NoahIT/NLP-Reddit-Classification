# NLP Reddit Klasifikavimas ir Sentimentų Analizė

Pilna programinė įranga, kuri renka įrašus ir komentarus iš Reddit, atlieka sentimentų analizę naudojant natūralios kalbos apdorojimą (NLP) ir vizualizuoja duomenis realiuoju laiku.

## Turinys

- [Projekto Apžvalga](#projekto-apžvalga)
- [Technologijų Rinkinys](#technologijų-rinkinys)
- [Reikalavimai](#reikalavimai)
- [Diegimas ir Nustatymas](#diegimas-ir-nustatymas)
  - [1. Backend Nustatymas](#1-backend-nustatymas)
  - [2. Duomenų Bazės Nustatymas](#2-duomenų-bazės-nustatymas)
  - [3. Frontend Nustatymas](#3-frontend-nustatymas)
- [Programos Paleidimas](#programos-paleidimas)
  - [A variantas: Paleidimas su Docker (Rekomenduojama)](#a-variantas-paleidimas-su-docker-rekomenduojama)
  - [B variantas: Paleidimas Rankiniu Būdu](#b-variantas-paleidimas-rankiniu-būdu)
- [Projekto Struktūra](#projekto-struktūra)

## Projekto Apžvalga

Šį projektą sudaro trys pagrindiniai komponentai:

1. **Duomenų Rinkiklis**: Python paslauga, kuri prisijungia prie Reddit API, transliuoja komentarus/įrašus realiuoju laiku arba ieško konkrečių raktažodžių.
2. **Analizės Sistema**: Apdoroja tekstinius duomenis naudodama VADER (Valence Aware Dictionary and sEntiment Reasoner), kad nustatytų, ar sentimentas yra Teigiamas, Neigiamas ar Neutralus.
3. **Valdymo Skydas**: React pagrindu sukurta svetainė, kuri rodo gyvą statistiką, sentimentų tendencijas ir naujausius įrašus.

## Technologijų Rinkinys

- **Backend**: Python, Flask, PRAW (Reddit API), NLTK (NLP)
- **Frontend**: React (Vite), Plotly.js, TailwindCSS (naudojamas per klases)
- **Duomenų bazė**: MySQL
- **Pranešimai**: Redis (WebSocket komunikacijai)
- **Konteinerizacija**: Docker ir Docker Compose

## Reikalavimai

Prieš pradedant, įsitikinkite, kad jūsų kompiuteryje įdiegta:

1. **Python 3.8+**: [Atsisiųsti Python](https://www.python.org/downloads/)
2. **Node.js ir npm** (frontend'ui): [Atsisiųsti Node.js](https://nodejs.org/)
3. **Docker Desktop** (paprasčiausias būdas paleisti duomenų bazę ir Redis): [Atsisiųsti Docker](https://www.docker.com/products/docker-desktop/)
4. **Git**: [Atsisiųsti Git](https://git-scm.com/)

---

## Diegimas ir Nustatymas

### 1. Backend Nustatymas

1. **Klonuokite saugyklą** (jei dar to nepadarėte):

    ```bash
    git clone <repository_url>
    cd NLP-Reddit-Classification
    ```

2. **Sukurkite Virtualią Aplinką**:
    Tai izoliuoja jūsų Python priklausomybes.

    ```bash
    # Windows
    python -m venv .venv
    .venv\Scripts\activate

    # Mac/Linux
    python3 -m venv .venv
    source .venv/bin/activate
    ```

3. **Įdiekite Python Priklausomybes**:

    ```bash
    pip install -r requirements.txt
    ```

4. **Aplinkos Kintamieji**:
    Sukurkite failą pavadinimu `.env` šakniniame kataloge. Jums reikės Reddit API prisijungimo duomenų.
    > **Kaip gauti Reddit Prisijungimo Duomenis:**
    > 1. Eikite į [https://www.reddit.com/prefs/apps](https://www.reddit.com/prefs/apps)
    > 2. Paspauskite "create another app..."
    > 3. Pasirinkite **script**.
    > 4. Naudokite `http://localhost:8080` kaip redirect uri (script programoms tai nėra labai svarbu).
    > 5. Nukopijuokite **ID** (po pavadinimu) ir **Secret**.

    **Pridėkite šią informaciją į savo `.env` failą:**

    ```ini
    # Reddit API Raktai
    REDDIT_CLIENT_ID=jusu_client_id_cia
    REDDIT_CLIENT_SECRET=jusu_client_secret_cia
    REDDIT_USER_AGENT=python:nlp-sentiment:v1.0 (by /u/jusu_vartotojo_vardas)

    # Duomenų Bazės Konfigūracija
    DB_HOST=localhost
    DB_PORT=3306
    DB_USER=root
    DB_PASSWORD=secret
    DB_NAME=reddit_db
    DEBUG=True

    # Redis Konfigūracija
    REDIS_HOST=localhost
    REDIS_PORT=6379
    ```

### 2. Duomenų Bazės Nustatymas

Jums reikia veikiančios MySQL duomenų bazės ir Redis egzemplioriaus. Paprasčiausias būdas - naudoti Docker šioms paslaugoms arba įdiegti jas rankiniu būdu.

**Naudojant Docker DB ir Redis (Rekomenduojama Kūrimui):**
Galite paleisti *tik* duomenų bazę ir redis iš `docker-compose.yml`, jei norite paleisti programos kodą lokaliai.

```bash
docker-compose up -d mysql-db redis
```

**Rankinis Nustatymas:**
Jei įdiegėte MySQL rankiniu būdu:

1. Sukurkite duomenų bazę pavadinimu `reddit_db`.
2. Importuokite schemą iš `scripts/schema.sql` (jei yra) arba leiskite programai automatiškai sukurti lenteles (`db_manager.py` tvarko kai kuriuos schemos patikrinimus).

### 3. Frontend Nustatymas

1. Pereikite į frontend aplanką:

    ```bash
    cd frontend
    ```

2. Įdiekite priklausomybes:

    ```bash
    npm install
    ```

---

## Programos Paleidimas

### A variantas: Paleidimas su Docker (Rekomenduojama)

Tai paleidžia visą sistemą (Duomenų bazę, Backend, Frontend) konteineriuose. Tai **paprasčiausias** būdas viską iškart paleisti.

1. Įsitikinkite, kad Docker Desktop veikia.
2. Iš šakninio projekto katalogo:

    ```bash
    docker-compose up --build
    ```

3. Atidarykite naršyklę adresu: `http://localhost:80` (arba tiesiog `http://localhost`)

### B variantas: Paleidimas Rankiniu Būdu

Jei norite redaguoti kodą ir iš karto matyti pakeitimus, paleiskite komponentus atskirai.

**1. Paleiskite Duomenų Bazę ir Redis**
Įsitikinkite, kad MySQL ir Redis veikia (žr. "Duomenų Bazės Nustatymas" aukščiau).

**2. Paleiskite API Serverį**
Atidarykite terminalą šakniniame aplanke:

```bash
# Aktyvuokite venv, jei neaktyvuotas
.venv\Scripts\activate

# Paleiskite API
python run_api.py
```

*API pradės veikti adresu <http://localhost:5000>*

**3. Paleiskite Duomenų Rinkiklį**
Atidarykite **naują** terminalą šakniniame aplanke:

```bash
# Aktyvuokite venv
.venv\Scripts\activate

# Paleiskite rinkiklį apklausos režimu (pavyzdys)
python run_collector.py poll --keywords python ai machinelearning
```

**4. Paleiskite Frontend**
Atidarykite **naują** terminalą `frontend` aplanke:

```bash
npm run dev
```

*Frontend paprastai pradės veikti adresu <http://localhost:5173>*

---

## Projekto Struktūra

```
NLP-Reddit-Classification/
├── app/
│   ├── api/            # Flask maršrutai
│   ├── data_collection/ # Reddit PRAW logika
│   ├── database/       # MySQL duomenų bazės valdiklis
│   ├── nlp/            # VADER sentimentų analizatorius
│   ├── models.py       # Duomenų klasės
│   └── config.py       # Konfigūracijos įkėliklis
├── frontend/           # React programa
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── scripts/            # SQL skriptai
├── tests/              # Vienetų testai
├── run_api.py          # API pradžios taškas
├── run_collector.py    # Rinkiklio pradžios taškas
├── docker-compose.yml  # Docker orkestravimas
├── requirements.txt    # Python priklausomybės
└── README.md           # Šis failas
```
