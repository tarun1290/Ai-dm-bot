import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      family: 4, 
    };

    const maskedUri = MONGODB_URI.replace(/([^/]*\/\/)([^@]*)(@.*)/, "$1****:****$3");
    console.log(`[DB] New connection attempt with URI: ${maskedUri}`);

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("[DB] Mongoose connection promise fulfilled.");
      return mongoose;
    });
  }

  try {
    console.log(`[DB] Attempting to connect to MongoDB... (Target: ${process.env.DATABASE_NAME || 'default'})`);
    cached.conn = await cached.promise;
    console.log(`[DB] Connection successful! Cluster host: ${cached.conn.connection.host}`);
  } catch (e) {
    cached.promise = null;
    console.error(`[DB ERROR NAME]: ${e.name}`);
    console.error(`[DB ERROR MESSAGE]: ${e.message}`);
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
