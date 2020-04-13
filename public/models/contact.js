/*jshint esversion: 6 */

const mongoose = require('mongoose');

// Contact Schema
const contactSchema = mongoose.Schema({
    /* Name */
      n:{
            type: String,
            default: ""
      },
    /* email_address */
      e:{
            type: String,
            default: ""
      },
    /* phone_number */
      p:{
            type: String,
            default: ""
      },
    /* location */
      l:{
            type: String,
            default: ""
      },
    /* date_entered */
      d:{
            type: Date,
            default: Date.now
      }
      /*
      clicked:{
            type: Boolean,
            default: false
      }*/
});

const Contact = module.exports = mongoose.model('Contact', contactSchema);

// Get Contacts
module.exports.getContacts = function(callback, limit) {
      Contact.find(callback).limit(limit);
}

// Get single contact
module.exports.getContactById = function(id, callback) {
      Contact.findById(id, callback);
}

// Add a contact
module.exports.addContact = function(contact, callback) {
      Contact.create(contact, callback);
}

// Update a contact
module.exports.updateContact = function(id, contact, options, callback) {
      var query = {_id: id};
      var update = {
            n: contact.name,
            e: contact.email_address,
            l: contact.location,
            p: contact.phone_number,
      }
      Contact.findOneAndUpdate(query, update, options, callback);
}

// Delete a contact
module.exports.deleteContact = function(id, callback) {
      var query = {_id: id};
      Contact.remove(query, callback);
}
