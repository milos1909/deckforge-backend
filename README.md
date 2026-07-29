# DeckForge Backend

Backend REST API for **DeckForge**, a web platform designed to support Yu-Gi-Oh! players with deck building, card browsing, collection management, and shop functionality.

This repository contains the server-side application responsible for handling business logic, database communication, authentication, and API endpoints.

## Features

- REST API for managing cards and card sets
- Card search and filtering functionality
- Card set information management
- Deck creation and management
- Public deck browsing
- User collection management
- User authentication and authorization
- Shop functionality for purchasing cards and card sets
- Invoice generation and management
- Database integration and data persistence

## Technologies

- Node.js
- Express.js
- TypeScript
- TypeORM
- MySQL
- JWT Authentication
- Bun

## API

The backend provides REST API endpoints used by the DeckForge frontend application.

Main functionality includes:

- User management
- Card and set management
- Deck management
- Collection management
- Shop and invoice management

## Database

The application uses a relational database for storing application data.

Main entities include:

- User
- Card
- Set
- Deck
- DeckCard
- Invoice
- InvoiceItem

## Frontend

This backend API is consumed by the DeckForge frontend application.

[DeckForge Frontend](https://github.com/milos1909/deckforge-frontend)

## Project Setup

### Install dependencies

```sh
bun install
```

### Environment Configuration

Create a `.env` file and configure the required environment variables.

Example:

```env
DATABASE_HOST=
DATABASE_PORT=
DATABASE_USERNAME=
DATABASE_PASSWORD=
DATABASE_NAME=
JWT_SECRET=
```

### Run Development Server

```sh
bun run dev
```

### Build for Production

```sh
bun run build
```
