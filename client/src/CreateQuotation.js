import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

function CreateQuotation() {
  const { userid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: '',
    currency: '',
    validity_days: '',
    description: '',
  });
  const [formError, setFormError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [quotationId, setQuotationId] = useState(null);
  const [file, setFile] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const update = params.get('update');
    const tenderId = params.get('tender_id');
    if (update) {
      setIsUpdating(true);
      // Fetch the existing quotation data and pre-populate the form
      const accessToken = new URLSearchParams(location.search).get('accessToken');
      axios.get(`http://127.0.0.1:5000/tenders/${tenderId}/quotations/${userid}`, { headers: { Authorization: `Bearer ${accessToken}` } })
        .then(response => {
          if (response.data.success) {
            const { amount, currency, validity_days, description } = response.data.quotation;
            setQuotationId(response.data.quotation._id);
            setFormData({ amount, currency, validity_days, description });
          } else {
            setIsUpdating(false);
            console.log(response.data.message);
          }
        })
        .catch(error => {
          console.log(error);
          setFormError('An error occurred while fetching the quotation data. Please try again later.'+error);
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
      const tender_id = new URLSearchParams(location.search).get('tender_id');
      const data = new FormData();
      data.append('amount', formData.amount);
      data.append('currency', formData.currency);
      data.append('validity_days', formData.validity_days);
      data.append('description', formData.description);
      data.append('file', file); // Add the file to the form data
      let response;
      if (isUpdating) {
        response = await axios.put(`http://127.0.0.1:5000/quotations/${quotationId}`, data, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
      } else {
        response = await axios.post(`http://127.0.0.1:5000/quotations?tender_id=${tender_id}&userid=${userid}`, data, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
      }
      if (response.data.success) {
        if (isUpdating) {
          alert('Quotation updated successfully!');
        } else {
          alert('Quotation created successfully!');
        }
        window.close();
        window.opener.location.reload();
      } else {
        alert(response.data.message);
        setFormError(response.data.message);
      }
    } catch (error) {
      console.log(error.response.data.message);
      setFormError('An error occurred while creating/updating the quotation. Please try again later.'+error.response.data.message);
    }
  };
  

  const handlePopupClose = () => {
    window.close(); // Close the current window
  };
  
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  return (
    <div>
      <h1>{isUpdating ? 'Update Quotation' : 'Create Quotation'}</h1>
      {formError && <p>{formError}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="amount">Amount</label>
          <input type="number" id="amount" name="amount" value={formData.amount} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="currency">Currency</label>
          <input type="text" id="currency" name="currency" value={formData.currency} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="validity_days">Validity (days)</label>
          <input type="number" id="validity_days" name="validity_days" value={formData.validity_days} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="file">Upload File</label>
          <input type="file" id="file" name="file" onChange={handleFileChange} />
        </div>
        <button type="submit">{isUpdating ? 'Update' : 'Create'}</button>
        <button onClick={handlePopupClose}>Close</button>
      </form>
    </div>
  );
}

export default CreateQuotation;