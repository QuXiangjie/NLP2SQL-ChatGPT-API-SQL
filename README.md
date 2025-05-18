# 🧠 ChatGPT-powered NLP2SQL System

A web-based application that allows users to **upload Excel files**, **ask natural language questions**, and receive automatically generated SQL queries powered by **ChatGPT API**, all using **Node.js**, **Express**, **EJS**, and **JavaScript**. The backend supports database login, SQL query execution, and data preview — perfect for turning non-technical Excel users into database query pros.

---

## 📦 Features

- 🗂 Upload Excel files and preview content (headers + top 5 rows).
- 🧾 Use ChatGPT API to generate SQL queries from natural language.
- 🧪 Execute SQL queries directly from the interface.
- 💾 Store and manage Excel and SQL query history with MongoDB.
- 🖼 View detailed query and sheet data using EJS templates.

---

## 🛠 Tech Stack

| Layer           | Technologies                                 |
|----------------|----------------------------------------------|
| Frontend        | HTML, CSS, JavaScript, EJS                  |
| Backend         | Node.js, Express                            |
| Database        | MongoDB (Excel & Query Storage), MS SQL Server (Data Source) |
| AI Service      | OpenAI ChatGPT API                          |
| File Handling   | `multer`, `xlsx` for parsing Excel          |
| DB Connection   | `msnodesqlv8` for SQL Server                |

---

## Start
```bash
git clone https://github.com/yourusername/nlp2sql.git
cd nlp2sql


