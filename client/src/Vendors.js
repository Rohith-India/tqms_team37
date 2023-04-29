import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { useParams } from 'react-router-dom';

function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [tenderAssignedVendors, setTenderAssignedVendors] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const accessToken = new URLSearchParams(location.search).get('accessToken');
    axios.get(`http://127.0.0.1:5000/users?role=vendor`, { headers: { Authorization: `Bearer ${accessToken}` } })
      .then(response => {
        const tenderAssignedVendors = new URLSearchParams(location.search).get('assigned_vendors') || '';
        const assignedVendors = tenderAssignedVendors.split(',');
        setSelectedVendors(assignedVendors)
        setTenderAssignedVendors(assignedVendors);
        if (response.data.success) {
          setVendors(response.data.users);
        } else {
          console.log(response.data.message);
        }
      })
      .catch(error => {
        console.log(error);
      });
  }, []);

  const handleCheckboxChange = (event) => {
    const vendorId = event.target.value;
    const isChecked = event.target.checked;

    if (isChecked) {
      setSelectedVendors([...selectedVendors, vendorId]);
    } else {
      setSelectedVendors(selectedVendors.filter(id => id !== vendorId));
    }

    // Update the tenderAssignedVendors state
    if (isChecked) {
      setTenderAssignedVendors([...tenderAssignedVendors, vendorId]);
    } else {
      setTenderAssignedVendors(tenderAssignedVendors.filter(id => id !== vendorId));
    }
  };

  const handleAssignClick = () => {
    const tender_id = new URLSearchParams(location.search).get('tender_id');
    const accessToken = new URLSearchParams(location.search).get('accessToken');
    console.log('tender_id', tender_id)
    axios.post('http://127.0.0.1:5000/tenders/assign', {
      tender_id: tender_id,
      vendor_ids: selectedVendors
    }, { headers: { Authorization: `Bearer ${accessToken}` } })
      .then(response => {
        alert(response.data.message);
        if (response.data.status === 'success') {
          console.log(response.data.message);
          setSelectedVendors([]);
        } else {
          console.log(response.data.message);
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  const handlePopupClose = () => {
    window.close(); // Close the current window
    window.opener.location.reload(); // Refresh the parent window
  };

  return (
    <div className='container-popup'>
      <h1 className='title-popup'>Vendors</h1>
      <table>
        <thead>
        <th><button className='button-popup' onClick={handleAssignClick}>Assign</button></th>
        <th><button className='button-popup' onClick={handlePopupClose}>Close</button></th>
        </thead>
      </table>
      <br></br>
      <table className='table-popup' border="2">
        <thead>
          <tr className='tr'>
            <th className='th'>Select</th>
            <th className='th'>Username</th>
            <th className='th'>Email</th>
            <th className='th'>Contact No</th>
            <th className='th'>Address</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map(vendor => (
            <tr className='tr' key={vendor._id}>
              <td className='td'><input type="checkbox" value={vendor._id} checked={tenderAssignedVendors.includes(vendor._id)} onChange={handleCheckboxChange} /></td>
              <td className='td'>{vendor.username}</td>
              <td className='td'>{vendor.email}</td>
              <td className='td'>{vendor.contactNo}</td>
              <td className='td'>{vendor.address}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Vendors;
