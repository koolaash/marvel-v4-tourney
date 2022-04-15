const disocrd = require("discord.js"),
  { MessageEmbed } = require("discord.js"),
  db = require("quick.db"),
  disbut = require("discord-buttons"),
  discord = require("discord.js");

module.exports = {
  name: "setup",
  description: "setup bot with updates channel",
  category: "HELP",
  usage: "help",
  userPermissions: ["ADMINISTRATOR"],
  botPermissions: ["EMBED_LINKS", "MANAGE_CHANNELS", "MANAGE_ROLES"],
  vote: true,

  async run(client, message, args) {
    const setup = db.get("setup" + message.channel.guild.id),
      setchan = message.guild.channels.cache.get(setup);


     let msg = `@here\nThank you for choosing **MARVEL**

We hope marvel do help you with your server.
You can join the support server by taping the support button below.

You can also vote us ( https://top.gg/bot/748583869527097376/vote ) please do support our bot.

**Note : ** 
- Make sure not to delete this channel.
- You can rename the channel.
- you can categorize the channel.

Add me to other servers by tapping the invite button.

Thank you :heart:`
    let btn1 = new disbut.MessageButton()
    .setStyle("url")
    .setLabel("|  SUPPORT")
    .setURL(client.config.bserver)
    .setEmoji(client.emoji.discord_id)
    .setDisabled(false);
  const btn2 = new disbut.MessageButton()
    .setStyle("url")
    .setLabel("|  INVITE")
    .setURL(client.config.binvite)
    .setEmoji(client.emoji.invite_id)
    .setDisabled(false);

  const btn3 = new disbut.MessageButton()
    .setStyle("url")
    .setLabel("|  WEBSITE")
    .setURL(client.config.bwebsite)
    .setEmoji(client.emoji.dm_id)
    .setDisabled(false);
  const btn4 = new disbut.MessageButton()
    .setStyle("url")
    .setLabel("|  VOTE")
    .setURL(client.config.bvote)
    .setEmoji(client.emoji.discord_id)
    .setDisabled(false);

  const row = new disbut.MessageActionRow()
    .addComponent(btn1)
    .addComponent(btn2)
    .addComponent(btn3)
    .addComponent(btn4);
    
    if (
      setup === null ||
      setup === undefined ||
      !setup ||
      !setchan ||
      setchan === null ||
      setchan === undefined
    ) {
      let c = await message.guild.channels
        .create("marvel-private")
        .then((channel) => {
          channel.updateOverwrite(client.user, {
            VIEW_CHANNEL: true,
            SEND_MESSAGES: true,
            EMBED_LINKS: true,
          });
          channel.updateOverwrite(message.guild.roles.everyone, {
            VIEW_CHANNEL: false,
          });
          channel.send(msg, {
            components: [row],
          })
          message.lineReply(
            new discord.MessageEmbed({
              description:
                client.emoji.success +
                "| <#" +
                channel.id +
                "> Is created and set as update channel",
              color: client.embed.cr,
            })
          );
          db.set("setup" + message.guild.id, channel.id);
          return;
        });
    } else {
      return message.lineReply(
        new discord.MessageEmbed({
          description:
            client.emoji.fail + "| <#" + setchan.id +
            "> Is already set as update channel in this" +
            " guild make sure to give me permissions in that channel",
          color: client.embed.cf,
        })
      );
    }
  },
};
