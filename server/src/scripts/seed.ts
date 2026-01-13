import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB_NAME || "attest-vit";

async function seed() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to database");

    const db = client.db(dbName);
    const userCollection = db.collection("user");

    const email = "gov@admin.com";
    const walletAddress = (process.env.GOV_WALLET_ADDRESS || "0xeA7ddDA0D73600C06d25F41570e4e8DBa39C06a6").toLowerCase();
    
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("password123", salt);

    await userCollection.updateOne(
      { email },
      { 
        $set: { 
          email,
          password: passwordHash,
          name: "Government Admin",
          address: "123 Gov Lane",
          walletAddress: walletAddress,
          role: "Government",
        } 
      },
      { upsert: true }
    );

    console.log("Government user registered/updated successfully");
    console.log("Email: gov@admin.com");
    console.log("Wallet Address:", walletAddress);

  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await client.close();
  }
}

seed();
