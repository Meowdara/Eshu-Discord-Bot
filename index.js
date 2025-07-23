
// Disha Bot: Node.js Edition with NSFW, Mood Switch & VC TTS
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require("@discordjs/voice");
const { Configuration, OpenAIApi } = require("openai");
const googleTTS = require("google-tts-api");
const axios = require("axios");
require("dotenv").config();

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.Channel],
});

const PREFIX = "!";
const moods = {};
const moodNames = {
  hindi: ["jaan", "pyaar", "baby"],
  yandere: ["senpai", "darling"],
  sad: ["love", "sweetheart"],
  naughty: ["Daddy", "babe", "boss"],
};

bot.on("ready", () => {
  console.log(`✅ Logged in as ${bot.user.tag}`);
});

bot.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  const guildId = msg.guild?.id;
  const mood = moods[guildId] || "naughty";
  const name = moodNames[mood][Math.floor(Math.random() * moodNames[mood].length)];

  if (msg.content.startsWith(PREFIX + "setmood")) {
    const newMood = msg.content.split(" ")[1];
    if (["hindi", "yandere", "sad", "naughty"].includes(newMood)) {
      moods[guildId] = newMood;
      msg.reply(`Mood set to **${newMood}** 🔥`);
    } else {
      msg.reply("❌ Invalid mood. Use: hindi, yandere, sad, naughty");
    }
    return;
  }

  if (["hi", "hello", "hey", "baby"].some(word => msg.content.toLowerCase().includes(word))) {
    const moodReplies = {
      hindi: `Arre ${name}, kya haal hai? 😘`,
      yandere: `You’re not allowed to leave me, ${name}~ ❤️🔪`,
      sad: `Hey ${name}... I missed you 😔`,
      naughty: `Hey ${name} 😈 Wanna play?`,
    };
    msg.reply(moodReplies[mood]);
  }

  if (msg.content.startsWith(PREFIX + "vc")) {
    const args = msg.content.split(" ").slice(1).join(" ");
    if (!args) return msg.reply("❌ Provide a message for VC TTS!");

    const voiceChannel = msg.member?.voice.channel;
    if (!voiceChannel) return msg.reply("❌ Join a voice channel first!");

    const url = googleTTS.getAudioUrl(args, { lang: "en", slow: false });
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });
    const player = createAudioPlayer();
    const resource = createAudioResource(url);
    connection.subscribe(player);
    player.play(resource);

    msg.reply("🔊 Talking naughty in VC...");
  }

  const nsfwEndpoints = {
    boobs: "https://nekos.life/api/v2/img/boobs",
    ass: "https://nekos.life/api/v2/img/ass",
    hentai: "https://nekos.life/api/v2/img/hentai",
    gif: "https://nekos.life/api/v2/img/Random_hentai_gif",
  };

  for (const cmd in nsfwEndpoints) {
    if (msg.content === PREFIX + cmd) {
      if (!msg.channel.nsfw) return msg.reply("❌ NSFW commands can only be used in NSFW channels.");
      const { data } = await axios.get(nsfwEndpoints[cmd]);
      msg.channel.send(data.url);
    }
  }
});

bot.login(process.env.TOKEN);
