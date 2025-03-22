// backend/config/production.js
const path = require('path');
const express = require('express');

const configureProduction = (app) => {
  // Serve static files from the React app
  app.use(express.static(path.join(__dirname, '../../frontend/build')));

  // The "catchall" handler: for any request that doesn't
  // match one above, send back React's index.html file.
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../frontend/build', 'index.html'));
  });

  return app;
};

module.exports = configureProduction;