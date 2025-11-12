# Actual Budget Transaction Categorizer

Uses local LLM to categorize Actual Budget transactions

## Pre-requisites

- Ensure Actual-Budget is running and accessible
- Ensure Ollama is running and accessible
  - Ensure you have at least 1 model installed
- `node` > v22.12.0

## Setup

1. Create a local `.env` file based off the `.env.example` file

    ```bash
    cp .env.example .env
    ```

2. Update `.env` with your own personal values

## Running locally

1. Install dependencies

    ```bash
    npm install
    ```

2. Run app

    ```bash
    npm run dev
    ```
