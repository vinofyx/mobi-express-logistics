# Customer Module Integration Guide

## Overview
This guide explains how to integrate the enhanced Customer module with other modules in the MobiExpress logistics system, particularly the Pickup module.

## 🏗️ Architecture

### Core Components
- **Customer Model** (`customer.model.js`) - Enhanced with B2B/B2C support, validation methods, and virtuals
- **Customer Controller** (`customer.controller.js`) - Comprehensive CRUD operations with business logic
- **Customer Service** (`customer.service.js`) - Business logic and integration layer
- **Customer Validator** (`customer.validator.js`) - Comprehensive validation schemas
- **Customer Routes** (`customer.routes.js`) - RESTful API endpoints

## 🔗 Pickup Module Integration

### 1. Customer-Pickup Relationship
The Pickup module already references customers, but we've enhanced this relationship:

```javascript
// In pickup.model.js
customer: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Customer',
  required: [true, 'Customer is required.'],
}
```

### 2. Integration Points

#### A. Customer Validation Before Pickup Creation
Use the `CustomerService.validateCustomerForPickup()` method:

```javascript
const CustomerService = require('../customers/customer.service');

// Before creating a pickup
const validation = await CustomerService.validateCustomerForPickup(
  customerId, 
  estimatedValue
);

if (!validation.canCreatePickup) {
  throw new Error(validation.reason);
}
```

#### B. Customer Statistics Update
After successful pickup creation:

```javascript
// In pickup controller
const customer = await Customer.findById(pickupData.customerId);
await customer.updateOrderStats();
```

#### C. Outstanding Balance Management
For B2B customers:

```javascript
// When pickup is completed/invoiced
await CustomerService.updateOutstandingBalance(
  customerId,
  invoiceAmount,
  'Pickup completed - Invoice #' + invoiceNumber
);
```

### 3. Enhanced Pickup Controller Integration

Add these methods to your pickup controller:

```javascript
const CustomerService = require('../customers/customer.service');

// Create pickup with customer validation
exports.create = catchAsync(async (req, res) => {
  const { customerId, ...pickupData } = req.body;
  
  // Validate customer
  const validation = await CustomerService.validateCustomerForPickup(
    customerId,
    pickupData.estimatedValue || 0
  );
  
  if (!validation.canCreatePickup) {
    return apiResponse(res, 400, validation.reason);
  }
  
  // Create pickup
  const pickup = await CustomerService.createPickupForCustomer(
    customerId,
    pickupData,
    req.user._id
  );
  
  return apiResponse(res, 201, 'Pickup created successfully.', { pickup });
});
```

## 📊 Analytics Integration

### Customer Dashboard Integration
Use the service methods to power your analytics:

```javascript
// Customer analytics for dashboard
const analytics = await CustomerService.getCustomerAnalytics({
  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  endDate: new Date()
});

// Top customers
const topCustomers = await CustomerService.getTopCustomers(
  startDate,
  endDate,
  10
);

// Customers needing follow-up
const followUpCustomers = await CustomerService.getCustomersForFollowUp({
  daysSinceLastPickup: 30,
  minOrderValue: 5000
});
```

## 🔧 API Endpoints Integration

### New Customer Endpoints
The customer module now provides these endpoints:

#### Basic CRUD
- `GET /api/v1/customers` - List with filtering
- `POST /api/v1/customers` - Create customer
- `GET /api/v1/customers/:id` - Get single customer
- `PATCH /api/v1/customers/:id` - Update customer
- `DELETE /api/v1/customers/:id` - Soft delete

#### Advanced Features
- `GET /api/v1/customers/search` - Advanced search
- `GET /api/v1/customers/stats` - Customer statistics
- `GET /api/v1/customers/export` - Export data
- `POST /api/v1/customers/bulk-update` - Bulk operations
- `GET /api/v1/customers/phone/:phone` - Find by phone

#### Tag Management
- `POST /api/v1/customers/:id/tags` - Add tag
- `DELETE /api/v1/customers/:id/tags/:tag` - Remove tag

#### Credit Management (B2B)
- `PATCH /api/v1/customers/:id/credit-limit` - Update credit limit

#### Order Integration
- `POST /api/v1/customers/:id/update-order-stats` - Update order stats

## 🔄 Workflow Integration

### 1. New Customer Onboarding
```
Customer Creation → Verification → Credit Limit Setup (B2B) → First Pickup
```

### 2. Pickup Request Workflow
```
Customer Search → Validation → Pickup Creation → Order Stats Update
```

### 3. B2B Credit Management
```
Credit Limit Check → Pickup Creation → Invoice Generation → Balance Update
```

## 📱 Frontend Integration

### Customer Search Component
```javascript
// API call for customer search
const searchCustomers = async (query, filters) => {
  const response = await fetch('/api/v1/customers/search?' + new URLSearchParams({
    query,
    type: filters.type,
    city: filters.city,
    page: filters.page,
    limit: filters.limit
  }));
  return response.json();
};
```

