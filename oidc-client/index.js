const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const path = require("path");
const http = require("http");
const { truncate } = require("fs");

const app = express();
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));

app.set("view", path.join(__dirname, "view"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname,"public")));

app.use(session({
    secret:"secret",
    resave:false,
    saveUninitialized:true
}));

const httpServer = http.createServer(app)

httpServer.listen(8080, ()=> {
    console.log(`Http Server Runing on port 3004`)
});