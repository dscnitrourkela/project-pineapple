const {
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  NoSubscriberBehavior,
} = require("@discordjs/voice");
const playdl = require("play-dl");

async function play(guild, song, queue) {
  const player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause,
    },
  });
  const songQueue = queue.get(guild.id);

  if (!song) {
    songQueue.connection.destroy();
    queue.delete(guild.id);
    player.stop();
    songQueue.textChannel.send("All songs have been played.");
    return;
  }
  try {
    const stream = await playdl.stream(song.url);
    const resourse = createAudioResource(stream.stream, {
      inputType: stream.type,
    });
    player.play(resourse);
    songQueue.connection.subscribe(player);
    player.on(AudioPlayerStatus.Idle, () => {
      songQueue.songs.shift();
      play(guild, songQueue.songs[0], queue);
    });
    await songQueue.textChannel.send(`🎶 Now playing **${song.title}**`);

    player.on("error", (err) => {
      console.log(err);
    });
  } catch (error) {
    console.error(error);
  }
}
module.exports = play;
