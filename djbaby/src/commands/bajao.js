const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");
const { joinVoiceChannel } = require("@discordjs/voice");
const play = require("../helpers/play");

async function bajao(message, queue) {
  const serverQueue = queue.get(message.guild.id);
  const args = message.content.split(" ");

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) {
    return message.channel.send(
      "You need to be in a voice channel to play music!"
    );
  }
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return message.channel.send(
      "No permissions to join and speak in this voice channel!"
    );
  }
  const info = args.slice(3, args.length + 1).join(" ");
  let song;
  if (ytdl.validateURL(info)) {
    const songInfo = await ytdl.getInfo(info);
    song = {
      title: songInfo.videoDetails.title,
      url: songInfo.videoDetails.video_url,
    };
  } else {
    r = await ytSearch(info);
    if (r.videos.length > 0) {
      song = {
        title: r.videos[0].title,
        url: r.videos[0].url,
      };
    }
  }
  if (!song) {
    return message.channel.send("Error finding your song");
  } else {
    if (!serverQueue) {
      const queueConstructor = {
        voiceChannel: voiceChannel,
        textChannel: message.channel,
        connection: null,
        songs: [],
        playing: true,
      };

      //Add our key and value pair into the global queue. We then use this to get our server queue.
      queue.set(message.guild.id, queueConstructor);
      queueConstructor.songs.push(song);

      //Establish a connection and play the song with the vide_player function.
      try {
        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          selfDeaf: true,
          guildId: message.guild.id,
          adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });
        queueConstructor.connection = connection;
        play(message.guild, queueConstructor.songs[0], queue);
      } catch (err) {
        queue.delete(message.guild.id);
        message.channel.send("There was an error connecting!");
        throw err;
      }
    } else {
      serverQueue.songs.push(song);
      return message.channel.send(`👍 **${song.title}** added to queue!`);
    }
  }
}
module.exports = bajao;
