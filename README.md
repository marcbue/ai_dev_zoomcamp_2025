# AI Development Zoomcamp

Course materials and projects for the AI Development Zoomcamp.

## Project Structure

```
ai_dev_zoomcamp/
├── pyproject.toml          # Main project configuration
├── README.md               # This file
└── week1_overview/         # Week 1: Django Todo App
    ├── ai_todo_list/       # Django project settings
    ├── todo/               # Todo application
    ├── manage.py           # Django management script
    └── db.sqlite3          # SQLite database
```

## Setup

1. Install dependencies using uv:
   ```bash
   uv sync
   ```

2. Run the Week 1 Django application:
   ```bash
   cd week1_overview
   uv run python manage.py runserver
   ```

## Week 1: Todo List Application

A Django-based todo list application. See [week1_overview/README.md](week1_overview/README.md) for details.

