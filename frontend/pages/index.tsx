import Head from 'next/head'
import Image from 'next/image'

const SimpleRow = ({ title, children }: { title: string; children: any }) => {
  return (
    <div className="p-2">
      <div className="text-lg text-terminal-green">{title}</div>
      <div>
        <span className="text-terminal-green">{'>>>'} </span>
        <span>{children}</span>
      </div>
    </div>
  )
}

const Row = ({ title, children }: { title: string; children: any }) => {
  return (
    <div className="p-2">
      <div className="text-lg text-terminal-green">{title}</div>
      {children}
    </div>
  )
}

const Homepage = () => {
  return (
    <div className="h-screen">
      <Head>
        <title>verify cabal.xyz</title>
        <link rel="icon" href="/cabal_favicon.png" />
      </Head>
      <div className="flex p-5">
        <Image src="/logo.png" alt="cabal" width="64" height="64" />
        <div className="flex items-center justify-center px-5 text-lg text-white">
          <a href="/" className="hover:text-gray-400">
            cabal.xyz
          </a>
        </div>
      </div>
      <div className="-mt-24 flex h-full items-center justify-center bg-black text-white">
        <div className="max-w-3xl">
          <SimpleRow title="What is cabal?">
            {' '}
            FILL IN DESCRIPTION HERE
          </SimpleRow>
          <SimpleRow title="How do I use it to manage my gated-discord roles (for admins)?">
            <a
              href="https://www.notion.so/0xparc/Configuring-Cabal-2554b43826e9431e934062452f07be65"
              className="text-gray-200 hover:text-gray-400"
              target="_blank"
            >
              Guide: Configuring Cabal
            </a>
          </SimpleRow>
          <SimpleRow title="How do I use it to authenticate a discord server (for users)?">
            <a
              href="https://0xparc.notion.site/Getting-verified-with-Cabal-64496bf7d95b4481bfc3c3a6cb3eae51"
              className="hover:text-gray-400"
              target="_blank"
            >
              Guide: Getting verified with Cabal
            </a>
          </SimpleRow>
          <SimpleRow title="Blog Post">
            Coming soon! We are planning to release a blog post about FILL IN
            MORE INFORMATION ABOUT IT HERE
          </SimpleRow>
          <SimpleRow title="Open Source Resources">
            Coming soon! FILL IN A LITTLE MORE TEASER INFORMATION
          </SimpleRow>
          <Row title="Contact Info">
            <div>
              Please reach out to us if you have any questions about our
              implementation or want to jam on more ideas!{' '}
            </div>
            <div>
              <span className="text-terminal-green">{'>>>'} </span>
              <span>
                <a
                  href="https://twitter.com/cabalxyz"
                  target="_blank"
                  className="hover:text-gray-400"
                >
                  twitter: @cabalxyz
                </a>
              </span>
            </div>
            <div>
              <span className="text-terminal-green">{'>>>'} </span>
              <span>
                <a
                  href="https://twitter.com/cabalxyz"
                  target="_blank"
                  className="hover:text-gray-400"
                >
                  discord invite
                </a>
              </span>
            </div>
          </Row>
        </div>
      </div>
    </div>
  )
}

export default Homepage
