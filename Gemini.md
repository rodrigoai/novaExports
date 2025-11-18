# Project: export-metas-nova-pay

This project is a web application designed to fetch, display, and filter a list of "alunos" (students) which are represented as "orders" from a "Nova Pay" API.

## Core Functionality:

### Backend (Node.js/Express):

*   Acts as a proxy or intermediary to communicate with the Nova Pay API.
*   It exposes a single API endpoint: `/api/orders`.
*   This endpoint fetches order data from `https://{{tenant}}.pay.nova.money/api/v1/orders`.
*   It requires `NOVA_TOKEN` and `NOVA_TENANT` environment variables for authentication and to specify the tenant.
*   It handles API pagination to retrieve all order records.
*   It sanitizes the fetched data by removing certain fields (`gateway_id`, `company`, `items`, and meta fields starting with `_`).

### Frontend (HTML/CSS/JavaScript):

*   Provides a user interface to view and interact with the order data.
*   The main page (`public/index.html`) is titled "Relatório de Alunos" (Student Report).
*   Users can filter orders by status (`paid`, `pending`, `failed`, `canceled`, `all`) and by a date range (`initial_date`, `final_date`).
*   The frontend makes requests to its own backend (`/api/orders`) to get the data.
*   The data is displayed in a dynamic HTML table.
*   The table columns include `ID`, `Data`, `Cliente`, `Documento`, `Valor`, and `Status`.
*   It also dynamically adds columns for student information (`Aluno 1`, `Série 1`, `Turma 1`, etc.) based on the `meta` field of the orders.
*   The frontend includes sorting functionality on the table columns.
*   It uses `tailwindcss` for styling.
*   The `public/js/main.js` file contains the core frontend logic for fetching data, rendering the table, handling filtering, and sorting.
*   The `public/js/formatters.js` likely contains functions to format dates, currency, and other data for display.

## Project Rules/Conventions:

*   **Environment Variables:** The application relies on a `.env` file to store the `NOVA_TOKEN` and `NOVA_TENANT`. These are crucial for the application to function.
*   **API Abstraction:** The frontend does not directly communicate with the Nova Pay API. All communication is proxied through the backend. This is a good practice for security (hiding the API token) and control.
*   **Data Sanitization:** A specific set of keys are removed from the data before being sent to the frontend. This suggests that the frontend doesn't need all the data from the Nova Pay API.
*   **Modular Code:** The code is organized into modules. Server logic is in `index.js`, API interaction in `utils/api.js`, helper functions in `utils/helpers.js`, and frontend logic in `public/js/main.js` and `public/js/formatters.js`.
*   **Dynamic Table Generation:** The frontend table is generated dynamically from the data, which allows for flexibility in the data structure.
