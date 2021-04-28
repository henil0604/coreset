let STARTING_TIME = Date.now();
let express = require("express");
let cors = require("cors");
let app = express();
let config = require("./config.json");
let port = process.env.PORT || config.system.PORT;
let handler = require("./node/handler");

app.use("/assets", express.static("assets"));
app.use("/public", express.static("public"));
app.use("/handler.js", express.static("public/coreset.js"));
app.use("/test.html", express.static("public/test.html"));
app.use(cors())
app.use(handler)


app.listen(port, () => {

    console.log(`
        - Listening on Port ${port}:
            http://127.0.0.1:${port}
            http://localhost:${port}

        - Took ${Date.now() - STARTING_TIME}ms To Load Up
    `)

})