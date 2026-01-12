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
    const existingUser = await userCollection.findOne({ email });

    if (existingUser) {
      console.log("Government user already exists");
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("password123", salt);

    await userCollection.insertOne({
      email,
      password: passwordHash,
      name: "Government Admin",
      address: "123 Gov Lane",
      role: "Government",
    });

    console.log("Government user created successfully");
    console.log("Email: gov@admin.com");
    console.log("Password: password123");

  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await client.close();
  }
}

seed();
