import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB_NAME || "attest-vit";

async function fix() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to database");

    const db = client.db(dbName);
    const projectCollection = db.collection("project");
    const proposalCollection = db.collection("proposal");

    // Fix Projects (catch both missing and null)
    const projects = await projectCollection.find({ 
      $or: [
        { onchain_id: { $exists: false } },
        { onchain_id: null }
      ]
    }).toArray();
    
    // Get highest current ID to avoid collisions
    const allProjects = await projectCollection.find({ onchain_id: { $type: "number" } }).toArray();
    let projectIdCounter = allProjects.length > 0 ? Math.max(...allProjects.map(p => p.onchain_id)) + 1 : 1;

    for (const project of projects) {
      await projectCollection.updateOne(
        { _id: project._id },
        { $set: { onchain_id: projectIdCounter++ } }
      );
      console.log(`Updated project ${project.project_name} with onchain_id ${projectIdCounter - 1}`);
    }

    // Fix Proposals
    const proposals = await proposalCollection.find({ 
      $or: [
        { onchain_id: { $exists: false } },
        { onchain_id: null }
      ]
    }).toArray();
    
    const allProposals = await proposalCollection.find({ onchain_id: { $type: "number" } }).toArray();
    let proposalIdCounter = allProposals.length > 0 ? Math.max(...allProposals.map(p => p.onchain_id)) + 1 : 1;

    for (const proposal of proposals) {
      await proposalCollection.updateOne(
        { _id: proposal._id },
        { $set: { onchain_id: proposalIdCounter++ } }
      );
      console.log(`Updated proposal ${proposal.proposal_name} with onchain_id ${proposalIdCounter - 1}`);
    }

    console.log("Database IDs fixed.");

  } catch (error) {
    console.error("Error updating database:", error);
  } finally {
    await client.close();
  }
}

fix();