type AuthInfoProps = {
  userName: string
  merkleRoot: string
  roleName: string
  serverName: string
}

export default function AuthInfo({
  userName,
  merkleRoot,
  roleName,
  serverName,
}: AuthInfoProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl lg:px-8">
      <div className="flex items-center space-x-5">
        <div className="flex-shrink-0">
          <div className="relative">
            <img
              className="h-16 w-16 rounded-full"
              src="https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80"
              alt=""
            />
            <span
              className="absolute inset-0 rounded-full shadow-inner"
              aria-hidden="true"
            />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{userName}</h1>
          <p className="text-sm font-medium text-gray-500">
            Server: <span className="text-gray-900">{serverName}</span>
          </p>
          <p className="text-sm font-medium text-gray-500">
            Verifying address in merkle root{' '}
            <a className="text-gray-900">{merkleRoot}</a> on{' '}
            <time dateTime="2020-08-25">August 25, 2020</time>
          </p>
          <p className="text-sm font-medium text-gray-500">
            Role: <span className="text-gray-900">{roleName}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
