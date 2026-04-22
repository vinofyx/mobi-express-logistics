const Customer = require('./customer.model');
const Pickup = require('../pickups/pickup.model');

/**
 * Customer Service - Business logic for customer operations
 * Handles integration with other modules like pickups
 */

class CustomerService {
  
  /**
   * Get customer with pickup history
   * @param {string} customerId - Customer ID
   * @returns {Promise<Object>} Customer with pickup history
   */
  static async getCustomerWithPickupHistory(customerId) {
    const customer = await Customer.findById(customerId)
      .populate('createdBy updatedBy', 'name email');
    
    if (!customer || !customer.isActive) {
      throw new Error('Customer not found');
    }

    const pickups = await Pickup.find({ 
      customer: customerId,
      isActive: true 
    })
    .populate('assignedAgent', 'name email')
    .populate('parcels')
    .sort({ createdAt: -1 })
    .limit(10);

    return {
      ...customer.toObject(),
      recentPickups: pickups,
      pickupStats: await this.getCustomerPickupStats(customerId)
    };
  }

  /**
   * Get customer pickup statistics
   * @param {string} customerId - Customer ID
   * @returns {Promise<Object>} Pickup statistics
   */
  static async getCustomerPickupStats(customerId) {
    const stats = await Pickup.aggregate([
      { $match: { customer: mongoose.Types.ObjectId(customerId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          lastPickup: { $max: '$createdAt' }
        }
      }
    ]);

    const totalPickups = await Pickup.countDocuments({ 
      customer: customerId 
    });

    const result = {
      totalPickups,
      statusBreakdown: {},
      lastPickupDate: null
    };

    stats.forEach(stat => {
      result.statusBreakdown[stat._id] = stat.count;
      if (!result.lastPickupDate || stat.lastPickup > result.lastPickupDate) {
        result.lastPickupDate = stat.lastPickup;
      }
    });

    return result;
  }

  /**
   * Check if customer can create new pickup
   * Validates credit limits, outstanding balance, etc.
   * @param {string} customerId - Customer ID
   * @param {number} estimatedValue - Estimated value of pickup
   * @returns {Promise<Object>} Validation result
   */
  static async validateCustomerForPickup(customerId, estimatedValue = 0) {
    const customer = await Customer.findById(customerId);
    
    if (!customer || !customer.isActive) {
      return {
        canCreatePickup: false,
        reason: 'Customer not found or inactive'
      };
    }

    // For B2B customers, check credit limit
    if (customer.type === 'B2B') {
      const availableCredit = customer.creditLimit - customer.outstandingBalance;
      if (estimatedValue > availableCredit) {
        return {
          canCreatePickup: false,
          reason: `Insufficient credit limit. Available: ₹${availableCredit}, Required: ₹${estimatedValue}`,
          availableCredit,
          requiredCredit: estimatedValue
        };
      }
    }

    // Check if customer has too many pending pickups
    const pendingPickups = await Pickup.countDocuments({
      customer: customerId,
      status: { $in: ['REQUESTED', 'SCHEDULED', 'ASSIGNED'] }
    });

    if (pendingPickups >= 10) { // Configurable limit
      return {
        canCreatePickup: false,
        reason: 'Too many pending pickups. Please complete existing pickups first.',
        pendingPickups
      };
    }

    return {
      canCreatePickup: true,
      customerType: customer.type,
      availableCredit: customer.type === 'B2B' ? customer.creditLimit - customer.outstandingBalance : null
    };
  }

  /**
   * Create pickup for customer with validation
   * @param {string} customerId - Customer ID
   * @param {Object} pickupData - Pickup data
   * @param {string} userId - User creating the pickup
   * @returns {Promise<Object>} Created pickup
   */
  static async createPickupForCustomer(customerId, pickupData, userId) {
    // Validate customer first
    const validation = await this.validateCustomerForPickup(
      customerId, 
      pickupData.estimatedValue || 0
    );

    if (!validation.canCreatePickup) {
      throw new Error(validation.reason);
    }

    // Get customer details
    const customer = await Customer.findById(customerId);
    
    // Use customer's default address if no pickup address provided
    if (!pickupData.address) {
      pickupData.address = customer.address;
    }

    // Create pickup
    const pickup = await Pickup.create({
      ...pickupData,
      customer: customerId,
      createdBy: userId
    });

    // Update customer order statistics
    await customer.updateOrderStats();

    return pickup;
  }

  /**
   * Get customers due for follow-up
   * Customers with no recent pickups or high-value customers
   * @param {Object} options - Query options
   * @returns {Promise<Array>} List of customers
   */
  static async getCustomersForFollowUp(options = {}) {
    const {
      daysSinceLastPickup = 30,
      minOrderValue = 5000,
      customerType = null,
      limit = 50
    } = options;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysSinceLastPickup);

    const filter = {
      isActive: true,
      $or: [
        { lastOrderDate: { $lt: cutoffDate } },
        { lastOrderDate: { $exists: false } }
      ]
    };

    if (customerType) {
      filter.type = customerType;
    }

    if (minOrderValue) {
      filter.totalOrders = { $gte: minOrderValue };
    }

    return await Customer.find(filter)
      .sort({ lastOrderDate: 1, totalOrders: -1 })
      .limit(limit)
      .populate('createdBy', 'name email');
  }

