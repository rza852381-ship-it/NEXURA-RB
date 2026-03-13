// index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dynamically load all route files from ./routes folder
const routesPath = path.join(__dirname, 'routes');
if (fs.existsSync(routesPath)) {
  fs.readdirSync(routesPath).forEach((file) => {
    if (file.endsWith('.js')) {
      const route = require(`./routes/${file}`);
      // Use the filename (without .js) as the route path
      const routePath = `/${file.replace('.js', '')}`;
      app.use(routePath, route);
      console.log(`Loaded route: ${routePath}`);
    }
  });
} else {
  console.log('No routes folder found, skipping route loading.');
}

// Example root route
app.get('/', (req, res) => {
  res.send('NEXURA-RB server is running!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
