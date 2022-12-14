const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const path = require("path");
const http = require("http");
const passport = require("passport");
const helmet = require("helmet");
const { Issuer, Strategy, tokenSet } = require("openid-client");
const { userinfo } = require("os");

const app = express();
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.set("view", path.join(__dirname, "view"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true
}));

app.use(helmet());

app.use(passport.initialize());
app.use(passport.session());

const httpServer = http.createServer(app)

passport.serializeUser((user, done) => {
    console.log('-----------------------------');
    console.log('serialize user');
    console.log(user);
    console.log('-----------------------------');
    done(null, user);
});
passport.deserializeUser((user, done) => {
    console.log('-----------------------------');
    console.log('deserialize user');
    console.log(user);
    console.log('-----------------------------');
    done(null, user);
});

Issuer.discover("http://localhost:3000/oidc")
    .then((oidcIssuer) => {
        let client = new oidcIssuer.Client({
            client_id: "oidcCLIENT",
            client_secret: "client_super_secret",
            redirect_uris: ["http://localhost:8080/auth/login/callback"],
            response_types: ['code']
        });
        passport.use("oidc", new Strategy({
            client, passReqToCallback: true
        },
            (req, tokenSet, userinfo, done) => {
                console.log('tokenSet', tokenSet);
                console.log("userinfo", userinfo);
                req.session.tokenSet = tokenSet;
                req.session.userinfo = userinfo;
                return done(null, tokenSet.claims());
            }))
    })

app.get("/login",
    (req, res, next) => {
        console.log("--------------------------------");
        console.log('Login handler started')
        next();
    },
    passport.authenticate('oidc', {scope: "openid"}));

app.get("/login/callback", (req, res, next) => {
    passport.authenticate("oidc", { successRedirect: "/user", failureRedirect: "/" })(req, res, next)
})

app.get("/", (req, res) => {
    res.send("<a href='/login'>Log In with OAuth 2.0 Provider </a>")
})

app.get("/user", (req, res) => {
    res.header("Content-Type", "application/json");
    res.end(JSON.stringify({ tokenSet: req.session.tokenSet, userinfo: req.session.userinfo }, null, 2))
})

httpServer.listen(8080, () => {
    console.log(`Http Server Runing on port 3004`)
});