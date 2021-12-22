const ytdl = require("ytdl-core");
const {
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  StreamType,
  NoSubscriberBehavior,
} = require("@discordjs/voice");

async function play(guild, song, queue) {
  const player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause,
    },
  });
  const songQueue = queue.get(guild.id);

  if (!song) {
    songQueue.voiceChannel.leave();
    queue.delete(guild.id);
    player.stop();
    songQueue.textChannel.send("All songs have been played.");
    return;
  }
  try {
    const stream = ytdl(song.url, {
      filter: "audio",
      quality: "highestaudio",
      highWaterMark: 1 << 25,
    });
    const resourse = createAudioResource(stream, {
      inputType: StreamType.Arbitrary,
    });
    player.play(resourse);
    songQueue.connection.subscribe(player);
    if (player.state.status === AudioPlayerStatus.Idle) {
      songQueue.songs.shift();
      play(guild, songQueue.songs[0], queue);
    }
    await songQueue.textChannel.send(`🎶 Now playing **${song.title}**`);

    player.on("error", (err) => {
      console.log(err);
    });
  } catch (error) {
    console.error(error);
  }
}
module.exports = play;
