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
  
  return (
    <div>
      <h2>Notifications</h2>
      <div>
        <button onClick={handlePopupClose}>Close</button>
      </div>
      <table border="2" className='Table'>
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
            <tr>
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
    </div>
  );
}

export default Notifications;
