# NLP Reddit Classification & Sentiment Analysis

A full-stack application that collects posts and comments from Reddit, performs sentiment analysis using Natural Language Processing (NLP), and visualizes the data in real-time.

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Database Setup](#2-database-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [Running the Application](#running-the-application)
  - [Option A: Running with Docker (Recommended)](#option-a-running-with-docker-recommended)
  - [Option B: Running Manually](#option-b-running-manually)
- [Project Structure](#project-structure)

## Project Overview

This project consists of three main components:

1. **Data Collector**: A Python service that connects to the Reddit API, streams comments/posts in real-time, or polls for specific keywords.
2. **Analysis Engine**: Processes the text data using VADER (Valence Aware Dictionary and sEntiment Reasoner) to determine if the sentiment is Positive, Negative, or Neutral.
3. **Dashboard**: A React-based frontend that displays live statistics, sentiment trends, and recent posts.

## Tech Stack

- **Backend**: Python, Flask, PRAW (Reddit API), NLTK (NLP)
- **Frontend**: React (Vite), Plotly.js, TailwindCSS (implied via class usage)
- **Database**: MySQL
- **Messaging**: Redis (for WebSocket communication)
- **Containerization**: Docker & Docker Compose

## Prerequisites

Before starting, ensure you have the following installed on your machine:

1. **Python 3.8+**: [Download Python](https://www.python.org/downloads/)
2. **Node.js & npm** (for the frontend): [Download Node.js](https://nodejs.org/)
3. **Docker Desktop** (easiest way to run database & Redis): [Download Docker](https://www.docker.com/products/docker-desktop/)
4. **Git**: [Download Git](https://git-scm.com/)

---

## Installation & Setup

### 1. Backend Setup

1. **Clone the repository** (if you haven't already):

    ```bash
    git clone <repository_url>
    cd NLP-Reddit-Classification
    ```

2. **Create a Virtual Environment**:
    This isolates your Python dependencies.

    ```bash
    # Windows
    python -m venv .venv
    .venv\Scripts\activate

    # Mac/Linux
    python3 -m venv .venv
    source .venv/bin/activate
    ```

3. **Install Python Dependencies**:

    ```bash
    pip install -r requirements.txt
    ```

4. **Environment Variables**:
    Create a file named `.env` in the root directory. You will need Reddit API credentials.
    > **To get Reddit Credentials:**
    > 1. Go to [https://www.reddit.com/prefs/apps](https://www.reddit.com/prefs/apps)
    > 2. Click "create another app..."
    > 3. Select **script**.
    > 4. Use `http://localhost:8080` as the redirect uri (doesn't matter much for script apps).
    > 5. Copy the **ID** (under the name) and **Secret**.

    **Add the following to your `.env` file:**

    ```ini
    # Reddit API Keys
    REDDIT_CLIENT_ID=your_client_id_here
    REDDIT_CLIENT_SECRET=your_client_secret_here
    REDDIT_USER_AGENT=python:nlp-sentiment:v1.0 (by /u/your_username)

    # Database Config
    DB_HOST=localhost
    DB_PORT=3306
    DB_USER=root
    DB_PASSWORD=secret
    DB_NAME=reddit_db
    DEBUG=True

    # Redis Config
    REDIS_HOST=localhost
    REDIS_PORT=6379
    ```

### 2. Database Setup

You need a running MySQL database and Redis instance. The easiest way is to use Docker for just these services, or install them manually.

**Using Docker for DB & Redis (Recommended for Dev):**
You can run *just* the database and redis from the `docker-compose.yml` if you want to run the app code locally.

```bash
docker-compose up -d mysql-db redis
```

**Manual Setup:**
If you installed MySQL manually:

1. Create a database named `reddit_db`.
2. Import the schema from `scripts/schema.sql` (if available) or let the app auto-create tables (the `db_manager.py` handles some schema checks).

### 3. Frontend Setup

1. Navigate to the frontend folder:

    ```bash
    cd frontend
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

---

## Running the Application

### Option A: Running with Docker (Recommended)

This runs the entire stack (Database, Backend, Frontend) in containers. This is the **simplest** method to get everything working instantly.

1. Make sure Docker Desktop is running.
2. From the root project directory:

    ```bash
    docker-compose up --build
    ```

3. Open your browser to: `http://localhost:80` (or just `http://localhost`)

### Option B: Running Manually

If you want to edit code and see changes immediately, run components individually.

**1. Start Database & Redis**
Ensure MySQL and Redis are running (see "Database Setup" above).

**2. Start the API Server**
Open a terminal in the root folder:

```bash
# Activate venv if not active
.venv\Scripts\activate

# Run the API
python run_api.py
```

*The API will start on <http://localhost:5000>*

**3. Start the Data Collector**
Open a **new** terminal in the root folder:

```bash
# Activate venv
.venv\Scripts\activate

# Run collector in poll mode (example)
python run_collector.py poll --keywords python ai machinelearning
```

**4. Start the Frontend**
Open a **new** terminal in the `frontend` folder:

```bash
npm run dev
```

*The frontend will start on <http://localhost:5173> (usually)*

---

## Project Structure

```
NLP-Reddit-Classification/
├── app/
│   ├── api/            # Flask routes
│   ├── data_collection/ # Reddit PRAW logic
│   ├── database/       # MySQL database manager
│   ├── nlp/            # VADER sentiment analyzer
│   ├── models.py       # Data classes
│   └── config.py       # Configuration loader
├── frontend/           # React application
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── scripts/            # SQL scripts
├── tests/              # Unit tests
├── run_api.py          # Entry point for API
├── run_collector.py    # Entry point for Collector
├── docker-compose.yml  # Docker orchestration
├── requirements.txt    # Python dependencies
└── README.md           # This file
```
