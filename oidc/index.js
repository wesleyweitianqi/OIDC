const express = require("express");
const app = express();
const { Provider } = require('oidc-provider');
const path = require("path");

app.use(express.static(__dirname + "/public"));
app.set("view", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const configuration = {
    clients: [{
        client_id: "oidcCLIENT",
        client_secret: "some_super_secret",
        grant_types: ["authorization_code"],
        redirect_uris: ["http://localhost:8080/auth/login/callback", "https://oidcdebugger.com/debug"],
        response_types: ["code"]
    }],
    pkce: {
        required: () => false
    },
}

const oidc = new Provider('http://localhost:3000', configuration);

app.use("/oidc", oidc.callback())

app.listen(3000, () => {
    console.log("OIDC is listening on port 3000!")
});