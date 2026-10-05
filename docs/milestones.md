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

**Closed user stories:** Пока не закрываются

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

**Closed user stories:** Пока не закрываются

---

## Milestone 3 — Progress Review 1
**Period:** Week 4–6 (28 Sep – 18 Oct 2026)

**Official milestone:** Progress Review 1

**Project work / deliverable:**
- ML & Receipt Processing Core

**Acceptance criteria:**
- Подготовлена high-level архитектура
- ML prototype принимает фото чека и распознаёт:
  - `merchant`
  - `date`
  - `total`
- Настроена загрузка receipt в MinIO
- Spring создаёт receipt и pre-signed URL
- Python Worker обрабатывает загруженный receipt
- Статусы проходят через:
  - `PENDING_UPLOAD → UPLOADED → PROCESSING → DONE/FAILED`
- Результат сохраняется в PostgreSQL

**Closed user stories:** `US-07`, `US-24`, `US-25`

---

## Milestone 4 — Expert Submissions Begin
**Period:** Week 7–9 (19 Oct – 8 Nov 2026)

**Official milestone:** Expert submissions begin

**Project work / deliverable:**
- Transactions, Categories & Authentication

**Acceptance criteria:**
- Работают registration/login
- Работает создание, редактирование и удаление транзакций
- Работает назначение категорий
- Поддерживаются custom/default categories
- Реализована история транзакций
- Работает фильтрация по дате и категории
- Есть поле `description`
- Реализованы recent transactions

**Closed user stories:**  
`US-01`, `US-02`, `US-03`, `US-04`, `US-05`, `US-06`, `US-11`, `US-12`, `US-13`, `US-14`, `US-15`, `US-16`, `US-23`

---

## Milestone 5 — Progress Review 2
**Period:** Week 10–12 (9–29 Nov 2026)

**Official milestone:** Progress Review 2 — includes complexity check

**Project work / deliverable:**
- Working MVP: Budgets, Goals & Financial Overview

**Acceptance criteria:**
- Работают бюджеты и отображение их progress
- Работают financial goals и отображение их progress
- Отображаются income/expense totals
- Реализован spending by category
- Есть общий financial overview
- Основные пользовательские сценарии доступны через UI и работают end-to-end
- К этому моменту реализована большая часть системы

**Closed user stories:**  
`US-08`, `US-09`, `US-10`, `US-17`, `US-18`, `US-19`, `US-20`, `US-21`, `US-22`
