require("dotenv").config();
const { Client, Intents } = require("discord.js");

const bajao = require("./commands/bajao");
const player = require("./helpers/player");
const play = require("./helpers/play");

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
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
  if (
    message.content.startsWith(`${process.env.PREFIX} bajao`) ||
    message.content.startsWith(`${process.env.PREFIX} play`)
  ) {
    bajao(message, queue, player);
    return;
  } else if (
    message.content.startsWith(`${process.env.PREFIX} skip`) ||
    message.content.startsWith(`${process.env.PREFIX} hatao`)
  ) {
    const serverQueue = queue.get(message.guild.id);
    if (!serverQueue) return message.channel.send("No songs in queue.");
    serverQueue.songs.shift();
    play(message.guild, serverQueue.songs[0], queue, player);
    return;
  } else if (
    message.content.startsWith(`${process.env.PREFIX} stop`) ||
    message.content.startsWith(`${process.env.PREFIX} roko`)
  ) {
    const serverQueue = queue.get(message.guild.id);
    if (!serverQueue) return message.channel.send("All stopped already!!");
    serverQueue.connection.destroy();
    queue.delete(message.guild.id);
    player.stop();
    return message.channel.send("Chalo bye bye 👋🏻👋🏻");
  } else if (
    message.content.startsWith(`${process.env.PREFIX} help`) ||
    message.content.startsWith(`${process.env.PREFIX} bachao`)
  ) {
    return message.channel.send(
      "Baby can understand: `bajao || play`, `bachao || help`, `hatao || skip`, `roko || stop`, `pause` and `dikhao || queue` for now."
    );
  } else if (
    message.content.startsWith(`${process.env.PREFIX} queue`) ||
    message.content.startsWith(`${process.env.PREFIX} dikhao`)
  ) {
    const serverQueue = queue.get(message.guild.id);
    if (!serverQueue) return message.channel.send("No songs in queue.");
    serverQueue.songs.forEach((song) => {
      message.channel.send(`${song.title}`);
    });
    return message.channel.send(`Total songs: ${serverQueue.songs.length}`);
  } else if (message.content.startsWith(`${process.env.PREFIX} pause`)) {
    if (player.state.status === "playing") {
      player.pause();
      return message.channel.send("Rukk gyi 🛑");
    }
    player.unpause();
    return message.channel.send("Bajao 💃🏻💃🏻");
  } else {
    message.channel.send("Galat command h babu bhaiya!");
  }
});
