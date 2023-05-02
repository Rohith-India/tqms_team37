# tqms_team37

1. Download and install the following on the server:

        Node.js from https://nodejs.org/en/download
        Python from https://www.python.org/downloads/
        pip
    
2. How to build and start Server:

    Onetime setup:
    
        mkdir tqms/server
        cd tqms/server
        python3 -m venv venv
        source venv/bin activate
        pip install Flask
        pip install flask_pymongo
        pip install werkzeug.security
        pip install flask_jwt_extended
        pip install flask_cors

    Start Server:

        tqms/server
        Copy https://github.com/Rohith-India/CS4443/blob/main/Team-37/TQMS/server/app.py to tqms/server folder
        export FLASK_APP=app.py
        flask run

3. How to build and start Client:

    Onetime setup:

        cd tqms/server
        npx create-react-app client
        cd client
        npm install react-router-dom
        npm install reactstrap

    Start Client:
    
        cd tqms/client
        Copy files from https://github.com/Rohith-India/CS4443/blob/main/Team-37/TQMS/client/src/ to tqms/client/src folder
        npm start

4. MongoDB database details:

    saisivarohith
    TQMS123

    Connect from VSCode:
    mongodb+srv://saisivarohith:TQMS123@cluster0.s6qo7ga.mongodb.net/test

    Connect from shell:
    mongosh "mongodb+srv://cluster0.s6qo7ga.mongodb.net/myFirstDatabase" --apiVersion 1 --username saisivarohith

5. The following default user is created with the above setup:

        user name        password           role
        =========        ========           =====
        admin            a                  admin

6. How to access UI:

    http://localhost:3000


7. APIs details:

I USER MANAGEMENT

1. Login:

        curl -X POST -H 'Content-Type: application/json' -d '{"username":"<username>","password":"<password>"}' http://localhost:5000/login

2. Create a new user:

        curl -X POST -H 'Authorization: Bearer <access_token>' -H 'Content-Type: application/json' -d '{"username":"<username>","password":"<password>","role":"<role>","email":"<email>","contactNo":"<contactNo>","address":"<address>","organization":"<organization>"}' http://localhost:5000/users


3. Get all users:

        curl -X GET -H 'Authorization: Bearer <access_token>' http://localhost:5000/users

4. Get a specific user:

        curl -X GET -H 'Authorization: Bearer <access_token>' http://localhost:5000/users/<user_id>

5. Update an existing user:

        curl -X PUT -H 'Authorization: Bearer <access_token>' -H 'Content-Type: application/json' -d '{"username":"<newusername>","password":"<newpassword>","role":"<newrole>","email":"<newemail>","contactNo":"<newcontactNo>","address":"<newaddress>","organization":"<neworganization>"}' http://localhost:5000/users/<userid>

6. Delete a user:

        curl -X DELETE -H 'Authorization: Bearer <access_token>' -H 'Content-Type: application/json' http://localhost:5000/users/<userid>


II TENDER MANAGEMENT

1. Create a new tender:

        curl -X POST -H 'Authorization: Bearer <access_token>' -H 'Content-Type: application/json' -d '{ "title": "New Tender", "description": "This is a new tender.", "start_date": "2023-05-01", "deadline": "2023-05-15", "location": "New York City", "userid": "<owner_user_id>" }' http://localhost:5000/tenders


2. Get all tenders:

        curl -X GET -H 'Authorization: Bearer <access_token>' http://localhost:5000/tenders?userid=<owner_id>

3. Get a specific tender:

        curl -H 'Authorization: Bearer <access_token>' http://localhost:5000/tenders/<tender_id>

4. Delete a tender:

        curl -X DELETE -H 'Authorization: Bearer <access_token>' http://localhost:5000/tenders/<tender_id> 

5. Assign a tender to list of vendors:

        curl -X POST -H 'Authorization: Bearer <access_token>' -H 'Content-Type: application/json' -d '{"tender_id": "<tender_id>", "vendor_ids": ["<vendor_id_1>", "<vendor_id_2>"]}' http://localhost:5000/tenders/assign


6. Get all tenders assigned to a vendor:

        curl -X GET -H 'Authorization: Bearer <access_token>' -H 'Content-Type: application/json' http://localhost:5000/tenders/vendors/<vendor_id>

7. Update an existing tender:

        curl -X PUT  -H 'Authorization: Bearer <access_token>' -H 'Content-Type: application/json' -d '{ "title": "<new_title>", "description": "<new_description>", "start_date": "<new_start_date>", "deadline": "<new_deadline>", "location": "<new_location>", "status": "<new_status>" }' http://localhost:5000/tenders/<tender_id>


III QUOTATION MANAGEMENT


1. Create a new quotation

        curl -X POST -H 'Authorization: Bearer <access_token>' -H 'Content-Type: application/json' -d '{"amount": "1000", "currency": "USD", "validity_days": "30", "description": "Quotation for tender xyz"}' http://localhost:5000/quotations?tender_id=<tender_id>&userid=<vendor_id>

2. GET quotations for a given tender

        curl -X GET -H 'Authorization: Bearer <access_token>' -H 'Content-Type: application/json' http://localhost:5000/tenders/<tender_id>/quotations

3. GET the quotation created by a vendor for a given tender

        curl -X GET -H 'Authorization: Bearer <access_token>' -H 'Content-Type: application/json' http://localhost:5000/tenders/<tender_id>/quotations/<vendor_id>

4. Update an existing quotation

        curl -X PUT -H 'Authorization: Bearer <access_token>' -H 'Content-Type: application/json' http://localhost:5000/quotations/<quotation_id>?userid=<vendor_id> -d '{ "amount": 10000, "currency": "USD", "validity_days": 30, "description": "Updated quotation description" }'

5. Update decision (accepted/accepted) for a quotation

        curl -X PUT -H 'Authorization: Bearer <access_token>' -H 'Content-Type: application/json' http://localhost:5000/quotations/<quotation_id>/decision -d '{ "status": "accepted" }'

6. Delete a quotation

        curl -X DELETE -H 'Authorization: Bearer <access_token>' http://localhost:5000/tenders/<tender_id>/quotations/<vendor_id>
