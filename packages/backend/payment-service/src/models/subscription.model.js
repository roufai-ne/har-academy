const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subscriptionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true
  },
  plan: {
    type: String,
    enum: ['basic', 'pro', 'enterprise'],
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'past_due', 'cancelled', 'expired', 'trialing'],
    default: 'active',
    required: true,
    index: true
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'EUR',
    uppercase: true
  },
  stripeSubscriptionId: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  stripeCustomerId: {
    type: String,
    index: true
  },
  stripePriceId: String,
  currentPeriodStart: {
    type: Date,
    required: true
  },
  currentPeriodEnd: {
    type: Date,
    required: true,
    index: true
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  cancelledAt: Date,
  cancelReason: String,
  trialStart: Date,
  trialEnd: Date,
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Indexes
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ currentPeriodEnd: 1, status: 1 });
subscriptionSchema.index({ plan: 1, status: 1 });

// Virtual for days remaining
subscriptionSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const diff = this.currentPeriodEnd - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Methods
subscriptionSchema.methods.isActive = function() {
  return this.status === 'active' && this.currentPeriodEnd > new Date();
};

subscriptionSchema.methods.cancel = function(reason) {
  this.cancelAtPeriodEnd = true;
  this.cancelledAt = new Date();
  this.cancelReason = reason;
  return this.save();
};

subscriptionSchema.methods.reactivate = function() {
  this.cancelAtPeriodEnd = false;
  this.cancelledAt = null;
  this.cancelReason = null;
  this.status = 'active';
  return this.save();
};

subscriptionSchema.methods.renew = function(periodEnd) {
  this.currentPeriodStart = this.currentPeriodEnd;
  this.currentPeriodEnd = periodEnd;
  this.status = 'active';
  return this.save();
};

// Statics
subscriptionSchema.statics.findActiveByUser = function(userId) {
  return this.findOne({
    user: userId,
    status: 'active',
    currentPeriodEnd: { $gt: new Date() }
  });
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;