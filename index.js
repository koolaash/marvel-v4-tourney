const { Client, Collection, WebhookClient } = require("discord.js"),
    client = new Client({
        intents: 574,
    }),
    web = new WebhookClient('964497868276772944', '0wOVgkhr_Uq5FwjU7qjnbLWyeFMmY70iUDdTwpqM3bOh5pK4VPt9RvQtFtJbo8YgqozD');

require("discord-reply");
const disbut = require("discord-buttons");
disbut(client);

client.commands = new Collection();
client.aliases = new Collection();
client.emoji = require("./json/emoji.json");
client.embed = require("./json/embed.json");
client.color = require("./json/embed.json");
client.config = require("./config.json");
client.web = web;
client.snipes = new Collection();
const mongoose = require("mongoose");

const dbOptions = {
    useNewUrlParser: true,
    autoIndex: false,
    poolSize: 5,
    connectTimeoutMS: 10000,
    family: 4,
    useUnifiedTopology: true,
};
mongoose.connect(process.env.DB || client.config.DB, dbOptions);
mongoose.set("useFindAndModify", false);
mongoose.Promise = global.Promise;
mongoose.connection.on("connected", () => {
    console.log("MONGOOSE LONG DAATABASE CONNECTED".yellow);
});
mongoose.connection.on("err", (err) => {
    console.log(`Mongoose connection error: \n ${err.stack}`);
});
mongoose.connection.on("disconnected", () => {
    console.log("Mongoose disconnected");
});
const { Database } = require("quickmongo");
client.qdb = new Database(process.env.DB || client.config.DB);
client.qdb.on("ready", () => {
    console.log("[DB] QUICK CONNECTED");
});
client.prefixModel = require('./models/prefixes.js');

require('events').EventEmitter.defaultMaxListeners = 100;
process.setMaxListeners(100);
["command", "events"].forEach((handler) => {
    require(`./handlers/${handler}`)(client);
});

require('./tournet.js')(client)

process.on("unhandledRejection", (error) => {
    web.send(`\`\`\`js\n${error.stack}\`\`\``);
});
process.on("uncaughtException", (err, origin) => {
    web.send(`\`\`\`js\n${err.stack}\`\`\``);
});
process.on("uncaughtExceptionMonitor", (err, origin) => {
    web.send(`\`\`\`js\n${err.stack}\`\`\``);
});
process.on("beforeExit", (code) => {
    web.send(`\`\`\`js\n${code}\`\`\``);
});
process.on("exit", (code) => {
    web.send(`\`\`\`js\n${code}\`\`\``);
});
process.on("multipleResolves", (type, promise, reason) => { });

client.login(process.env.TOKEN || client.config.TOKEN)