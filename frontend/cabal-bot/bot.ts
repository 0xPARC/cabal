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
  //await prisma.guild.upsert({
  //  where: { guildId: guild.id },
  //  update: { guildName: guild.name },
  //  create: {
  //    guildId: guild.id,
  //    guildName: guild.name,
  //  },
  //})
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

  return

  //if (
  //  interaction.commandName === 'verify' ||
  //  interaction.commandName === `${GUILD_TEST_COMMAND_PREFIX}verify` ||
  //  interaction.commandName === 'verify-select' ||
  //  interaction.commandName === `${GUILD_TEST_COMMAND_PREFIX}verify-select`
  //) {
  //  await interaction.reply({
  //    ephemeral: true,
  //    content: 'Generating link...wait a few moments...',
  //  })

  //  const channelNameMatches = await ensureChannelHasExpectedName(
  //    interaction,
  //    CHANNEL_NAME_CABAL_ADMIN,
  //    `ERROR: This command only runs in the ${CHANNEL_NAME_CABAL_ADMIN} channel. Go to the ${CHANNEL_NAME_CABAL_ADMIN} channel and type /verify again.`
  //  )
  //  if (!channelNameMatches) return

  //  if (!interaction.guild || !interaction.member) {
  //    await interaction.followUp({
  //      ephemeral: true,
  //      content: 'There was an error in retrieving the server or member.',
  //    })
  //    return
  //  }

  //  const guildId = interaction.guild.id
  //  const guild = await prisma.guild.findUnique({
  //    where: { guildId: guildId },
  //    include: { configuredConnections: true },
  //  })
  //  if (!guild) {
  //    await interaction.followUp({
  //      ephemeral: true,
  //      content: 'There was an error in retrieving the server.',
  //    })
  //    return
  //  }

  //  const validConnections = guild.configuredConnections.filter(
  //    (c) => !c.deleted
  //  )
  //  let configuredConnection: ConfiguredConnection | null = null
  //  if (validConnections.length == 0) {
  //    await interaction.followUp({
  //      ephemeral: true,
  //      content:
  //        'There are no configured roles in this server. Ask your admin to set up one!',
  //    })
  //    return
  //  } else if (validConnections.length == 1) {
  //    // We ignore whichever merkle root we have selected
  //    configuredConnection = validConnections[0]
  //    if (
  //      interaction.commandName === 'verify-select' ||
  //      interaction.commandName === `${GUILD_TEST_COMMAND_PREFIX}verify-select`
  //    ) {
  //      const selectedRoot = interaction.options.get('merkle_root')
  //        ?.value as string
  //      if (configuredConnection.merkleRoot !== selectedRoot) {
  //        await interaction.followUp({
  //          ephemeral: true,
  //          content: `Tried to select merkle root "${selectedRoot}", but the only valid configured roots are:\n>>>${configuredConnection.merkleRoot}`,
  //        })
  //        return
  //      }
  //    }
  //  } else if (validConnections.length > 1) {
  //    if (
  //      interaction.commandName === 'verify' ||
  //      interaction.commandName === `${GUILD_TEST_COMMAND_PREFIX}verify`
  //    ) {
  //      await interaction.followUp({
  //        ephemeral: true,
  //        content:
  //          'There are multiple configured roles in this server. Please use the verify-select command.',
  //      })
  //      return
  //    } else {
  //      // This is the verify-select command
  //      const merkleRoots = validConnections.map(
  //        (configuredConnection) => configuredConnection.merkleRoot
  //      )
  //      const selectedRoot = interaction.options.get('merkle_root')
  //        ?.value as string
  //      if (selectedRoot && merkleRoots.includes(selectedRoot)) {
  //        configuredConnection =
  //          validConnections[merkleRoots.indexOf(selectedRoot)]
  //      } else {
  //        await interaction.followUp({
  //          ephemeral: true,
  //          content: `Tried to select merkle root ${selectedRoot}, but the only valid configured root is ${JSON.stringify(
  //            merkleRoots
  //          )}`,
  //        })
  //        return
  //      }
  //    }
  //  }

  //  if (!configuredConnection) {
  //    throw "The configured connection is null, this shouldn't be happening"
  //  }

  //  const interactionUser = interaction.member.user
  //  const user = await prisma.user.upsert({
  //    where: { userId: interactionUser.id },
  //    update: { userName: interactionUser.username },
  //    create: {
  //      userId: interactionUser.id,
  //      userName: interactionUser.username,
  //    },
  //  })

  //  const authToken = await prisma.authToken.create({
  //    data: {
  //      userId: user.userId,
  //      configuredConnectionId: configuredConnection.id,
  //    },
  //  })

  //  const authTokenString = authToken.authTokenString

  //  const row = new MessageActionRow().addComponents(
  //    new MessageButton()
  //      .setURL(`http://${HOSTNAME}/verify/${authTokenString}`)
  //      .setLabel('Generate ZK Proof')
  //      .setStyle('LINK')
  //  )

  //  const embed = new MessageEmbed()
  //    .setColor('#0099ff')
  //    .setTitle(`${HOSTNAME}`)
  //    .setURL(`http://${HOSTNAME}/verify/${authTokenString}`)
  //    .setDescription(
  //      'Use this custom link to create a ZK proof for verification.'
  //    )

  //  await interaction.followUp({
  //    ephemeral: true,
  //    embeds: [embed],
  //    components: [row],
  //  })
  //} else if (
  //  interaction.commandName === 'configure' ||
  //  interaction.commandName === `${GUILD_TEST_COMMAND_PREFIX}configure`
  //) {
  //  console.log('Recieved configuration request')
  //  await interaction.reply({
  //    ephemeral: true,
  //    content: 'Configuration request recieved! Working on it...',
  //  })

  //  if (!interaction.memberPermissions?.has('ADMINISTRATOR')) {
  //    await interaction.followUp({
  //      content:
  //        'ERROR: You can only run this command if you are an administrator of the server!',
  //      ephemeral: true,
  //    })
  //    return
  //  }

  //  const channelNameMatches = await ensureChannelHasExpectedName(
  //    interaction,
  //    CONFIGURE_CHANNEL_NAME,
  //    `ERROR: This command only runs in the ${CONFIGURE_CHANNEL_NAME} channel. Go to the ${CONFIGURE_CHANNEL_NAME} channel and type /configure again.`
  //  )
  //  if (!channelNameMatches) return

  //  if (!interaction.guild || !interaction.member) {
  //    await interaction.followUp({
  //      content: 'There was an error in retrieving the server or member.',
  //    })
  //    return
  //  }
  //  /*
  //    interaction.options.get('merkle_root')
  //    { name: 'merkle_root', type: 'STRING', value: 'asdf' }
  //    interaction.options.get('verified_role')
  //    { role: { name: 'roleName', id: 'roleId' }, value: 'roleId'}
  //  */
  //  const selectedMerkleRoot = interaction.options.get('merkle_root')
  //    ?.value as string
  //  const selectedRole = interaction.options.get('verified_role')?.role
  //  if (!selectedMerkleRoot || !selectedRole) {
  //    await interaction.followUp({
  //      content: 'An invalid merkle root or role was provided!',
  //    })
  //    return
  //  }

  //  const guild = await prisma.guild.upsert({
  //    where: { guildId: interaction.guild.id },
  //    update: { guildName: interaction.guild.name },
  //    create: {
  //      guildId: interaction.guild.id,
  //      guildName: interaction.guild.name,
  //    },
  //    include: { configuredConnections: true },
  //  })

  //  const deleteExisting = false
  //  let existingConnection = false

  //  if (deleteExisting) {
  //    if (guild.configuredConnections.length > 1) {
  //      existingConnection = true
  //      // Delete all the existing ones, since we only allow 1
  //      for (let i = 0; i < guild.configuredConnections.length; i++) {
  //        await prisma.configuredConnection.update({
  //          where: { id: guild.configuredConnections[i].id },
  //          data: { deleted: true },
  //        })
  //      }
  //    }
  //  }

  //  const createdRole = await prisma.role.upsert({
  //    where: { roleId: selectedRole.id },
  //    update: { roleName: selectedRole.name },
  //    create: { roleId: selectedRole.id, roleName: selectedRole.name },
  //  })

  //  await prisma.configuredConnection.create({
  //    data: {
  //      roleId: createdRole.roleId,
  //      guildId: guild.guildId,
  //      merkleRoot: selectedMerkleRoot,
  //      prettyName: '',
  //    },
  //  })

  //  let successMessage = `Successfully configured verification of inclusion in Merkle root "${selectedMerkleRoot}" to be assigned role "${selectedRole.name}."`
  //  if (existingConnection) {
  //    successMessage = successMessage.concat(
  //      `\n\n(P.S. we had to replace an existing configuration. For now we only allow 1 configuration per server.)`
  //    )
  //  }
  //  const existingRoots = guild.configuredConnections
  //    .filter((cc) => !cc.deleted)
  //    .map((cc) => cc.merkleRoot)
  //  existingRoots.push(selectedMerkleRoot)
  //  successMessage = successMessage.concat(
  //    `\n>>>The current available roots are \n${JSON.stringify(existingRoots)}`
  //  )
  //  await interaction.followUp({
  //    content: successMessage,
  //  })
  //}
})

client.login(process.env.DISCORD_BOT_TOKEN)
