import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

function CreateUser() {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: '',
    email: '',
    contactNo: '',
    address: '',
    organization: ''
  });
  const [formError, setFormError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState('');

  useEffect(() => {
    const userId = new URLSearchParams(location.search).get('_id');
    if (userId) {
      setIsUpdating(true);
      setUserId(userId);
      // Fetch the existing user data and pre-populate the form
      const accessToken = new URLSearchParams(location.search).get('accessToken');
      axios.get(`http://127.0.0.1:5000/users/${userId}`, { headers: { Authorization: `Bearer ${accessToken}` } })
        .then(response => {
          if (response.data.success) {
            const { username, password, role, email, contactNo, address, organization } = response.data.user;
            setFormData({ username, password, role, email, contactNo, address, organization });
          } else {
            console.log(response.data.message);
          }
        })
        .catch(error => {
          console.log(error);
          setFormError('An error occurred while fetching the user data. Please try again later.' + error.message);
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

      // Perform email validation for admin and tender_manager roles
      if ((formData.role === "admin" || formData.role === "tender_manager") && !formData.email.endsWith("@iith.ac.in")) {
        setFormError("Email must be in the @iith.ac.in domain for admin and tender_manager roles.");
        return;
      }

      if (isUpdating) {
        response = await axios.put(`http://127.0.0.1:5000/users/${userId}`, formData, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
      } else {
        response = await axios.post('http://127.0.0.1:5000/users', formData, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
      }
      if (response.data.success) {
        if (isUpdating) {
          alert('User updated successfully!');
        } else {
          alert('User created successfully!');
        }
        window.close();
        window.opener.location.reload();
      } else {
        setFormError(response.data.message);
      }
    } catch (error) {
      console.log(error.message);
      setFormError('An error occurred while creating/updating the user. Please try again later. ' + error.message);
    }
  };

  const handlePopupClose = () => {
    window.close(); // Close the current window
  };

  return (
    <div>
      <h1>{isUpdating ? 'Update User' : 'Create User'}</h1>
      {formError && <p>{formError}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username</label>
          <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="role">Role</label>
          <select id="role" name="role" value={formData.role} onChange={handleChange}>
            <option value="">Select a role</option>
            <option value="admin">Admin</option>
            <option value="tender_manager">Tender Manager</option>
            <option value="vendor">Vendor</option>
          </select>
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="contactNo">Contact No</label>
          <input type="text" id="contactNo" name="contactNo" value={formData.contactNo} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="address">Address</label>
          <textarea id="address" name="address" value={formData.address} onChange={handleChange} required></textarea>
        </div>
        <div>
          <label htmlFor="organization">Organization</label>
          <input type="text" id="organization" name="organization" value={formData.organization} onChange={handleChange} required />
        </div>
        <button type="submit">{isUpdating ? 'Update' : 'Create'}</button>
        <button onClick={handlePopupClose}>Close</button>
      </form>
    </div>
  );
}
export default CreateUser;
