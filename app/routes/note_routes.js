const express = require('express')
const passport = require('passport')
const Expense = require('../models/expense')
const customErrors = require('../../lib/custom_errors')
const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership
const removeBlanks = require('../../lib/remove_blank_fields')
const requireToken = passport.authenticate('bearer', { session: false })
const router = express.Router()


// POST /:expenseId
router.post('/notes/:expenseId', requireToken, (req, res, next) => {
    console.log(req.user)
    const note = req.body.note
    note.owner = req.user.id
    note.userName = req.user.username
    console.log('req.user.username in note create', req.user.username)
    console.log(note)
    const expenseId = req.params.expenseId
    
    Expense.findById(expenseId)
        .then(handle404)
        .then(expense => {
            console.log('this is the expense', expense)
            console.log('this is the note', note)
            expense.notes.push(note)

            return expense.save()
            
        })
        .then(expense => res.status(201).json({ expense: expense }))
        .catch(next)
})

// UPDATE
// PATCH /notes/:expenseId/:noteId
// router.patch('/notes/:expenseId/:noteId', requireToken, removeBlanks, (req, res, next) => {
// 	// delete req.body.note.owner
// const noteId = req.params.noteId
// const expenseId = req.params.expenseId

// 	Expense.findById(expenseId)
// 		.then(handle404)
// 		.then((expense) => {

//             console.log('noteId in update Note', noteId)

//             const note = expense.notes.id(noteId)

//             requireOwnership(req, note)

//             note.set(req.body.note)

// 			return expense.updateOne(req.body.expense)
//             // return expense.save()
// 		})
// 		.then(() => res.sendStatus(204))
//         .then(() => triggerRefresh())
// 		.catch(next)
// })



/// DELETE - Note Delete
router.delete('/notes/:expenseId/:noteId', requireToken, (req, res) => {
  const expenseId = req.params.expenseId
  const noteId = req.params.noteId

  Expense.findById(expenseId)
  .then(expense => {
      const note = expense.notes.id(noteId)
      requireOwnership(req, note)
      note.remove()
      return expense.save()
  })
  .then(() => res.sendStatus(204))
  .then(expense => {
      res.redirect(`/expenses/${expenseId}`)
  })
  .catch(err => {
      console.log(err)
  })
 
})

module.exports = router