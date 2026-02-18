import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { AddBill } from './pages/AddBill';
import { BillDetail } from './pages/BillDetail';
import { NegotiationLive } from './pages/NegotiationLive';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="add-bill" element={<AddBill />} />
          <Route path="bills/:id" element={<BillDetail />} />
          <Route path="negotiations/:id" element={<NegotiationLive />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
