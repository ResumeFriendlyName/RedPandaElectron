import { HashRouter, Route, Routes } from 'react-router-dom'
import HubView from './views/HubView'
import TransactionsView from './views/TransactionsView'
import ViewLayout from './views/ViewLayout'
import SettingsView from './views/SettingsView'

function App(): JSX.Element {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<ViewLayout />}>
          <Route index element={<HubView />} />
          <Route path="transactions" element={<TransactionsView />} />
          <Route path="settings" element={<SettingsView />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
