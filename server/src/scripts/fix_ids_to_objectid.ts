import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB_NAME || "attest-vit";

async function fix() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to database");

    const db = client.db(dbName);
    const proposalCollection = db.collection("proposal");
    const phaseCollection = db.collection("phase");

    // 1. Fix Proposals
    const proposals = await proposalCollection.find({}).toArray();
    for (const p of proposals) {
      const updates: any = {};
      if (typeof p.agency_id === "string") {
        updates.agency_id = new ObjectId(p.agency_id);
      }
      if (typeof p.project_id === "string") {
        updates.project_id = new ObjectId(p.project_id);
      }
      
      if (Object.keys(updates).length > 0) {
        await proposalCollection.updateOne({ _id: p._id }, { $set: updates });
        console.log(`Updated proposal ${p.proposal_name}`);
      }
    }

    // 2. Fix Phases
    const phases = await phaseCollection.find({}).toArray();
    for (const ph of phases) {
      const updates: any = {};
      if (typeof ph.agency_id === "string") {
        updates.agency_id = new ObjectId(ph.agency_id);
      }
      if (typeof ph.project_id === "string") {
        updates.project_id = new ObjectId(ph.project_id);
      }
      if (typeof ph.proposal_id === "string") {
        updates.proposal_id = new ObjectId(ph.proposal_id);
      }

      if (Object.keys(updates).length > 0) {
        await phaseCollection.updateOne({ _id: ph._id }, { $set: updates });
        console.log(`Updated phase ${ph.title}`);
      }
    }

    console.log("Database normalization complete.");

  } catch (error) {
    console.error("Error updating database:", error);
  } finally {
    await client.close();
  }
}

fix();
