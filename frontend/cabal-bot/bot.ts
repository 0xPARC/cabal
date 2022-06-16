import path from 'path'
import { config } from 'dotenv'

const envFilePath = path.join(__dirname, '..', '..', '.env')
config({ path: envFilePath })

import {
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  Client,
  Intents,
  Message,
  IntegrationApplication,
  TextBasedChannel,
  TextChannel,
  InteractionCollector,
  Interaction,
  CommandInteraction,
} from 'discord.js'

import { PrismaClient } from '@prisma/client'
import {
  Guild,
  Role,
  User,
  ConfiguredConnection,
  AuthToken,
} from '@prisma/client/index'
import { DB } from '../lib/db/types'
import db from '../lib/db'
import { CREATE_ARG_NAME, CREATE_ARG_ROLE } from './constants'

const client = new Client({
  intents: [Intents.FLAGS.GUILDS],
})
const prisma = new PrismaClient()

// TODO read this from a .env file, for local dev can make it localhost:3000
const HOSTNAME = 'cabal.xyz'
const CHANNEL_NAME_CABAL_ADMIN = 'cabal-admin'
const CONFIGURE_CHANNEL_NAME = 'cabal-configure'
const GUILD_TEST_COMMAND_PREFIX = 'guild-test-command-' // Make sure this is synced with deploy.ts

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`)
})

client.on('error', async (error) => {
  console.log('Error info', error)
})

client.on('guildIntegrationsUpdate', async (guild) => {
  console.log('guildIntegrationsUpdate event', guild.id, guild.name)
})
/**
 * This event is triggered when the bot is added to a new server. It creates a
 * cabal-configure channel that admins can use to configure the bot and a
 * cabal-verify channel where users go to get verified with cabal.
 */
client.on('guildCreate', async (guild) => {
  console.log('guildCreate', guild.id, guild.name)
  // TODO only create these channels if they don't exist
  const createdChannel = await guild.channels.create(CONFIGURE_CHANNEL_NAME, {
    reason: 'A channel where users can get verified with cabal.',
    topic:
      'A channel where users can get verified with cabal. Type /verify (slash-command) to get started!',
  })
  if (createdChannel.type == 'GUILD_TEXT') {
    createdChannel as TextChannel
    await createdChannel.send('Type /verify to get started!')
  }
  const everyoneRole = guild.roles.everyone
  const configureChannel = await guild.channels.create(
    CHANNEL_NAME_CABAL_ADMIN,
    {
      reason: 'A channel where admins can configure the cabal-bot.',
      topic:
        'A channel where admins can configure the cabal-bot. Type /configure (slash-command) to get started!',
      permissionOverwrites: [
        {
          type: 'role',
          id: everyoneRole.id,
          deny: ['VIEW_CHANNEL'],
        },
        {
          type: 'role',
          id: guild.me!.roles.botRole!.id,
          allow: ['VIEW_CHANNEL'],
        },
      ],
    }
  )
  if (configureChannel.type == 'GUILD_TEXT') {
    configureChannel as TextChannel
    await configureChannel.send('Type /configure to get started!')
  }
})

async function ensureChannelHasExpectedName(
  interaction: CommandInteraction,
  expectedChannelName: string
) {
  const channelHasExpectedName =
    interaction.channel &&
    'name' in interaction.channel &&
    interaction.channel.name === expectedChannelName

  if (!channelHasExpectedName) {
    await sendErrorMessage(
      interaction,
      `This command only runs in: ${expectedChannelName}`
    )
  }
  return channelHasExpectedName
}

async function sendErrorMessage(
  interaction: CommandInteraction,
  msg: string,
  { reply }: { reply: boolean } = { reply: true }
) {
  const formatted = `ERROR: ${msg}`
  const sender = (reply ? interaction.reply : interaction.followUp).bind(
    interaction
  )
  sender({ content: formatted, ephemeral: true })
}

function makeLink(path: string): string {
  return `http://localhost:3000${path}`
}

async function handleCreateClub(
  interaction: CommandInteraction
): Promise<unknown> {
  const isAdminChannel = await ensureChannelHasExpectedName(
    interaction,
    CHANNEL_NAME_CABAL_ADMIN
  )
  if (!isAdminChannel) return

  const userIsDiscordAdmin = interaction.memberPermissions?.has('ADMINISTRATOR')
  if (!userIsDiscordAdmin) {
    return sendErrorMessage(interaction, `Only admins can create clubs`)
  }

  // Are these 2 internal errors only?
  if (!interaction.guild) {
    return sendErrorMessage(interaction, `Missing guild`)
  }
  if (!interaction.guildId) {
    return sendErrorMessage(interaction, `Missing guild ID`)
  }

  const discordRoleForClub = interaction.options.get(CREATE_ARG_ROLE)?.role
  if (!discordRoleForClub) {
    return sendErrorMessage(interaction, `No role was provided for the club`)
  }

  const clubName = interaction.options.get(CREATE_ARG_NAME)?.value
  if (!clubName) {
    return sendErrorMessage(interaction, `No club name was provided`)
  }

  if (typeof clubName !== 'string') {
    return sendErrorMessage(
      interaction,
      `Club name must be string, was: ${typeof clubName}`
    )
  }

  const {
    guildId,
    guild: { name: guildName },
  } = interaction
  const { id, name } = discordRoleForClub

  const adminId = await db.createClub({
    clubName,
    role: { guildId, guildName, name, id },
  })
  const link = makeLink(`/club/admin/${adminId}`)
  await interaction.reply({
    content: `Club created! Head to the [secret admin panel](${link})`,
  })
}

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return

  if (interaction.commandName === 'create-club') {
    await handleCreateClub(interaction)
  }
})

client.login(process.env.DISCORD_BOT_TOKEN)
