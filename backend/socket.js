const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');


let io;
// In-memory map to store userId -> socketId
const userSocketMap = new Map();

const initializeSocket = (server) => {
io = new Server(server, {
  cors: {
    origin: ['https://main-student-buddy.vercel.app', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password'); // Fetch user without password
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error.message);
      next(new Error(`Authentication error: ${error.message}`));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.user._id);

    // Store user's socket ID mapping
    userSocketMap.set(socket.user._id.toString(), socket.id);
    console.log(`User ${socket.user._id} connected with socket ID ${socket.id}. Current map size: ${userSocketMap.size}`);



    // Sync Space events
    socket.on('joinSyncSpace', (spaceId) => {
      socket.join(spaceId);
      console.log(`User ${socket.user._id} joined sync space room ${spaceId}`);
      socket.emit('joinedSyncSpace', spaceId);
    });

    socket.on('leaveSyncSpace', (spaceId) => {
      socket.leave(spaceId);
      console.log(`User ${socket.user._id} left sync space room ${spaceId}`);
      socket.emit('leftSyncSpace', spaceId);
    });

    socket.on('sendMessage', async ({ spaceId, message }) => {
      try {
        const syncSpace = await require('./models/SyncSpace').findById(spaceId);

        // Check membership for both old and new structures
        const isMember = syncSpace && syncSpace.members.some(member => {
          // New structure: member.user field
          if (member.user) {
            return member.user._id.equals(socket.user._id);
          }
          // Old structure: member is just an ObjectId
          return member.equals(socket.user._id);
        });

        if (!syncSpace) {
          return socket.emit('sendMessageError', { message: 'Sync Space not found.' });
        }

        if (!isMember) {
          return socket.emit('sendMessageError', { message: 'You are not a member of this Sync Space.' });
        }

        // User is a member, send the message
        const chatMessage = {
          sender: socket.user.toObject(), // Send full user object
          username: socket.user.username, // Explicitly include username
          message,
          timestamp: new Date(),
        };
        syncSpace.chat.push({
          ...chatMessage,
          sender: socket.user._id, // Save only the ID in the database
        });

        // Update member contribution count for messages sent
        const memberIndex = syncSpace.members.findIndex(member => {
          // New structure: member.user field
          if (member.user) {
            return member.user.toString() === socket.user._id.toString();
          }
          // Old structure: member is just an ObjectId
          return member.toString() === socket.user._id.toString();
        });
        if (memberIndex !== -1 && syncSpace.members[memberIndex].contributions) {
          syncSpace.members[memberIndex].contributions.messagesSent += 1;
        }

        await syncSpace.save();

        // Emit to all members in the space
        io.to(spaceId).emit('newMessage', chatMessage);
        console.log(`Message sent in space ${spaceId} by user ${socket.user.username}`);

        // Send notifications to other members (not the sender)
        const notificationController = require('./controllers/notificationController');
        const otherMembers = syncSpace.members.filter(member => {
          // New structure: member.user._id
          if (member.user && member.user._id) {
            return !member.user._id.equals(socket.user._id);
          }
          // Old structure: member is just an ObjectId
          return !member.equals(socket.user._id);
        });

        for (const member of otherMembers) {
          try {
            // Create sync space message notification
            const notification = await notificationController.createNotification(
              member.user ? member.user._id : member, // Handle both structures
              `💬 New message in ${syncSpace.name}`,
              `${socket.user.username}: ${message.length > 50 ? message.substring(0, 50) + '...' : message}`,
              'sync_new_message',
              `/app/sync-space/${spaceId}`
            );

            // Send WebSocket notification
            const memberSocketId = userSocketMap.get((member.user ? member.user._id : member).toString());
            if (memberSocketId) {
              io.to(memberSocketId).emit('syncNotification', {
                ...notification.toObject(),
                syncType: 'sync_space_message',
                spaceName: syncSpace.name
              });
            }
          } catch (notifError) {
            console.error(`Error sending notification to member ${(member.user ? member.user._id : member)}:`, notifError);
          }
        }
      } catch (error) {
        console.error('Error handling sendMessage:', error);
        socket.emit('sendMessageError', { message: 'Failed to send message.' });
      }
    });
    
    // Handle task creation
    socket.on('createTask', async ({ spaceId, task }) => {
      try {
        const SyncSpace = require('./models/SyncSpace');
        const Task = require('./models/Task');

        const syncSpace = await SyncSpace.findById(spaceId);
        // Check membership for both old and new structures
        const isMember = syncSpace && syncSpace.members.some(member => {
          // New structure: member.user field
          if (member.user) {
            return member.user.toString() === socket.user._id.toString();
          }
          // Old structure: member is just an ObjectId
          return member.toString() === socket.user._id.toString();
        });
        if (!syncSpace || !isMember) {
          return socket.emit('taskError', { message: 'Sync Space not found or you are not a member' });
        }
        
        // Extract user IDs from members (handle both old and new structures)
        const memberUserIds = syncSpace.members.map(member => {
          // New structure: member.user field
          if (member.user) {
            return member.user;
          }
          // Old structure: member is just an ObjectId
          return member;
        });

        // Create the task with required fields for the Task model
        const newTask = new Task({
          ...task,
          user: socket.user._id, // Set user field instead of creator
          type: task.type || 'other', // Set a default type if not provided
          startTime: task.startTime || task.dueDate || new Date(), // Use startTime, fallback to dueDate or current date
          priority: task.priority || 'medium',
          sharedWith: memberUserIds // Add all sync space members to sharedWith
        });
        await newTask.save();
        
        // Add to sync space
        syncSpace.sharedTasks.push(newTask._id);
        
        // Create system message
        const systemMessage = {
          sender: socket.user._id,
          username: 'System',
          message: `${socket.user.username} created a task: ${task.title}`,
          timestamp: new Date(),
          isSystemMessage: true
        };
        
        syncSpace.chat.push(systemMessage);
        await syncSpace.save();
        
        // Add status field to the task object for frontend compatibility
        const taskWithStatus = {
          ...newTask.toObject(),
          status: newTask.completed ? 'completed' : 'in-progress'
        };
        
        // Broadcast to all members
        io.to(spaceId).emit('newTask', { task: taskWithStatus, systemMessage });
        console.log(`Task created in space ${spaceId} by user ${socket.user.username}`);

        // Send notifications to other members about new task
        const notificationController = require('./controllers/notificationController');
        const otherMembers = syncSpace.members.filter(member => {
          // New structure: member.user._id
          if (member.user && member.user._id) {
            return !member.user._id.equals(socket.user._id);
          }
          // Old structure: member is just an ObjectId
          return !member.equals(socket.user._id);
        });

        for (const member of otherMembers) {
          try {
            await notificationController.createSharedTaskNotification(
              newTask._id,
              member._id,
              socket.user._id
            );
          } catch (notifError) {
            console.error(`Error sending task notification to member ${member._id}:`, notifError);
          }
        }
      } catch (error) {
        console.error('Error creating task:', error);
        socket.emit('taskError', { message: 'Failed to create task: ' + error.message });
      }
    });
    
    // Handle task completion
    socket.on('completeTask', async ({ spaceId, taskId }) => {
      try {
        const SyncSpace = require('./models/SyncSpace');
        const Task = require('./models/Task');

        const syncSpace = await SyncSpace.findById(spaceId);
        const task = await Task.findById(taskId);

        // Check membership for both old and new structures
        const isMember = syncSpace && syncSpace.members.some(member => {
          // New structure: member.user field
          if (member.user) {
            return member.user.toString() === socket.user._id.toString();
          }
          // Old structure: member is just an ObjectId
          return member.toString() === socket.user._id.toString();
        });
        if (!syncSpace || !task || !isMember) {
          return socket.emit('taskError', { message: 'Sync Space or Task not found or you are not a member' });
        }
        
        // Check if user has already completed this task
        if (!task.completedBy.includes(socket.user._id)) {
          // Add user to completedBy array
          task.completedBy.push(socket.user._id);

          // Check if task is assigned to specific members
          if (task.assignedTo && task.assignedTo.length > 0) {
            // For assigned tasks: complete when all assigned members finish
            const assignedUserIds = task.assignedTo.map(assignment => assignment.user.toString());
            const allAssignedCompleted = assignedUserIds.every(userId => task.completedBy.includes(userId));

            if (allAssignedCompleted) {
              task.completed = true;
              task.completedAt = new Date();
            }
          } else {
            // For group tasks: complete when all members finish (original behavior)
            if (task.completedBy.length === syncSpace.members.length) {
              task.completed = true;
              task.completedAt = new Date();
            }
          }
          
          await task.save();
          
          // Create system message
          const systemMessage = {
            sender: socket.user._id,
            username: 'System',
            message: `${socket.user.username} completed the task: ${task.title}`,
            timestamp: new Date(),
            isSystemMessage: true
          };
          
          syncSpace.chat.push(systemMessage);
          await syncSpace.save();
          
          // Add status field and completedBy to the task object for frontend compatibility
          const taskWithStatus = {
            ...task.toObject(),
            status: task.completed ? 'completed' : 'in-progress',
            userCompleted: true // Flag to indicate this user completed it
          };
          
          // Broadcast to all members
          io.to(spaceId).emit('taskCompleted', { taskId, task: taskWithStatus, systemMessage });
          console.log(`Task ${taskId} completed in space ${spaceId} by user ${socket.user.username}`);
        } else {
          socket.emit('taskError', { message: 'You have already completed this task' });
        }
      } catch (error) {
        console.error('Error completing task:', error);
        socket.emit('taskError', { message: 'Failed to complete task: ' + error.message });
      }
    });



    // Handle disconnection});

    // Handle task assignment
    socket.on('assignTask', async ({ spaceId, taskId, memberIds }) => {
      try {
        const SyncSpace = require('./models/SyncSpace');
        const Task = require('./models/Task');

        const syncSpace = await SyncSpace.findById(spaceId);
        const task = await Task.findById(taskId);

        // Check membership for both old and new structures
        const isMember = syncSpace && syncSpace.members.some(member => {
          // New structure: member.user field
          if (member.user) {
            return member.user.toString() === socket.user._id.toString();
          }
          // Old structure: member is just an ObjectId
          return member.toString() === socket.user._id.toString();
        });
        if (!syncSpace || !task || !isMember) {
          return socket.emit('taskError', { message: 'Sync Space, Task not found or you are not a member' });
        }

        // For now, allow any member to assign tasks to encourage participation
        // TODO: Add more granular permissions later if needed
        const requesterMember = syncSpace.members.find(member => {
          // New structure: member.user field
          if (member.user) {
            return member.user.toString() === socket.user._id.toString();
          }
          // Old structure: member is just an ObjectId
          return member.toString() === socket.user._id.toString();
        });
        if (!requesterMember) {
          return socket.emit('taskError', { message: 'You are not a member of this Sync Space' });
        }

        // Validate member IDs
        const validMemberIds = memberIds.filter(memberId =>
          syncSpace.members.some(member => {
            // New structure: member.user field
            if (member.user) {
              return member.user.toString() === memberId;
            }
            // Old structure: member is just an ObjectId
            return member.toString() === memberId;
          })
        );

        // Add assignments
        const newAssignments = validMemberIds.map(memberId => ({
          user: memberId,
          assignedAt: new Date(),
          assignedBy: socket.user._id
        }));

        task.assignedTo.push(...newAssignments);
        await task.save();

        // Create system message
        const assignedUsernames = await Promise.all(
          validMemberIds.map(async (memberId) => {
            const user = await require('./models/User').findById(memberId);
            return user.username;
          })
        );

        const systemMessage = {
          sender: socket.user._id,
          username: 'System',
          message: `${task.title} has been assigned to: ${assignedUsernames.join(', ')}`,
          timestamp: new Date(),
          isSystemMessage: true
        };

        syncSpace.chat.push(systemMessage);
        await syncSpace.save();

        io.to(spaceId).emit('taskAssigned', { taskId, assignments: newAssignments, systemMessage });
        console.log(`Task ${taskId} assigned in space ${spaceId}`);
      } catch (error) {
        console.error('Error assigning task:', error);
        socket.emit('taskError', { message: 'Failed to assign task: ' + error.message });
      }
    });

    // Handle task progress update
    socket.on('updateTaskProgress', async ({ spaceId, taskId, progress, actualHours }) => {
      try {
        const SyncSpace = require('./models/SyncSpace');
        const Task = require('./models/Task');

        const syncSpace = await SyncSpace.findById(spaceId);
        const task = await Task.findById(taskId);

        // Check membership for both old and new structures
        const isMember = syncSpace && syncSpace.members.some(member => {
          // New structure: member.user field
          if (member.user) {
            return member.user.toString() === socket.user._id.toString();
          }
          // Old structure: member is just an ObjectId
          return member.toString() === socket.user._id.toString();
        });
        if (!syncSpace || !task || !isMember) {
          return socket.emit('taskError', { message: 'Sync Space, Task not found or you are not a member' });
        }

        // Check permissions - allow assigned users or any member for now
        const requesterMember = syncSpace.members.find(member => {
          // New structure: member.user field
          if (member.user) {
            return member.user.toString() === socket.user._id.toString();
          }
          // Old structure: member is just an ObjectId
          return member.toString() === socket.user._id.toString();
        });
        const isAssigned = task.assignedTo && task.assignedTo.some(assignment => assignment.user.toString() === socket.user._id.toString());
        const canUpdate = isAssigned || requesterMember; // Allow any member to update for now

        if (!canUpdate) {
          return socket.emit('taskError', { message: 'You are not authorized to update this task' });
        }

        // Update progress
        if (progress !== undefined) {
          task.progress = Math.max(0, Math.min(100, progress));
        }
        if (actualHours !== undefined) {
          task.actualHours = actualHours;
        }

        await task.save();

        // Update member contribution
        if (progress > 0) {
          const memberIndex = syncSpace.members.findIndex(member => {
            // New structure: member.user field
            if (member.user) {
              return member.user.toString() === socket.user._id.toString();
            }
            // Old structure: member is just an ObjectId
            return member.toString() === socket.user._id.toString();
          });
          if (memberIndex !== -1 && syncSpace.members[memberIndex].contributions) {
            syncSpace.members[memberIndex].contributions.learningActivities += 1;
            await syncSpace.save();
          }
        }

        io.to(spaceId).emit('taskProgressUpdated', { taskId, progress: task.progress });
        console.log(`Task ${taskId} progress updated in space ${spaceId}`);
      } catch (error) {
        console.error('Error updating task progress:', error);
        socket.emit('taskError', { message: 'Failed to update task progress: ' + error.message });
      }
    });

    // Handle note import
    // Handle note import
    socket.on('importNote', async ({ spaceId, sharedNoteId }) => {
      try {
        const SyncSpace = require('./models/SyncSpace');
        const Note = require('./models/Note');
        const userId = socket.user._id;

        const syncSpace = await SyncSpace.findById(spaceId);
        if (!syncSpace) {
          return socket.emit('noteError', { message: 'Sync Space not found' });
        }

        // Check membership for both old and new structures
        const isMember = syncSpace.members.some(member => {
          // New structure: member.user field
          if (member.user) {
            return member.user.toString() === userId.toString();
          }
          // Old structure: member is just an ObjectId
          return member.toString() === userId.toString();
        });
        if (!isMember) {
          return socket.emit('noteError', { message: 'You are not a member of this Sync Space' });
        }

        const sharedNote = syncSpace.sharedNotes.id(sharedNoteId);
        if (!sharedNote) {
          return socket.emit('noteError', { message: 'Shared note not found' });
        }

        if (sharedNote.addedBy.includes(userId)) {
          return socket.emit('noteError', { message: 'You have already added this note' });
        }

        const originalNote = await Note.findById(sharedNote.originalNoteId);
        if (!originalNote) {
          return socket.emit('noteError', { message: 'Original note not found' });
        }

        const newNote = new Note({
          ...originalNote.toObject(),
          _id: undefined,
          user: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await newNote.save();

        sharedNote.addedBy.push(userId);

        // Update contribution for the person who originally shared the note (peersHelped)
        const sharerIndex = syncSpace.members.findIndex(member => {
          // New structure: member.user field
          if (member.user) {
            return member.user.toString() === sharedNote.sharedBy.toString();
          }
          // Old structure: member is just an ObjectId
          return member.toString() === sharedNote.sharedBy.toString();
        });
        if (sharerIndex !== -1 && syncSpace.members[sharerIndex].contributions) {
          syncSpace.members[sharerIndex].contributions.peersHelped += 1;
        }

        // Update contribution for the person importing the note (learningActivities)
        const importerIndex = syncSpace.members.findIndex(member => {
          // New structure: member.user field
          if (member.user) {
            return member.user.toString() === userId.toString();
          }
          // Old structure: member is just an ObjectId
          return member.toString() === userId.toString();
        });
        if (importerIndex !== -1 && syncSpace.members[importerIndex].contributions) {
          syncSpace.members[importerIndex].contributions.learningActivities += 1;
        }

        const systemMessage = {
          sender: userId,
          username: 'System',
          message: `${socket.user.username} added "${sharedNote.title}" to their Notes.`,
          timestamp: new Date(),
          isSystemMessage: true,
        };
        syncSpace.chat.push(systemMessage);

        await syncSpace.save();

        io.to(spaceId).emit('noteAdded', {
          sharedNoteId,
          userId: userId.toString(),
          username: socket.user.username,
          systemMessage,
        });
        
        socket.emit('noteImportedSuccess', { message: 'Note added to your Notes ✅', noteId: newNote._id });

      } catch (error) {
        console.error('Error importing note:', error);
        socket.emit('noteError', { message: 'Failed to import note: ' + error.message });
      }
    });


    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.user._id);
      // Remove user from the map
      userSocketMap.delete(socket.user._id.toString());
      console.log(`User ${socket.user._id} removed from map. Current map size: ${userSocketMap.size}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Function to get a user's socket ID
const getUserSocketId = (userId) => {
  return userSocketMap.get(userId.toString());
};

module.exports = { initializeSocket, getIO, getUserSocketId };