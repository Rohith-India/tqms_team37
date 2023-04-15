# tqms_team37

Onetime Setup:

        mkdir tqms/server
        cd tqms/server
        python3 -m venv venv
        source venv/bin/activate
        pip install Flask
        pip install flask_pymongo
        pip install flask_bcrypt
        pip install flask_cors
        touch app.py
        update app.py

Start Server:

        export FLASK_APP=app.py
        flask run
    
API Commands:

    User login:
    curl -X POST -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"admin_password"}' http://localhost:5000/login

    {

      "success": "Logged in successfully"


    }


    User registration:
    curl -X POST -H "Content-Type: application/json" -d '{"email":"cs20betech11044@iith.ac.in","password":"abc123", "role":"Vendor"}' http://localhost:5000/register

    {

      "success": "User registered successfully"


    }

    Get all users:
    curl http://localhost:5000/users

    [

      {

        "_id": "6438962775766e0f13848286",

        "email": "admin@example.com",

        "role": "admin"

      },

      {

        "_id": "643896b875766e0f13848287",

        "email": "es20betech11025@iith.ac.in",

        "user_type": "Vendor"

      },

      {

        "_id": "6438a11cfe0015e03b7847b6",

        "email": "cs20betech11044@iith.ac.in",

        "user_type": "Vendor"

      }


    ]

    Update an existing User:
    curl -X PUT -H "Content-Type: application/json" -d '{"email":"cs20betech11044@iith.ac.in","password":"abc123", "user_type":"Tender_Manager"}' http://localhost:5000/users/6438a11cfe0015e03b7847b6

    {

      "success": "User updated successfully"

    }
    
Client Setup:
Onetime Setup:
    cd tqms
    npx create-react-app client
    cd client
    update App.js

Start Client:
    npm start
    
