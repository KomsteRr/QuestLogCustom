const { MongoClient } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');

async function getUserCount() {
  let client;
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('📊 Connected to MongoDB');
    
    const db = client.db("usersDB");
    const userCount = await db.collection('users').countDocuments({
      googleId: { $exists: true, $ne: null }
    });
    
    // Use absolute path relative to script location
    const readmePath = path.join(__dirname, '..', 'README.md');
    
    // Verify file exists
    try {
      await fs.access(readmePath);
    } catch {
      throw new Error('README.md not found');
    }

    // Read file
    let readme = await fs.readFile(readmePath, 'utf8');

    // Prepare new content
    const userCountRegex = /!\[.*?\]\(https:\/\/img\.shields\.io\/badge\/.*?\)/;
    if (readme.match(userCountRegex)) {
      readme = readme.replace(
        userCountRegex, 
        `![Current Authorized Users](https://img.shields.io/badge/Current%20Authorized%20Users-${userCount}-blue?logo=mongodb&logoColor=white)`
      );
    } else {
      readme = readme.replace(
        '# 🎮 QuestLog',
        `# 🎮 QuestLog\n\n![Current Authorized Users](https://img.shields.io/badge/Current%20Authorized%20Users-${userCount}-blue?logo=mongodb&logoColor=white)`
      );
    }

    // Write atomically
    const tempPath = `${readmePath}.tmp`;
    await fs.writeFile(tempPath, readme);
    await fs.rename(tempPath, readmePath);

    console.log(`Updated README with ${userCount} users`);
    return userCount;

  } catch (error) {
    console.error('Error:', error.message);
    throw new Error('Failed to update user count');
  } finally {
    if (client) {
      await client.close().catch(() => {});
      console.log('🔌 Closed MongoDB connection');
    }
  }
}

// Only run if called directly
if (require.main === module) {
  getUserCount().catch(() => process.exit(1));
}

module.exports = getUserCount;