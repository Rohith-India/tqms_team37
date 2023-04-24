import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useLocation } from 'react-router-dom';

function Tenders() {
  const { userid } = useParams();
  const [tenders, setTenders] = useState([]);
  const [selectedTenders, setSelectedTenders] = useState([]); // new state to keep track of selected tender
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      const accessToken = new URLSearchParams(location.search).get('accessToken');
      const response = await axios.get(`http://127.0.0.1:5000/tenders?userid=${userid}`, { headers: { Authorization: `Bearer ${accessToken}` }});
      if (response.data.success) {
        console.log(response.data.tenders)
        setTenders(response.data.tenders);
      } else {
        console.log(response.data.message);
      }
    };

    fetchData();
  }, [userid, location]);

  const handleNewTenderClick = () => {
    const accessToken = new URLSearchParams(location.search).get('accessToken');
    window.open(`/createTender/${userid}?accessToken=${accessToken}`, '_blank', 'width=600,height=600');
  };

  const handleSelectTender = (e, tender) => {
    if (e.target.checked) {
      setSelectedTenders([...selectedTenders, tender]); // add the selected tender to the list of selected tenders
    } else {
      setSelectedTenders(selectedTenders.filter(selectedTender => selectedTender._id !== tender._id)); // remove the selected tender from the list of selected tenders
    }
  };

  const handleDeleteTender = async () => {
    if (selectedTenders.length === 1) { // only enable the button if one row is selected
      const accessToken = new URLSearchParams(location.search).get('accessToken');
      const response = await axios.delete(`http://127.0.0.1:5000/tenders/${selectedTenders[0]._id}`, { headers: { Authorization: `Bearer ${accessToken}` }});
      if (response.data.success) {
        setTenders(tenders.filter((tender) => tender.id !== selectedTenders[0].id));
        setSelectedTenders([]);
        //window.location.reload()
      } else {
        console.log(response.data.message);
      }
    }
  };

  const handleAssignVendors = () => {
    // do something with the selected tender
    if (selectedTenders.length == 1) {
      const accessToken = new URLSearchParams(location.search).get('accessToken');
      window.open(`/vendors?tender_id=${selectedTenders[0]._id}&accessToken=${accessToken}`, '_blank', 'width=600,height=600');
    }
  };

  const handleModifyTender = () => {
    const accessToken = new URLSearchParams(location.search).get('accessToken');
    window.open(`/createTender/${userid}?_id=${selectedTenders[0]._id}&accessToken=${accessToken}`, selectedTenders[0], 'width=600,height=600');
  };

  const handleViewQuotations = async () => {
    if (selectedTenders[0]) {
      const accessToken = new URLSearchParams(location.search).get('accessToken');
      window.open(`/quotations?tenderId=${selectedTenders[0]._id}&accessToken=${accessToken}`, '_blank', 'width=600,height=600');
    }
  };
  
  const handleCloseTender = async () => {
    if (selectedTenders.length === 1) {
      const accessToken = new URLSearchParams(location.search).get('accessToken');
      const response = await axios.put(`http://127.0.0.1:5000/tenders/close/${selectedTenders[0]._id}`, { status: 'closed' }, { headers: { Authorization: `Bearer ${accessToken}` }});
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
    <div>
      <h1>Tenders</h1>
      <button onClick={handleNewTenderClick}>Create a New Tender</button>
      <button onClick={handleModifyTender} disabled={!isOneRowSelected}>Modify Tender</button>
      <button onClick={handleDeleteTender} disabled={!isOneRowSelected}>Delete Tender</button>
      <button onClick={handleAssignVendors} disabled={!isOneRowSelected}>Assign Vendors</button>
      <button onClick={handleViewQuotations} disabled={!isOneRowSelected}>View Quotations</button>
      <button onClick={handleCloseTender} disabled={!isOneRowSelected}>Close Tender</button>
      <table border="2">
        <thead>
          <tr>
            <th></th>
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
              <td><input type="checkbox" onChange={(e) => handleSelectTender(e, tender)} /></td>
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
    </div>
  );
}

export default Tenders;
