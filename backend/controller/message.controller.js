const db = require('../models');
const Message = db.message;

// Retrieve all messages from the database.
exports.findAll = async (req, res) => {
  const query = req.query;

  try {
    const result = await Message.find().skip(10*req.params.offset).limit(10).sort({createdAt: 'DESC'});
    return res.status(200).send({ type: 'success', data: result });
  } catch (error) {
    res.status(500).send({
      message:
        error.message || "Some error occurred while retrieving Message."
    });
  }
};

exports.create = async (req, res) => {
  try {
    const newMessage = new Message(req.body ?? req);
    return newMessage.save().then((result, err) => {
      if (err) {
          res.status(200).send({ message: "Database error", type: "error" });
      }
      else {
        if(req.body) {
          res.status(200).send({ message: "New message added", type: "success", data: result });
        } else {
          const response = { message: "New message added", type: "success", data: result };
          return response;
        }
      }
    });
  } catch (err) {
    console.log(err);
  }
}