import {
  AdminAccess,
  Club,
  ClubResource,
  DB,
  DiscordRole,
  ClubErrors,
  SUCCESS,
} from './types'
import { LowSync, JSONFileSync } from 'lowdb'
import lodash from 'lodash'
import short from 'short-uuid'
import _ from 'lodash'
import { errors } from 'ethers'

class LowWithLodash<T> extends LowSync<T> {
  chain: lodash.ExpChain<this['data']> = lodash.chain(this).get('data')
}

function testAdminId(c: Club, adminId: string) {
  return c.adminId === adminId
}

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

  #addressChangeError(adminAccess: AdminAccess): ClubResource<Club> {
    const club = this.db.data!!.clubs.find((club) =>
      testAdminId(club, adminAccess.adminId)
    )
    if (!club) return ClubErrors.MISSING_CLUB
    if (club.merkleRoot.root) return ClubErrors.MERKLE_ROOT_COMPUTED
    return { type: 'success', data: club }
  }

  getAdminPanelData(adminAccess: AdminAccess) {
    const club = this.db.data!!.clubs.find((club) =>
      testAdminId(club, adminAccess.adminId)
    )
    return (
      (club && ({ type: 'success', data: club } as const)) ||
      ClubErrors.MISSING_CLUB
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
    if (!club) return ClubErrors.MISSING_CLUB
    if (club.merkleRoot.root) return ClubErrors.MERKLE_ROOT_COMPUTED
    if (_.keys(club.merkleRoot.addressToPublicCommitment).length === 0) {
      return ClubErrors.NO_PUBLIC_COMMITMENTS
    }

    try {
      club.merkleRoot.root = computeRoot(
        _.values(club.merkleRoot.addressToPublicCommitment).map(
          (c) => c.commitment
        )
      )
    } catch (e: any) {
      return ClubErrors.MERKLE_ROOT_COMPUTATION_FAILED
    }
    this.#updateDb()
    return SUCCESS
  }

  addPublicCommitment: DB['addPublicCommitment'] = (
    clubId,
    { commitment, signature, address, verifySignature }
  ) => {
    const club = this.db.data!!.clubs.find((club) => club.id === clubId)
    if (!club) return ClubErrors.MISSING_CLUB
    if (!(address in club.merkleRoot.addressToPublicCommitment)) {
      return ClubErrors.ADDRESS_NOT_IN_CLUB
    }
    if (club.merkleRoot.root) {
      return ClubErrors.MERKLE_ROOT_COMPUTED
    }
    if (!verifySignature()) {
      return ClubErrors.INVALID_SIGNATURE
    }

    club.merkleRoot.addressToPublicCommitment[address] = {
      commitment,
      signature,
    }
    this.#updateDb()
    return SUCCESS
  }

  addRoleToDiscordUser(clubId: string, zkProof: string): void | Promise<void> {
    throw new Error('Method not implemented.')
  }
}
