const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

const ATLAS_URI = "mongodb+srv://varshith_db_user:bTQajq8WPchq5v0e@cluster0.a8gf4j0.mongodb.net/";
const DB_NAME = "hms-ash-backend";
const INPUT_DIR = "./exported-data";

// Skip these — not needed in production
const SKIP_COLLECTIONS = ['refreshtokens', 'auditlogs'];

async function importData() {
  const client = new MongoClient(ATLAS_URI);

  try {
    await client.connect();
    console.log("✅ Connected to Atlas");

    const db = client.db(DB_NAME);

    const files = fs.readdirSync(INPUT_DIR)
      .filter(f => f.endsWith(".json"));

    for (const file of files) {
      const collectionName = path.basename(file, ".json");
      const filePath = path.join(INPUT_DIR, file);

      // Skip unnecessary collections
      if (SKIP_COLLECTIONS.includes(collectionName)) {
        console.log(`⏭ ${collectionName}: skipped`);
        continue;
      }

      const docs = JSON.parse(fs.readFileSync(filePath, "utf8"));

      if (docs.length === 0) {
        console.log(`⏭ ${collectionName}: empty, skipped`);
        continue;
      }

      console.log(`Importing ${collectionName}...`);

      await db.collection(collectionName).deleteMany({});
      await db.collection(collectionName).insertMany(docs);

      console.log(`✅ ${collectionName}: ${docs.length} documents`);
    }

    console.log("\n🎉 Import completed successfully");

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await client.close();
  }
}

importData();