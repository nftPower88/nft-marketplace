const db = require('../models');
const Message = db.message;

// Retrieve all messages from the database.
exports.findAll = async (req, res) => {
  const query = req.query;

  try {
    const result = await Message.find(query);
    return res.status(200).send({ data: result });
  } catch (error) {
    res.status(500).send({
      message:
        error.message || "Some error occurred while retrieving Message."
    });
  }
};

exports.create = async (req, res) => {
  try {
    const newMessage = new Message(req.body);
    await newMessage.save((err, result) => {
      if (err)
        res.status(200).send({ message: "Database error", type: "error" });
      else
        res.status(200).send({ message: "New message added", type: "success", data: result });
    });
  } catch (err) {
    console.log(err);
  }
}