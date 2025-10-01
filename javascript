    // Example for Express.js
    const express = require('express');
    const app = express();
    // Assuming your manifest is in a 'public' folder at the root
    app.use(express.static('public')); 
    // Or, if it's in a specific 'snap' folder
    app.use('/snap', express.static('snap')); 
