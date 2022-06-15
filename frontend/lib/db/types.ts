type MaybePromise<T> = Promise<T> | T

// interface Guild {
//   id: string
//   name: string
//   clubs: Club[]
// }

type EthereumAddress = string
type ClubId = string
type AdminClubId = string

export interface Club {
  id: ClubId
  adminId: AdminClubId
  name: string

  role: DiscordRole
  addresses: EthereumAddress[]
  merkleRoot: MerkleRoot | null
}

type MerkleRoot = {
  root: string | null
  publicCommitments: string[]
  zkIdentities: ZkIdentity[]
}

type ZkIdentity = {
  nullifier: string
}

export interface DiscordRole {
  id: string
  name: string
  guildId: string
  guildName: string
}

export type AdminAccess = {
  // clubId: string
  adminId: string
}

export const AddAddressResult = {
  SUCCESS: 'success',
  ALREADY_ADDED: 'duplicate_address',
  MISSING_CLUB: 'no_club',
} as const
type AddAddressResult = typeof AddAddressResult[keyof typeof AddAddressResult]

export interface DB {
  createClub(opts: {
    clubName: string
    role: DiscordRole
  }): MaybePromise<AdminClubId>
  getAdminPanelData(adminAccess: AdminAccess): MaybePromise<Club | null>
  addAddress(
    args: AdminAccess & { address: string }
  ): MaybePromise<AddAddressResult>
  computeMerkleRoot(adminAccess: AdminAccess): MaybePromise<void>
  addPublicCommitment(clubId: string, commitment: string): MaybePromise<void>
  addRoleToDiscordUser(clubId: string, zkProof: string): MaybePromise<void>
}
