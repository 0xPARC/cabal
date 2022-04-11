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
