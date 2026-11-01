// One-off migration: lowercase + trim existing user emails so they match the new
// normalised login lookup. Dry run by default; pass --apply to write.
//   node scripts/normalize-emails.js [--apply]
// Prints counts and user ids only — never email addresses.
import mongoose from 'mongoose';
import { env } from '../src/config/env.js';

const apply = process.argv.includes('--apply');

await mongoose.connect(env.MONGO_URI);
const users = mongoose.connection.collection('users');

const all = await users.find({}, { projection: { email: 1 } }).toArray();
const byNormalized = new Map();
for (const u of all) {
  const key = String(u.email).trim().toLowerCase();
  byNormalized.set(key, [...(byNormalized.get(key) || []), u]);
}

let toFix = 0;
let fixed = 0;
const conflicts = [];
for (const [normalized, group] of byNormalized) {
  if (group.length > 1) {
    conflicts.push(group.map((u) => String(u._id)));
    continue;
  }
  const [u] = group;
  if (u.email === normalized) continue;
  toFix += 1;
  if (apply) {
    await users.updateOne({ _id: u._id }, { $set: { email: normalized } });
    fixed += 1;
  }
}

console.log(`Users scanned: ${all.length}`);
console.log(`Emails needing normalisation: ${toFix}${apply ? ` (updated ${fixed})` : ' (dry run, pass --apply to update)'}`);
if (conflicts.length) {
  console.log(`Conflicts (same email differing only in case) — resolve manually, user ids:`);
  for (const ids of conflicts) console.log(`  ${ids.join(', ')}`);
}

await mongoose.disconnect();
