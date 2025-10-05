const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function cleanupDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority'
    });

    console.log('Connected to MongoDB Atlas');

    const db = mongoose.connection.db;

    // List all collections before cleanup
    const collectionsBefore = await db.listCollections().toArray();
    console.log('Collections before cleanup:', collectionsBefore.map(c => c.name));

    // Drop collections that need to be removed
    const collectionsToDrop = ['syncspaces', 'tasks', 'groups', 'studynotes'];

    for (const collectionName of collectionsToDrop) {
      try {
        const collectionExists = await db.listCollections({ name: collectionName }).hasNext();
        if (collectionExists) {
          await db.dropCollection(collectionName);
          console.log(`✅ Dropped collection: ${collectionName}`);
        } else {
          console.log(`ℹ️ Collection ${collectionName} does not exist, skipping`);
        }
      } catch (error) {
        console.log(`ℹ️ Collection ${collectionName} does not exist or already dropped`);
      }
    }

    // Clean up User documents - remove syncSpaces field
    const usersResult = await db.collection('users').updateMany(
      { syncSpaces: { $exists: true } },
      { $unset: { syncSpaces: "" } }
    );
    console.log(`✅ Updated ${usersResult.modifiedCount} user documents (removed syncSpaces field)`);

    // Clean up Note documents - remove sharedWith and syncSpace fields
    const notesResult = await db.collection('notes').updateMany(
      {
        $or: [
          { sharedWith: { $exists: true } },
          { syncSpace: { $exists: true } }
        ]
      },
      {
        $unset: {
          sharedWith: "",
          syncSpace: ""
        }
      }
    );
    console.log(`✅ Updated ${notesResult.modifiedCount} note documents (removed sharedWith and syncSpace fields)`);

    // Clean up Course documents - remove schedule, attendance, results fields and set topics to empty array
    const coursesResult = await db.collection('courses').updateMany(
      {},
      {
        $unset: {
          schedule: "",
          attendance: "",
          results: ""
        },
        $set: {
          topics: []
        }
      }
    );
    console.log(`✅ Updated ${coursesResult.modifiedCount} course documents (removed schedule/attendance/results, added empty topics array)`);

    // List all collections after cleanup
    const collectionsAfter = await db.listCollections().toArray();
    console.log('Collections after cleanup:', collectionsAfter.map(c => c.name));

    console.log('\n🎉 Database cleanup completed successfully!');

  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the cleanup
cleanupDatabase();