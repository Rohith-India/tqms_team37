from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt
from flask_cors import CORS

app = Flask(__name__)
app.config["MONGO_URI"] = "mongodb+srv://saisivarohith:TQMS123@cluster0.s6qo7ga.mongodb.net/TQMS"
mongo = PyMongo(app)
bcrypt = Bcrypt(app)
#CORS(app)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})


# Define user roles
ADMIN = "admin"
TENDER_MANAGER = "tender_manager"
VENDOR = "vendor"

# Check if the admin user already exists
admin_user = mongo.db.users.find_one({'email': 'admin@example.com'})
print(admin_user)
if not admin_user:
    # Default admin user
    default_admin = {
        "email": "admin@example.com",
        "password": bcrypt.generate_password_hash("admin_password").decode('utf-8'),
        "role": ADMIN
    }
    mongo.db.users.insert_one(default_admin)

# Routes
@app.route('/register', methods=['POST'])
def register():
    user_data = request.get_json()
    # Check if email already exists
    if mongo.db.users.find_one({"email": user_data["email"]}):
        return jsonify({"error": "Email already exists"})
    # Hash the password before saving
    user_data["password"] = bcrypt.generate_password_hash(user_data["password"]).decode('utf-8')
    mongo.db.users.insert_one(user_data)
    return jsonify({"success": "User registered successfully"})

@app.route('/forgot-password', methods=['POST'])
def forgot_password():
    email = request.get_json()["email"]
    user = mongo.db.users.find_one({"email": email})
    if not user:
        return jsonify({"error": "User not found"})
    # Send email with password reset instructions
    # ...
    return jsonify({"success": "Password reset email sent"})

@app.route('/login', methods=['POST'])
def login():
    user_data = request.get_json()
    user = mongo.db.users.find_one({"email": user_data["email"]})
    if not user:
        return jsonify({"error": "User not found"})
    if not bcrypt.check_password_hash(user["password"], user_data["password"]):
        return jsonify({"error": "Invalid password"})
    # Return user data with a JWT token
    # ...
    return jsonify({"success": "Logged in successfully"})

@app.route('/users', methods=['GET'])
def get_users():
    users = list(mongo.db.users.find())
    # Remove password field before sending data to client
    for user in users:
        user['_id'] = str(user['_id'])
        user['email'] = str(user['email'])
        #user['user_type'] = str(user['user_type'])
        del user["password"]
    return jsonify(users)

@app.route('/users/<id>', methods=['PUT'])
def update_user(id):
    user_data = request.get_json()
    # Hash the password before saving
    user_data["password"] = bcrypt.generate_password_hash(user_data["password"]).decode('utf-8')
    mongo.db.users.update_one({"_id": id}, {"$set": user_data})
    return jsonify({"success": "User updated successfully"})

@app.route('/users/<id>', methods=['DELETE'])
def delete_user(id):
    mongo.db.users.delete_one({"_id": id})
    return jsonify({"success": "User deleted successfully"})