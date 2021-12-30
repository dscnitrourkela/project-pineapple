const ytdl = require("ytdl-core");
const playdl = require("play-dl");
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
  let info = args.slice(3, args.length + 1).join(" ");
  const songList = [];
  if (info.startsWith("https://open.spotify.com/playlist/")) {
    try {
      if (playdl.is_expired()) {
        await playdl.refreshToken();
      }
      const data = await playdl.spotify(info);
      await data.fetch();
      const length = data.tracksCount;
      if (length > 0)
        message.channel.send(
          `${length} songs found! Indexing started... Please wait!`
        );
      const l = length % 100 === 0 ? length / 100 : length / 100 + 1;
      for (let i = 1; i <= l; i++) {
        const promiseArray = data.fetched_tracks
          .get(`${i}`)
          .map(async (track) => {
            const ytResult = await ytSearch(track.name);
            if (ytResult.videos.length > 0) {
              const song = {
                title: ytResult.videos[0].title,
                url: ytResult.videos[0].url,
              };
              songList.push(song);
              Promise.resolve();
            }
          });

        await Promise.all(promiseArray);
      }
    } catch (error) {
      console.log(error);
    }
  } else if (ytdl.validateURL(info)) {
    const songInfo = await ytdl.getInfo(info);
    const song = {
      title: songInfo.videoDetails.title,
      url: songInfo.videoDetails.video_url,
    };
    songList.push(song);
  } else {
    const ytResult = await ytSearch(info);
    if (ytResult.videos.length > 0) {
      const song = {
        title: ytResult.videos[0].title,
        url: ytResult.videos[0].url,
      };
      songList.push(song);
    }
  }

  if (songList.length === 0) {
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
      songList.forEach((s) => {
        queueConstructor.songs.push(s);
      });

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
      songList.forEach((s) => {
        serverQueue.songs.push(s);
      });
      return message.channel.send("Added to the queue!");
    }
    return message.channel.send(`👍 added to queue!`);
  }
}

module.exports = bajao;
