const mongoose = require('mongoose')

const Schema = mongoose.Schema

const credentialSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  pwd: {
    type: String,
    required: true
  },
  domain: {
    type: String,
    required: true
  },
  user_id: {
    type: String,
    required: true
  }
}, { timestamps: true })

module.exports = mongoose.model('Credential', credentialSchema)