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
    note.userName = req.user.email
    console.log(req.user.email)
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