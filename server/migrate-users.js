const mongoose = require('mongoose');

async function migrateUsers() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/rideapp');
    console.log('Connected to MongoDB');
    
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log(`Found ${users.length} users`);
    
    users.forEach(user => {
      console.log(`User: ${user.name} - Role: ${user.role}`);
    });
    
    const result = await mongoose.connection.db.collection('users').updateMany(
      { role: 'rider' },
      { $set: { role: 'general' } }
    );
    
    console.log(`Updated ${result.modifiedCount} users from 'rider' to 'general'`);
    
    console.log('\nUsers after migration:');
    const updatedUsers = await mongoose.connection.db.collection('users').find({}).toArray();
    updatedUsers.forEach(user => {
      console.log(`User: ${user.name} - Role: ${user.role}`);
    });
    
    await mongoose.disconnect();
    console.log('Migration completed!');
  } catch (error) {
    console.error('Error:', error);
  }
}

migrateUsers();
