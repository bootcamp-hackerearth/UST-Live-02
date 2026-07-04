const { MongoClient } = require("mongodb");
const fs = require("fs");

const ATLAS_URI = process.env.MONGO_URI ||
  "mongodb+srv://varshith_db_user:bTQajq8WPchq5v0e@cluster0.a8gf4j0.mongodb.net/";
const DB_NAME = "hms-ash-backend";

// Only reimport these collections
const REIMPORT = ['employees', 'users', 'counters'];

// Path where exported data exists
const INPUT_DIR = "/home/ubuntu/UST-Live-02/HMS_Back_end/exported-data";

async function reimport() {
  const client = new MongoClient(ATLAS_URI);

  try {
    await client.connect();
    console.log("✅ Connected to Atlas");

    const db = client.db(DB_NAME);

    for (const name of REIMPORT) {
      const filePath = `${INPUT_DIR}/${name}.json`;

      if (!fs.existsSync(filePath)) {
        console.log(`❌ File not found: ${filePath}`);
        continue;
      }

      const docs = JSON.parse(fs.readFileSync(filePath, "utf8"));

      if (docs.length === 0) {
        console.log(`⏭ ${name}: empty`);
        continue;
      }

      await db.collection(name).deleteMany({});
      await db.collection(name).insertMany(docs);
      console.log(`✅ ${name}: ${docs.length} documents imported`);
    }

    console.log("\n🎉 Staff data reimported successfully");

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await client.close();
  }
}

reimport();
