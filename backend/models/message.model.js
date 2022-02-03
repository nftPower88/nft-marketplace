
const { SchemaTypes } = require("mongoose")

module.exports = mongoose => {
  const schema = mongoose.Schema({
    text: String,
    sender: SchemaTypes.ObjectId,
    walletAddress: String,
  }, {
    timestamps: true
  })

  const Message = mongoose.model("Message", schema);  
  return Message;
} 