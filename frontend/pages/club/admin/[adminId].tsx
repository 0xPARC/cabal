import { GetServerSideProps } from 'next'
import { useState } from 'react'
import invariant from 'tiny-invariant'
import db from '../../../lib/db'
import { Club } from '../../../lib/db/types'

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  invariant(params, `URL params required`)
  const { adminId } = params
  invariant(adminId, `Missing adminId in URL params`)
  invariant(
    typeof adminId === 'string',
    `adminId has incorrect type: ${typeof params.adminId}`
  )

  const adminPanelData = db.getAdminPanelData({ adminId })
  if (!adminPanelData) {
    return { notFound: true }
  } else {
    return { props: adminPanelData }
  }
}

export default function (club: Club) {
  const { addresses } = club

  const [newAddresses, setNewAddresses] = useState<string[]>([])

  return (
    <div className="flex min-h-screen flex-col bg-gray-700 p-8 text-white">
      <h1 className="text-4xl">Admin Panel</h1>
      <div className="mt-4 flex flex-row items-center gap-x-4">
        <h2 className="text-2xl">Addresses</h2>
        <button
          onClick={() => {
            const newAddresses = window.prompt(
              'Enter 1 or more Ethereum addresses, separated by a comma'
            )
            if (!newAddresses) return;
            const addresses = newAddresses?.split(",")
            console.log(newAddresses)
          }}
          className="h-full rounded bg-gray-800 px-4 py-1 font-bold"
        >
          ADD
        </button>
      </div>
      {addresses.length === 0 ? (
        <div className="text-xl">No addresses</div>
      ) : (
        <div className="flex flex-col">
          {addresses.map((addr) => (
            <div>{addr}</div>
          ))}
        </div>
      )}
    </div>
  )
}
