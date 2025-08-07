const v1_router = require("express").Router();
const auth_router = require("./auth/auth.routes");
v1_router.use("/auth", auth_router);

module.exports = v1_router;
