# E-commerce Full Stack Application

## Overview

This is a modern full-stack e-commerce application built with React, TypeScript, and Express.js. The application features a complete shopping cart system, product catalog, and order management functionality. It uses a PostgreSQL database with Drizzle ORM for data persistence and includes comprehensive UI components using shadcn/ui.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and dark mode support
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **API Design**: RESTful API with JSON responses
- **Session Management**: Express sessions with PostgreSQL session store

## Key Components

### Database Schema
The application uses a well-structured relational database with the following main entities:
- **Users**: Authentication and user management
- **Categories**: Product categorization system
- **Products**: Core product catalog with pricing, ratings, and inventory
- **Carts**: Shopping cart functionality with session-based storage
- **Cart Items**: Individual items within shopping carts
- **Orders**: Order management and history
- **Order Items**: Detailed order line items

### API Endpoints
- `GET /api/categories` - Fetch product categories
- `GET /api/products` - Fetch products with filtering options
- `GET /api/cart` - Get current user's cart
- `POST /api/cart/add` - Add items to cart
- `PUT /api/cart/items/:id` - Update cart item quantities
- `DELETE /api/cart/items/:id` - Remove items from cart
- `POST /api/orders` - Create new orders (checkout)

### Frontend Components
- **ProductCard**: Displays individual products with ratings, pricing, and add-to-cart functionality
- **CartSidebar**: Slide-out cart management interface
- **CheckoutModal**: Multi-step checkout process with form validation
- **ProductFilters**: Advanced filtering by category, price range, and ratings
- **Header**: Navigation with search and cart functionality
- **Footer**: Complete footer with links and contact information

## Data Flow

1. **Product Browsing**: Users can view products with real-time filtering and pagination
2. **Cart Management**: Session-based cart storage allows anonymous shopping
3. **Search & Filter**: Real-time search with category and price range filters
4. **Checkout Process**: Multi-step checkout with customer information and payment method selection
5. **Order Processing**: Orders are created with detailed item information and customer data

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM, React Hook Form)
- TanStack Query for server state management
- Radix UI primitives for accessible components
- Tailwind CSS for styling
- Zod for schema validation
- Date-fns for date formatting
- Lucide React for icons

### Backend Dependencies
- Express.js for server framework
- Drizzle ORM for database operations
- Neon Database serverless driver
- Connect-pg-simple for session storage
- Zod for request validation

## Deployment Strategy

The application is configured for deployment on Replit with:
- **Development**: `npm run dev` - Runs both frontend and backend in development mode
- **Build**: `npm run build` - Creates optimized production builds
- **Production**: `npm run start` - Serves the built application
- **Database**: Uses Neon Database for PostgreSQL hosting
- **Environment**: Configured for Replit's autoscale deployment target

The build process:
1. Frontend is built with Vite and output to `dist/public`
2. Backend is bundled with esbuild and output to `dist/index.js`
3. Static files are served by Express in production

## Changelog
- June 14, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.