/**
 * Script used for deploying slash commands to a server.
 * https://discordjs.guide/interactions/slash-commands.html#registering-slash-commands
 * To deploy slash commands to a particular guild, use `node deploy.ts --guildId <guildId>`
 * An example guildId is 944758641934880779
 * To deploy slash commands globally (will take 1 hour to update), use `node deploy.ts`
 */

import 'dotenv/config'
import { SlashCommandBuilder } from '@discordjs/builders'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import path from 'path'
import { config } from 'dotenv'
import { CREATE_ARG_NAME, CREATE_ARG_ROLE } from './constants'

const envFilePath = path.join(__dirname, '..', '..', '.env')
config({ path: envFilePath })

/**
 * The bot clientId can be found by navigating to the bot application, selecting
 * OAuth2/General in the sidebar in the Client Id section under Client Information.
 */
const clientId = process.env.DISCORD_BOT_CLIENT_ID
const token = process.env.DISCORD_BOT_TOKEN

if (!clientId) {
  throw new Error(`Missing bot client id`)
}

if (!token) {
  throw new Error(`Missing bot client secret`)
}

/**
 * Find the guildId for a server you're an admin of by right-clicking on the server's name or image
 * and selecting "Copy ID" at the bottom of the menu.
 */
const GLOBAL_DEFAULT = 'GLOBAL'
const args = yargs(hideBin(process.argv))
  .options({
    guildId: { type: 'string', default: GLOBAL_DEFAULT },
    reset: { type: 'boolean', default: false },
  })
  .parseSync()
const guildId = args.guildId

if (args.reset && guildId === GLOBAL_DEFAULT) {
  console.log('Resetting commands only works when guildId specified. Exiting.')
  process.exit()
}

if (guildId === GLOBAL_DEFAULT) {
  console.log('***Deploying slash commands globally***')
} else if (!args.reset) {
  console.log(`***Deploying slash commands to guild ${guildId}***`)
} else if (args.reset) {
  console.log(`***Resetting slash commands for guild ${guildId}***`)
}

/**
 * We prefix command names with "guild-test-command-" for when adding applicationGuildCommands
 * since they are different from applicationCommands (globally). And we do not want the names to
 * overlap.
 */
//export const GUILD_TEST_COMMAND_PREFIX = 'guild-test-command-'
//let commandNamePrefix = ''
//if (guildId !== GLOBAL_DEFAULT) {
//  commandNamePrefix = GUILD_TEST_COMMAND_PREFIX
//}
const commandNamePrefix = ''
const commandsRaw = [
  new SlashCommandBuilder()
    .setName(`${commandNamePrefix}create-club`)
    .setDescription(
      'Responds with a verification link! Only will work when called in cabal-verify channel.'
    )
    .addRoleOption((opt) =>
      opt
        .setName(CREATE_ARG_ROLE)
        .setDescription('What role the user recieves upon verification')
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt
        .setName(CREATE_ARG_NAME)
        .setDescription('The club name')
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName(`${commandNamePrefix}verify-select`)
    .setDescription(
      'Responds with a verification link for specific merkle root!'
    )
    .addStringOption((option) =>
      option
        .setName('merkle_root')
        .setDescription(
          'Which merkle root you want to generate a verification for.'
        )
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName(`${commandNamePrefix}configure`)
    .setDescription(
      'Configures cabal-bot with merkle root & role (for admin use).'
    )
    .addStringOption((option) =>
      option
        .setName('merkle_root')
        .setDescription(
          'Which merkle root you want to generate a verification for.'
        )
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName('verified_role')
        .setDescription('What role the user recieves upon verification')
        .setRequired(true)
    ),
]

if (guildId !== GLOBAL_DEFAULT) {
  commandsRaw.push(
    new SlashCommandBuilder()
      .setName('test_role_setting')
      .setDescription('Tests that the discord bot can set roles')
  )
}

const commands = commandsRaw.map((command) => command.toJSON())

console.log(token)
const rest = new REST({ version: '9' }).setToken(token)

if (args.reset) {
  rest
    .put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
    .then(() =>
      console.log(
        `Successfully reset application commands for guild ${guildId}.`
      )
    )
    .catch(console.error)
    .finally(() => process.exit())
} else {
  rest
    .put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
    .then(() =>
      console.log(
        guildId !== GLOBAL_DEFAULT
          ? `Successfully registered application commands to guild ${guildId}.`
          : `Successfully registered application commands globally`
      )
    )
    .catch(console.error)
}
