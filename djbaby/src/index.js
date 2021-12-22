require("dotenv").config();
const { Client, Intents } = require("discord.js");
const bajao = require("./commands/bajao");

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.login(process.env.TOKEN);

client.once("ready", () => {
  console.log("Ready!");
});

client.once("reconnecting", () => {
  console.log("Reconnecting!");
});

client.once("disconnect", () => {
  console.log("Disconnect!");
});

const queue = new Map();

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(process.env.PREFIX)) return;
  // const serverQueue = queue.get(message.guild.id);
  if (
    message.content.startsWith(`${process.env.PREFIX} bajao`) ||
    message.content.startsWith(`${process.env.PREFIX} play`)
  ) {
    bajao(message, queue);
    return;
  } else if (
    message.content.startsWith(`${process.env.PREFIX} skip`) ||
    message.content.startsWith(`${process.env.PREFIX} hatao`)
  ) {
    // TODO: Skip music
    console.log(message.content);
  } else if (
    message.content.startsWith(`${process.env.PREFIX} stop`) ||
    message.content.startsWith(`${process.env.PREFIX} roko`)
  ) {
    // TODO: Stop music
    console.log(message.content);
  } else if (
    message.content.startsWith(`${process.env.PREFIX} help`) ||
    message.content.startsWith(`${process.env.PREFIX} bachao`)
  ) {
    // TODO: Help Commands
    message.channel.send("Aaya....");
  } else if (
    message.content.startsWith(`${process.env.PREFIX} queue`) ||
    message.content.startsWith(`${process.env.PREFIX} dikhao`)
  ) {
    // TODO: Play music
    console.log(message.content);
  } else if (
    message.content.startsWith(`${process.env.PREFIX} pause`) ||
    message.content.startsWith(`${process.env.PREFIX} play`)
  ) {
    // TODO: Play music
    console.log(message.content);
  } else {
    message.channel.send("Galat command h babu bhaiya!");
  }
});
