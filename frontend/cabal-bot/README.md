## Discord client

All commands should be run out of the parent folder.

Run `yarn` to install all packages.

Run `yarn bot-dev` to start the bot client. This will restart the bot client if there are any file changes, which is useful for active development.

To run the bot in production, use `yarn bot-prod` to use `forever` to start the bot client (and will automatically restart the process if it crashes).

## Slash command deployment

To deploy slash commands & have them show up in a server, you have to run the `deploy.ts` script to register them.

Run the following to deploy them globally

```
npx ts-node cabal-bot/deploy.ts
```

Run the following to deploy them to a specific guild (no 1-hour wait), the command names will be different

```
npx ts-node cabal-bot/deploy.ts --guildId <guildId>
```

Run the following to reset guild-specific commands as not to clutter a guild

```
npx ts-node cabal-bot/deploy.ts --guildId <guildId> --reset
```

## Inviting discord bot

This is the link for inviting the discord bot to a server (with the appropriate permissions).

https://discord.com/api/oauth2/authorize?client_id=944759233277202442&permissions=2415971344&scope=bot%20applications.commands

The attached .png has the list of permissions when configuring the discord bot invite-link URL.

**After inviting discord bot to server make sure the bot's role is above any role you want it to manage.**
