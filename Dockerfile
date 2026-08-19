# Wybieramy lekkiego Pythona
FROM python:3.11-slim

# Ustawiamy katalog roboczy w kontenerze
WORKDIR /app

# Kopiujemy najpierw wymagania, żeby cache'ować pobieranie paczek
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Kopiujemy resztę kodu
COPY . .

# Wystawiamy port
EXPOSE 8000

# Odpalamy serwer (flaga --reload jest super przydatna przy developmencie)
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]