const request = require("request");

const post = (uri, options) => {
  return new Promise((resolve, reject) => {
    request.post(uri, options, (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
};

const get = (uri, options) => {
  return new Promise((resolve, reject) => {
    request.get(uri, options, (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
};

module.exports = {
  post, get
};