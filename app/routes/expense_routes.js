// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')
// dotenv
require("dotenv").config()
// pull in Mongoose model for expenses
const Expense = require('../models/expense')
// require axios
const axios = require("axios")
// this is a collection of methods that help us detect situations when we need to throw a custom error
const customErrors = require('../../lib/custom_errors')
// this function sends 404 when nonexistent document is requested
const handle404 = customErrors.handle404
// this function sends 401 when user tries to modify a resource owned by someone else
const requireOwnership = customErrors.requireOwnership
// this is middleware that will remove blank fields from `req.body`, e.g.
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router
const router = express.Router()


// INDEX - GET /expenses
router.get('/expenses', (req, res, next) => {
	Expense.find()
		.then((expenses) => {
			return expenses.map((expense) => expense.toObject())
		})
		.then((expenses) => res.status(200).json({ expenses: expenses }))
		.catch(next)
})

// SHOW - GET /expenses/:id
router.get('/expenses/:id', (req, res, next) => {
	Expense.findById(req.params.id)
		.then(handle404)
		.then((expense) => {
			// Error: Mongoose does not support calling populate() on nested docs. Instead of `doc.arr[0].populate("path")`, use `doc.populate("arr.0.path")`
			const myExpense = expense

			console.log('myExpense before populate', myExpense)

			// myexpense.notes.forEach((comment, commentIndex) => 
			// myexpense.populate())
			Expense.populate(myExpense.notes, {'path': 'owner'})

			console.log('myExpense after populate', myExpense)

			console.log('Trying to see if we populated, will return boolean if so', myExpense.populated('notes[0].owner'))

			console.log('notes inside of myExpense in show expenses', myExpense.notes)

			return myExpense
		})
		.then((expense) => res.status(200).json({ expense: expense.toObject() }))
		.catch(next)
})

// CREATE - POST /expenses
router.post('/expenses', requireToken, (req, res, next) => {
	req.body.expense.owner = req.user._id
	const expense = req.body.expense
	expense.userName = req.user.username
  console.log('expense in create expense', expense)
	Expense.create(req.body.expense)
		.then((expense) => {
      console.log('expense created', expense)
			res.status(201).json({ expense: expense.toObject() })
		})
		.catch(next)
})

// UPDATE
// PATCH /expenses/:id
router.patch('/expenses/:id', requireToken, removeBlanks, (req, res, next) => {
	delete req.body.expense.owner

	Expense.findById(req.params.id)
		.then(handle404)
		.then((expense) => {
			requireOwnership(req, expense)
			return expense.updateOne(req.body.expense)
		})
		.then(() => res.sendStatus(204))
		.catch(next)
})

// DESTROY - DELETE /expenses/:id
router.delete('/expenses/:id', requireToken, (req, res, next) => {
	Expense.findById(req.params.id)
		.then(handle404)
		.then((expense) => {
			requireOwnership(req, expense)
			expense.deleteOne()
		})
		.then(() => res.sendStatus(204))
		.catch(next)
})

module.exports = router
