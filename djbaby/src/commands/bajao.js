const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");
const axios = require("axios");
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
  let song;
  let songList;
  if (info.startsWith("https://open.spotify.com/playlist/")) {
    const playlistID = info.split("/")[4];
    try {
      const data = await axios.get(
        `https://api.spotify.com/v1/playlists/${playlistID}/tracks`,
        { headers: { Authorization: `Bearer ${process.env.SPOTIFY_TOKEN}` } }
      );
      songList = data.data.items;
      info = songList[0].track.name;
      songList.shift();
    } catch (error) {
      console.log(error);
    }
  }
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

      try {
        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          selfDeaf: true,
          guildId: message.guild.id,
          adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });
        queueConstructor.connection = connection;
        play(message.guild, queueConstructor.songs[0], queue);
        if (songList && songList.length > 0) {
          songList.map(async (s) => {
            r = await ytSearch(s.track.name);
            if (r.videos.length > 0) {
              song = {
                title: r.videos[0].title,
                url: r.videos[0].url,
              };
              queueConstructor.songs.push(song);
            }
          });
        }
      } catch (err) {
        queue.delete(message.guild.id);
        message.channel.send("There was an error connecting!");
        throw err;
      }
    } else {
      serverQueue.songs.push(song);
      if (songList && songList.length > 0) {
        songList.map(async (s) => {
          r = await ytSearch(s.track.name);
          if (r.videos.length > 0) {
            song = {
              title: r.videos[0].title,
              url: r.videos[0].url,
            };
            serverQueue.songs.push(song);
          }
        });
      }
      return message.channel.send("Added to the queue!");
    }
    return message.channel.send(`👍 **${song.title}** added to queue!`);
  }
}

module.exports = bajao;
