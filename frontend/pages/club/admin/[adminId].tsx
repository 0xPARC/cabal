import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import invariant from 'tiny-invariant'
import db from '../../../lib/db'
import { Club } from '../../../lib/db/types'
import ky from 'ky'
import { ParsedUrlQuery } from 'querystring'

type PageProps = {
  club: Club
  adminId: string
}

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

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  params,
}) => {
  const adminId = getAdminId(params)
  const adminPanelData = await db.getAdminPanelData({ adminId })
  return adminPanelData
    ? { props: { club: adminPanelData, adminId } }
    : { notFound: true }
}

export default function ({ club, adminId }: PageProps) {
  const { addresses, merkleRoot } = club
  const { asPath, replace } = useRouter()
  const rootHash = merkleRoot.root || null

  return (
    <div className="flex min-h-screen flex-col bg-gray-700 p-8 text-white">
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
            await ky.post(`/api/clubAdmin`, { json: { addresses, adminId } })
            console.log('refreshing')
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
              const res = await ky.post('/api/clubAdmin', {
                json: { compute: true, adminId },
              })
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
