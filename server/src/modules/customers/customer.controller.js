const Customer    = require('./customer.model');
const catchAsync  = require('../../shared/utils/catchAsync');
const apiResponse = require('../../shared/utils/apiResponse');
const paginate    = require('../../shared/utils/paginate');

// ─── Create ───────────────────────────────────────────────────────────────────

exports.create = catchAsync(async (req, res) => {
  // Check for duplicate phone number
  const existingCustomer = await Customer.findByPhone(req.body.phone);
  if (existingCustomer) {
    return apiResponse(res, 409, 'A customer with this phone number already exists.');
  }

  const customerData = {
    ...req.body,
    createdBy: req.user?._id,
    updatedBy: req.user?._id
  };

  const customer = await Customer.create(customerData);
  
  // Populate user details for response
  await customer.populate('createdBy', 'name email');
  
  return apiResponse(res, 201, 'Customer created successfully.', { customer });
});

// ─── List ─────────────────────────────────────────────────────────────────────

exports.list = catchAsync(async (req, res) => {
  const filter = { isActive: true };

  // Basic search functionality
  if (req.query.search) {
    filter.$or = [
      { name: new RegExp(req.query.search, 'i') },
      { companyName: new RegExp(req.query.search, 'i') },
      { phone: new RegExp(req.query.search, 'i') },
      { email: new RegExp(req.query.search, 'i') }
    ];
  }

  // Filter by type
  if (req.query.type) {
    filter.type = req.query.type;
  }

  // Filter by city
  if (req.query.city) {
    filter['address.city'] = new RegExp(req.query.city, 'i');
  }

  // Filter by state
  if (req.query.state) {
    filter['address.state'] = new RegExp(req.query.state, 'i');
  }

  // Filter by verification status
  if (req.query.isVerified !== undefined) {
    filter.isVerified = req.query.isVerified === 'true';
  }

  const result = await paginate(Customer, filter, req.query, ['createdBy', 'updatedBy']);
  return apiResponse(res, 200, 'Customers retrieved successfully.', result.data, result.meta);
});

// ─── Advanced Search ─────────────────────────────────────────────────────────

exports.search = catchAsync(async (req, res) => {
  const {
    query,
    type,
    city,
    state,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const customers = await Customer.searchCustomers(query, {
    type,
    city,
    state,
    page: parseInt(page),
    limit: parseInt(limit),
    sortBy,
    sortOrder
  });

  const total = await Customer.countDocuments({
    isActive: true,
    ...(type && { type }),
    ...(city && { 'address.city': new RegExp(city, 'i') }),
    ...(state && { 'address.state': new RegExp(state, 'i') }),
    ...(query && {
      $or: [
        { name: new RegExp(query, 'i') },
        { companyName: new RegExp(query, 'i') },
        { phone: new RegExp(query, 'i') },
        { email: new RegExp(query, 'i') }
      ]
    })
  });

  return apiResponse(res, 200, 'Customers searched successfully.', {
    customers,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  });
});

// ─── Get one ─────────────────────────────────────────────────────────────────

exports.getOne = catchAsync(async (req, res) => {
  const customer = await Customer.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');
    
  if (!customer || !customer.isActive) {
    return apiResponse(res, 404, 'Customer not found.');
  }

  return apiResponse(res, 200, 'Customer retrieved successfully.', { customer });
});

// ─── Update ───────────────────────────────────────────────────────────────────

exports.update = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body, updatedBy: req.user?._id };

  // Check if phone number is being updated and if it already exists
  if (updateData.phone) {
    const existingCustomer = await Customer.findOne({ 
      phone: updateData.phone, 
      _id: { $ne: id },
      isActive: true 
    });
    if (existingCustomer) {
      return apiResponse(res, 409, 'A customer with this phone number already exists.');
    }
  }

  const customer = await Customer.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate('createdBy updatedBy', 'name email');

  if (!customer || !customer.isActive) {
    return apiResponse(res, 404, 'Customer not found.');
  }

  return apiResponse(res, 200, 'Customer updated successfully.', { customer });
});

// ─── Soft delete ──────────────────────────────────────────────────────────────

exports.remove = catchAsync(async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    { 
      isActive: false,
      updatedBy: req.user?._id
    },
    { new: true }
  );

  if (!customer) {
    return apiResponse(res, 404, 'Customer not found.');
  }

  return apiResponse(res, 200, 'Customer deactivated successfully.');
});

// ─── Find by Phone ────────────────────────────────────────────────────────────

exports.findByPhone = catchAsync(async (req, res) => {
  const { phone } = req.params;
  
  const customer = await Customer.findByPhone(phone)
    .populate('createdBy', 'name email');

  if (!customer) {
    return apiResponse(res, 404, 'Customer not found with this phone number.');
  }

  return apiResponse(res, 200, 'Customer found.', { customer });
});

// ─── Add Tag ─────────────────────────────────────────────────────────────────

exports.addTag = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { tag } = req.body;

  const customer = await Customer.findById(id);
  if (!customer || !customer.isActive) {
    return apiResponse(res, 404, 'Customer not found.');
  }

  if (customer.tags.includes(tag)) {
    return apiResponse(res, 409, 'Tag already exists for this customer.');
  }

  await customer.addTag(tag);
  await customer.populate('createdBy updatedBy', 'name email');

  return apiResponse(res, 200, 'Tag added successfully.', { customer });
});

