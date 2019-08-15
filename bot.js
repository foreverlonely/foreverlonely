const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const fs = require('fs');
bot.mutes = require('./mutes.json');
let config = require('./botconfig.json');
let token = config.token;
let prefix = config.prefix;
let profile = require('./profile.json');
fs.readdir('./cmds/',(err,files)=>{
    if(err) console.log(err);
    let jsfiles = files.filter(f => f.split(".").pop() === "js");
    if(jsfiles.length <=0) console.log("Нет комманд для загрузки!!");
    console.log(`Загружено ${jsfiles.length} комманд`);
    jsfiles.forEach((f,i) =>{
        let props = require(`./cmds/${f}`);
        console.log(`${i+1}.${f} Загружен!`);
        bot.commands.set(props.help.name,props);
    });
});

bot.on('ready', () => {
    console.log(`Запустился бот ${bot.user.username}`);
    bot.generateInvite(["ADMINISTRATOR"]).then(link =>{
        console.log(link);
    });
    bot.setInterval(()=>{
        for(let i in bot.mutes){
            let time = bot.mutes[i].time;
            let guildid = bot.mutes[i].guild;
            let guild = bot.guilds.get(guildid);
            let member = guild.members.get(i);
            let muteRole = member.guild.roles.find(r => r.name === "Muted"); 
            if(!muteRole) continue;

            if(Date.now()>= time){
                member.removeRole(muteRole);
                delete bot.mutes[i];
                fs.writeFile('./mutes.json',JSON.stringify(bot.mutes),(err)=>{
                    if(err) console.log(err);
                });
            }
        }

    },5000)

});

bot.on('message', async message => {
    if(message.author.bot) return;
    if(message.channel.type == "dm") return;
    let uid = message.author.id;
    bot.send = function (msg){
        message.channel.send(msg);
    };
    if(!profile[message.author.id]){
        profile[message.author.id] = {
            coins:10,
            msgs:1,
            icons: "",
            op: "Пусто",
            voiceTime: 0
        };
    }else{
        profile[uid].msgs = profile[uid].msgs / 1 + 1
    }
    let u = profile[uid];
    if(profile[message.author.id].msgs / 1 == 5000) {
        let testt = "сладкая речь"
        message.member.addRole("name", `${testt}`)
    }

    u.xp++;

    if(u.xp>= (u.lvl * 5)){
        u.xp = 0;
        u.lvl += 1;
        
    };


    fs.writeFile('./profile.json',JSON.stringify(profile),(err)=>{
        if(err) console.log(err);
    });

    let messageArray = message.content.split(" ");
    let command = messageArray[0].toLowerCase();
    let args = messageArray.slice(1);
    if(!message.content.startsWith(prefix)) return;
    let cmd = bot.commands.get(command.slice(prefix.length));
    if(cmd) cmd.run(bot,message,args);
    bot.rUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    bot.uId = message.author.id;
});
bot.on('voiceStateUpdate', (oldMember, newMember) => {
    let newUserChannel = newMember.voiceChannel;
    let oldUserChannel = oldMember.voiceChannel;
    let voicetext = "🌿Голосовой онлайн: "
    let ch = bot.channels.get("610792535945904128");
    if(newUserChannel && !oldUserChannel){
        ch.setName(`${voicetext}${newMember.guild.members.filter(m => m.voiceChannel).size}`);
    };
    if(!newUserChannel && oldUserChannel){
        ch.setName(`${voicetext}${newMember.guild.members.filter(m => m.voiceChannel).size}`);
    };

});
let voiceUsers = [];
bot.on('voiceStateUpdate', (o,n) => {
if (!profile[n.id]) profile[n.id] = { voiceTime: 0 };
if(!o.voiceChannel && n.voiceChannel) {
voiceUsers.push({ id : n.id, joinTime : Date.now()})
} else if (o.voiceChannel && !n.voiceChannel) {
const user = voiceUsers.find(u => u.id == n.id);
if(!user) return
profile[n.id].voiceTime += Math.round((Date.now() - user.joinTime) / 1 /60000 / 1)
}
bot.on('guildMemberAdd',(member)=>{
  
    let role = member.guild.roles.find(role => role.name === "Eventmember");
    
          member.addRole(role)
    
  });
  const { findTimeZone, getZonedTime } = require('timezone-support');
const russia = findTimeZone("Europe/Moscow");
  setInterval(function(){
    const nativeDate = new Date()
    const russiatime = getZonedTime(nativeDate, russia)
    let hours = russiatime.hours
    let minutes = russiatime.minutes
    if(hours < 10){
      hours = `0${hours}`;
    }
    if(minutes < 10){
      minutes = `0${minutes}`;
    }
    bot.channels.get("611105286807355404").setName(`🌸Время по МСК: ${hours}:${minutes}`)
    
  }, 5000);
});
bot.login(token);