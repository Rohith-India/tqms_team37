import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Tenders from './Tenders';
import VendorTenders from './VendorTenders';
import CreateTender from './CreateTender';

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Login />} />
        <Route exact path="/tenders" element={<Tenders />} />
        <Route exact path="/vendorTenders/:username" element={<VendorTenders />} />
        <Route exact path="/createTender" element={<CreateTender />} />
      </Routes>
    </Router>
  );
}

export default App;
