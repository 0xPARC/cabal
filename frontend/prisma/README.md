npx prisma migrate dev --name init
npx prisma generate


https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases/using-prisma-migrate-typescript-postgres


npx prisma migrate dev --name init --schema ./prisma/schema.sqlite.prisma
to generate the migration to apply to postgres

then
change 'sqlite' in migration_lock.toml to be 'postgres'

then
npx prisma migrate deploy

To set up postgres running locally:

```
brew install postgres
brew services start postgres
```
```
psql; create user merkle; create database merkle; alter role merkle createdb;
```

To run a migration
```
npx dotenv -e .env.local -- npx prisma migrate dev --name <migration_name>
```

Then you have deploy the migration in prod
```
npx prisma migrate deploy
```