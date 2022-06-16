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

export const ClubResourceCode = {
  SUCCESS: 'success',
  MISSING_CLUB: 'missing_club',
  ERROR: 'error',
} as const

export type ClubResource<D, E> =
  | { type: typeof ClubResourceCode['MISSING_CLUB'] }
  | (D extends undefined
      ? { type: typeof ClubResourceCode['SUCCESS'] }
      : { type: typeof ClubResourceCode['SUCCESS']; data: D })
  | (E extends undefined
      ? never
      : { type: typeof ClubResourceCode['ERROR']; error: E })

export const MISSING_CLUB = { type: ClubResourceCode.MISSING_CLUB } as const
export const SUCCESS = { type: ClubResourceCode.SUCCESS } as const

export const PublicCommitmentError = {
  INVALID_SIGNATURE: 'invalid_signature',
  ADDRESS_NOT_IN_CLUB: 'address_not_in_club',
  MERKEL_ROOT_COMPUTED: 'merkle_root_computed',
} as const
export type PublicCommitmentError =
  typeof PublicCommitmentError[keyof typeof PublicCommitmentError]

export const MerkleRootComputationError = {
  NO_PUBLIC_COMMITMENTS: 'no_public_commitments',
  MERKEL_ROOT_COMPUTED: 'merkle_root_computed',
} as const
export type MerkleRootComputationError =
  | typeof MerkleRootComputationError[keyof typeof MerkleRootComputationError]
  | { computationFailure: string }

export const AddressResultError = {
  MERKEL_ROOT_COMPUTED: 'merkle_root_computed',
} as const
export type AddressResultError =
  typeof AddressResultError[keyof typeof AddressResultError]

export interface DB {
  createClub(opts: {
    clubName: string
    role: DiscordRole
  }): MaybePromise<AdminClubId>
  getAdminPanelData(
    adminAccess: AdminAccess
  ): MaybePromise<ClubResource<Club, undefined>>
  addAddresses(
    args: AdminAccess & { addresses: string[] }
  ): MaybePromise<ClubResource<undefined, AddressResultError>>
  removeAddresses(
    args: AdminAccess & { addresses: string[] }
  ): MaybePromise<ClubResource<undefined, AddressResultError>>
  computeMerkleRoot(
    adminAccess: AdminAccess,
    args: { computeRoot: (commitments: string[]) => string }
  ): MaybePromise<ClubResource<undefined, MerkleRootComputationError>>
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
  ): MaybePromise<ClubResource<undefined, PublicCommitmentError>>
  addRoleToDiscordUser(clubId: string, zkProof: string): MaybePromise<void>
}
