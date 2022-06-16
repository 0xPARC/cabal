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
  merkleRoot: MerkleRoot
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

export const ComputeMerkleRootResult = {
  SUCCESS: 'success',
  MISSING_CLUB: 'no_club',
  NO_ADDRESSES: 'no_addresses',
} as const
type ComputeMerkleRootResult =
  typeof ComputeMerkleRootResult[keyof typeof ComputeMerkleRootResult]

export const AddAddressResult = {
  SUCCESS: 'success',
  MERKLE_ROOT_COMPUTED: 'merkle_root_computed',
  MISSING_CLUB: 'no_club',
} as const
type AddAddressResult = typeof AddAddressResult[keyof typeof AddAddressResult]

export interface DB {
  createClub(opts: {
    clubName: string
    role: DiscordRole
  }): MaybePromise<AdminClubId>
  getAdminPanelData(adminAccess: AdminAccess): MaybePromise<Club | null>
  addAddresses(
    args: AdminAccess & { addresses: string[] }
  ): MaybePromise<AddAddressResult>
  computeMerkleRoot(
    adminAccess: AdminAccess
  ): MaybePromise<ComputeMerkleRootResult>
  addPublicCommitment(clubId: string, commitment: string): MaybePromise<void>
  addRoleToDiscordUser(clubId: string, zkProof: string): MaybePromise<void>
}
