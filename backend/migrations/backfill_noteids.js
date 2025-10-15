/* One-off migration helper: backfill `noteIds` on AIGeneratedPracticeExam documents using a best-effort match against Note titles/snippets.

Run this manually from the `backend` folder with node after setting NODE_ENV and MONGO_URI appropriately.
Example:
  set NODE_ENV=development; set MONGO_URI=mongodb://...; node migrations/backfill_noteids.js

This script is intentionally cautious: it won't overwrite existing `noteIds`, it logs matches and failures, and it supports a `--dry-run` flag.
*/

const { MongoClient, ObjectId } = require('mongodb');
const minimist = require('minimist');

async function main() {
  const argv = minimist(process.argv.slice(2));
  const dryRun = argv['dry-run'] || argv.dryRun || false;
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI is required in env');
    process.exit(1);
  }

  const client = new MongoClient(mongoUri, { useUnifiedTopology: true });
  await client.connect();
  const db = client.db();

  const exams = db.collection('aigeneratedpracticeexams');
  const notes = db.collection('notes');

  // Find exams that don't have noteIds
  const cursor = exams.find({ $or: [ { noteIds: { $exists: false } }, { noteIds: { $size: 0 } } ] });
  let processed = 0;

  while (await cursor.hasNext()) {
    const exam = await cursor.next();
    processed++;
    const titleCandidates = [];

    if (exam.topicOrNote && typeof exam.topicOrNote === 'string') {
      // naive heuristic: look for quoted note titles or leading note headers
      const match = exam.topicOrNote.match(/--- NOTE:?\s*([^\n\r]+)/i);
      if (match && match[1]) titleCandidates.push(match[1].trim());
      // fallback: take first line as candidate
      const firstLine = exam.topicOrNote.split(/\r?\n/)[0].trim();
      if (firstLine) titleCandidates.push(firstLine);
    }

    let matchedNoteIds = [];

    for (const candidate of titleCandidates) {
      // try exact title match first
      const note = await notes.findOne({ title: candidate, user: exam.userId });
      if (note) {
        matchedNoteIds.push(note._id);
        break;
      }

      // fuzzy: title contains
      const fuzzy = await notes.findOne({ title: { $regex: candidate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }, user: exam.userId });
      if (fuzzy) {
        matchedNoteIds.push(fuzzy._id);
        break;
      }
    }

    if (matchedNoteIds.length === 0 && exam.topicOrNote) {
      // last resort: search notes by snippet contained in topicOrNote
      const snippet = (exam.topicOrNote || '').substring(0, 200);
      const found = await notes.findOne({ content: { $regex: snippet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }, user: exam.userId });
      if (found) matchedNoteIds.push(found._id);
    }

    if (matchedNoteIds.length > 0) {
      console.log(`Exam ${exam._id} matched notes: ${matchedNoteIds.join(',')}`);
      if (!dryRun) {
        await exams.updateOne({ _id: exam._id }, { $set: { noteIds: matchedNoteIds, noteTitles: [] } });
      }
    } else {
      console.log(`Exam ${exam._id} - no match found`);
    }
  }

  console.log(`Processed ${processed} exams`);
  await client.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
