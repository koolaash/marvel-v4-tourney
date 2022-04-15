const db = require("quick.db");

module.exports = {
  name: "s-owner",
  category: "OWNERS",
  userPermissions: [],
  botPermissions: ["EMBED_LINKS"],

  run: async (client, message, args) => {
    if (!client.config.bowner.includes(message.author.id)) return;
    if (!args[0]) {
      return
    }
    const target =
      message.mentions.members.first() ||
      message.guild.members.guild.cache.get[0];

    if (!args[1]) return

    if (args[1] === "add") {
      db.set(`noprefix${target.id}`, true)
      return //message.lineReply("Done").then(m => m.delete({ timeout: 3000 }))
    } else if (args[1] === 'remove') {
      db.delete(`noprefix${target.id}`)
      return //message.lineReply("Done").then(m => m.delete({ timeout: 3000 }))
    }
  }
}