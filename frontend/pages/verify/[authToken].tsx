import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { Data } from '../api/verify/[authTokenString]'
import Head from 'next/head'

const AuthToken = () => {
  const router = useRouter()
  const { authToken } = router.query
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<Data | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      fetch(`/api/verify/${authToken}`).then((res) => {
        if (res.ok) {
          res.json().then((data) => setData(data))
          setError(null)
        } else {
          res.json().then((data) => setError(data.error))
          setData(null)
        }
      })
    }
    fetchData()
  }, [authToken])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>verify cabal.xyz</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <header>
          {/* {address && (
            <div className="fixed top-2.5 right-2.5 p-2.5">
              <Profile address={address} ensName={name ? name : undefined} />
            </div>
          )} */}
        </header>

        {data && (
          <div>
            <h1 className="text-6xl font-bold">
              Generating verification for user{' '}
              <a className="text-blue-600" href="https://cabal.xyz">
                {data.user.userName}
              </a>
            </h1>
            <div>Server: {data.guild.guildName}</div>
            <div>Merkle Root: {data.configuredConnection.merkleRoot}</div>
            <div>Role: {data.role.roleName}</div>
          </div>
        )}
        {error && <div>Error {error}</div>}
        {!data && !error && <div>Loading...</div>}
      </main>
    </div>
  )
}

export default AuthToken
