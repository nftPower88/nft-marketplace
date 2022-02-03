const userRoutes = require("./user.routes");
const messageRoutes = require("./message.router");


module.exports = app => {

    //register all routes
    app.use("/api/users", userRoutes);
    app.use("/api/message", messageRoutes);

}