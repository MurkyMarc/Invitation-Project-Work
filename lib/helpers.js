/*
 * Helpers for various tasks
 *
 */

// Dependencies
const config = require('./config');
const crypto = require('crypto');
const https = require('https');
const querystring = require('querystring');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const client = require('twilio')(config.twilio.accountSid, config.twilio.authToken);

// Email creds
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.email.address,
    pass: config.email.password
  }
});

// Container for all the helpers
const helpers = {};

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = function(str) {
  try {
    let obj = JSON.parse(str);
    return obj;
  } catch (e) {
    return {};
  }
};

// Create a SHA256 hash
helpers.hash = function(str) {
  if (typeof(str) == 'string' && str.length > 0) {
    let hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};

// Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = function(strLength) {
  strLength = typeof(strLength) == 'number' && strLength > 0
    ? strLength
    : false;
  if (strLength) {
    // Define all the possible characters that could go into a string
    let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    // Start the final string
    let str = '';
    for (i = 1; i <= strLength; i++) {
      // Get a random charactert from the possibleCharacters string
      let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
      // Append this character to the string
      str += randomCharacter;
    }
    // Return the final string
    return str;
  } else {
    return false;
  }
};

// URI data to json
helpers.decode = function(data) {

  data = data.replace(/%0D%0A/mg, "LINEBREAK"); // \n

  let contact = decodeURI(data).toString();

  ///remove dangerous characters
  contact = contact.replace(/%23/mg, "#"); // #
  contact = contact.replace(/%24/mg, "$"); // $
  contact = contact.replace(/%3D/mg, ""); // =
  contact = contact.replace(/%2B/mg, "+"); // +
  contact = contact.replace(/%3B/mg, ";"); // ;
  contact = contact.replace(/%3A/mg, ":"); // :
  contact = contact.replace(/%2C/mg, ","); // ,
  contact = contact.replace(/%2F/mg, "/"); // /
  contact = contact.replace(/%3F/mg, "?"); // ?
  contact = contact.replace(/%26/mg, ""); // &
  contact = contact.replace(/%40/mg, "@"); // @

  contact = contact.replace(/(['`,"^{|}\[\]])/mg, "");
  contact = JSON.parse('{"' + contact.replace(/LINEBREAK/mg, '\\n').replace(/"/mg, '\\"').replace(/&/g, '","').replace(/=/g, '":"').replace(/\+/mg, " ") + '"}');
  return contact;

};

// Take a given string and data object, and find/replace all the keys within it
helpers.sendEmail = function(data) {

  let mailOptions = {
    from: config.email.address,
    to: data.e,
    subject: "Subject Line",
    text: data.custom_msg
  };
  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      //console.log(error);
    } else {
      //console.log('Email sent: ' + info.response);
    }
  });
  return false;
};

helpers.sendTwilioSms = function(phone, msg, data, callback) {
  // Validate parameters

  phone = typeof(phone) == 'string' && phone.trim().length == 10
    ? phone.trim()
    : false;
  msg = typeof(msg) == 'string' && msg.trim().length > 0 && msg.trim().length <= 1600
    ? msg.trim()
    : false;

  let vcard = '';

  switch (data.l) {
    case 'one':
      vcard = 'vcard url 1';
      break;
    case 'two':
      vcard = 'vcard url 2';
      break;
    case 'three':
      vcard = 'vcard url 3';
      break;
  }

  if (phone && msg) {

    // console.log(msg);

    client.messages.create({
      body: msg,
      from: config.twilio.fromPhone,
      to: '+1' + phone,
      mediaUrl: vcard
    }).done();

    // Configure the request payload
    // let payload = {
    //   'From': config.twilio.fromPhone,
    //   'To': '+1' + phone,
    //   'Body': msg,
    //   'mediaUrl': 'url'
    // };
    // let stringPayload = querystring.stringify(payload);

    //  Configure the request details
    // let requestDetails = {
    //   'protocol': 'https:',
    //   'hostname': 'api.twilio.com',
    //   'method': 'POST',
    //   'path': '/2010-04-01/Accounts/' + config.twilio.accountSid + '/Messages.json',
    //   'auth': config.twilio.accountSid + ':' + config.twilio.authToken,
    //   'headers': {
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //     'Content-Length': Buffer.byteLength(stringPayload)
    //   }
    // };
    //
    //  Instantiate the request object
    // let req = https.request(requestDetails, function(res) {
    //    Grab the status of the sent request
    //   let status = res.statusCode;
    //    Callback successfully if the request went through
    //   if (status == 200 || status == 201) {
    //     callback(false);
    //   } else {
    //     callback('Status code returned was ' + status);
    //   }
    // });
    //
    //  Bind to the error event so it doesn't get thrown
    // req.on('error', function(e) {
    //   callback(e);
    // });
    //
    //  Add the payload
    // req.write(stringPayload);
    //
    //  End the request
    // req.end();

  } else {
    callback('Given parameters were missing or invalid');
  }
};

// Get the string content of a template, and use provided data for string interpolation
helpers.getTemplate = function(templateName, data, callback) {
  templateName = typeof(templateName) == 'string' && templateName.length > 0
    ? templateName
    : false;
  data = typeof(data) == 'object' && data !== null
    ? data
    : {};
  if (templateName) {
    let templatesDir = path.join(__dirname, '/../templates/');
    fs.readFile(templatesDir + templateName + '.html', 'utf8', function(err, str) {
      if (!err && str && str.length > 0) {
        // Do interpolation on the string
        let finalString = helpers.interpolate(str, data);
        callback(false, finalString);
      } else {
        callback('No template could be found');
      }
    });
  } else {
    callback('A valid template name was not specified');
  }
};

// Add the universal header and footer to a string, and pass provided data object to header and footer for interpolation
helpers.addUniversalTemplates = function(str, data, callback) {
  str = typeof(str) == 'string' && str.length > 0
    ? str
    : '';
  data = typeof(data) == 'object' && data !== null
    ? data
    : {};
  // Get the header
  helpers.getTemplate('_header', data, function(err, headerString) {
    if (!err && headerString) {
      // Get the footer
      helpers.getTemplate('_footer', data, function(err, footerString) {
        if (!err && headerString) {
          // Add them all together
          let fullString = headerString + str + footerString;
          callback(false, fullString);
        } else {
          callback('Could not find the footer template');
        }
      });
    } else {
      callback('Could not find the header template');
    }
  });
};

// Take a given string and data object, and find/replace all the keys within it
helpers.interpolate = function(str, data) {
  str = typeof(str) == 'string' && str.length > 0
    ? str
    : '';
  data = typeof(data) == 'object' && data !== null
    ? data
    : {};

  // Add the templateGlobals to the data object, prepending their key name with "global."
  for (let keyName in config.templateGlobals) {
    if (config.templateGlobals.hasOwnProperty(keyName)) {
      data['global.' + keyName] = config.templateGlobals[keyName]
    }
  }
  // For each key in the data object, insert its value into the string at the corresponding placeholder
  for (let key in data) {
    if (data.hasOwnProperty(key) && typeof(data[key] == 'string')) {
      let replace = data[key];
      let find = '{' + key + '}';
      str = str.replace(find, replace);
    }
  }
  return str;
};

// Get the contents of a static (public) asset
helpers.getStaticAsset = function(fileName, callback) {
  fileName = typeof(fileName) == 'string' && fileName.length > 0
    ? fileName
    : false;
  if (fileName) {

    let publicDir = path.join(__dirname, '/../public/');
    fs.readFile(publicDir + fileName, function(err, data) {
      if (!err && data) {
        callback(false, data);
      } else {
        callback('No file could be found');
      }
    });

  } else {
    callback('A valid file name was not specified');
  }
};

// Export the module
module.exports = helpers;
