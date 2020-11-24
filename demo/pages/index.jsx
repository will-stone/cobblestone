import { Page } from '../components/page'
import { PageTitle } from '../components/page-title'

const Index = () => (
  <Page>
    <PageTitle>Index</PageTitle>
    <nav>
      <a className="underline" href="/about">
        About
      </a>
    </nav>
    <p>
      <img alt="" src="/image.png" />
    </p>
    <p className="text-gray-500">gray</p>
    <p className="text-red-500">red</p>
    <p className="text-blue-500">blue</p>
    <p className="text-orange-500">orange</p>
    <p className="text-yellow-500">yellow</p>
    <p className="text-pink-500">pink</p>
    <p className="text-teal-500">teal</p>
    <p className="text-green-500">green</p>
  </Page>
)

export default Index
