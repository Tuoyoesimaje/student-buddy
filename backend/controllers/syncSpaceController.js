const SyncSpace = require('../models/SyncSpace');
const User = require('../models/User');
const Task = require('../models/Task');
const { nanoid } = require('nanoid');

// Create a new Sync Space
exports.createSyncSpace = async (req, res) => {
  try {
    const { name, studyGoals, learningGoals, studyPreferences } = req.body;
    const joinCode = nanoid(8);
    const syncSpace = new SyncSpace({
      name,
      joinCode,
      members: [{
        user: req.user.userId,
        role: 'facilitator', // Creator becomes initial facilitator
        learningGoals,
        studyPreferences,
      }],
      studyGoals: studyGoals ? {
        topic: studyGoals.topic,
        objectives: studyGoals.objectives,
        targetDate: studyGoals.targetDate,
      } : undefined,
    });
    await syncSpace.save();
    res.status(201).json(syncSpace);
  } catch (error) {
    res.status(500).json({ message: 'Error creating Sync Space', error });
  }
};

// Join a Sync Space
exports.joinSyncSpace = async (req, res) => {
  try {
    const { joinCode, learningGoals, studyPreferences } = req.body;
    const syncSpace = await SyncSpace.findOne({ joinCode });

    if (!syncSpace) {
      return res.status(404).json({ message: 'Sync Space not found' });
    }

    // Check if user is already a member (handle both old and new structures)
    const existingMember = syncSpace.members.find(member => {
      // New structure: member.user
      if (member.user) {
        return member.user.toString() === req.user.userId;
      }
      // Old structure: member is just an ObjectId
      return member.toString() === req.user.userId;
    });

    if (existingMember) {
      return res.status(400).json({ message: 'You are already a member of this Sync Space' });
    }

    // Add new member with participant role
    syncSpace.members.push({
      user: req.user.userId,
      role: 'participant',
      learningGoals,
      studyPreferences,
      contributions: {
        tasksCompleted: 0,
        notesShared: 0,
        messagesSent: 0,
        peersHelped: 0,
        learningActivities: 0,
      },
    });

    await syncSpace.save();

    res.status(200).json(syncSpace);
  } catch (error) {
    res.status(500).json({ message: 'Error joining Sync Space', error });
  }
};

