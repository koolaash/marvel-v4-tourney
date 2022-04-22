const discord = require("discord.js"),
    db = require("quick.db"),
    ms = require("ms"),
    disbut = require("discord-buttons"),
    Timeout = new discord.Collection();

module.exports.run = async (client, message) => {
    if (message.author.bot || !message.guild) return;
    let defprefix = client.config.pprefix,
        { bowner } = client.config,
        nprefix = await client.qdb.get(`guildPrefix_${message.guild.id}`);
    if (nprefix !== null) {
        defprefix = nprefix;
    }

    // For user with prefix
    // normal users

    const marvelMention = new RegExp(`^<@!?${client.user.id}>`),
        marvel = message.content.match(marvelMention) ? message.content.match(marvelMention)[0] : defprefix;

    if (message.content.startsWith(marvel)) {
        try {
            const modOnly = db.get("modOnly" + message.guild.id);
            if (!message.member)
                message.member = await message.guild.fetchMember(message);
            const m = message.content.toLowerCase();
            let args = message.content.slice(marvel.length).trim().split(/ +/g),
                arg = m.slice(marvel.length).trim().split(/ +/g),
                cmd = args.shift().toLowerCase();
            if (cmd.length === 0) return;
            let command = client.commands.get(cmd);
            if (!command) command = client.commands.get(client.aliases.get(cmd));
            if (command) {

                if (command.setup === true) {
                    const setup = db.get("setup" + message.channel.guild.id),
                        setchan = message.guild.channels.cache.get(setup);
                    if (
                        setup === null ||
                        setup === undefined ||
                        !setup ||
                        !setchan ||
                        setchan === null ||
                        setchan === undefined
                    ) {
                        return message.lineReply(
                            new discord.MessageEmbed({
                                description:
                                    client.emoji.fail + "| Please run `" +
                                    defprefix + "setup` command first!\nI'll create a channel "
                                    + "for updates make sure your security bot don't kick me!",
                                color: client.embed.cf,
                            })
                        );
                    }
                }

                if (command.modRole === true) {
                    const modRol = db.get("modrole" + message.guild.id);
                    if (!modRol || modRol === null) {
                        return message.lineReply(
                            new discord.MessageEmbed({
                                color: client.embed.cf,
                                description:
                                    client.emoji.fail + "| You need to set ModRole first to use this command use `" +
                                    defprefix +
                                    "modrole set @role`",
                            })
                        );
                    }
                    const modRole = message.guild.roles.cache.get(modRol);
                    if (!modRole || modRole === null) {
                        return message.lineReply(
                            new discord.MessageEmbed({
                                color: client.embed.cf,
                                description:
                                    client.emoji.fail + "| You need to set ModRole first to use this command use `" +
                                    defprefix +
                                    "modrole set @role`\n" +
                                    "I was unable to find the role you set before!",
                            })
                        );
                    }
                    let t = await message.guild.members.fetch(message.member.id)
                    if (!client.config.bowner.includes(message.member.id)) {
                        if (message.member !== message.guild.owner) {
                            if (!t.roles.cache.has(modRole.id)) {
                                return message.lineReply(
                                    new discord.MessageEmbed({
                                        color: client.embed.cf,
                                        description:
                                            client.emoji.fail + "| You need <@&" +
                                            modRole.id +
                                            "> role to execute this command!",
                                    })
                                );
                            }
                        }
                    }
                }

                if (command.vote === true) {
                    let vote = new discord.MessageEmbed({
                        description: "You need to vote first to use this command.",
                        color: client.color.cf
                    })
                    const vb = new disbut.MessageButton()
                        .setStyle("url")
                        .setLabel("|  VOTE")
                        .setURL(client.config.bvote)
                        .setEmoji(client.emoji.discord_id)
                        .setDisabled(false)
                    const row = new disbut.MessageActionRow()
                        .addComponent(vb);
                    let pre = await client.qdb.get("voted" + message.author.id);
                    if (pre !== true) return message.channel
                        .send(vote, {
                            components: [row],
                        });
                    const trt = await client.qdb.get("vote-time_" + message.author.id);
                    var milliseconds = trt;
                    var millisecondsInDay = 8.64e7;
                    var futureDate = new Date(milliseconds + 1 * millisecondsInDay);
                    var tit = Date.now();
                    if (futureDate - tit <= 0) {
                        return (
                            message.channel
                                .send(vote, {
                                    components: [row],
                                }) &&
                            client.qdb.delete("votes" + message.author.id) &&
                            client.qdb.delete("vote-time_" + message.author.id)
                        );
                    }
                }
                let cooldown = 5000;
                if (Timeout.has(`cooldown${message.author.id}`)) {
                    return message.lineReply(
                        `You are on a \`${ms(
                            Timeout.get(`cooldown${message.author.id}`) - Date.now(),
                            { long: true }
                        )}\` cooldown.`
                    );
                }
                let r = false;
                if (!client.config.bowner.includes(message.member.id)) {
                    if (modOnly === true) {
                        if (
                            !message.member.permissionsIn(message.channel).has("ADMINISTRATOR")
                        )
                            return message
                                .lineReply(
                                    client.emoji.fail + "| Bot is mod only in this guild"
                                )
                                .then((m) => m.delete({ timeout: 3000 }));
                    }

                    command.userPermissions.forEach((permission) => {
                        if (r === true) return;
                        if (
                            !message.member.permissionsIn(message.channel).has(permission)
                        ) {
                            r = true;
                            return message.lineReply(
                                client.emoji.fail +
                                "| YOU NEED **`" +
                                permission +
                                "`** PERMISSION FIRST TO EXECUTE THIS COMMAND!!"
                            ).then((m) => m.delete({ timeout: 3000 }));
                        }
                    });
                }
                command.botPermissions.forEach((permission) => {
                    if (r === true) return;
                    if (
                        !message.guild.me.permissionsIn(message.channel).has(permission)
                    ) {
                        r = true;
                        return message.lineReply(
                            client.emoji.fail +
                            "| I NEED **`" +
                            permission +
                            "`** PERMISSION FIRST TO EXECUTE THIS COMMAND!!"
                        ).then((m) => m.delete({ timeout: 3000 }));
                    }
                });
                if (r === false) {
                    try {
                        command.run(client, message, args, arg, discord, disbut, db) &&
                            Timeout.set(`cooldown${message.author.id}`, Date.now() + cooldown);
                        setTimeout(() => {
                            Timeout.delete(`cooldown${message.author.id}`);
                        }, cooldown);
                    } catch (e) {
                        console.log(e)
                        client.web.send(
                            "```js\n" + e.message + "```\n```" + command.name + "```"
                        );
                    }
                }
            }
        } catch (e) {
            console.log(e);
            client.web.send("```js\n" + e.message + "```");
        }
    }

    // no prefix 
    // commands 

    const secondOwner = client.qdbdb.get(`noprefix.mem`)
    if (secondOwner === true) {
        try {
            if (!message.member)
                message.member = await message.guild.fetchMember(message);
            const m = message.content.toLowerCase();
            let args = message.content.slice().trim().split(/ +/g),
                arg = m.slice().trim().split(/ +/g),
                cmd = args.shift().toLowerCase();
            if (cmd.length === 0) return;

            let command = client.commands.get(cmd);
            if (!command) command = client.commands.get(client.aliases.get(cmd));
            if (command) {
                if (command.modRole === true) {
                    const modRol = db.get("modrole" + message.guild.id);
                    if (!modRol || modRol === null) {
                        return message.lineReply(
                            new discord.MessageEmbed({
                                color: client.embed.cf,
                                description:
                                    client.emoji.fail +
                                    "| You need to set ModRole first to use this command use `" +
                                    defprefix +
                                    "modrole set @role`",
                            })
                        );
                    }
                    const modRole = message.guild.roles.cache.get(modRol);
                    if (!modRole || modRole === null) {
                        return message.lineReply(
                            new discord.MessageEmbed({
                                color: client.embed.cf,
                                description:
                                    client.emoji.fail +
                                    "| You need to set ModRole first to use this command use `" +
                                    defprefix +
                                    "modrole set @role`\n" +
                                    "I was unable to find the role you set before!",
                            })
                        );
                    }
                    let t = await message.guild.members.fetch(message.member.id)
                    if (!client.config.bowner.includes(message.member.id)) {
                        if (message.member !== message.guild.owner) {
                            if (!t.roles.cache.has(modRole.id)) {
                                return message.lineReply(
                                    new discord.MessageEmbed({
                                        color: client.embed.cf,
                                        description:
                                            client.emoji.fail + "| You need <@&" +
                                            modRole.id +
                                            "> role to execute this command!",
                                    })
                                );
                            }
                        }
                    }
                }
                if (command.vote === true) {
                    let vote = new discord.MessageEmbed({
                        description: "You need to vote first to use this command.",
                        color: client.color.cf
                    })
                    const vb = new disbut.MessageButton()
                        .setStyle("url")
                        .setLabel("|  VOTE")
                        .setURL(client.config.bvote)
                        .setEmoji(client.emoji.discord_id)
                        .setDisabled(false)
                    const row = new disbut.MessageActionRow()
                        .addComponent(vb);
                    let pre = await client.qdb.get("voted" + message.author.id);
                    if (pre !== true) return message.channel
                        .send(vote, {
                            components: [row],
                        });
                    const trt = await client.qdb.get("vote-time_" + message.author.id);
                    var milliseconds = trt;
                    var millisecondsInDay = 8.64e7;
                    var futureDate = new Date(milliseconds + 1 * millisecondsInDay);
                    var tit = Date.now();
                    if (futureDate - tit <= 0) {
                        return (
                            message.channel
                                .send(vote, {
                                    components: [row],
                                }) &&
                            client.qdb.delete("votes" + message.author.id) &&
                            client.qdb.delete("vote-time_" + message.author.id)
                        );
                    }
                }
                let r = false;
                const modOnly = db.get("modOnly" + message.guild.id);
                if (!bowner.includes(message.member.id)) {
                    if (modOnly === true) {
                        if (
                            !message.member.permissionsIn(message.channel).has("ADMINISTRATOR")
                        )
                            return message
                                .lineReply(
                                    client.emoji.fail + "| Bot is mod only in this guild"
                                )
                                .then((m) => m.delete({ timeout: 3000 }));
                    }
                    command.userPermissions.forEach((permission) => {
                        if (r === true) return;
                        if (
                            !message.member.permissionsIn(message.channel).has(permission)
                        ) {
                            r = true;
                            return message.lineReply(
                                client.emoji.fail +
                                "| YOU NEED **`" +
                                permission +
                                "`** PERMISSION FIRST TO EXECUTE THIS COMMAND!!"
                            ).then((m) => m.delete({ timeout: 3000 }));
                        }
                    });
                }
                command.botPermissions.forEach((permission) => {
                    if (r === true) return;
                    if (
                        !message.guild.me.permissionsIn(message.channel).has(permission)
                    ) {
                        r = true;
                        return message.lineReply(
                            client.emoji.fail +
                            "| I NEED **`" +
                            permission +
                            "`** PERMISSION FIRST TO EXECUTE THIS COMMAND!!"
                        ).then((m) => m.delete({ timeout: 3000 }));
                    }
                });
                if (r === false) {
                    try {
                        command.run(client, message, args, arg, discord, disbut, db)
                    } catch (e) {
                        console.log(e)
                        client.web.send(
                            "```js\n" + e.message + "```\n```" + command.name + "```"
                        );
                    }
                }
            }
        } catch (e) {
            console.log(e);
            client.web.send("```js\n" + e.message + "```");
        }
    }

    // announcement system starts here
    // for marvel private channels across the servers

    if (message.channel.id === client.config.announce) {
        if (!client.config.bowner.includes(message.author.id)) {
            return;
        }
        const ok = new disbut.MessageButton()
            .setStyle("green")
            .setEmoji(client.emoji.tick_id)
            .setID("okay")
            .setDisabled(false);

        const cancel = new disbut.MessageButton()
            .setStyle("red")
            .setEmoji(client.emoji.cross_id)
            .setID("cancel")
            .setDisabled(false);

        const row = new disbut.MessageActionRow()
            .addComponent(ok)
            .addComponent(cancel);

        message.channel
            .send(message.content, {
                components: [row],
            })
            .then((m) => {
                client.on("clickButton", async (button) => {
                    try {
                        if (button.clicker.id !== message.author.id) return;
                        if (button.message.id !== m.id) return;
                        if (button.id == "cancel") {
                            return m.delete();
                        } else if (button.id === "okay") {
                            m.delete();
                            client.guilds.cache.forEach((guild) => {
                                const setup = db.get(`setup${guild.id}`)
                                if (!setup || setup === null) return
                                const setchan = guild.channels.cache.get(setup);
                                try {
                                    setchan.send(message.content)
                                    console.log(`${guild.name} Sent`)
                                } catch (e) {
                                    return db.delete(`setup${guild.id}`)
                                }
                            });
                        } else {
                            return;
                        }
                    } catch (e) {
                        console.log(e);
                    }
                });
            });
    }
}