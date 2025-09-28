const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const syncSpaceController = require('../controllers/syncSpaceController');

console.log('🔄 SyncSpace routes loaded successfully');
console.log('Available controller functions:', Object.keys(syncSpaceController));

// Create a new Sync Space
router.post('/', auth, syncSpaceController.createSyncSpace);

// Join a Sync Space
router.post('/join', auth, syncSpaceController.joinSyncSpace);

// Get all Sync Spaces for a user
router.get('/', auth, syncSpaceController.getSyncSpaces);

// Get Sync Space details
router.get('/:id', auth, syncSpaceController.getSyncSpace);



// Share a task with the Sync Space
router.post('/:id/tasks', auth, syncSpaceController.shareTask);

// Mark a shared task as complete
router.post('/:id/tasks/complete', auth, syncSpaceController.completeTask);

// Role management
router.post('/:id/roles/assign', auth, syncSpaceController.assignRole);
router.post('/:id/roles/rotate', auth, syncSpaceController.rotateRoles);

// Member profile updates
router.put('/:id/member/profile', auth, syncSpaceController.updateMemberProfile);

// Task assignment and progress
router.post('/:id/tasks/:taskId/assign', auth, syncSpaceController.assignTask);
router.put('/:id/tasks/:taskId/progress', auth, syncSpaceController.updateTaskProgress);

// Participation analytics
router.get('/:id/analytics', auth, syncSpaceController.getParticipationAnalytics);

// Participation nudges
router.post('/:id/nudges', auth, syncSpaceController.sendParticipationNudges);


module.exports = router;