const userRoutes = require("./user.routes");


module.exports = app => {

    //register all routes
    app.use("/api/users", userRoutes);

}