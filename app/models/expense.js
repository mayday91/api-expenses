const mongoose = require('mongoose')
const noteSchema = require('./note')
const { Schema, model } = mongoose

const expenseSchema = new Schema({
  title: {
    type: String,
    trim: true,
    required: true
  },
  amount: {
      type: Number,
      required: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  category: {
    type: String,
    enum: ['utilities', 'housing', 'pet', 'entertainment', 'food', 'travel', 'savings', 'investment', 'loan', 'personal', 'healthcare', 'debt', 'credit', 'tech', 'misc.', 'test', 'clothing', 'kicks'],
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  notes: 
    [noteSchema],
  updated: {
    type: Date,
    default: Date.now
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: {
    type: String,
    required: true
  }
})


module.exports = model('Expense', expenseSchema)
