# Stage 1: Builder
FROM python:3.10-slim as builder

WORKDIR /usr/src/app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev \
    gcc \
    && apt-get clean

COPY requirements.txt .
# Install dependencies to a specific location
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt
RUN pip install --no-cache-dir --prefix=/install gunicorn

# Stage 2: Final
FROM python:3.10-slim

WORKDIR /usr/src/app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install runtime dependencies only
RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder to global site-packages
COPY --from=builder /install /usr/local

# Copy application code
COPY . .

# Download NLTK data (install to global location or user location)
# NLTK downloader defaults to user home, let's set it to a shared location or ensure appuser can read it
# Setting NLTK_DATA environment variable is safer
ENV NLTK_DATA=/usr/share/nltk_data
RUN mkdir -p /usr/share/nltk_data && \
    python -m nltk.downloader -d /usr/share/nltk_data vader_lexicon

# Create a non-root user
RUN useradd -m appuser && chown -R appuser:appuser /usr/src/app
USER appuser

# CMD is handled by docker-compose or overridden
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "run_api:app"]