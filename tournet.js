const discord = require("discord.js"),
    db = require("quick.db"),
    tesseract = require("node-tesseract-ocr"),
    config = {
        lang: "eng",
        oem: 1,
        psm: 4,
    }

module.exports = function (client) {
    const description = {
        name: "TOURNAMENT EXECUTOR",
        filename: "tournet.js",
        version: "2.0.0",
    };
    console.log(
        ` :: ⬜️ Loaded : ${description.name} from ("${description.filename}")`
    );

    client.on('message', async message => {
        if (!message.guild || message.author.bot) return;
        const chan = db.get(`chan${message.guild.id}${message.channel.id}`),
            sschan = db.get(`sschan${message.guild.id}${message.channel.id}`),
            modRole = db.get(`modRole${message.guild.id}`)
        try {
            if (!message.member) {
                message.member = await message.guild.fetchMember(message);
            }
            if (chan === true) {
                if (message.member.roles.cache.has(modRole)) return
                const msize = db.get(`msize${message.guild.id}${message.channel.id}`),
                    alreg = db.get(`regmem.mem${message.guild.id}${message.channel.id}`);

                if (alreg === null || alreg === undefined) {
                    db.push(
                        `regmem.mem${message.guild.id}${message.channel.id}`,
                        "1234567890"
                    );
                }
                let m = message.content.toLowerCase();
                if (!m.includes("team")) {
                    return message.lineReply(
                        new discord.MessageEmbed({
                            description:
                                `${client.emoji.fail}| PROPER FORMAT FOR REGISTRATION IS\nTeam Name : \`team_name_here\nAll Other Details\nMention teammates along with format\``,
                            color: client.embed.cf,
                        })
                    ) &&
                        message.react(client.emoji.fail)
                }
                let count = false,
                    tnames = message.content.toLowerCase().split("\n"),
                    name,
                    link =
                        `https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`;

                function removeFromString(words, tnames) {
                    return words.reduce((result, word) => result.replace(word, ""), tnames);
                }
                tnames.forEach((tname) => {
                    if (tname.includes("team")) {
                        name = removeFromString(
                            [
                                "team ",
                                "name ",
                                ": ",
                                "- ",
                                /<@(.*?)>/,
                                ":-",
                                "name:",
                                "discord",
                                "discordid",
                                "player",
                                "ign",
                                "character",
                                "id",
                                ":",
                                "-",
                                ": - ",
                                ": - ",
                            ],
                            tname
                        )
                            .split(" ")
                            .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
                            .join(" ");
                    }
                });
                if (msize !== "0") {
                    if (message.mentions.members.size < msize) {
                        return message.lineReply(
                            new discord.MessageEmbed()
                                .setDescription(
                                    `${client.emoji.fail}| MINIMUM MENTIONS REQUIRED IS \`${msize}\`\nMembers You Mention Must Be In This Server`
                                )
                                .setColor(client.embed.cf)
                        ) &&
                            message.react(client.emoji.fail)
                    } else {
                        const alre = db.get(
                            "regmem.mem" + message.guild.id + message.channel.id
                        );
                        if (
                            message.mentions.members.forEach((member) => {
                                if (count === true) return;
                                if (alre.includes(member.id)) {
                                    return (
                                        message.lineReply(
                                            `${client.emoji.fail}| Make Sure You Mention Members Who Is Not Registered With This Tournament Already`
                                        ) && (count = true) &&
                                        message.react(client.emoji.fail)
                                    );
                                } else if (member.user.bot) {
                                    return (
                                        message.lineReply(
                                            `${client.emoji.fail}| Make Sure You Mention Real Members Not Bots`
                                        ) && (count = true) &&
                                        message.react(client.emoji.fail)
                                    );
                                }
                            })
                        ) {
                            return;
                        } else {
                            if (count === true) return;
                            message.mentions.members.forEach((member) => {
                                db.push(
                                    `regmem.mem${message.guild.id}${message.channel.id}`,
                                    member.id
                                );
                            });
                            let mentions = message.mentions.members
                                .map((m) => m.user.tag)
                                .join(" , ");

                            db.add(`number${message.guild.id}${message.channel.id}`, 1);
                            const cchan = db.get(
                                `cchan${message.guild.id}${message.channel.id}`
                            ),
                                crole = db.get("crole" + message.guild.id + message.channel.id),
                                no = db.get("number" + message.guild.id + message.channel.id),
                                mr = message.guild.roles.cache.get(crole),
                                crm = message.guild.channels.cache.get(cchan);
                            const aemb = new discord.MessageEmbed()
                                .setTitle("Team No. " + no)
                                .setDescription(
                                    `**Team Name : [${name}](${link})**\n\`\`\`${mentions}\`\`\``
                                )
                                .setColor(client.embed.cr);
                            return (
                                message.member.roles.add(mr) &&
                                message.lineReply(
                                    `${client.emoji.success}| Registeration Successful`
                                ) &&
                                crm.send(`<@!${message.author.id}>`, aemb) &&
                                message.react(client.emoji.success)
                            );
                        }
                    }
                } else if (msize === "0") {
                    if (count === true) return;
                    db.add(`number${message.guild.id}${message.channel.id}`, 1);
                    const cchan = db.get(`cchan${message.guild.id}${message.channel.id}`),
                        crole = db.get(`crole${message.guild.id}${message.channel.id}`),
                        no = db.get(`number${message.guild.id}${message.channel.id}`),
                        mr = message.guild.roles.cache.get(crole),
                        crm = message.guild.channels.cache.get(cchan);
                    const aemb = new discord.MessageEmbed()
                        .setTitle("Team No. " + no)
                        .setDescription(`**Team Name : [${name}](${link})**`)
                        .setColor(client.embed.cr);
                    return (
                        message.member.roles.add(mr) &&
                        message.lineReply(
                            `${client.emoji.success}| Registeration Successful`
                        ) &&
                        crm.send("<@!" + message.author.id + ">", aemb) &&
                        message.react(client.emoji.success)
                    );
                }
            } else if (sschan === true) {
                if (message.attachments.size > 0) {
                    if (message.member.roles.cache.has(modRole)) return
                    const sssize = db.get(`sssize${message.guild.id}${message.channel.id}`),
                        assent = db.get(
                            `usersssent${message.guild.id}${message.channel.id}${message.author.id}`
                        );
                    if (assent === null || assent === undefined) {
                        db.set(
                            `usersssent${message.guild.id}${message.channel.id}${message.author.id}`,
                            0
                        );
                    }
                    await message.attachments.forEach(async attachment => {
                        let img = attachment.proxyURL,
                            sstype = db.get(`sstype${message.guild.id}${message.channel.id}`),
                            ssname = db.get(`ssname${message.guild.id}${message.channel.id}`),
                            condi,
                            text = await tesseract.recognize(img, config);
                        if (sstype === "youtube" || sstype === "yt") {
                            condi = "SUBSCRIBED"
                        } else if (sstype === 'instagram' || sstype === "insta") {
                            condi = "Following"
                        }
                        if (text.includes([ssname]) && text.includes([sstype])) {
                            db.add(
                                `usersssent${message.guild.id}${message.channel.id}${message.author.id}`,
                                1
                            );
                        }
                    })
                    message.lineReply("Please wait.....")
                    setTimeout(async function () {
                        const asnt = await db.get(
                            `usersssent${message.guild.id}${message.channel.id}${message.author.id}`
                        );

                        if (asnt >= sssize) {
                            const ssrole = db.get(
                                `ssrole${message.guild.id}${message.channel.id}`
                            ),
                                sr = message.guild.roles.cache.get(ssrole);
                            return (
                                message.member.roles.add(sr) &&
                                message.lineReply(
                                    new discord.MessageEmbed()
                                        .setDescription(
                                            `${client.emoji.success}| Submission Successful Proceed For Next Step`
                                        )
                                        .setColor(client.embed.cr)
                                ).then(m => m.delete({ timeout: 3000 })) &&
                                db.delete(
                                    `usersssent${message.guild.id}${message.channel.id}${message.author.id}`
                                ) &&
                                message.react(client.emoji.success) &&
                                message.delete({ timeout: 3000 })
                            );
                        } else {
                            let remain = sssize - asnt;
                            message.lineReply(
                                `${client.emoji.fail}| **You Need To Upload \`${remain}\` More Screenshots**`
                            ).then(m => m.delete({ timeout: 3000 })) &&
                                message.react(client.emoji.fail) &&
                                message.delete({ timeout: 3000 })
                        }
                    }, 7500)
                }
            }
        } catch (e) {
            console.log(e)
        }
    })
}