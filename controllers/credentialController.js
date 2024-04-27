const Credential = require('../models/credentialModel')
const mongoose = require('mongoose')
require('dotenv').config();

const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const SECRET_KEY = process.env.SECRET_KEY;
const IV_LENGTH = 16; 

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(SECRET_KEY, 'hex'), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(SECRET_KEY, 'hex'), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// get all credentials
const getCredentials = async (req, res) => {
  const user_id = req.user._id;
  try {
    const credentials = await Credential.find({ user_id }).sort({ createdAt: -1 });
    // Decrypting each password before sending (be cautious with this)
    const decryptedCredentials = credentials.map(credential => ({
      ...credential.toObject(),
      pwd: decrypt(credential.pwd)
    }));
    res.status(200).json(decryptedCredentials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get a single credential
const getCredential = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such credential' });
  }

  try {
    const credential = await Credential.findById(id);
    if (!credential) {
      return res.status(404).json({ error: 'No such credential' });
    }
    // Decrypt password before sending it (be cautious with this)
    const decryptedCredential = {
      ...credential.toObject(),
      pwd: decrypt(credential.pwd)
    };
    res.status(200).json(decryptedCredential);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// create new credential
const createCredential = async (req, res) => {
  const {username, domain, pwd} = req.body;

  let emptyFields = [];
  if(!username) emptyFields.push('username');
  if(!domain) emptyFields.push('domain');
  if(!pwd) emptyFields.push('pwd');
  if(emptyFields.length > 0) {
    return res.status(400).json({ error: 'Please fill in all the fields', emptyFields });
  }

  const encryptedPwd = encrypt(pwd); // Encrypt password before saving

  try {
    const user_id = req.user._id;
    const credential = await Credential.create({ username, domain, pwd: encryptedPwd, user_id });
    // Decrypt password before sending it back
    const decryptedCredential = {
      ...credential.toObject(),
      pwd: decrypt(encryptedPwd) // Decrypting the password right after encryption for display
    };
    res.status(200).json(decryptedCredential);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// delete a credential
const deleteCredential = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({error: 'No such credential'})
  }

  const credential = await Credential.findOneAndDelete({_id: id})

  if (!credential) {
    return res.status(400).json({error: 'No such credential'})
  }

  res.status(200).json(credential)
}

// update a credential
const updateCredential = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({error: 'No such credential'})
  }

  const credential = await Credential.findOneAndUpdate({_id: id}, {
    ...req.body
  })

  if (!credential) {
    return res.status(400).json({error: 'No such credential'})
  }

  res.status(200).json(credential)
}


module.exports = {
  getCredentials,
  getCredential,
  createCredential,
  deleteCredential,
  updateCredential
}

