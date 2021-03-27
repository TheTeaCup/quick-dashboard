const express = require('express');
const DiscordOauth2 = require("discord-oauth2");
const config = require("./config.json");

const oauth = new DiscordOauth2({
    clientId: config.ID,
    clientSecret: config.SECRET,
    redirectUri: config.CALLBACK,
});
const app = express();

app.get("/", (req, res) => {
    res.send(`
    <a href="login"> Login </a>
    `)
});

app.get("/login", (req, res) => {
    const url = oauth.generateAuthUrl({
        // replace this with what you want
        scope: ["identify", "guilds"],
    });

    res.redirect(url);

});

app.get("/callback", async (req, res) => {

    let code = req.query.code;
    if (!code) return res.json({ error: true, message: "no code" });

    try {


        let data = {
            user: null,
            guilds: null
        };

        let token = await oauth.tokenRequest({
            code: code,
            grantType: "authorization_code"
        });

        token = token.access_token;

        let user = await oauth.getUser(token);
        let guilds = await oauth.getUserGuilds(token);

        data.user = user;
        data.guilds = guilds

        //console.log(data)

        await res.send(data)
    } catch (e) {
        console.log(e)
        res.send(`Error Occured <br/> <a href="/login"> Try Again? </a>`)
    }
});

app.listen(config.PORT);