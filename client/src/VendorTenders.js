import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

function VendorTenders() {
  const { userid } = useParams();
  const location = useLocation();
  const [tenders, setTenders] = useState([]);
  const [selectedTenders, setSelectedTenders] = useState([]);
  const [accessToken, setAccessToken] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const params = new URLSearchParams(location.search);
      const accessToken = params.get('accessToken');
      const response = await axios.get(`http://127.0.0.1:5000/tenders/vendors/${userid}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (response.data.status === 'success') {
        setTenders(response.data.tenders);
      } else {
        console.log(response.data.message);
      }
    };

    fetchData();
  }, [userid, location.search]);

  const handleTenderClick = (e, tender) => {
    if (e.target.checked) {
      setSelectedTenders([...selectedTenders, tender]); // add the selected tender to the list of selected tenders
    } else {
      setSelectedTenders(selectedTenders.filter(selectedTender => selectedTender._id !== tender._id)); // remove the selected tender from the list of selected tenders
    }
  };

  const handleCreateNew = () => {
    // Code to create a new tender
    const accessToken = new URLSearchParams(location.search).get('accessToken');
    console.log(accessToken)
    window.open(`/createQuotation/${userid}?tender_id=${selectedTenders[0]._id}&&accessToken=${accessToken}`, '_blank', 'width=800,height=1000');
  };

  const handleUpdate = () => {
    // Code to update the selected tender
    if (selectedTenders.length === 1) { // only enable the button if one row is selected
      const accessToken = new URLSearchParams(location.search).get('accessToken');
      console.log(selectedTenders[0])
      window.open(`/createQuotation/${userid}?update=1&&tender_id=${selectedTenders[0]._id}&accessToken=${accessToken}`, selectedTenders[0], 'width=800,height=1000');
    }
  };

  const handleDelete = () => {
    const accessToken = new URLSearchParams(location.search).get('accessToken');
    axios.delete(`http://127.0.0.1:5000/tenders/${selectedTenders[0]._id}/quotations/${userid}`, { headers: { Authorization: `Bearer ${accessToken}` } })
        .then(response => {
          alert(response.data.message);
          if (response.data.success) {
            console.log(response.data.message);
            window.location.reload()
          } else {
            console.log(response.data.message);
          }
        })
        .catch(error => {
          console.log(error);
        });
  };

  const handleNotifications = () => {
    const accessToken = new URLSearchParams(location.search).get('accessToken');
    console.log(accessToken)
    window.open(`/notifications/${userid}?&accessToken=${accessToken}`, '_blank', 'width=800,height=1000');
  }

  const navigate = useNavigate();

  const handleLogout = async () => {
    localStorage.removeItem('token');
    // Perform logout logic here (e.g. clear session, redirect to login page)
    navigate('/');
    alert('Logged out from the system successfully.')
  };

  const isOneRowSelected = selectedTenders.length === 1; // check if one row is selected

  return (
    <div className="container">
      <h1 className="title">Tenders</h1>
      <table>
        <thead>
          <tr>
            <th><button className="button" onClick={handleCreateNew} disabled={!isOneRowSelected}>Create New Quotation</button></th>
            <th><button className="button" onClick={handleUpdate} disabled={!isOneRowSelected}>Update Quotation</button></th>
            <th><button className="button" onClick={handleDelete} disabled={!isOneRowSelected}>Delete Quotation</button></th>
            <th><button className="button" onClick={handleNotifications}>Notifications</button></th>
          </tr>
        </thead>
      </table>
      <br></br>
      <hr></hr>
      <table border="2" className='table'>
        <thead>
          <tr>
            <th>Select</th>
            <th>Title</th>
            <th>Description</th>
            <th>Location</th>
            <th>Start Date</th>
            <th>Deadline</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {tenders.map((tender) => (
            <tr key={tender._id}>
              <td><input type="checkbox" onChange={(e) => handleTenderClick(e, tender)} /></td>
              <td>{tender.title}</td>
              <td>{tender.description}</td>
              <td>{tender.location}</td>
              <td>{tender.start_date}</td>
              <td>{tender.deadline}</td>
              <td>{tender.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <th><button className='button' onClick={handleLogout}>Logout</button></th>
    </div>
  );
}

export default VendorTenders;
