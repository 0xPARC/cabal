require("dotenv").config();
const { SlashCommandBuilder } = require("@discordjs/builders");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { Client, Intents } = require("discord.js");

const guildId = "944758641934880779";
const clientId = "944759233277202442";
const token = process.env.DISCORD_TOKEN;

const commands = [
  new SlashCommandBuilder()
    .setName("verify")
    .setDescription(
      "Replies with verification information. Only will work when called in cabal-join channel."
    ),
  new SlashCommandBuilder()
    .setName("configure")
    .setDescription(
      "Configures cabal-bot with merkle root & role (for admin use)"
    )
    .addStringOption((option) =>
      option
        .setName("merkle_root")
        .setDescription(
          "Which merkle root you want to generate a verification for."
        )
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName("verified_role")
        .setDescription("What role the user recieves upon verification")
        .setRequired(true)
    ),
].map((command) => command.toJSON());

const rest = new REST({ version: "9" }).setToken(token);

rest
  .put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
  .then(() => console.log("Successfully registered application commands."))
  .catch(console.error);
