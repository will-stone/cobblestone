const React = require('react')

const PageInfoContext = React.createContext()

function usePageInfo() {
  return React.useContext(PageInfoContext)
}

exports.usePageInfo = usePageInfo
exports.PageInfoContext = PageInfoContext
