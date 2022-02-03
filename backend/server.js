const express = require("express");
const cors = require("cors");
const app = express();

const corsOptions = {
  origin: "*"
};

app.use(cors(corsOptions));

app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));   /* bodyParser.urlencoded() is deprecated */

const db = require("./models");
const message = require("./events/message");
console.log(db.connString);
db.mongoose
  .connect(db.connString, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log(db.connString , " Cannot connect to the database!", err);
    process.exit();
  });
// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome !" });
});

// all routes
require("./routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}. http://localhost:${PORT}`);
});

// socket server:
/* tslint:disable */
const socketServer = require('http').Server(app);
const io = require('socket.io')(socketServer, {
  cors: {
    origin: '*'
  }
});

socketServer.listen(process.env.SOCKET_SERVER_PORT || 8889, () => {
  console.log('SOCKET Server successfully started at port', socketServer.address().port, 'and host', socketServer.address().address);
  console.log('--------------------Running Hubbers Socket Server-------------------------');
});

io.on('connection', (socket) => {
  message.notificationEvent(io, socket);
  socket.on('disconnect', (data, callback) => {
    // tslint:disable-next-line: no-console
    console.log('disconnect=>', data);
  });
});