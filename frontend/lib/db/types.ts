type MaybePromise<T> = Promise<T> | T

type EthereumAddress = string
type ClubId = string
type AdminClubId = string

export interface Club {
  id: ClubId
  adminId: AdminClubId
  name: string

  role: DiscordRole
  merkleRoot: MerkleRoot
}

type MerkleRoot = {
  root: string | null
  addressToPublicCommitment: Record<
    EthereumAddress,
    { commitment: string; signature: string }
  >
  addresses: string[]
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
  adminId: string
}

export const ClubErrors = {
  MISSING_CLUB: { error: 'missing_club' },
  MERKLE_ROOT_COMPUTED: { error: 'merkle_root_computed' },
  INVALID_SIGNATURE: { error: 'invalid_signature' },
  ADDRESS_NOT_IN_CLUB: { error: 'address_not_in_club' },
  NO_PUBLIC_COMMITMENTS: { error: 'no_public_commitments' },
  // TODO: Ideally, we'd make this a function that returns an object with a stacktrace
  // We'd then use a mapped type to create the `Errors` type
  MERKLE_ROOT_COMPUTATION_FAILED: { error: 'merkle_root_computation_failed' },
} as const
export type Errors = typeof ClubErrors[keyof typeof ClubErrors]

export type ClubResource<D = undefined> =
  | Errors
  | (D extends undefined ? { type: 'success' } : { type: 'success'; data: D })

export const SUCCESS = { type: 'success' } as const

export interface DB {
  createClub(opts: {
    clubName: string
    role: DiscordRole
  }): MaybePromise<AdminClubId>
  getAdminPanelData(adminAccess: AdminAccess): MaybePromise<ClubResource<Club>>
  addAddresses(
    args: AdminAccess & { addresses: string[] }
  ): MaybePromise<ClubResource>
  removeAddresses(
    args: AdminAccess & { addresses: string[] }
  ): MaybePromise<ClubResource>
  computeMerkleRoot(
    adminAccess: AdminAccess,
    args: { computeRoot: (commitments: string[]) => string }
  ): MaybePromise<ClubResource>
  addPublicCommitment(
    clubId: string,
    {
      commitment,
      signature,
      address,
      verifySignature,
    }: {
      commitment: string
      signature: string
      address: string
      verifySignature: () => boolean
    }
  ): MaybePromise<ClubResource>
  addRoleToDiscordUser(clubId: string, zkProof: string): MaybePromise<void>
}
