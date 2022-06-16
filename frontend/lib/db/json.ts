import {
  AdminAccess,
  Club,
  ComputeMerkleRootResult,
  DB,
  DiscordRole,
} from './types'
import { AddAddressResult } from './types'
import { LowSync, JSONFileSync } from 'lowdb'
import lodash from 'lodash'
import short from 'short-uuid'

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

  getAdminPanelData(adminAccess: AdminAccess) {
    const club = this.db.data!!.clubs.find((club) =>
      testAdminId(club, adminAccess.adminId)
    )
    return club || null
  }
  addAddresses(args: { adminId: string; addresses: string[] }) {
    const club = this.db.data!!.clubs.find((club) =>
      testAdminId(club, args.adminId)
    )
    if (!club) return AddAddressResult.MISSING_CLUB
    const newAddresses = Array.from(
      new Set([...club.addresses, ...args.addresses])
    )
    club.addresses = newAddresses
    this.#updateDb()
    return AddAddressResult.SUCCESS
  }
  createClub({ clubName, role }: { clubName: string; role: DiscordRole }) {
    const adminId = short.generate()
    this.db.data!!.clubs.push({
      name: clubName,
      merkleRoot: { zkIdentities: [], publicCommitments: [], root: null },
      addresses: [],
      adminId,
      id: short.generate(),
      role,
    })
    this.#updateDb()
    return adminId.toString()
  }

  computeMerkleRoot(adminAccess: AdminAccess) {
    const club = this.db.data!!.clubs.find((club) =>
      testAdminId(club, adminAccess.adminId)
    )
    if (!club) {
      return ComputeMerkleRootResult.MISSING_CLUB
    }
    if (club.addresses.length === 0) {
      return ComputeMerkleRootResult.NO_ADDRESSES
    }
    club.merkleRoot = { ...club.merkleRoot, root: 'test-root' }
    this.#updateDb()
    return ComputeMerkleRootResult.SUCCESS
  }
  addPublicCommitment(
    clubId: string,
    commitment: string
  ): void | Promise<void> {
    throw new Error('Method not implemented.')
  }
  addRoleToDiscordUser(clubId: string, zkProof: string): void | Promise<void> {
    throw new Error('Method not implemented.')
  }
}
