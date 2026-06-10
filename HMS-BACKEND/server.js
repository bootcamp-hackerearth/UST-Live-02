const app = require('./app');

const connection = require('./src/config/db')
const connectDB = require('./src/config/db')
const seedData = require('./src/utils/seedData')
const seedAdmin = require('./src/utils/seedAdmin')
const seedNodes = require('./src/utils/seedNodes');
connectDB();



const PORT = process.env.PORT || 5000;



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
})

seedData();
seedAdmin();
seedNodes();