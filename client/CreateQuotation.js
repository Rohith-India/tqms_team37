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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const update = params.get('update');
    const tenderId = params.get('tender_id');
    if (update) {
      setIsUpdating(true);
      // Fetch the existing quotation data and pre-populate the form
      const accessToken = new URLSearchParams(location.search).get('accessToken');
      console.log(accessToken)
      axios.get(`http://127.0.0.1:5000/tenders/${tenderId}/quotations/${userid}`, { headers: { Authorization: `Bearer ${accessToken}` } })
        .then(response => {
          console.log(response.data.quotation)
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
          setFormError('An error occurred while fetching the quotation data. Please try again later.');
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
      console.log(tender_id)
      let response;
      if (isUpdating) {
        response = await axios.put(`http://127.0.0.1:5000/quotations/${quotationId}`, formData, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
      } else {
        response = await axios.post(`http://127.0.0.1:5000/quotations?tender_id=${tender_id}&userid=${userid}`, formData, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
      }
      console.log(response.data.success)
      if (response.data.success) {
        if (isUpdating) {
          alert('Quotation updated successfully!');
        } else {
          alert('Quotation created successfully!');
        }
        window.close();
        window.opener.location.reload();
      } else {
        setFormError(response.data.message);
      }
    } catch (error) {
      console.log(error);
      setFormError('An error occurred while creating/updating the quotation. Please try again later.');
    }
  };

  const handlePopupClose = () => {
    window.close(); // Close the current window
  };

  return (
    <>
      <div className='container'>
        <div className='login-box'>
          <h2>{isUpdating ? 'Update Quotation' : 'Create Quotation'}</h2>
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
            <button type="submit" id="UC">{isUpdating ? 'Update' : 'Create'}</button>
            <button id ="close" onClick={handlePopupClose}>Close</button>
          </form>
        </div>
      </div>
    </>
  );
}

export default CreateQuotation;
