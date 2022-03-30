export default function Header() {
  return (
    <div className="relative flex items-center justify-between bg-white px-4 py-6 sm:px-6 md:justify-start md:space-x-10">
      <div>
        <a href="#" className="flex">
          <span className="sr-only">Cabal</span>
          <img
            className="h-8 w-auto sm:h-10"
            src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
            alt=""
          />
          <div className="px-2 text-base text-lg text-indigo-600 md:flex md:flex-1 md:items-center">
            cabal.xyz
          </div>
        </a>
      </div>
      <div className="hidden md:flex md:flex-1 md:items-center md:justify-between">
        <div className="flex space-x-10">
          <a
            href="#"
            className="text-base font-medium text-gray-500 hover:text-gray-900"
          >
            Blog (coming soon)
          </a>
        </div>
        <div className="flex items-center md:ml-12">
          <button
            disabled={true}
            className="ml-8 inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  )
}
