// App.js

import { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState('');

  const [tenders, setTenders] = useState([]);
  const [selectedTender, setSelectedTender] = useState(null);
  const [selectedBid, setSelectedBid] = useState(null);
  const [formData, setFormData] = useState({});

  const NEW = "New";
  const PENDING = "Pending";
  const AWARDED = "Awarded";
  const CLOSED = "Closed";

  const register = async () => {
    if (!email || !password || !role) {
      alert('Please fill in all fields');
      return;
    }
    await axios.post('http://127.0.0.1:5000/register', { email, password, role });
    alert('User registered successfully');
  };

  const forgotPassword = async () => {
    await axios.post('http://127.0.0.1:5000/forgot-password', { email });
    alert('Password reset email sent');
  };
  const login = async () => {
    await axios.post('http://127.0.0.1:5000/login', { email, password });
    alert('Logged in successfully');
  };

  const getUsers = async () => {
    const response = await axios.get('http://127.0.0.1:5000/users');
    setUsers(response.data);
  };

  const updateUser = async (id) => {
    if (!email || !password || !role) {
      alert('Please fill in all fields');
      return;
    }
    // Get user data from user input
    const updatedUserData = { email, password, role };
    await axios.put('http://127.0.0.1:5000/users/${id}', updatedUserData);
    alert('User updated successfully');
  };

  const deleteUser = async (id) => {
    if (!email || !password || !role) {
      alert('Please fill in all fields');
      return;
    }
    await axios.delete('http://127.0.0.1:5000/users/${id}');
    alert('User deleted successfully');
  };

  useEffect(() => {
    axios.get("/tenders").then((response) => setTenders(response.data));
  }, []);

  function handleFormChange(event) {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  }

  function handleTenderClick(tender) {
    setSelectedTender(tender);
    setSelectedBid(null);
  }

  function handleBidClick(bid) {
    setSelectedBid(bid);
  }

  function handleNewTender() {
    setFormData({});
    setSelectedTender(null);
    setSelectedBid(null);
  }

  function handleTenderSave() {
    if (selectedTender) {
      axios
        .put(`http://127.0.0.1:5000/tenders/${selectedTender._id}`, formData)
        .then(() => {
          setSelectedTender(null);
          setFormData({});
          axios.get("http://127.0.0.1:5000/tenders").then((response) => setTenders(response.data));
        });
    } else {
      axios
        .post("http://127.0.0.1:5000/tenders", formData)
        .then(() => {
          setSelectedTender(null);
          setFormData({});
          axios.get("http://127.0.0.1:5000/tenders").then((response) => setTenders(response.data));
        });
    }
  }

  function handleTenderDelete() {
    axios.delete(`http://127.0.0.1:5000/tenders/${selectedTender._id}`).then(() => {
      setSelectedTender(null);
      setSelectedBid(null);
      axios.get("http://127.0.0.1:5000/tenders").then((response) => setTenders(response.data));
    });
  }

  function handleTenderStatusUpdate(status) {
    axios
      .put(`http://127.0.0.1:5000/tenders/${selectedTender._id}/status`, { status })
      .then(() => {
        setSelectedTender(null);
        setSelectedBid(null);
        axios.get("http://127.0.0.1:5000/tenders").then((response) => setTenders(response.data));
      });
  }

  function handleNewBid() {
    setFormData({});
    setSelectedBid(null);
  }

  function handleBidSave() {
    if (selectedBid) {
      axios
        .put(`http://127.0.0.1:5000/tenders/${selectedTender._id}/bids/${selectedBid._id}`, formData)
        .then(() => {
          setSelectedBid(null);
          setFormData({});
          axios.get(`http://127.0.0.1:5000/tenders/${selectedTender._id}/bids`).then((response) => setSelectedTender({ ...selectedTender, bids: response.data }));
        });
    } else {
      axios
        .post(`http://127.0.0.1:5000/tenders/${selectedTender._id}/bids`, formData)
        .then(() => {
          setSelectedBid(null);
          setFormData({});
          axios.get(`http://127.0.0.1:5000/tenders/${selectedTender._id}/bids`).then((response) => setSelectedTender({ ...selectedTender, bids: response.data }));
        });
    }
  }

  function handleBidDelete() {
    axios
      .delete(`http://127.0.0.1:5000/tenders/${selectedTender._id}/bids/${selectedBid._id}`)
      .then(() => {
        setSelectedBid(null);
        axios.get(`http://127.0.0.1:5000/tenders/${selectedTender._id}/bids`).then((response) => setSelectedTender({ ...selectedTender, bids: response.data }));
      });
  }

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/tenders").then((res) => {
      setTenders(res.data);
    });
  }, []);

  const handleDelete = (id) => {
    axios.delete(`http://127.0.0.1:5000/tenders/${id}`).then((res) => {
      setTenders(tenders.filter((tender) => tender._id !== id));
    });
  };

  const handleUpdateStatus = (id, status) => {
    axios.put(`http://127.0.0.1:5000/tenders/${id}/status`, { status }).then((res) => {
      const updatedTenders = tenders.map((tender) =>
        tender._id === id ? { ...tender, status } : tender
      );
      setTenders(updatedTenders);
    });
  };
  return (
    <div>
      <header className="App-header">
        <h1>User Management</h1>
      </header>
      <h2>Register</h2>
      <label>Email:</label>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <label>Password:</label>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <br></br>
      <select onChange={(e) => setRole(e.target.value)}>
        <option value="">Select role</option>
        <option value="admin">Admin</option>
        <option value="tender_manager">Tender Manager</option>
        <option value="vendor">Vendor</option>
      </select>

      <button onClick={register}>Register</button>
      <h2>Forgot Password</h2>
      <label>Email:</label>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button onClick={forgotPassword}>Send Password Reset Email</button>

      <h2>Login</h2>
      <label>Email:</label>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <label>Password:</label>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={login}>Login</button>


      <h2>Users</h2>
      <button onClick={getUsers}>Get Users</button>
      <ul>
        {users.map((user) => (
          <li key={user._id}>
            Email: {user.email}
            <button onClick={() => updateUser(user._id)}>Update</button>
            <button onClick={() => deleteUser(user._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
    
  );
};

export default App;