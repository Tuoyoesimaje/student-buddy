const SyncSpace = require('../models/SyncSpace');
const User = require('../models/User');
const Note = require('../models/Note');
const { getIO } = require('../socket');

exports.shareNoteToSyncSpace = async (req, res) => {
  try {
    const { noteId, syncSpaceId } = req.body;
    const userId = req.user.userId;

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ msg: 'Note not found' });
    }

    const syncSpace = await SyncSpace.findById(syncSpaceId);
    if (!syncSpace) {
      return res.status(404).json({ msg: 'Sync space not found' });
    }

    if (note.user.toString() !== userId) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const sharedNote = {
      title: note.title,
      course: note.course,
      originalNoteId: note._id,
      sharedBy: userId,
    };

    syncSpace.sharedNotes.push(sharedNote);

    // Update member contribution count for notes shared
    const memberIndex = syncSpace.members.findIndex(member => {
      // New structure: member.user field
      if (member.user) {
        return member.user.toString() === userId;
      }
      // Old structure: member is just an ObjectId
      return member.toString() === userId;
    });

    if (memberIndex !== -1) {
      if (!syncSpace.members[memberIndex].contributions) {
        syncSpace.members[memberIndex].contributions = {
          tasksCompleted: 0,
          notesShared: 0,
          messagesSent: 0,
          peersHelped: 0,
          learningActivities: 0,
        };
      }
      syncSpace.members[memberIndex].contributions.notesShared += 1;
    }

    await syncSpace.save();

    const io = getIO();
    io.to(syncSpaceId).emit('noteShared', sharedNote);

    const user = await User.findById(userId);
    const systemMessage = {
        sender: userId, 
        message: `📘 "${note.title}" was shared in Sync Space.`,
        isSystemMessage: true,
    };
    syncSpace.chat.push(systemMessage);
    await syncSpace.save();
    io.to(syncSpaceId).emit('newMessage', systemMessage);


    res.json(syncSpace.sharedNotes);
  } catch (err) {
    console.error('Error creating note:', err.message);
    console.error('Request body:', req.body);
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
exports.createNote = async (req, res) => {
  const { title, content, subject, course, tags, attachments } = req.body;

  try {
    const newNote = new Note({
      title,
      content,
      subject,
      course,
      tags,
      attachments,
      user: req.user.userId,
    });

    const note = await newNote.save();
    res.json(note);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.importSharedNote = async (req, res) => {
  try {
    const { sharedNoteId, syncSpaceId } = req.body;
    const userId = req.user.userId;

    const syncSpace = await SyncSpace.findById(syncSpaceId);
    if (!syncSpace) {
      return res.status(404).json({ msg: 'Sync space not found' });
    }

    const sharedNote = syncSpace.sharedNotes.id(sharedNoteId);
    if (!sharedNote) {
      return res.status(404).json({ msg: 'Shared note not found' });
    }

    if (sharedNote.addedBy.includes(userId)) {
      return res.status(400).json({ msg: 'Note already added' });
    }

    const originalNote = await Note.findById(sharedNote.originalNoteId);
    if (!originalNote) {
      return res.status(404).json({ msg: 'Original note not found' });
    }

    const newNote = new Note({
      title: originalNote.title,
      content: originalNote.content,
      subject: originalNote.subject,
      course: originalNote.course,
      attachments: originalNote.attachments,
      user: userId,
    });

    await newNote.save();

    sharedNote.addedBy.push(userId);
    await syncSpace.save();

    const user = await User.findById(userId);
    const io = getIO();
    io.to(syncSpaceId).emit('noteAdded', { 
        username: user.username, 
        noteTitle: newNote.title, 
        noteId: newNote._id 
    });

    const systemMessage = {
        sender: userId,
        message: `📓 ${user.username} added "${newNote.title}" to their Notes.`,
        isSystemMessage: true,
    };
    syncSpace.chat.push(systemMessage);
    await syncSpace.save();
    io.to(syncSpaceId).emit('newMessage', systemMessage);

    res.json({ msg: 'Note added to your Notes ✅', note: newNote });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};