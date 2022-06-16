import {
  AddressResultError,
  AdminAccess,
  Club,
  ClubResource,
  ClubResourceCode,
  DB,
  DiscordRole,
  MerkleRootComputationError,
  MISSING_CLUB,
  PublicCommitmentError,
  SUCCESS,
} from './types'
import { LowSync, JSONFileSync } from 'lowdb'
import lodash from 'lodash'
import short from 'short-uuid'
import _ from 'lodash'

class LowWithLodash<T> extends LowSync<T> {
  chain: lodash.ExpChain<this['data']> = lodash.chain(this).get('data')
}

function testAdminId(c: Club, adminId: string) {
  return c.adminId === adminId
}
const merkleRootAlreadyExists = {
  type: ClubResourceCode.ERROR,
  error: 'merkle_root_computed',
} as const

export default class JSONDB implements DB {
  db: LowWithLodash<{ clubs: Club[] }>

  constructor(fileName: string) {
    this.db = new LowWithLodash(new JSONFileSync(fileName))
    this.db.read()
    this.db.data ||= { clubs: [] }
  }

  #updateDb() {
    this.db.write()
    // TODO: Check if this is needed to refresh the data
    this.db.read()
  }

  #addressChangeError(
    adminAccess: AdminAccess
  ): ClubResource<Club, AddressResultError> {
    const club = this.db.data!!.clubs.find((club) =>
      testAdminId(club, adminAccess.adminId)
    )
    if (!club) return MISSING_CLUB
    if (club.merkleRoot.root) return merkleRootAlreadyExists
    return { type: ClubResourceCode.SUCCESS, data: club }
  }

  getAdminPanelData(adminAccess: AdminAccess) {
    const club = this.db.data!!.clubs.find((club) =>
      testAdminId(club, adminAccess.adminId)
    )
    return (
      (club && { type: ClubResourceCode.SUCCESS, data: club }) || MISSING_CLUB
    )
  }
  addAddresses(args: { adminId: string; addresses: string[] }) {
    const addressChangeError = this.#addressChangeError(args)
    if (!('data' in addressChangeError)) return addressChangeError
    const { data: club } = addressChangeError

    const newAddresses = Array.from(
      new Set([...club.merkleRoot.addresses, ...args.addresses])
    )
    club.merkleRoot.addresses = newAddresses
    this.#updateDb()
    return SUCCESS
  }

  removeAddresses(args: AdminAccess & { addresses: string[] }) {
    const addressChangeError = this.#addressChangeError(args)
    if (!('data' in addressChangeError)) return addressChangeError
    const { data: club } = addressChangeError

    const newAddresses = club.merkleRoot.addresses.filter(
      (addr) => !args.addresses.includes(addr)
    )
    club.merkleRoot.addresses = newAddresses
    this.#updateDb()
    return SUCCESS
  }

  createClub({ clubName, role }: { clubName: string; role: DiscordRole }) {
    const adminId = short.generate()
    this.db.data!!.clubs.push({
      name: clubName,
      merkleRoot: {
        zkIdentities: [],
        addressToPublicCommitment: {},
        addresses: [],
        root: null,
      },
      adminId,
      id: short.generate(),
      role,
    })
    this.#updateDb()
    return adminId.toString()
  }

  computeMerkleRoot: DB['computeMerkleRoot'] = (
    adminAccess: AdminAccess,
    { computeRoot }
  ) => {
    const club = this.db.data!!.clubs.find((club) =>
      testAdminId(club, adminAccess.adminId)
    )
    if (!club) return MISSING_CLUB
    if (club.merkleRoot.root) return merkleRootAlreadyExists
    if (_.keys(club.merkleRoot.addressToPublicCommitment).length === 0) {
      return {
        type: ClubResourceCode.ERROR,
        error: MerkleRootComputationError.NO_PUBLIC_COMMITMENTS,
      }
    }

    try {
      club.merkleRoot.root = computeRoot(
        _.values(club.merkleRoot.addressToPublicCommitment).map(
          (c) => c.commitment
        )
      )
    } catch (e: any) {
      return {
        type: ClubResourceCode.ERROR,
        error: { computationFailure: e?.toString() || 'unknown error' },
      }
    }
    this.#updateDb()
    return SUCCESS
  }

  addPublicCommitment: DB['addPublicCommitment'] = (
    clubId,
    { commitment, signature, address, verifySignature }
  ) => {
    const club = this.db.data!!.clubs.find((club) => club.id === clubId)
    if (!club) return MISSING_CLUB
    if (!(address in club.merkleRoot.addressToPublicCommitment)) {
      return {
        type: ClubResourceCode.ERROR,
        error: PublicCommitmentError.ADDRESS_NOT_IN_CLUB,
      }
    }
    if (club.merkleRoot.root) {
      return merkleRootAlreadyExists
    }
    if (!verifySignature()) {
      return {
        type: ClubResourceCode.ERROR,
        error: PublicCommitmentError.INVALID_SIGNATURE,
      }
    }

    club.merkleRoot.addressToPublicCommitment[address] = {
      commitment,
      signature,
    }
    this.#updateDb()
    return { type: ClubResourceCode.SUCCESS }
  }

  addRoleToDiscordUser(clubId: string, zkProof: string): void | Promise<void> {
    throw new Error('Method not implemented.')
  }
}
