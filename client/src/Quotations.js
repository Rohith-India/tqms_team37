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
            console.log(selectedQuotation._id)
            const response = await axios.put(`http://127.0.0.1:5000/quotations/${selectedQuotation._id}/decision`, { status: "accepted" }, { headers: { Authorization: `Bearer ${accessToken}` } });
            console.log(response)
            if (response.data.success) {
                setSelectedQuotation(null);
                window.location.reload()
            } else {
                console.log(response.data.message);
            }
        }
    };

    const handleRejectQuotation = async () => {
        if (selectedQuotation) {
            const accessToken = new URLSearchParams(location.search).get('accessToken');
            console.log(selectedQuotation._id)
            const response = await axios.put(`http://127.0.0.1:5000/quotations/${selectedQuotation._id}/decision`, { status: "rejected" }, { headers: { Authorization: `Bearer ${accessToken}` } });
            if (response.data.success) {
                setSelectedQuotation(null);
                window.location.reload()
            } else {
                console.log(response.data.message);
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

    return (
        <div>
            <h1>Quotations</h1>
            <button onClick={handleAcceptQuotation} disabled={!selectedQuotation}>Accept Quotation</button>
            <button onClick={handleRejectQuotation} disabled={!selectedQuotation}>Reject Quotation</button>
            <table border="2">
                <thead>
                    <tr>
                        <th></th>
                        <th>Vendor</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Currency</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {quotations.map((quotation) => (
                        <tr key={quotation._id}>
                            <td><input type="checkbox" onChange={(e) => handleSelectQuotation(e, quotation)} /></td>
                            <td>{quotation.vendor_name}</td>
                            <td>{quotation.description}</td>
                            <td>{quotation.amount}</td>
                            <td>{quotation.currency}</td>
                            <td>{quotation.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Quotations;