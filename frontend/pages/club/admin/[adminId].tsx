import { handle, json, redirect, TypedResponse } from 'next-runtime'
import { Form } from 'next-runtime/form'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import invariant from 'tiny-invariant'
import db from '../../../lib/db'
import { Club } from '../../../lib/db/types'
import ky from 'ky'
import { ParsedUrlQuery } from 'next-runtime/types/querystring'
import zod from 'zod'

type GET = {
  club: Club
  adminId: string
}

const Schema = zod.union([
  zod.object({
    addresses: zod.array(zod.string()),
    adminId: zod.string(),
  }),
  zod.object({
    adminId: zod.string(),
    compute: zod.boolean(),
  }),
])

function getAdminId(params: ParsedUrlQuery | undefined): string {
  invariant(params, `URL params required`)
  const { adminId } = params
  invariant(adminId, `Missing adminId in URL params`)
  invariant(
    typeof adminId === 'string',
    `adminId has incorrect type: ${typeof params.adminId}`
  )
  return adminId
}

async function get({
  params,
}: {
  params?: ParsedUrlQuery
}): Promise<TypedResponse<GET> | { notFound: true }> {
  const adminId = getAdminId(params)
  const adminPanelData = await db.getAdminPanelData({ adminId })
  return adminPanelData
    ? json({ club: adminPanelData, adminId } as GET)
    : { notFound: true }
}

export const getServerSideProps: GetServerSideProps = handle({
  get,
  async post({ req: { body } }) {
    const parsed = Schema.parse(body)
    const { adminId } = parsed
    if ('addresses' in parsed) {
      await db.addAddresses({
        addresses: parsed.addresses,
        adminId: adminId,
      })
    } else {
      await db.computeMerkleRoot({ adminId })
    }
    return json({ success: true })
  },
})

export default function ({ club, adminId }: GET) {
  const { addresses, merkleRoot } = club
  const { asPath, replace } = useRouter()
  //const origin =
  //  typeof window !== 'undefined' && window.location.origin
  //    ? window.location.origin
  //    : ''
  //const URL = `${origin}${asPath}`

  const rootHash = merkleRoot.root || null

  return (
    <div className="flex min-h-screen flex-col bg-gray-700 p-8 text-white">
      <Form className="hidden"></Form>
      <h1 className="text-4xl">Admin Panel</h1>
      <div className="mt-4 flex flex-row items-center gap-x-4">
        <h2 className="text-2xl">Addresses</h2>
        <button
          onClick={async () => {
            const newAddresses = window.prompt(
              'Enter 1 or more Ethereum addresses, separated by a comma'
            )
            const addresses = newAddresses?.split(',')
            if (!addresses || addresses.length === 0) return
            await ky.post(asPath, { json: { addresses, adminId } })
            replace(asPath)
          }}
          className="h-full rounded bg-gray-800 px-4 py-1 font-bold"
        >
          ADD
        </button>
        <button
          disabled={Boolean(rootHash)}
          onClick={async () => {
            const proceed = window.confirm(
              'Once you do this, you cannot add any more addresses. Proceed?'
            )
            if (proceed) {
              await ky.post(asPath, { json: { compute: true, adminId } })
              replace(asPath)
            }
          }}
          className="h-full rounded bg-gray-800 px-4 py-1 font-bold disabled:bg-gray-600"
        >
          Compute Merkle Root
        </button>
      </div>
      {addresses.length === 0 ? (
        <div className="text-xl text-gray-300">No addresses</div>
      ) : (
        <div className="flex flex-col text-gray-200">
          {addresses.map((addr) => (
            <div key={addr}>{addr}</div>
          ))}
        </div>
      )}
      <div className="mt-2 text-2xl">
        Merkle Root: {rootHash || <i>not computed</i>}
      </div>
    </div>
  )
}
