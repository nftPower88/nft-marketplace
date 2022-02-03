const { messageController } = require('../controller');

module.exports = {
  notificationEvent: (io, socket) => {
    try {
      socket.on('message-send', async (data) => {
        try {
          const result = await messageController.create(data);
          io.emit('message-receive', {data: result?.data, type: 'success'});
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