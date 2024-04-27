const express = require('express')
const {
  createCredential,
  getCredentials,
  getCredential,
  deleteCredential,
  updateCredential
} = require('../controllers/credentialController')
const requireAuth = require('../middleware/requireAuth')

const router = express.Router()

// require auth for all credential routes
router.use(requireAuth)

// GET all credentials
router.get('/', getCredentials)

//GET a single credential
router.get('/:id', getCredential)

// POST a new credential
router.post('/', createCredential)

// DELETE a credential
router.delete('/:id', deleteCredential)

// UPDATE a credential
router.patch('/:id', updateCredential)


module.exports = router