  /**
   * Update customer outstanding balance
   * Called when pickup is completed or invoiced
   * @param {string} customerId - Customer ID
   * @param {number} amount - Amount to add to outstanding balance
   * @param {string} reason - Reason for the update
   * @returns {Promise<Object>} Updated customer
   */
  static async updateOutstandingBalance(customerId, amount, reason) {
    const customer = await Customer.findById(customerId);
    
    if (!customer) {
      throw new Error('Customer not found');
    }

    if (customer.type !== 'B2B') {
      throw new Error('Outstanding balance is only applicable for B2B customers');
    }

    customer.outstandingBalance += amount;
    
    // Log the balance change (implement audit log as needed)
    console.log(`Outstanding balance updated for customer ${customerId}: +${amount}. Reason: ${reason}`);

    return await customer.save();
  }

  /**
   * Get customer analytics for dashboard
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Analytics data
   */
  static async getCustomerAnalytics(options = {}) {
    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      endDate = new Date()
    } = options;

    const [
      totalCustomers,
      newCustomers,
      activeCustomers, // Customers with pickups in date range
      topCustomers,
      customerTypeBreakdown
    ] = await Promise.all([
      Customer.countDocuments({ isActive: true }),
      Customer.countDocuments({ 
        isActive: true,
        createdAt: { $gte: startDate, $lte: endDate }
      }),
      Pickup.distinct('customer', {
        createdAt: { $gte: startDate, $lte: endDate }
      }).then(customers => customers.length),
      this.getTopCustomers(startDate, endDate, 10),
      Customer.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ])
    ]);

    return {
      totalCustomers,
      newCustomers,
      activeCustomers,
      topCustomers,
      customerTypeBreakdown: customerTypeBreakdown.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      period: { startDate, endDate }
    };
  }

  /**
   * Get top customers by pickup count or value
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {number} limit - Number of customers to return
   * @returns {Promise<Array>} Top customers
   */
  static async getTopCustomers(startDate, endDate, limit = 10) {
    return await Pickup.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$customer',
          pickupCount: { $sum: 1 },
          totalValue: { $sum: '$estimatedValue' } // If you have estimatedValue in pickups
        }
      },
      { $sort: { pickupCount: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customer'
        }
      },
      { $unwind: '$customer' },
      {
        $project: {
          customerId: '$_id',
          name: '$customer.name',
          companyName: '$customer.companyName',
          type: '$customer.type',
          phone: '$customer.phone',
          pickupCount: 1,
          totalValue: 1
        }
      }
    ]);
  }

  /**
   * Search customers by pickup patterns
   * @param {Object} criteria - Search criteria
   * @returns {Promise<Array>} Matching customers
   */
  static async searchCustomersByPickupPatterns(criteria) {
    const {
      pickupFrequency = 'high', // 'high', 'medium', 'low'
      averageValue = null,
      lastPickupAfter = null,
      lastPickupBefore = null
    } = criteria;

    // Build pickup query
    const pickupQuery = {};
    
    if (lastPickupAfter) {
      pickupQuery.createdAt = { $gte: lastPickupAfter };
    }
    
    if (lastPickupBefore) {
      pickupQuery.createdAt = pickupQuery.createdAt || {};
      pickupQuery.createdAt.$lte = lastPickupBefore;
    }

    // Get customer IDs based on pickup patterns
    const customerStats = await Pickup.aggregate([
      { $match: pickupQuery },
      {
        $group: {
          _id: '$customer',
          pickupCount: { $sum: 1 },
          avgValue: { $avg: '$estimatedValue' },
          lastPickup: { $max: '$createdAt' }
        }
      }
    ]);

    // Filter based on frequency and value
    let filteredCustomerIds = customerStats.map(stat => stat._id);

    if (pickupFrequency === 'high') {
      filteredCustomerIds = customerStats
        .filter(stat => stat.pickupCount >= 10)
        .map(stat => stat._id);
    } else if (pickupFrequency === 'medium') {
      filteredCustomerIds = customerStats
        .filter(stat => stat.pickupCount >= 5 && stat.pickupCount < 10)
        .map(stat => stat._id);
    } else if (pickupFrequency === 'low') {
      filteredCustomerIds = customerStats
        .filter(stat => stat.pickupCount < 5)
        .map(stat => stat._id);
    }

    if (averageValue) {
      filteredCustomerIds = customerStats
        .filter(stat => stat.avgValue >= averageValue)
        .map(stat => stat._id);
    }

    return await Customer.find({
      _id: { $in: filteredCustomerIds },
      isActive: true
    }).populate('createdBy', 'name email');
  }
}

module.exports = CustomerService;
