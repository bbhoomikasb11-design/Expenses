const Group = require('../models/Group');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);
    
    socket.on('join-group', (groupId) => {
      socket.join(groupId);
      console.log(`Socket ${socket.id} joined group room: ${groupId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  // Setup Change Streams as EXTRA layer
  try {
    const groupChangeStream = Group.watch([], { fullDocument: 'updateLookup' });
    
    groupChangeStream.on('change', async (change) => {
      console.log('🔄 Change stream event:', change.operationType);
      
      let groupId;
      let fullGroupData;

      if (change.operationType === 'insert') {
        groupId = change.fullDocument._id.toString();
        fullGroupData = change.fullDocument;
      } else if (change.operationType === 'update' || change.operationType === 'replace') {
        groupId = change.documentKey._id.toString();
        // Since we used fullDocument: 'updateLookup', we can grab it if returned directly 
        // Or we optionally manually fetch it so it covers populated data:
        fullGroupData = change.fullDocument || await Group.findById(groupId);
      }

      if (groupId && fullGroupData) {
        // Emit group-updated to only the specific group's room
        io.to(groupId).emit('group-updated', fullGroupData);
      }
    });

    groupChangeStream.on('error', (err) => {
      console.error('Change stream error (are you running Replica Set?):', err.message);
    });

  } catch (err) {
    console.warn('Could not initialize Mongo change streams:', err.message);
  }
};
