import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Tenders from './Tenders';
import VendorTenders from './VendorTenders';
import CreateTender from './CreateTender';
import Quotations from './Quotations';
import CreateQuotation from './CreateQuotation';
import Vendors from './Vendors';
import Users from './Users';
import CreateUser from './CreateUser';
import { useNavigate } from 'react-router-dom';

function BackButton() {
  const navigate = useNavigate();

  function handleClick() {
    navigate(-1);
  }

  return <button onClick={handleClick}>Back</button>;
}

function LogoutButton() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('token');
    // Perform logout logic here (e.g. clear session, redirect to login page)
    navigate('/');
  }

  return <button onClick={handleLogout}>Logout</button>;
}


function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Login />} />
        <Route exact path="/tenders/:userid" element={<><Tenders /><BackButton /><LogoutButton /></>} />
        <Route exact path="/vendorTenders/:userid" element={<><VendorTenders /><BackButton /><LogoutButton /></>} />
        <Route exact path="/createTender/:userid" element={<><CreateTender /><BackButton /></>} />
        <Route exact path="/quotations" element={<Quotations/>} />
        <Route exact path="/createQuotation/:userid" element={<CreateQuotation />} />
        <Route exact path="/vendors" element={<Vendors />} />
        <Route exact path="/users" element={<><Users /><BackButton /><LogoutButton /></>} />
        <Route exact path="/createUser" element={<CreateUser />} />
      </Routes>
    </Router>
  );
}

export default App;
