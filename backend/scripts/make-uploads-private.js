// One-off migration: moves report files uploaded before storage was made private
// (public Cloudinary URLs in Report.fileUrl) to 'authenticated' delivery, and records
// them in Report.file so they're served through signed URLs.
// Dry run by default; pass --apply to change anything.
//   node scripts/make-uploads-private.js [--apply]
// Prints counts and report ids only — never URLs or report contents.
import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import Report from '../src/models/Report.js';
import { parseLegacyFileUrl } from '../src/utils/legacyFileUrl.js';
import { makeFilePrivate, logStorageError } from '../src/services/fileStorage.js';

const apply = process.argv.includes('--apply');

await mongoose.connect(env.MONGO_URI);

const legacy = await Report.find({ fileUrl: { $exists: true, $ne: null }, file: { $exists: false } })
  .select('fileUrl');

let migrated = 0;
const unparseable = [];
const failed = [];

for (const report of legacy) {
  const stored = parseLegacyFileUrl(report.fileUrl);
  if (!stored) {
    unparseable.push(String(report._id));
    continue;
  }
  if (!apply) continue;

  try {
    report.file = await makeFilePrivate(stored);
    report.fileUrl = undefined;
    await report.save();
    migrated += 1;
  } catch (err) {
    logStorageError(`migrate report ${report._id}`, err);
    failed.push(String(report._id));
  }
}

console.log(`Reports with legacy public files: ${legacy.length}`);
console.log(apply ? `Migrated: ${migrated}` : 'Dry run — pass --apply to migrate.');
if (unparseable.length) console.log(`Not a Cloudinary URL (left unchanged): ${unparseable.join(', ')}`);
if (failed.length) console.log(`Failed (safe to re-run): ${failed.join(', ')}`);

await mongoose.disconnect();
