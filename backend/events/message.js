const { messageController } = require('../controller');

module.exports = {
  notificationEvent: (io, socket) => {
    try {
      socket.on('message-send', async (data) => {
        try {
          const result = await messageController.create(data);
          console.log(result);
          io.emit('message-receive', {data: result});
        } catch (err) {
          // tslint:disable-next-line: no-console
          console.log(err);
        }
      });
    } catch(err) {
      console.log(err);
    }
  }
};