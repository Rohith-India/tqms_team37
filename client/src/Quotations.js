import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

function Quotations() {
    const [quotations, setQuotations] = useState([]);
    const [selectedQuotation, setSelectedQuotation] = useState(null); // new state to keep track of selected quotation
    const location = useLocation();

    useEffect(() => {
        const fetchData = async () => {
            const accessToken = new URLSearchParams(location.search).get('accessToken');
            const tenderId = new URLSearchParams(location.search).get('tenderId');
            console.log('tenderId: ', tenderId)
            const response = await axios.get(`http://127.0.0.1:5000/tenders/${tenderId}/quotations`, { headers: { Authorization: `Bearer ${accessToken}` } });
            console.log('response', response.data)
            if (response.data.success) {
                setQuotations(response.data.quotations);
            } else {
                console.log(response.data.message);
            }
        };

        fetchData();
    }, [location]);

    const handleAcceptQuotation = async () => {
        if (selectedQuotation) {
          const accessToken = new URLSearchParams(location.search).get('accessToken');
          console.log(selectedQuotation._id);
          try {
            const response = await axios.put(`http://127.0.0.1:5000/quotations/${selectedQuotation._id}/decision`, { status: "accepted" }, { headers: { Authorization: `Bearer ${accessToken}` } });
            alert(response.data.message);
            if (response.data.success) {
              setSelectedQuotation(null);
              window.location.reload()
            } else {
              console.log(response.data.message);
            }
          } catch (error) {
            alert('An error occurred while accepting the quotation.'+error.response.data.message);
          }
        }
      };

      const handleRejectQuotation = async () => {
        if (selectedQuotation) {
          const accessToken = new URLSearchParams(location.search).get('accessToken');
          console.log(selectedQuotation._id);
          try {
            const response = await axios.put(
              `http://127.0.0.1:5000/quotations/${selectedQuotation._id}/decision`,
              { status: 'rejected' },
              { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            if (response.status === 200 && response.data.success) {
              setSelectedQuotation(null);
              window.location.reload();
            } else {
              console.log(response.data.message);
              alert('There was an error rejecting the quotation.');
            }
          } catch (error) {
            alert('There was an error rejecting the quotation.'+error.response.data.message);
          }
        }
      };
      

    const handleSelectQuotation = (e, quotation) => {
        if (e.target.checked) {
            setSelectedQuotation(quotation);
        } else {
            setSelectedQuotation(null);
        }
    };

    const handlePopupClose = () => {
        window.close(); // Close the current window
    };

    return (
        <div className='container-popup'>
            <h1 className='title-popup'>Quotations</h1>
            <table>
              <thead>
                <tr>
                  <th><button className='button-popup' onClick={handleAcceptQuotation} disabled={!selectedQuotation}>Accept</button></th>
                  <th><button className='button-popup' onClick={handleRejectQuotation} disabled={!selectedQuotation}>Reject</button></th>
                </tr>
              </thead>
            </table>
            <br></br>
            <table border="2" className='table-popup'>
                <thead>
                    <tr className='tr'>
                        <th className='th'></th>
                        <th className='th'>Vendor</th>
                        <th className='th'>Description</th>
                        <th className='th'>Amount</th>
                        <th className='th'>Currency</th>
                        <th className='th'>Status</th>
                        <th className='th'>File Name</th>
                    </tr>
                </thead>
                <tbody>
                    {quotations.map((quotation) => (
                        <tr className='tr' key={quotation._id}>
                            <td className='td'><input type="checkbox" onChange={(e) => handleSelectQuotation(e, quotation)} /></td>
                            <td className='td'>{quotation.vendor_name}</td>
                            <td className='td'>{quotation.description}</td>
                            <td className='td'>{quotation.amount}</td>
                            <td className='td'>{quotation.currency}</td>
                            <td className='td'>{quotation.status}</td>
                            <td className='td'>{quotation.file_name ? <a href={`http://127.0.0.1:5000/uploads/${quotation.file_name}`} target="_blank">{quotation.file_name}</a> : ""}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <br></br>
            <th><button className='button' onClick={handlePopupClose}>Close</button></th>
        </div>
    );
}
export default Quotations;
