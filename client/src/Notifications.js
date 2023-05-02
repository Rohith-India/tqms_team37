import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

function Notifications() {
  const { userid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const params = new URLSearchParams(location.search);
      const accessToken = params.get('accessToken');
      const response = await axios.get(`http://127.0.0.1:5000/tenders/vendors/${userid}/notifications`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (response.data.status === 'success') {
        setNotifications(response.data.notifications);
      } else {
        console.log(response.data.message);
      }
    };
  
    fetchData();
    
  }, [userid, location.search]);

  const handlePopupClose = () => {
    window.close(); // Close the current window
  };

  const handleClearNotifications = async () => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get('accessToken');
  
    try {
      const response = await axios.delete(`http://127.0.0.1:5000/tenders/vendors/${userid}/notifications/clear`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
  
      if (response.data.status === 'success') {
        setNotifications([]);
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      console.log(error.message);
    }
  };  
  
  return (
    <div className='container-popup'>
      <h2 className='title-popup'>Notifications</h2>
      <table className='table-popup' border="2">
        <thead>
          <tr>
            <th>Title</th>
            <th>Owner</th>
            <th>Location</th>
            <th>Start Date</th>
            <th>Deadline</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {notifications.map((notification) => (
            <tr key={notification.tender_id}>
              <td>{notification.title}</td>
              <td>{notification.owner}</td>
              <td>{notification.location}</td>
              <td>{notification.start_date}</td>
              <td>{notification.deadline}</td>
              <td>{notification.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <th><button className='button-popup' onClick={handleClearNotifications}>Clear</button></th>
      <th><button className='button-popup' onClick={handlePopupClose}>Close</button></th>
    </div>
  );
}

export default Notifications;
