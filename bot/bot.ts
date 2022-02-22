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
  await createdChannel.send("Type /verify (slash-command) to get started!");
  const configureChannel = await guild.channels.create("cabal-configure", {
    reason: "A channel where the admins can configure the cabal-bot.",
  });
  await configureChannel.send(
    "Type /configure (slash-command) to get started!"
  );
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

    // TODO get the guild_id, member_id from interaction
    // TODO construct special URL
    // TODO handle case where there are mutiple merkle_root <> role for a single guild_id
    // nonce checks validity of the URL, so that you can't replay attack with different `memberId`
    // when you go to this URL, the page is rendered with the `guildId`, `merkleRoot`, `roleId`, `memberId` (no API request sent)
    // generate ZK proof using your wallet attesting you control a pubkey in the given merkleRoot
    // POST request to server with {zkProof, merkleRoot, guildId, roleId, memberId, nonce}
    // server validates zkProof with merkleRoot
    // server validates nonce <> memberId, guildId, roleId, merkleRoot, invalidates nonce
    // grants memberId in guildId with roleId using discord API
    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setURL(
          `http://cabal.xyz/${guildId}?merkleRoot=${merkleRoot}&roleId=${roleId}&memberId=${memberId}&nonce=${nonce}`
        )
        .setLabel("Generate ZK Proof")
        .setStyle("LINK")
    );

    const embed = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle("cabal.xyz")
      .setURL("http://cabal.xyz")
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
    // interaction.options.get("merkle_root")
    // { name: 'merkle_root', type: 'STRING', value: 'asdf' }
    const selectedMerkleRoot = interaction.options.get("merkle_root").value;
    console.log("Selected Merkle Root is: ", selectedMerkleRoot);
    const role = interaction.options.get("verified_role");
    const role_id = role.value; // same as role.role.id
    const role_name = role.role.name;
    console.log(`Selected role id is ${role_id}, with name ${role_name}`);
    // TODO: store guild_id, merkle_root, role_id, role_name
    // store rold_id, role_name
    await interaction.reply({
      content: `Successfully configured verification of inclusion in Merkle root ${selectedMerkleRoot} to be assigned role ${role_name}`,
    });
  } // TODO implement deletion of role assignment
});

client.login(process.env.DISCORD_TOKEN);
