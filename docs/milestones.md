# Project Milestones

## Milestone 1 — Topic Selection & Supervisor Assignment
**Period:** Week 1–2 (7–20 Sep 2026)

**Official milestone:** Topic selection and supervisor assignment

**Project work / deliverable:**
- Project scope and requirements draft

**Acceptance criteria:**
- Тема выбрана и согласована с supervisor
- Определены основные функции проекта
- Сформирован первоначальный список user stories
- Определён базовый tech stack

**Closed user stories:**  
Пока не закрываются

---

## Milestone 2 — Topic Approval by Administration
**Period:** Week 3 (21–27 Sep 2026)

**Official milestone:** Topic approval by administration

**Project work / deliverable:**
- Finalize approved project scope

**Acceptance criteria:**
- Тема официально утверждена
- Scope проекта зафиксирован
- Основные требования подтверждены

**Closed user stories:**  
Пока не закрываются

---

## Milestone 3 — Progress Review 1
**Period:** Week 4–7 (28 Sep – 25 Oct 2026)

**Official milestone:** Progress Review 1

**Project work / deliverable:**
- ML & Receipt Processing Core

**Acceptance criteria:**
- Подготовлена high-level архитектура
- ML prototype принимает фото чека и распознаёт:
  - `merchant`
  - `date`
  - `total`
  - `currency`
  - `line items`
- Для распознанных товаров могут быть извлечены:
  - `name`
  - `quantity`
  - `unit_price`
  - `total_amount`
- Настроена загрузка receipt в Cloudinary
- Spring создаёт receipt и signed upload parameters
- Python Worker автоматически обрабатывает загруженный receipt
- Статусы проходят через:
  - `PENDING_UPLOAD → UPLOADED → PROCESSING → DONE/FAILED`
- Распознанные данные receipt сохраняются в PostgreSQL
- Распознанные товары сохраняются в таблицу `line_items`
- Проверен end-to-end flow:
  - `Spring → Cloudinary → PostgreSQL → Python Worker → ML pipeline → PostgreSQL`

**Closed / partially completed user stories:**  
`US-07`, `US-24`, `US-25`

---

## Milestone 4 — Expert Submissions Begin
**Period:** Week 8–10 (26 Oct – 15 Nov 2026)

**Official milestone:** Expert submissions begin

**Project work / deliverable:**
- Transactions, Categories & Authentication

**Acceptance criteria:**
- Работают registration/login
- Пользователь может вручную записывать расходы
- Работает создание, редактирование и удаление транзакций
- Поддерживается preferred currency
- Поддерживаются default и custom categories
- Работает редактирование и удаление custom categories
- Реализована история транзакций
- Работает фильтрация по дате и категории
- Есть поле `description`
- Реализованы recent transactions
- Receipt processing result можно получить через Spring Boot API
- Receipt processing status можно получить через Spring Boot API

**Closed user stories:**  
`US-01`, `US-02`, `US-03`, `US-04`, `US-05`, `US-06`, `US-11`, `US-12`, `US-13`, `US-14`, `US-15`, `US-16`, `US-23`, `US-24`, `US-25`

---

## Milestone 5 — Progress Review 2
**Period:** Week 11–13 (16 Nov – 6 Dec 2026)

**Official milestone:** Progress Review 2 — includes complexity check

**Project work / deliverable:**
- Working MVP: Budgets, Goals & Financial Overview

**Acceptance criteria:**
- Работают бюджеты и отображение их progress
- Работают financial goals и отображение их progress
- Отображаются income/expense totals
- Реализован spending by category
- Есть общий financial overview
- Пользователь может видеть spending trends по дням, неделям и месяцам
- Receipt recognition result можно просмотреть и проверить перед созданием или обновлением transaction
- Основные пользовательские сценарии доступны через UI и работают end-to-end
- Frontend, Spring Boot, PostgreSQL, Cloudinary и Python Worker интегрированы между собой
- К этому моменту реализована большая часть системы

**Closed user stories:**  
`US-08`, `US-09`, `US-10`, `US-17`, `US-18`, `US-19`, `US-20`, `US-21`, `US-22`
