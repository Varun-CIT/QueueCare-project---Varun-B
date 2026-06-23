let io = null;

const setSocketInstance = (socketIo) => {
  io = socketIo;
};

const emitQueueUpdate = (patients) => {
  if (io) {
    io.emit("queueUpdated", patients);
  }
};

module.exports = {
  setSocketInstance,
  emitQueueUpdate,
};