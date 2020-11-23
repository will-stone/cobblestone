import { Page } from '../components/page'
import { PageTitle } from '../components/page-title'

const About = () => {
  return (
    <Page>
      <PageTitle>About</PageTitle>
      <p>
        <a className="underline" href="/">
          Index
        </a>
      </p>
    </Page>
  )
}

export default About
