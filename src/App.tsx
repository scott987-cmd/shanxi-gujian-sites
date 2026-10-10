import { HashRouter, Routes, Route, useParams } from 'react-router'
import Gallery from './pages/Gallery'
import Site from './pages/Site'
import { getSite } from './sites'

function SiteRoute() {
  const { id } = useParams()
  return <Site key={id} config={getSite(id)} />
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Gallery />} />
        <Route path="/s/:id" element={<SiteRoute />} />
      </Routes>
    </HashRouter>
  )
}
