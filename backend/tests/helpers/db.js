import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod;

export const connectTestDb = async () => {
  // No unix socket: it defaults to /tmp, which sandboxes and some CI runners don't allow.
  mongod = await MongoMemoryServer.create({ instance: { args: ['--nounixsocket'] } });
  await mongoose.connect(mongod.getUri());
  await mongoose.connection.syncIndexes();
};

export const clearTestDb = async () => {
  await Promise.all(Object.values(mongoose.connection.collections).map((c) => c.deleteMany({})));
};

export const closeTestDb = async () => {
  await mongoose.disconnect();
  await mongod?.stop();
};
