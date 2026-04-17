const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// 🔐 TOKEN seguro (vem do Railway)
const TOKEN = process.env.TOKEN;

// CONFIG
const GUILD_ID = "1236818895092977694";
const CHANNEL_ID = "1494794256181886976";

// NOMES
const CARGO_EQUIPE = "1236826329450680423";
const CALLS_SUPORTE = ["📞┆Suporte 1", "📞┆Suporte 2", "📞┆Suporte 3"];

client.once('ready', async () => {
    console.log(`Bot ligado como ${client.user.tag}`);

    const guild = await client.guilds.fetch(GUILD_ID);
    const channel = await guild.channels.fetch(CHANNEL_ID);

    async function atualizarEmbed() {
        await guild.members.fetch();

        // 👥 equipe online
        const role = guild.roles.cache.find(r => r.name.toLowerCase() === CARGO_EQUIPE);
        let equipeOnline = 0;

        if (role) {
            role.members.forEach(m => {
                if (m.presence && m.presence.status !== "offline") {
                    equipeOnline++;
                }
            });
        }

        // 🎧 suporte em call
        let suporteOnline = 0;

        guild.channels.cache.forEach(c => {
            if (c.type === 2 && CALLS_SUPORTE.includes(c.name)) {
                suporteOnline += c.members.size;
            }
        });

        const embed = new EmbedBuilder()
            .setTitle("📊 Informações")
            .setColor("#2b2d31")
            .addFields(
                { name: "👨‍💼 Equipe Online", value: `\`${equipeOnline}\` membros`, inline: true },
                { name: "🎧 Suporte Online", value: `\`${suporteOnline}\` em call`, inline: true }
            )
            .setFooter({ text: "Atualizado automaticamente" })
            .setTimestamp();

        const messages = await channel.messages.fetch({ limit: 10 });
        const botMsg = messages.find(m => m.author.id === client.user.id);

        if (botMsg) {
            botMsg.edit({ embeds: [embed] });
        } else {
            channel.send({ embeds: [embed] });
        }
    }

    setInterval(atualizarEmbed, 60000);
    atualizarEmbed();
});

client.login(TOKEN);