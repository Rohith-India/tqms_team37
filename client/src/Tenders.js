import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

function Tenders() {
  const { userid } = useParams();
  const [tenders, setTenders] = useState([]);
  const [selectedTenders, setSelectedTenders] = useState([]); // new state to keep track of selected tender
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      const accessToken = new URLSearchParams(location.search).get('accessToken');
      const response = await axios.get(`http://127.0.0.1:5000/tenders?userid=${userid}`, { headers: { Authorization: `Bearer ${accessToken}` } });
      if (response.data.success) {
        setTenders(response.data.tenders);
      } else {
        console.log(response.data.message);
      }
    };

    fetchData();
  }, [userid, location]);

  const handleNewTenderClick = () => {
    const accessToken = new URLSearchParams(location.search).get('accessToken');
    window.open(`/createTender/${userid}?accessToken=${accessToken}`, '_blank', 'width=800,height=1000');
  };

  const handleSelectTender = (e, tender) => {
    if (e.target.checked) {
      setSelectedTenders([...selectedTenders, tender]); // add the selected tender to the list of selected tenders
    } else {
      setSelectedTenders(selectedTenders.filter(selectedTender => selectedTender._id !== tender._id)); // remove the selected tender from the list of selected tenders
    }
  };

  const handleDeleteTender = async () => {
    if (selectedTenders.length === 1 && selectedTenders[0].status !== 'Closed') { // only enable the button if one row is selected
      const accessToken = new URLSearchParams(location.search).get('accessToken');
      var response = null;
      try {
        response = await axios.delete(`http://127.0.0.1:5000/tenders/${selectedTenders[0]._id}`, { headers: { Authorization: `Bearer ${accessToken}` } });
        alert(response.data.message);
        if (response.data.success) {
          setTenders(tenders.filter((tender) => tender.id !== selectedTenders[0].id));
          setSelectedTenders([]);
          //window.location.reload()
        } else {
          console.log(response.data.message);
        }
      } catch (error) {
        console.error(error.response.data.message);
        alert(error.response.data.message);
      }
    }
  };

  const handleAssignVendors = () => {
    if (selectedTenders.length !== 1) {
      alert("Please select one tender to assign vendors to.");
      return;
    }
    if (selectedTenders[0].status === 'Closed') {
      alert("Cannot assign vendors to a closed tender.");
      return;
    }
    // do something with the selected tender
    if (selectedTenders.length === 1 && selectedTenders[0].status !== 'Closed') {
      const tender = selectedTenders[0];
      const accessToken = new URLSearchParams(location.search).get('accessToken');
      console.log(tender.assigned_vendors)
      var assignedVendors = "";
      if (tender.assigned_vendors) {
        assignedVendors = tender.assigned_vendors.join(',');
      }
      const url = `/vendors?tender_id=${tender._id}&accessToken=${accessToken}&assigned_vendors=${assignedVendors}`;
      window.open(url, '_blank', 'width=800,height=1000');
    }
  };

  const handleModifyTender = () => {
    if (selectedTenders.length === 1 && selectedTenders[0].status !== 'Closed') {
      const accessToken = new URLSearchParams(location.search).get('accessToken');
      window.open(`/createTender/${userid}?_id=${selectedTenders[0]._id}&accessToken=${accessToken}`, selectedTenders[0], 'width=800,height=1000');
    }
  };

  const handleViewQuotations = async () => {
    if (selectedTenders[0]) {
      const accessToken = new URLSearchParams(location.search).get('accessToken');
      window.open(`/quotations?tenderId=${selectedTenders[0]._id}&accessToken=${accessToken}`, '_blank', 'width=800,height=1000');
    }
  };

  const navigate = useNavigate();

  const handleLogout = async () => {
    localStorage.removeItem('token');
    // Perform logout logic here (e.g. clear session, redirect to login page)
    navigate('/');
    alert('Logged out from the system successfully.')
  };

  const handleCloseTender = async () => {
    if (selectedTenders.length === 1 && selectedTenders[0].status !== 'Closed') {
      const accessToken = new URLSearchParams(location.search).get('accessToken');
      const response = await axios.put(`http://127.0.0.1:5000/tenders/close/${selectedTenders[0]._id}`, { status: 'closed' }, { headers: { Authorization: `Bearer ${accessToken}` } });
      alert(response.data.message);
      if (response.data.success) {
        setTenders(tenders.map((tender) => {
          if (tender._id === selectedTenders[0]._id) {
            return {
              ...tender,
              status: 'closed'
            }
          }
          return tender;
        }));
        setSelectedTenders([]);
      } else {
        console.log(response.data.message);
      }
    }
  };

  const isOneRowSelected = selectedTenders.length === 1; // check if one row is selected

  return (
    <div className='container'>
      <h1 className='title'>Tenders</h1>
      <table>
        <thead>
          <tr>
            <th><button className='button' onClick={handleNewTenderClick}>Create Tender</button></th>
            <th><button className='button' onClick={handleModifyTender} disabled={!isOneRowSelected || (selectedTenders.length === 1 && selectedTenders[0].status === 'Closed')}>Modify Tender</button></th>
            <th><button className='button' onClick={handleDeleteTender} disabled={!isOneRowSelected}>Delete Tender</button></th>
            <th><button className='button' onClick={handleAssignVendors} disabled={!isOneRowSelected || (selectedTenders.length === 1 && selectedTenders[0].status === 'Closed')}>Assign Vendors</button></th>
            <th><button className='button' onClick={handleViewQuotations} disabled={!isOneRowSelected}>View Quotations</button></th>
            <th><button className='button' onClick={handleCloseTender} disabled={!isOneRowSelected || (selectedTenders.length === 1 && selectedTenders[0].status === 'Closed')}>Close Tender</button></th>
          </tr>
        </thead>
      </table>
      <br></br>
      <hr></hr>
      <table border="2" className='table'>
        <thead>
          <tr className='tr'>
            <th className='th'></th>
            <th className='th'>Title</th>
            <th className='th'>Description</th>
            <th className='th'>Location</th>
            <th className='th'>Start Date</th>
            <th className='th'>Deadline</th>
            <th className='th'>Status</th>
          </tr>
        </thead>
        <tbody>
          {tenders.map((tender) => (
            <tr className='tr' key={tender._id}>
              <td className='td'><input type="checkbox" onChange={(e) => handleSelectTender(e, tender)} /></td>
              <td className='td'>{tender.title}</td>
              <td className='td'>{tender.description}</td>
              <td className='td'>{tender.location}</td>
              <td className='td'>{tender.start_date}</td>
              <td className='td'>{tender.deadline}</td>
              <td className='td'>{tender.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <th><button className='button' onClick={handleLogout}>Logout</button></th>
    </div>
  );
}

export default Tenders;