// Get all Sync Spaces for the logged-in user
exports.getSyncSpaces = async (req, res) => {
  try {
    console.log('=== GET SYNC SPACES DEBUG ===');
    console.log('Full req.user object:', JSON.stringify(req.user, null, 2));

    if (!req.user || !req.user.userId) {
      console.log('❌ No user found in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    console.log('✅ User authenticated with ID:', req.user.userId);

    // Test database connection
    console.log('Testing SyncSpace model...');
    const testQuery = await SyncSpace.find().limit(1);
    console.log('✅ Database connection works, found', testQuery.length, 'total spaces');

    // Find all spaces and filter in JavaScript to handle both old and new member structures
    console.log('🔍 Finding all spaces and filtering for user membership...');
    const allSpacesInDb = await SyncSpace.find({});
    console.log('✅ Found', allSpacesInDb.length, 'total spaces in database');

    const userSpaces = allSpacesInDb.filter(space => {
      // Check new structure: members.user field
      const isInNewStructure = space.members.some(member => {
        return member.user && member.user.toString() === req.user.userId;
      });

      // Check old structure: members array contains userId directly
      const isInOldStructure = space.members.some(member => {
        return !member.user && member.toString() === req.user.userId;
      });

      return isInNewStructure || isInOldStructure;
    });

    console.log('✅ User is member of', userSpaces.length, 'spaces');
    const allSpaces = userSpaces;

    console.log('📊 Total spaces returned:', allSpaces.length);
    if (allSpaces.length > 0) {
      console.log('📋 Space details:', allSpaces.map(s => ({
        id: s._id,
        name: s.name,
        membersCount: s.members.length,
        memberStructure: s.members[0]?.user ? 'new' : 'old'
      })));
    }

    res.json(allSpaces);
  } catch (error) {
    console.error('❌ Error fetching Sync Spaces:', error);
    console.error('Error details:', error.stack);
    res.status(500).json({ message: 'Error fetching Sync Spaces', error: error.message });
  }
};

// Get Sync Space details
exports.getSyncSpace = async (req, res) => {
    try {
        const syncSpace = await SyncSpace.findById(req.params.id);

        // Populate conditionally based on member structure
        try {
            await syncSpace.populate('members.user', 'username email profilePicture bio socialLinks');
        } catch (error) {
            // Old structure doesn't have user field, skip populate
        }

        // Populate other fields
        await syncSpace.populate({
            path: 'sharedTasks',
            populate: {
                path: 'user',
                select: 'username profilePicture'
            }
        });
        await syncSpace.populate({
            path: 'sharedNotes',
            populate: {
                path: 'sharedBy',
                select: 'username'
            }
        });
        await syncSpace.populate({
            path: 'chat.sender',
            select: 'username profilePicture'
        });

        if (!syncSpace) {
            return res.status(404).json({ message: 'Sync Space not found' });
        }

        // Check if the requesting user is a member of this sync space (handle both old and new member structures)
        const isMember = syncSpace.members.some(member => {
            // New structure: member.user._id
            if (member.user && member.user._id) {
                return member.user._id.toString() === req.user.userId;
            }
            // Old structure: member is just an ObjectId
            return member.toString() === req.user.userId;
        });
        if (!isMember) {
            return res.status(403).json({ message: 'You are not a member of this Sync Space' });
        }

        // Initialize contributions for any members that don't have them (migration for old groups)
        let needsSave = false;
        syncSpace.members.forEach(member => {
            if (!member.contributions) {
                member.contributions = {
                    tasksCompleted: 0,
                    notesShared: 0,
                    messagesSent: 0,
                    peersHelped: 0,
                    learningActivities: 0,
                };
                needsSave = true;
            }
        });
        if (needsSave) {
            await syncSpace.save();
        }

        // Update last active timestamp for the member (only for new structure)
        const memberIndex = syncSpace.members.findIndex(member => {
            if (member.user && member.user._id) {
                return member.user._id.toString() === req.user.userId;
            }
            return false; // Old structure doesn't have lastActive tracking
        });
        if (memberIndex !== -1) {
            syncSpace.members[memberIndex].lastActive = new Date();
            await syncSpace.save();
        }

        res.json(syncSpace);
    } catch (error) {
        console.error('Error fetching Sync Space:', error);
        res.status(500).json({ message: 'Error fetching Sync Space', error: error.message });
    }
};



// Share a task with the Sync Space
exports.shareTask = async (req, res) => {
    try {
        const { taskId } = req.body;
        const syncSpace = await SyncSpace.findById(req.params.id);
        const task = await Task.findById(taskId);
        const user = await User.findById(req.user.userId);

        if (!syncSpace || !task) {
            return res.status(404).json({ message: 'Sync Space or Task not found' });
        }

        // Check if user is a member
        const isMember = syncSpace.members.some(member => member.user.toString() === req.user.userId);
        if (!isMember) {
            return res.status(403).json({ message: 'You are not a member of this Sync Space' });
        }

        // Add all sync space members to the task's sharedWith array
        const memberUserIds = syncSpace.members.map(member => member.user);
        task.sharedWith = [...new Set([...task.sharedWith, ...memberUserIds])];
        await task.save();

        syncSpace.sharedTasks.push(taskId);

        // Update contributor count for the sharer
        const memberIndex = syncSpace.members.findIndex(member => member.user.toString() === req.user.userId);
        if (memberIndex !== -1) {
            syncSpace.members[memberIndex].contributions.tasksCompleted += 1;
        }

        const systemMessage = {
            sender: req.user.userId,
            message: `${user.username} shared a task: '${task.title}'`,
            isSystemMessage: true,
        };
        syncSpace.chat.push(systemMessage);
        await syncSpace.save();

        req.io.to(syncSpace.id).emit('newTask', { task, systemMessage });

        res.status(200).json(syncSpace);
    } catch (error) {
        console.error('Error sharing task:', error);
        res.status(500).json({ message: 'Error sharing task', error: error.message });
    }
};

// Assign role to a member
exports.assignRole = async (req, res) => {
  try {
    const { memberId, role } = req.body;
    const syncSpace = await SyncSpace.findById(req.params.id);

    if (!syncSpace) {
      return res.status(404).json({ message: 'Sync Space not found' });
    }

    // Check if requester is a facilitator or admin-equivalent
    const requesterMember = syncSpace.members.find(member => member.user.toString() === req.user.userId);
    if (!requesterMember || (requesterMember.role !== 'facilitator' && requesterMember.role !== 'peer-mentor')) {
      return res.status(403).json({ message: 'Only facilitators or peer mentors can assign roles' });
    }

    // Find the member to update
    const memberIndex = syncSpace.members.findIndex(member => member.user.toString() === memberId);
    if (memberIndex === -1) {
      return res.status(404).json({ message: 'Member not found in this Sync Space' });
    }

    // Update role and assignment timestamp
    syncSpace.members[memberIndex].role = role;
    syncSpace.members[memberIndex].roleAssignedAt = new Date();

    // Set role rotation due date (7 days from now by default)
    const rotationInterval = syncSpace.participationSettings?.rotationIntervalDays || 7;
    syncSpace.members[memberIndex].roleRotationDue = new Date(Date.now() + rotationInterval * 24 * 60 * 60 * 1000);

    await syncSpace.save();

    const user = await User.findById(memberId);
    const systemMessage = {
      sender: req.user.userId,
      message: `${user.username} has been assigned the role: ${role}`,
      isSystemMessage: true,
    };
    syncSpace.chat.push(systemMessage);
    await syncSpace.save();

    req.io.to(syncSpace.id).emit('roleAssigned', { memberId, role, systemMessage });

    res.status(200).json(syncSpace);
  } catch (error) {
    console.error('Error assigning role:', error);
    res.status(500).json({ message: 'Error assigning role', error: error.message });
  }
};

// Rotate roles automatically
exports.rotateRoles = async (req, res) => {
  try {
    const syncSpace = await SyncSpace.findById(req.params.id);

    if (!syncSpace) {
      return res.status(404).json({ message: 'Sync Space not found' });
    }

    // Check if requester can rotate roles
    const requesterMember = syncSpace.members.find(member => member.user.toString() === req.user.userId);
    if (!requesterMember || requesterMember.role !== 'facilitator') {
      return res.status(403).json({ message: 'Only facilitators can rotate roles' });
    }

    // Simple rotation: cycle through roles
    const roles = ['facilitator', 'note-taker', 'peer-mentor', 'resource-sharer', 'participant'];
    syncSpace.members.forEach((member, index) => {
      const currentRoleIndex = roles.indexOf(member.role);
      const nextRoleIndex = (currentRoleIndex + 1) % roles.length;
      member.role = roles[nextRoleIndex];
      member.roleAssignedAt = new Date();
      member.roleRotationDue = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    });

    syncSpace.lastRoleRotation = new Date();
    await syncSpace.save();

    const systemMessage = {
      sender: req.user.userId,
      message: 'Roles have been rotated among group members',
      isSystemMessage: true,
    };
    syncSpace.chat.push(systemMessage);
    await syncSpace.save();

    req.io.to(syncSpace.id).emit('rolesRotated', { systemMessage });

    res.status(200).json(syncSpace);
  } catch (error) {
    console.error('Error rotating roles:', error);
    res.status(500).json({ message: 'Error rotating roles', error: error.message });
  }
};

// Update member learning goals and preferences
exports.updateMemberProfile = async (req, res) => {
  try {
    const { learningGoals, studyPreferences } = req.body;
    const syncSpace = await SyncSpace.findById(req.params.id);

    if (!syncSpace) {
      return res.status(404).json({ message: 'Sync Space not found' });
    }

    const memberIndex = syncSpace.members.findIndex(member => member.user.toString() === req.user.userId);
    if (memberIndex === -1) {
      return res.status(404).json({ message: 'You are not a member of this Sync Space' });
    }

    if (learningGoals !== undefined) {
      syncSpace.members[memberIndex].learningGoals = learningGoals;
    }
    if (studyPreferences !== undefined) {
      syncSpace.members[memberIndex].studyPreferences = studyPreferences;
    }

    await syncSpace.save();

    res.status(200).json(syncSpace);
  } catch (error) {
    console.error('Error updating member profile:', error);
    res.status(500).json({ message: 'Error updating member profile', error: error.message });
  }
};

// Assign task to specific members
exports.assignTask = async (req, res) => {
  try {
    const { taskId, memberIds } = req.body;
    const syncSpace = await SyncSpace.findById(req.params.id);
    const task = await Task.findById(taskId);

    if (!syncSpace || !task) {
      return res.status(404).json({ message: 'Sync Space or Task not found' });
    }

    // Check if requester can assign tasks (facilitator or peer-mentor)
    const requesterMember = syncSpace.members.find(member => member.user.toString() === req.user.userId);
    if (!requesterMember || !['facilitator', 'peer-mentor'].includes(requesterMember.role)) {
      return res.status(403).json({ message: 'Only facilitators or peer mentors can assign tasks' });
    }

    // Validate that all memberIds are valid members
    const validMemberIds = memberIds.filter(memberId =>
      syncSpace.members.some(member => member.user.toString() === memberId)
    );

    if (validMemberIds.length === 0) {
      return res.status(400).json({ message: 'No valid members found for assignment' });
    }

    // Add assignments to task
    const newAssignments = validMemberIds.map(memberId => ({
      user: memberId,
      assignedAt: new Date(),
      assignedBy: req.user.userId
    }));

    task.assignedTo.push(...newAssignments);
    await task.save();

    // Create system message
    const assignedUsernames = await Promise.all(
      validMemberIds.map(async (memberId) => {
        const user = await User.findById(memberId);
        return user.username;
      })
    );

    const systemMessage = {
      sender: req.user.userId,
      message: `${task.title} has been assigned to: ${assignedUsernames.join(', ')}`,
      isSystemMessage: true,
    };
    syncSpace.chat.push(systemMessage);
    await syncSpace.save();

    req.io.to(syncSpace.id).emit('taskAssigned', { taskId, assignments: newAssignments, systemMessage });

    res.status(200).json({ task, assignments: newAssignments });
  } catch (error) {
    console.error('Error assigning task:', error);
    res.status(500).json({ message: 'Error assigning task', error: error.message });
  }
};

// Update task progress
exports.updateTaskProgress = async (req, res) => {
  try {
    const { taskId, progress, actualHours } = req.body;
    const syncSpace = await SyncSpace.findById(req.params.id);
    const task = await Task.findById(taskId);

    if (!syncSpace || !task) {
      return res.status(404).json({ message: 'Sync Space or Task not found' });
    }

    // Check if user is assigned to this task or is a facilitator
    const requesterMember = syncSpace.members.find(member => member.user.toString() === req.user.userId);
    const isAssigned = task.assignedTo.some(assignment => assignment.user.toString() === req.user.userId);
    const canUpdate = isAssigned || (requesterMember && ['facilitator', 'peer-mentor'].includes(requesterMember.role));

    if (!canUpdate) {
      return res.status(403).json({ message: 'You are not assigned to this task or authorized to update it' });
    }

    // Update progress
    if (progress !== undefined) {
      task.progress = Math.max(0, Math.min(100, progress));
    }
    if (actualHours !== undefined) {
      task.actualHours = actualHours;
    }

    await task.save();

    // Update member contribution if progress is being made
    if (progress > 0) {
      const memberIndex = syncSpace.members.findIndex(member => member.user.toString() === req.user.userId);
      if (memberIndex !== -1) {
        syncSpace.members[memberIndex].contributions.learningActivities += 1;
        await syncSpace.save();
      }
    }

    req.io.to(syncSpace.id).emit('taskProgressUpdated', { taskId, progress: task.progress });

    res.status(200).json({ task });
  } catch (error) {
    console.error('Error updating task progress:', error);
    res.status(500).json({ message: 'Error updating task progress', error: error.message });
  }
};

// Get participation analytics
exports.getParticipationAnalytics = async (req, res) => {
  try {
    const syncSpace = await SyncSpace.findById(req.params.id)
      .populate('members.user', 'username profilePicture');

    if (!syncSpace) {
      return res.status(404).json({ message: 'Sync Space not found' });
    }

    // Check if user is a member
    const isMember = syncSpace.members.some(member => member.user._id.toString() === req.user.userId);
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this Sync Space' });
    }

    // Calculate participation metrics
    const analytics = {
      totalMembers: syncSpace.members.length,
      roleDistribution: {},
      participationBalance: {},
      inactiveMembers: [],
      topContributors: [],
    };

    // Role distribution
    syncSpace.members.forEach(member => {
      analytics.roleDistribution[member.role] = (analytics.roleDistribution[member.role] || 0) + 1;
    });

    // Participation balance and inactive members
    const now = new Date();
    const inactiveThreshold = syncSpace.participationSettings?.inactiveThresholdHours || 48;
    const thresholdMs = inactiveThreshold * 60 * 60 * 1000;

    syncSpace.members.forEach(member => {
      const totalContributions = Object.values(member.contributions).reduce((sum, val) => sum + val, 0);
      analytics.participationBalance[member.user._id] = totalContributions;

      const lastActive = new Date(member.lastActive);
      if (now - lastActive > thresholdMs) {
        analytics.inactiveMembers.push({
          user: member.user,
          lastActive: member.lastActive,
          hoursInactive: Math.floor((now - lastActive) / (60 * 60 * 1000))
        });
      }
    });

    // Top contributors
    analytics.topContributors = syncSpace.members
      .map(member => ({
        user: member.user,
        totalContributions: Object.values(member.contributions).reduce((sum, val) => sum + val, 0),
        role: member.role
      }))
      .sort((a, b) => b.totalContributions - a.totalContributions)
      .slice(0, 3);

    res.status(200).json(analytics);
  } catch (error) {
    console.error('Error getting participation analytics:', error);
    res.status(500).json({ message: 'Error getting participation analytics', error: error.message });
  }
};


// Send gentle nudges to inactive members
exports.sendParticipationNudges = async (req, res) => {
  try {
    const syncSpace = await SyncSpace.findById(req.params.id)
      .populate('members.user', 'username email');

    if (!syncSpace) {
      return res.status(404).json({ message: 'Sync Space not found' });
    }

    // Check if requester can send nudges (facilitator only)
    const requesterMember = syncSpace.members.find(member => member.user.toString() === req.user.userId);
    if (!requesterMember || requesterMember.role !== 'facilitator') {
      return res.status(403).json({ message: 'Only facilitators can send participation nudges' });
    }

    const now = new Date();
    const inactiveThreshold = syncSpace.participationSettings?.inactiveThresholdHours || 48;
    const thresholdMs = inactiveThreshold * 60 * 60 * 1000;

    const inactiveMembers = syncSpace.members.filter(member => {
      const lastActive = new Date(member.lastActive);
      return now - lastActive > thresholdMs;
    });

    // Send nudges to inactive members
    const notificationController = require('./notificationController');
    const nudgePromises = inactiveMembers.map(async (member) => {
      try {
        const hoursInactive = Math.floor((now - new Date(member.lastActive)) / (60 * 60 * 1000));
        await notificationController.createNotification(
          member.user._id,
          `👋 We miss you in ${syncSpace.name}!`,
          `It's been ${hoursInactive} hours since your last activity. Come join the study session - your contributions are valuable to the group!`,
          'sync_participation_nudge',
          `/app/sync-space/${syncSpace._id}`
        );
        return member.user.username;
      } catch (error) {
        console.error(`Error sending nudge to ${member.user.username}:`, error);
        return null;
      }
    });

    const nudgedUsers = (await Promise.all(nudgePromises)).filter(Boolean);

    // Create system message
    const systemMessage = {
      sender: req.user.userId,
      message: `Sent participation reminders to ${nudgedUsers.length} group members`,
      isSystemMessage: true,
    };
    syncSpace.chat.push(systemMessage);
    await syncSpace.save();

    req.io.to(syncSpace.id).emit('newMessage', systemMessage);

    res.status(200).json({
      message: `Sent participation nudges to ${nudgedUsers.length} members`,
      nudgedUsers
    });
  } catch (error) {
    console.error('Error sending participation nudges:', error);
    res.status(500).json({ message: 'Error sending participation nudges', error: error.message });
  }
};

// Mark a shared task as complete
exports.completeTask = async (req, res) => {
    try {
        const { taskId } = req.body;
        const syncSpace = await SyncSpace.findById(req.params.id);
        const task = await Task.findById(taskId);
        const user = await User.findById(req.user.userId);

        if (!syncSpace || !task) {
            return res.status(404).json({ message: 'Sync Space or Task not found' });
        }

        // Check if user is a member
        const isMember = syncSpace.members.some(member => member.user.toString() === req.user.userId);
        if (!isMember) {
            return res.status(403).json({ message: 'You are not a member of this Sync Space' });
        }

        // Check if user has already completed this task
        if (task.completedBy.includes(req.user.userId)) {
            return res.status(400).json({ message: 'You have already completed this task' });
        }

        // Add user to completedBy array
        task.completedBy.push(req.user.userId);

        // Update member contribution count
        const memberIndex = syncSpace.members.findIndex(member => member.user.toString() === req.user.userId);
        if (memberIndex !== -1) {
            syncSpace.members[memberIndex].contributions.tasksCompleted += 1;
        }

        // Mark as completed based on assignment logic
        let shouldMarkCompleted = false;

        if (task.assignedTo && task.assignedTo.length > 0) {
            // If task is assigned to specific members, complete when all assigned members finish
            const assignedUserIds = task.assignedTo.map(assignment => assignment.user);
            shouldMarkCompleted = assignedUserIds.every(userId => task.completedBy.includes(userId.toString()));
        } else {
            // If not assigned, use old logic: complete when all members finish
            const memberUserIds = syncSpace.members.map(member => member.user);
            shouldMarkCompleted = task.completedBy.length === memberUserIds.length;
        }

        if (shouldMarkCompleted && !task.completed) {
            task.completed = true;
            task.completedAt = new Date();
        }

        await task.save();

        const systemMessage = {
            sender: req.user.userId,
            message: `${user.username} completed '${task.title}'`,
            isSystemMessage: true,
        };

        syncSpace.chat.push(systemMessage);
        await syncSpace.save();

        // Add status field for frontend compatibility
        const taskWithStatus = {
            ...task.toObject(),
            status: task.completed ? 'completed' : 'in-progress'
        };

        req.io.to(syncSpace.id).emit('taskCompleted', { taskId, task: taskWithStatus, systemMessage });

        res.status(200).json(syncSpace);
    } catch (error) {
        console.error('Error completing task:', error);
        res.status(500).json({ message: 'Error completing task', error: error.message });
    }
};