import { HashRouter, Route, Routes } from 'react-router-dom'
import HubView from './views/HubView'
import TransactionsView from './views/TransactionsView'
import ViewLayout from './views/ViewLayout'

function App(): JSX.Element {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<ViewLayout />}>
          <Route index element={<HubView />} />
          <Route path="transactions" element={<TransactionsView />} />
          {/* <Route index element={<TransactionsView />} /> */}
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
