const app = require("./app");

const connection = require("./src/config/db");
const connectDB = require("./src/config/db");
const seedOwner = require("./src/utils/seedOwner");
const seedData = require("./src/utils/seedData");
const seedMenus = require("./src/utils/seedMenus");

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
seedMenus();
seedData();
seedOwner();
