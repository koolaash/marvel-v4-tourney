const { readdirSync
} = require("fs"),
  ascii = require("ascii-table");

let table = new ascii("Commands");
table.setHeading("Command",
  "Load status");
module.exports = client => {
  readdirSync("./commands/").forEach(dir => {
    const commands = readdirSync(`./commands/${dir
      }/`).filter(file =>
        file.endsWith(".js")
      );

    for (let file of commands) {
      let pull = require(`../commands/${dir
        }/${file
        }`);
      if (pull.name) {
        client.commands.set(pull.name, pull);
        table.addRow(file,
          "♻️  => no error.!");
      } else {
        table.addRow(file, `☠️  => error.!`);
        continue;
      }
      if (pull.aliases && Array.isArray(pull.aliases))
        pull.aliases.forEach(alias => client.aliases.set(alias, pull.name));
    }
  });
  console.log(table.toString());
};
