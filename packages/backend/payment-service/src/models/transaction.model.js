const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true
  },
  course: {
    type: Schema.Types.ObjectId,
    index: true
  },
  type: {
    type: String,
    enum: ['course_purchase', 'subscription', 'refund'],
    required: true,
    index: true
  },
  amount: {
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
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending',
    required: true,
    index: true
  },
  paymentMethod: {
    type: {
      type: String,
      enum: ['card', 'paypal', 'bank_transfer']
    },
    last4: String,
    brand: String
  },
  stripePaymentIntentId: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  stripeChargeId: {
    type: String,
    sparse: true
  },
  subscription: {
    type: Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  metadata: {
    type: Map,
    of: String
  },
  failureReason: String,
  refundReason: String,
  refundedAt: Date,
  completedAt: Date
}, {
  timestamps: true
});

// Indexes
transactionSchema.index({ user: 1, status: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });

// Methods
transactionSchema.methods.markCompleted = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

transactionSchema.methods.markFailed = function(reason) {
  this.status = 'failed';
  this.failureReason = reason;
  return this.save();
};

transactionSchema.methods.refund = function(reason) {
  this.status = 'refunded';
  this.refundReason = reason;
  this.refundedAt = new Date();
  return this.save();
};

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;