### Customer Validation
```javascript
// Check if customer can create pickup
const validateCustomer = async (customerId, estimatedValue) => {
  const response = await fetch(`/api/v1/customers/${customerId}/validate-pickup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estimatedValue })
  });
  return response.json();
};
```

## 🛡️ Security & Permissions

### Role-Based Access
- **Admin**: Full access to all customer operations
- **Operations Manager**: Can manage customers, update credit limits
- **Center Staff**: Can create/view customers, basic updates
- **Data Analyst**: Can view statistics and export data
- **System**: Can update order statistics

### Data Validation
- Phone number uniqueness enforced
- B2B specific validations (company name required)
- Credit limit validations for B2B customers
- Address format validation

## 📈 Performance Optimization

### Database Indexes
The customer model includes optimized indexes:
- Phone number (unique)
- Text search on name, company, city
- Compound indexes for type + status
- Location-based indexes

### Caching Strategy
```javascript
// Cache frequently accessed customers
const getCachedCustomer = async (customerId) => {
  const cacheKey = `customer:${customerId}`;
  let customer = await cache.get(cacheKey);
  
  if (!customer) {
    customer = await Customer.findById(customerId);
    await cache.set(cacheKey, customer, 3600); // 1 hour
  }
  
  return customer;
};
```

## 🔍 Monitoring & Logging

### Key Metrics to Track
- Customer creation rate
- B2B vs B2C ratio
- Credit limit utilization
- Pickup frequency per customer
- Customer retention rates

### Audit Logging
```javascript
// Log important customer operations
const auditLogger = require('../utils/auditLogger');

// In customer controller
exports.create = catchAsync(async (req, res) => {
  const customer = await Customer.create(customerData);
  
  await auditLogger.log({
    action: 'CUSTOMER_CREATED',
    userId: req.user._id,
    customerId: customer._id,
    details: { type: customer.type, phone: customer.phone }
  });
  
  return apiResponse(res, 201, 'Customer created.', { customer });
});
```

## 🚀 Deployment Considerations

### Database Migration
When deploying the enhanced customer model:

1. **Backup existing data**
2. **Run migration script** to add new fields:
```javascript
// Migration script
db.customers.updateMany(
  { type: { $exists: false } },
  { $set: { type: 'B2C' } }
);
```

3. **Update indexes** in production
4. **Validate data integrity**

### API Versioning
Consider versioning your customer APIs:
- `/api/v1/customers` - Current version
- `/api/v2/customers` - Future enhancements

## 🧪 Testing Integration

### Unit Tests
```javascript
// Test customer-pickup integration
describe('Customer-Pickup Integration', () => {
  test('should validate B2B customer credit limit', async () => {
    const customer = await Customer.create({
      type: 'B2B',
      name: 'Test Company',
      companyName: 'Test Corp',
      phone: '9876543210',
      creditLimit: 10000,
      address: { /* address */ }
    });
    
    const validation = await CustomerService.validateCustomerForPickup(
      customer._id,
      15000 // Exceeds credit limit
    );
    
    expect(validation.canCreatePickup).toBe(false);
    expect(validation.reason).toContain('Insufficient credit limit');
  });
});
```

### Integration Tests
```javascript
// Test full pickup workflow
test('should create pickup and update customer stats', async () => {
  const customer = await Customer.create(customerData);
  const initialOrders = customer.totalOrders;
  
  const pickup = await CustomerService.createPickupForCustomer(
    customer._id,
    pickupData,
    userId
  );
  
  expect(pickup.customer).toBe(customer._id);
  
  const updatedCustomer = await Customer.findById(customer._id);
  expect(updatedCustomer.totalOrders).toBe(initialOrders + 1);
});
```

## 📞 Support & Troubleshooting

### Common Issues
1. **Phone number conflicts** - Check for existing customers before creating
2. **Credit limit exceeded** - Validate before pickup creation
3. **B2B validation errors** - Ensure company name is provided
4. **Address format issues** - Use the provided validation schemas

### Debug Tips
- Enable debug logging for customer operations
- Monitor database query performance
- Check audit logs for customer changes
- Validate data integrity after migrations

## 🔄 Future Enhancements

### Planned Features
1. **Customer Loyalty Program** - Points and rewards system
2. **Automated Follow-ups** - Email/SMS notifications
3. **Advanced Analytics** - Predictive analytics for customer behavior
4. **Multi-location Support** - Customers with multiple addresses
5. **Integration with Payment Gateway** - Automated billing for B2B

### Scalability Considerations
- Implement read replicas for customer data
- Use Redis for session and cache management
- Consider sharding for large customer databases
- Implement API rate limiting

---

## 📞 Support

For integration support or questions:
1. Check this documentation first
2. Review the code comments in service files
3. Check the audit logs for troubleshooting
4. Contact the development team for complex issues

This integration guide ensures seamless connectivity between the Customer module and other components of your MobiExpress logistics system.
