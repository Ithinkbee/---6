# Music Assistant

Диалоговая система для поиска и рекомендации музыки на основе естественного языка. Лабораторная работа по дисциплине «Естественно-языковой интерфейс иснтеллектуальных систем».

**Вариант 9 — Музыка**

---

## Описание

Веб-приложение, сочетающее классический REST API с AI-агентом на базе LangGraph. Пользователь общается с ассистентом на естественном языке: ищет исполнителей, получает рекомендации по жанру или настроению, просматривает анонсы мероприятий. Агент самостоятельно определяет намерение пользователя и вызывает соответствующие инструменты.

---

## Стек технологий

| Слой | Технологии |
|---|---|
| Backend | Python 3.12, FastAPI, SQLModel, Alembic, PostgreSQL 16 |
| AI / Агент | LangGraph, LangChain, Groq API (Llama 3.3 70B) |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Radix UI |
| Состояние | TanStack Query, Zustand |
| Аутентификация | Firebase Authentication |
| Инфраструктура | Docker, Docker Compose |

---

## Функциональность

- Регистрация и авторизация через Firebase
- Поиск исполнителей и треков по названию или жанру
- Подробная информация об исполнителе: дискография, треки
- Рекомендации по жанру и настроению (happy, sad, energetic, calm и др.)
- Афиша музыкальных мероприятий с фильтрацией по городу и жанру
- AI-чат с историей диалогов и двумя режимами: стандартный и саркастичный
- Управление профилем пользователя

---

## Быстрый старт (Docker Compose)

### Требования

- Docker Engine 24+
- Docker Compose v2

### Запуск

```bash
# 1. Клонировать репозиторий
git clone <repo-url>
cd lab6

# 2. Создать файл окружения
cp .env.example .env
# Заполнить переменные (см. раздел «Конфигурация»)

# 3. Запустить все сервисы
docker compose up
```

После запуска доступны:

| Сервис | Адрес |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |
| PostgreSQL | localhost:5433 |

---

## Конфигурация

Скопируйте `.env.example` в `.env` и заполните следующие переменные:

```dotenv
# Groq API
GROQ_API_KEY=your_groq_api_key

# Firebase (для аутентификации)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...

# Frontend
VITE_API_URL=http://localhost:8000/api
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
```

Файл `firebase_service_key.json` (сервисный ключ) поместить в директорию `backend/`.

---

## Локальная разработка без Docker

### Backend

```bash
cd backend

# Установить зависимости (uv)
uv sync

# Применить миграции
alembic upgrade head

# Запустить сервер
uvicorn src.dispatch.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend

npm install
npm run dev
```

---

## Структура проекта

```
.
├── backend/
│   ├── src/dispatch/
│   │   ├── auth/          # Firebase-аутентификация
│   │   ├── chat/          # AI-агент, диалоги, LangGraph
│   │   ├── music/         # Модели, CRUD, рекомендации
│   │   ├── user/          # Профили пользователей
│   │   └── common/        # Граф агента, утилиты
│   ├── alembic/           # Миграции БД
│   └── pyproject.toml
├── frontend/
│   └── src/
│       ├── pages/         # Страницы приложения
│       ├── components/    # UI-компоненты
│       ├── hooks/         # Кастомные хуки
│       └── config/        # API-клиент, Firebase, стор
└── docker-compose.yml
```

---

## Архитектура агента

AI-агент построен по паттерну **ReAct** (LangGraph). При получении сообщения агент:

1. Определяет намерение: `SEARCH`, `INFO`, `RECOMMEND`, `EVENTS`, `HELP`
2. Вызывает один или несколько инструментов (tools)
3. Формирует ответ на основе полученных данных

Доступные инструменты агента:

| Инструмент | Описание |
|---|---|
| `search_artists` | Поиск исполнителей по имени или жанру |
| `get_artist_info` | Подробная информация об исполнителе |
| `search_tracks` | Поиск треков |
| `recommend_music` | Рекомендации по жанру или настроению |
| `get_events` | Музыкальные мероприятия |
| `get_genre_info` | Информация о жанре |

---

## Команды разработчика

```bash
# Backend — линтинг
cd backend && ruff check

# Frontend — линтинг
cd frontend && npm run lint

# Frontend — сборка
cd frontend && npm run build

# Миграции
alembic upgrade head       # применить
alembic downgrade -1       # откатить
```
