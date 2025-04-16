# E-commerce API

A robust RESTful API for e-commerce applications built with Node.js, Express, and MongoDB.

## Overview

This project provides a complete backend solution for e-commerce websites with user authentication, product management, shopping cart functionality, and order processing. The API follows best practices including JWT authentication, input validation, and comprehensive error handling.

## Features

- **User Management**
  - Registration and authentication
  - JWT-based authorization
  - User profile management

- **Product Management**
  - Create, read, update, and delete products
  - Product categorization
  - Product search and filtering

- **Cart Functionality**
  - Add/remove items
  - Update quantities
  - Calculate totals

- **Order Processing**
  - Create orders from cart items
  - Order history
  - Order status tracking

- **Security**
  - Password hashing with bcrypt
  - JWT authentication
  - Input validation
  - Role-based access control

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **dotenv** - Environment variable management

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/ParthA164/Ecommerce-API.git
   cd Ecommerce-API
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   
   ```

4. Start the server:
   ```
   npm start
   ```

## API Endpoints

### Auth Routes
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### User Routes
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - Get all users (admin only)

### Product Routes
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create a product (admin only)
- `PUT /api/products/:id` - Update a product (admin only)
- `DELETE /api/products/:id` - Delete a product (admin only)

### Cart Routes
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:itemId` - Update cart item
- `DELETE /api/cart/:itemId` - Remove item from cart

### Order Routes
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status (admin only)

## Testing

Run tests using:
```
npm test
```

## Error Handling

The API implements comprehensive error handling with appropriate HTTP status codes and error messages. Common errors include:

- 400: Bad Request - Invalid input
- 401: Unauthorized - Authentication required
- 403: Forbidden - Insufficient permissions
- 404: Not Found - Resource not found
- 500: Internal Server Error - Server-side issues

## Authentication

The API uses JWT for authentication. Include the token in the Authorization header for protected routes:

```
Authorization: Bearer your_jwt_token
```

## Data Models

### User
- email (String, required)
- password (String, required)
- name (String)
- role (String: 'user' or 'admin')
- address (Object)

### Product
- name (String, required)
- description (String)
- price (Number, required)
- category (String)
- inStock (Number)
- image (String)

### Cart
- user (Reference to User)
- items (Array of product references with quantity)
- totalAmount (Number)

### Order
- user (Reference to User)
- items (Array of product references with quantity)
- totalAmount (Number)
- status (String: 'pending', 'processing', 'shipped', 'delivered')
- shippingAddress (Object)
- paymentMethod (String)



