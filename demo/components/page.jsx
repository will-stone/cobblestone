import clsx from 'clsx'

import { pageInfo } from '../../lib/main'

const NavLink = ({ href, children }) => (
  <li>
    <a
      className={clsx(
        pageInfo.pathname === href && 'bg-pink-500 text-white',
        'p-1',
      )}
      href={href}
    >
      {children}
    </a>
  </li>
)

export const Page = ({ children }) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <title>Cobblestone</title>
    </head>
    <body className="container">
      <header>
        <img alt="" className="w-20" src="/avatar.png" />
      </header>

      <nav>
        <ul className="flex space-x-4 my-4">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/about">About</NavLink>
          <NavLink href="/nested">Nested</NavLink>
          <NavLink href="/nested/nest">Nested Page</NavLink>
        </ul>
      </nav>

      <code>{pageInfo.pathname}</code>

      {children}
    </body>
  </html>
)
