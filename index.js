const app = require("./app");
const serverless = require("serverless-http");
app.listen(9010,()=>{
console.log("server listening on http://localhost:9010")
})
module.exports.handler = serverless(app);