// ─── Remove Tag ──────────────────────────────────────────────────────────────

exports.removeTag = catchAsync(async (req, res) => {
  const { id, tag } = req.params;

  const customer = await Customer.findById(id);
  if (!customer || !customer.isActive) {
    return apiResponse(res, 404, 'Customer not found.');
  }

  if (!customer.tags.includes(tag)) {
    return apiResponse(res, 404, 'Tag not found for this customer.');
  }

  await customer.removeTag(tag);
  await customer.populate('createdBy updatedBy', 'name email');

  return apiResponse(res, 200, 'Tag removed successfully.', { customer });
});

// ─── Update Credit Limit ──────────────────────────────────────────────────────

exports.updateCreditLimit = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { creditLimit, reason } = req.body;

  const customer = await Customer.findById(id);
  if (!customer || !customer.isActive) {
    return apiResponse(res, 404, 'Customer not found.');
  }

  if (customer.type !== 'B2B') {
    return apiResponse(res, 400, 'Credit limit can only be set for B2B customers.');
  }

  const oldCreditLimit = customer.creditLimit;
  customer.creditLimit = creditLimit;
  customer.updatedBy = req.user?._id;
  
  await customer.save();
  await customer.populate('createdBy updatedBy', 'name email');

  // Log the credit limit change (you might want to create a separate audit log)
  console.log(`Credit limit updated for customer ${customer._id}: ${oldCreditLimit} -> ${creditLimit}. Reason: ${reason}`);

  return apiResponse(res, 200, 'Credit limit updated successfully.', { 
    customer,
    oldCreditLimit,
    newCreditLimit: creditLimit,
    reason
  });
});

// ─── Get Customer Statistics ───────────────────────────────────────────────────

exports.getStats = catchAsync(async (req, res) => {
  const [
    totalCustomers,
    b2bCustomers,
    b2cCustomers,
    verifiedCustomers,
    recentCustomers
  ] = await Promise.all([
    Customer.countDocuments({ isActive: true }),
    Customer.countDocuments({ isActive: true, type: 'B2B' }),
    Customer.countDocuments({ isActive: true, type: 'B2C' }),
    Customer.countDocuments({ isActive: true, isVerified: true }),
    Customer.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name companyName type phone createdAt')
      .lean()
  ]);

  const topCities = await Customer.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$address.city', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  return apiResponse(res, 200, 'Customer statistics retrieved successfully.', {
    totalCustomers,
    b2bCustomers,
    b2cCustomers,
    verifiedCustomers,
    verificationRate: totalCustomers > 0 ? ((verifiedCustomers / totalCustomers) * 100).toFixed(2) : 0,
    recentCustomers,
    topCities
  });
});

// ─── Bulk Operations ─────────────────────────────────────────────────────────

exports.bulkUpdate = catchAsync(async (req, res) => {
  const { customerIds, updateData } = req.body;

  if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
    return apiResponse(res, 400, 'Customer IDs array is required.');
  }

  if (!updateData || Object.keys(updateData).length === 0) {
    return apiResponse(res, 400, 'Update data is required.');
  }

  updateData.updatedBy = req.user?._id;

  const result = await Customer.updateMany(
    { 
      _id: { $in: customerIds },
      isActive: true
    },
    { $set: updateData },
    { runValidators: true }
  );

  return apiResponse(res, 200, 'Customers updated successfully.', {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount
  });
});

// ─── Export Customers ─────────────────────────────────────────────────────────

exports.export = catchAsync(async (req, res) => {
  const { type, city, state, format = 'json' } = req.query;
  
  const filter = { isActive: true };
  if (type) filter.type = type;
  if (city) filter['address.city'] = new RegExp(city, 'i');
  if (state) filter['address.state'] = new RegExp(state, 'i');

  const customers = await Customer.find(filter)
    .populate('createdBy', 'name email')
    .select('name companyName type phone email address gst pan creditLimit isActive createdAt')
    .sort({ createdAt: -1 })
    .lean();

  if (format === 'csv') {
    // Convert to CSV format (you might want to use a library like csv-writer)
    const csv = customers.map(c => ({
      Name: c.name,
      'Company Name': c.companyName || '',
      Type: c.type,
      Phone: c.phone,
      Email: c.email || '',
      Address: `${c.address.line1}, ${c.address.city}, ${c.address.state} ${c.address.pincode}`,
      GST: c.gst || '',
      PAN: c.pan || '',
      'Credit Limit': c.creditLimit || 0,
      'Created Date': c.createdAt.toISOString().split('T')[0]
    }));

    return apiResponse(res, 200, 'Customers exported successfully.', { 
      data: csv,
      format: 'csv'
    });
  }

  return apiResponse(res, 200, 'Customers exported successfully.', { 
    customers,
    format: 'json'
  });
});

// ─── Update Order Statistics ─────────────────────────────────────────────────────

exports.updateOrderStats = catchAsync(async (req, res) => {
  const { id } = req.params;

  const customer = await Customer.findById(id);
  if (!customer || !customer.isActive) {
    return apiResponse(res, 404, 'Customer not found.');
  }

  await customer.updateOrderStats();
  await customer.populate('createdBy updatedBy', 'name email');

  return apiResponse(res, 200, 'Order statistics updated successfully.', { customer });
});
