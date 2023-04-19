import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

function Tenders() {
  const [tenders, setTenders] = useState([]);
  const [selectedTender, setSelectedTender] = useState(null); // new state to keep track of selected tender
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      const accessToken = new URLSearchParams(location.search).get('accessToken');
      const response = await axios.get('http://127.0.0.1:5000/tenders', { headers: { Authorization: `Bearer ${accessToken}` }});
      if (response.data.success) {
        console.log(response.data.tenders)
        setTenders(response.data.tenders);
      } else {
        console.log(response.data.message);
      }
    };

    fetchData();
  }, [location]);

  const handleNewTenderClick = () => {
    const accessToken = new URLSearchParams(location.search).get('accessToken');
    window.open(`/createTender?accessToken=${accessToken}`, '_blank', 'width=600,height=600');
  };

  const handleSelectTender = (e, tender) => {
    if (e.target.checked) {
      setSelectedTender(tender);
    } else {
      setSelectedTender(null);
    }
  };

  const handleDeleteTender = async () => {
    if (selectedTender) {
      const accessToken = new URLSearchParams(location.search).get('accessToken');
      console.log(selectedTender._id)
      const response = await axios.delete(`http://127.0.0.1:5000/tenders/${selectedTender._id}`, { headers: { Authorization: `Bearer ${accessToken}` }});
      if (response.data.success) {
        setTenders(tenders.filter((tender) => tender.id !== selectedTender.id));
        setSelectedTender(null);
        window.location.reload()
      } else {
        console.log(response.data.message);
      }
    }
  };

  const handleAssignVendors = () => {
    // do something with the selected tender
    console.log(selectedTender);
  };

  const handleModifyTender = () => {
    const accessToken = new URLSearchParams(location.search).get('accessToken');
    window.open(`/modifyTender?id=${selectedTender.id}&accessToken=${accessToken}`, '_blank', 'width=600,height=600');
  };

  const handleViewQuotations = async () => {
    if (selectedTender) {
      const accessToken = new URLSearchParams(location.search).get('accessToken');
      window.open(`/quotations?tenderId=${selectedTender._id}&accessToken=${accessToken}`, '_blank', 'width=600,height=600');
    }
  };
  
  return (
    <div>
      <h1>Tenders</h1>
      <button onClick={handleNewTenderClick}>Create a New Tender</button>
      <button onClick={handleModifyTender} disabled={!selectedTender}>Modify Tender</button>
      <button onClick={handleDeleteTender} disabled={!selectedTender}>Delete Tender</button>
      <button onClick={handleAssignVendors} disabled={!selectedTender}>Assign Vendors</button>
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
            <th>Quotations</th>
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
              <td><button onClick={() => handleViewQuotations(tender)}>View Quotations</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Tenders;
