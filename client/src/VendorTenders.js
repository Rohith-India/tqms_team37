import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { useParams } from 'react-router-dom';

function VendorTenders() {
  const { username } = useParams();
  const location = useLocation();
  const [vendor_id, setVendorId] = useState('');
  const [tenders, setTenders] = useState([]);
  const [accessToken, setAccessToken] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const params = new URLSearchParams(location.search);
      const accessToken = params.get('accessToken');
      //const username = params.get('username');
      console.log('accessToken: ', accessToken)
      const response = await axios.get(`http://127.0.0.1:5000/tenders/vendors/${username}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (response.data.status === 'success') {
        setTenders(response.data.tenders);
      } else {
        console.log(response.data.message);
      }
    };

    fetchData();
  }, [vendor_id, location.search]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const vendorId = params.get('vendor_id');
    console.log('vendorId: ', vendorId)
    setVendorId(vendorId);
  }, [location.search]);

  return (
    <div>
      <h1>My Tenders</h1>
      <table border="2">
        <thead>
          <tr>
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
            <tr key={tender.id}>
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

export default VendorTenders;
