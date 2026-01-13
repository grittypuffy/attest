import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB_NAME || "attest-vit";

async function update() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to database");

    const db = client.db(dbName);
    const userCollection = db.collection("user");

    // 1. Update Gov Admin
    await userCollection.updateOne(
      { email: "gov@admin.com" },
      { $set: { walletAddress: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266".toLowerCase() } }
    );
    console.log("Updated gov@admin.com with wallet address");

    // 2. For any other users, if they have an 'address' field that looks like a wallet, copy it to 'walletAddress'
    const users = await userCollection.find({ walletAddress: { $exists: false } }).toArray();
    for (const user of users) {
      if (user.address && user.address.startsWith("0x") && user.address.length === 42) {
        await userCollection.updateOne(
          { _id: user._id },
          { $set: { walletAddress: user.address.toLowerCase() } }
        );
        console.log(`Updated user ${user.email} with wallet address from address field`);
      }
    }

  } catch (error) {
    console.error("Error updating database:", error);
  } finally {
    await client.close();
  }
}

update();
