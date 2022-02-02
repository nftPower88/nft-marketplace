const db = require("../models");
const User = db.users;






// Retrieve all users from the database.
exports.create = async (req, res) => {
    const {body} = req;
    try {
        body.name = `User_${body.walletAddress}` // temporary solution for the user
       const result =  await User.create(body);
       return res.status(201).send(result);
    } catch (error) {
        res.status(500).send({
            message:
            error.message || "Some error occurred while retrieving Users."
        });
    }
  
};


// Retrieve all users from the database.
exports.findAll = async (req, res) => {
    const query = req.query;

    try {
       const result =  await User.find(query);
       return res.status(200).send({data: result});
    } catch (error) {
        res.status(500).send({
            message:
            error.message || "Some error occurred while retrieving Users."
        });
    }
  
  };


  exports.findOne = async (req, res) => {
    const id = req.params.id;
    try {
       const result = await User.findById(id)
       if (!result) {
        return res.status(400).send({message: 'record not found'});
       }
       return res.status(200).send(result);
        
    } catch (error) {
        res.status(500).send({
            message:
            error.message || "Some error occurred while retrieving Users."
        });
    }

  }