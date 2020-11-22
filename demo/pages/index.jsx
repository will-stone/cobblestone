import { PageTitle } from '../components/page-title'

const Index = () => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
    </head>
    <body className="container">
      <div>
        <PageTitle>Hello</PageTitle>
        <p>hello</p>
        <p className="text-blue-300">
          <a href="/about">About</a>
          <span className="text-transparent">transparent?</span>
        </p>
      </div>
    </body>
  </html>
)

export default Index
