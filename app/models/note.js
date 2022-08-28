// import dependencies
const mongoose = require('mongoose')

const { Schema, model } = mongoose

const noteSchema = new Schema({
  body: {
    type: String,
    required: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  userName: {
    type: String,
    required: true
  }
},
{timestamps: true}
)

module.exports = noteSchema