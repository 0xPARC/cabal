require("dotenv").config();
const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
const { Client, Intents } = require("discord.js");

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("guildCreate", async (guild) => {
  console.log(guild);
  if (!guild.available()) return;
  const createdChannel = await guild.channels.create("cabal-join", {
    reason: "A channel where users can get verified with cabal.",
  });
  createdChannel.send("Type /verify (slash-command) to get started!");
  const configureChannel = await guild.channels.create("cabal-configure", {
    reason: "A channel where the admins can configure the cabal-bot.",
  });
  configureChannel.send("Type /configure (slash-command) to get started!");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "verify") {
    if (interaction.channel.name !== "cabal-join") {
      await interaction.reply({
        content: "Go to the cabal-join channel and type /verify again.",
        ephemeral: true,
      });
      return;
    }

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setURL("http://join-cabal.xyz")
        .setLabel("Generate ZK Proof")
        .setStyle("LINK")
    );

    const embed = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle("cabal.xyz")
      .setURL("http://join-cabal.xyz")
      .setDescription(
        "Use this custom link to create a ZK proof for verification."
      );

    await interaction.reply({
      //   content: "Pong!",
      ephemeral: true,
      embeds: [embed],
      components: [row],
    });
  } else if (interaction.commandName === "configure") {
    // TODO only make this work in the cabal-configure channel
    // console.log(interaction);
    // console.log(interaction.options.get("merkle_root"));
    // { name: 'merkle_root', type: 'STRING', value: 'asdf' }
    const selectedMerkleRoot = interaction.options.get("merkle_root").value;
    console.log("Selected Merkle Root is: ", selectedMerkleRoot);
    // console.log(interaction.options.get("verified_role"));
    const role = interaction.options.get("verified_role");
    const role_id = role.value; // same as role.role.id
    const role_name = role.role.name;
    console.log(`Selected role id is ${role_id}, with name ${role_name}`);
    // TODO: store guild_id, merkle_root, role_id
    // store rold_id, role_name
    await interaction.reply({
      content: `Successfully configured verification of inclusion in Merkle root ${selectedMerkleRoot} to be assigned role ${role_name}`,
    });
  } // TODO implement deletion of role assignment
});

client.login(process.env.DISCORD_TOKEN);
