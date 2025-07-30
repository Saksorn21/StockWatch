# replit.md

## Overview

This is a React Stock Tracking and Personal Portfolio Web Application built as a Single Page Application (SPA). The application allows users to search for stocks, view market indices, manage a personal portfolio, and calculate rebalancing strategies. It features a modern tech stack with React, TypeScript, TailwindCSS, and shadcn/ui components.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a full-stack architecture with a clear separation between frontend and backend:

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: TailwindCSS with shadcn/ui component library
- **State Management**: React Context API for portfolio state and React Query for server state
- **Build Tool**: Vite for development and bundling

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **API Structure**: RESTful API design (currently minimal, primarily for CORS proxy)
- **Storage**: In-memory storage for user data (extensible interface)

## Key Components

### Frontend Components
1. **Dashboard Page**: Stock search, market indices display, and stock charts
2. **Portfolio Page**: Portfolio management with CRUD operations for stocks
3. **Rebalance Page**: Portfolio rebalancing calculator
4. **UI Components**: Complete shadcn/ui component library for consistent design

### Backend Components
1. **Express Server**: Main application server with middleware setup
2. **Storage Interface**: Abstracted storage layer (currently in-memory, ready for database integration)
3. **Route Handlers**: API endpoints for future stock data proxy needs

### Shared Components
1. **Schema Definitions**: Zod schemas for data validation shared between frontend and backend
2. **Type Definitions**: TypeScript interfaces for stock, portfolio, and market data

## Data Flow

### Stock Data Flow
1. Frontend requests stock data from external APIs (Finnhub.io)
2. Data is fetched directly from client (CORS-enabled)
3. React Query manages caching and state synchronization
4. Data is transformed using Zod schemas for type safety

### Portfolio Data Flow
1. Portfolio data is stored locally using localStorage
2. Portfolio context provides centralized state management
3. Stock prices are refreshed from external APIs
4. Calculations (profit/loss, allocations) are performed client-side

### User Interface Flow
1. Wouter handles client-side routing between pages
2. Components communicate through React Context
3. Form data is validated using react-hook-form with Zod resolvers
4. UI state is managed locally within components

## External Dependencies

### APIs
- **Finnhub.io**: Stock quotes, company profiles, and market data
- **API Key**: Required for stock data access (configured via environment variables)

### Key Libraries
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight client-side routing
- **react-hook-form**: Form handling and validation
- **recharts**: Chart rendering for stock prices and portfolio allocation
- **@radix-ui**: Accessible UI components foundation
- **zod**: Schema validation and type inference

### UI Framework
- **shadcn/ui**: Pre-built component library
- **TailwindCSS**: Utility-first CSS framework
- **Lucide React**: Icon library

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite development server with HMR
- **TypeScript**: Strict type checking enabled
- **Path Aliases**: Configured for clean imports (@/, @shared/, @assets/)

### Production Build
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: esbuild bundles Express server to `dist/index.js`
- **Static Assets**: Frontend assets served by Express in production

### Database Integration
- **Drizzle ORM**: Configured for PostgreSQL integration
- **Migration Support**: Database schema migrations using Drizzle Kit
- **Environment**: DATABASE_URL environment variable for connection

### Key Configuration Files
- **vite.config.ts**: Frontend build configuration with aliases and plugins
- **tsconfig.json**: TypeScript configuration with path mapping
- **drizzle.config.ts**: Database ORM configuration
- **tailwind.config.ts**: CSS framework configuration

### Storage Evolution
The application is designed to migrate from localStorage to PostgreSQL:
- Current: In-memory storage with localStorage persistence
- Future: Drizzle ORM with PostgreSQL backend
- Interface: IStorage abstraction allows seamless transition