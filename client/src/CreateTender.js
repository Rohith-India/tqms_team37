import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

function CreateTender() {
  const { userid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    deadline: '',
    location: ''
  });
  const [formError, setFormError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [tenderId, setTenderId] = useState(null);

  useEffect(() => {
    const tenderId = new URLSearchParams(location.search).get('_id');
    if (tenderId) {
      setIsUpdating(true);
      setTenderId(tenderId);
      // Fetch the existing tender data and pre-populate the form
      const accessToken = new URLSearchParams(location.search).get('accessToken');
      axios.get(`http://127.0.0.1:5000/tenders/${tenderId}`, { headers: { Authorization: `Bearer ${accessToken}` } })
        .then(response => {
          if (response.data.success) {
            const { title, description, start_date, deadline, location } = response.data.tender;
            setFormData({ title, description, start_date, deadline, location });
          } else {
            console.log(response.data.message);
          }
        })
        .catch(error => {
          setFormError('An error occurred while fetching the tender data. Please try again later.' + error.response.data.message);
        });
    }
  }, [location]);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const accessToken = new URLSearchParams(location.search).get('accessToken');
      let response;
      console.log("isUpdating", isUpdating);
      if (isUpdating) {
        response = await axios.put(`http://127.0.0.1:5000/tenders/${tenderId}`, formData, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
      } else {
        response = await axios.post(`http://127.0.0.1:5000/tenders?userid=${userid}`, formData, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
      }
      if (response.data.success) {
        if (isUpdating) {
          alert('Tender updated successfully!');
        } else {
          alert('Tender created successfully!');
        }
        window.close();
        window.opener.location.reload();
      } else {
        alert(response.data.message);
        setFormError(response.data.message);
      }
    } catch (error) {
      console.log(error.response.data.message);
      setFormError('An error occurred while creating/updating the tender. Please try again later. ' + error.response.data.message);
    }
  };

  const handlePopupClose = () => {
    window.close(); // Close the current window
  };
  
  return (
    <div>
      <h1>{isUpdating ? 'Update Tender' : 'Create Tender'}</h1>
      {formError && <p>{formError}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title</label>
          <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange} required></textarea>
        </div>
        <div>
          <label htmlFor="start_date">Start Date</label>
          <input type="date" id="start_date" name="start_date" value={formData.start_date} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="deadline">Deadline</label>
          <input type="date" id="deadline" name="deadline" value={formData.deadline} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="location">Location</label>
          <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} required />
        </div>
        <button type="submit">{isUpdating ? 'Update' : 'Create'}</button>
        <button onClick={handlePopupClose}>Close</button>
      </form>
    </div>
  );
}

export default CreateTender;
