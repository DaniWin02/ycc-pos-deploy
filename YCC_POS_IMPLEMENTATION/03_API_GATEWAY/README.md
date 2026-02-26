# YCC POS API Gateway

Backend API Gateway for the YCC POS system with comprehensive business logic, authentication, and data management.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Sales Management**: Complete sales flow with inventory deduction
- **Inventory Management**: Stock tracking, valuation, and low-stock alerts
- **Recipe Costing**: Food cost calculation and BOM resolution
- **Reporting**: Sales, inventory, and financial reports
- **Testing**: Comprehensive unit and integration tests with >80% coverage

## 📋 Services

### Core Services
- **AuthService**: User authentication, token management, role verification
- **SalesService**: Sales creation, cancellation, statistics, and reporting
- **InventoryService**: Stock management, valuation, and movement tracking
- **RecipeCostService**: Recipe costing, cost analysis, and variation tracking
- **BomResolverService**: Bill of Materials resolution and cost calculation

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Token refresh
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

#### Menu/Products
- `GET /api/menu/products` - List active products
- `GET /api/menu/products/:id` - Get product details
- `POST /api/menu/products` - Create product (Admin only)
- `PUT /api/menu/products/:id` - Update product (Admin only)
- `DELETE /api/menu/products/:id` - Deactivate product (Admin only)

#### Sales
- `POST /api/sales` - Create sale
- `GET /api/sales` - Get sales by period
- `POST /api/sales/:id/cancel` - Cancel sale
- `GET /api/sales/stats` - Get sales statistics

#### Inventory
- `GET /api/inventory/value` - Get inventory valuation
- `GET /api/inventory/low-stock` - Get low stock products
- `POST /api/inventory/update-cost` - Update average cost
- `GET /api/inventory/movements` - Get inventory movements
- `GET /api/inventory/fast-moving` - Get fast moving products

#### Recipes & Costing
- `GET /api/recipes/:id/cost` - Get recipe cost
- `GET /api/recipes/cost` - Get multiple recipe costs
- `GET /api/bom/:recipeId/resolve` - Resolve BOM

#### Reports
- `GET /api/reports/sales` - Sales reports
- `GET /api/reports/inventory` - Inventory reports
- `GET /api/reports/dashboard` - Dashboard data

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL
- Prisma CLI

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database URL and JWT secrets
```

3. Set up database:
```bash
npx prisma migrate dev
npx prisma generate
```

4. Start development server:
```bash
pnpm dev
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Test Structure
- **Unit Tests**: Individual service testing
- **Integration Tests**: End-to-end API testing
- **Coverage**: >80% global, >90% for critical services

### Test Files
```
test/
├── unit/
│   ├── auth.service.spec.ts
│   ├── sales.service.spec.ts
│   ├── inventory.service.spec.ts
│   ├── recipe-cost.spec.ts
│   └── bom-resolver.spec.ts
├── integration/
│   ├── auth.e2e.spec.ts
│   ├── menu.e2e.spec.ts
│   ├── sales.e2e.spec.ts
│   ├── inventory.e2e.spec.ts
│   └── reports.e2e.spec.ts
└── factories/
    ├── user.factory.ts
    ├── product.factory.ts
    ├── recipe.factory.ts
    └── index.ts
```

## 📊 API Documentation

### Authentication
All protected endpoints require a valid JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

### Role-Based Access
- **ADMIN**: Full access to all endpoints
- **MANAGER**: Sales and inventory access
- **CASHIER**: Sales operations only

### Error Responses
```json
{
  "error": "Error message"
}
```

### Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 🔧 Configuration

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - Refresh token secret
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Allowed CORS origins

### Database Schema
The API uses Prisma ORM with the following main models:
- `User` - User accounts and authentication
- `Product` - Menu items and inventory
- `Recipe` - Recipe definitions
- `Sale` - Sales transactions
- `SaleItem` - Line items in sales
- `RecipeIngredient` - Recipe ingredients

## 🚀 Deployment

### Build
```bash
pnpm build
```

### Start Production Server
```bash
pnpm start
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

## 📈 Performance

- **Response Time**: <200ms for most endpoints
- **Database**: Optimized queries with proper indexing
- **Caching**: JWT token caching for frequent requests
- **Rate Limiting**: Built-in protection for API endpoints

## 🔒 Security

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **CORS Protection**: Configurable origin whitelist
- **Helmet.js**: Security headers and protections
- **Input Validation**: Joi schemas for request validation

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📞 Support

For support and questions, please contact the YCC POS team.
