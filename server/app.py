from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt
from flask_cors import CORS
from bson import ObjectId

app = Flask(__name__)

app.config['MONGO_DBNAME'] = 'mydatabase'
app.config['MONGO_URI'] = 'mongodb+srv://saisivarohith:TQMS123@cluster0.s6qo7ga.mongodb.net/TQMS'
app.config['JWT_SECRET_KEY'] = 'mysecretkey'

mongo = PyMongo(app)
jwt = JWTManager(app)
#CORS(app)
CORS(app, resources={r"/*": {"origins": "*"}})

# Default admin user
def create_admin_user():
    admin_user = mongo.db.users.find_one({'username': 'admin'})
    if admin_user is None:
        hashed_password = generate_password_hash('a', method='sha256')
        mongo.db.users.insert_one({
            'username': 'admin',
            'password': hashed_password,
            'role': 'admin',
            'email': "es20btech11025@iith.ac.in",
            'contactNo': "+91 7892429095",
            'address': "Katilya Hostel",
            "organization": "IITH"
        })

create_admin_user()

# login
@app.route('/login', methods=['POST'])
def login():
    create_admin_user()
    username = request.json.get('username')
    password = request.json.get('password')

    user = mongo.db.users.find_one({'username': username})
    if user and check_password_hash(user['password'], password):
        access_token = create_access_token(identity=user['username'], additional_claims={'role': user['role']})
        return jsonify({'success': True, 'access_token': access_token, 'role': user['role'], 'userid': str(user['_id'])}), 200
    else:
        return jsonify({'success': False, 'message': 'Invalid credentials.'}), 400

# Create a new user
@app.route('/users', methods=['POST'])
@jwt_required()
def register():
    jwt_payload = get_jwt()
    if 'role' in jwt_payload and jwt_payload['role'] in ['admin']:
        username = request.json.get('username')
        password = request.json.get('password')
        role = request.json.get('role')
        email = request.json.get('email')
        contactNo = request.json.get('contactNo')
        address = request.json.get('address')
        organization = request.json.get('organization')

        if (role == 'admin' or role == 'tender_manager') and not email.endswith('@iith.ac.in'):
            return jsonify({'success': False, 'message': 'Invalid email domain for admin or tender_manager role.'}), 400

        existing_user = mongo.db.users.find_one({'username': username})
        if existing_user is None:
            hashed_password = generate_password_hash(password, method='sha256')
            mongo.db.users.insert_one({
                'username': username,
                'password': hashed_password,
                'role': role,
                'email': email,
                'contactNo': contactNo,
                'address': address,
                'organization': organization,
            })
            return jsonify({'success': True}), 200
        else:
            return jsonify({'success': False, 'message': 'User already exists.'}), 422
    else:
        return jsonify({'success': False, 'message': 'Not authorized to create users.'}), 401

# Get all users
@app.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    jwt_payload = get_jwt()
    if 'role' in jwt_payload and jwt_payload['role'] in ['admin', 'tender_manager']:
        role = request.args.get('role')
        if role == 'vendor':
            users = mongo.db.users.find({'role': 'vendor'}, {'password': 0})
        else:
            users = mongo.db.users.find({}, {'password': 0})
        users_list = [user for user in users]
        for user in users_list:
            user['_id'] = str(user['_id'])  # Convert ObjectId to string
       
        return jsonify({'success': True, 'users': users_list}), 200
    else:
        return jsonify({'success': False, 'message': 'Not authorized to access users.'}), 401

@app.route('/users/<user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    jwt_payload = get_jwt()
    if 'role' in jwt_payload and jwt_payload['role'] == 'admin':
        user = mongo.db.users.find_one({'_id': ObjectId(user_id)})
        user['_id'] = str(user['_id'])  # Convert ObjectId to string
        if user is not None:
            return jsonify({'success': True, 'user': user}), 200
        else:
            return jsonify({'success': False, 'message': 'User not found.'}), 404
    else:
        return jsonify({'success': False, 'message': 'Not authorized to access user.'}), 401

# Update an existing user
@app.route('/users/<userid>', methods=['PUT'])
@jwt_required()
def update_user(userid):
    jwt_payload = get_jwt()
    if 'role' in jwt_payload and jwt_payload['role'] == 'admin':
        user = mongo.db.users.find_one({'_id': ObjectId(userid)})
        if user:
            # Update user details
            username = request.json.get('username')
            password = request.json.get('password')
            role = request.json.get('role')
            email = request.json.get('email')
            contactNo = request.json.get('contactNo')
            address = request.json.get('address')
            organization = request.json.get('organization')

            if username:
                mongo.db.users.update_one({'_id': ObjectId(userid)}, {'$set': {'username': username}})
            if password:
                hashed_password = generate_password_hash(password, method='sha256')
                mongo.db.users.update_one({'_id': ObjectId(userid)}, {'$set': {'password': hashed_password}})
            if role:
                mongo.db.users.update_one({'_id': ObjectId(userid)}, {'$set': {'role': role}})
            if email:
                mongo.db.users.update_one({'_id': ObjectId(userid)}, {'$set': {'email': email}})
            if contactNo:
                mongo.db.users.update_one({'_id': ObjectId(userid)}, {'$set': {'contactNo': contactNo}})
            if address:
                mongo.db.users.update_one({'_id': ObjectId(userid)}, {'$set': {'address': address}})
            if organization:
                mongo.db.users.update_one({'_id': ObjectId(userid)}, {'$set': {'organization': organization}})
 
            updated_user = mongo.db.users.find_one({'_id': ObjectId(userid)})
            updated_user['_id'] = str(updated_user['_id'])  # Convert ObjectId to string

            return jsonify({'success': True, 'user': updated_user}), 200
        else:
            return jsonify({'success': False, 'message': 'User not found.'}), 404
    else:
        return jsonify({'success': False, 'message': 'Not authorized to update user details.'}), 401

# Delete a user
@app.route('/users/<userid>', methods=['DELETE'])
@jwt_required()
def delete_user(userid):
    jwt_payload = get_jwt()
    if 'role' in jwt_payload and jwt_payload['role'] == 'admin':
        user = mongo.db.users.find_one({'_id': ObjectId(userid)})
        if user['username'] == 'admin':
            return jsonify({'success': False, 'message': 'The admin user cannot be deleted.'}), 400
        result = mongo.db.users.delete_one({'_id': ObjectId(userid)})
        if result.deleted_count == 1:
            return jsonify({'success': True}), 200
        else:
            return jsonify({'success': False, 'message': 'User not found.'}), 404
    else:
        return jsonify({'success': False, 'message': 'Not authorized to delete user.'}), 401

# Create a new tender
@app.route('/tenders', methods=['POST'])
@jwt_required()
def create_tender():
    jwt_payload = get_jwt()
    if 'role' in jwt_payload and jwt_payload['role'] == 'tender_manager':
        title = request.json.get('title')
        description = request.json.get('description')
        start_date = request.json.get('start_date')
        deadline = request.json.get('deadline')
        location = request.json.get('location')
        owner = request.args.get('userid')
        existing_tender = mongo.db.tenders.find_one({'title': title})
        if existing_tender is None:
            mongo.db.tenders.insert_one({
                'title': title,
                'description': description,
                'start_date': start_date,
                'deadline': deadline,
                'location': location,
                'status': 'Open',
                'owner': owner
            })
            return jsonify({'success': True}), 200
        else:
            return jsonify({'success': False, 'message': 'Tender already exists.'}), 422
    else:
        return jsonify({'success': False, 'message': 'Not authorized to create tender.'}), 401


# Get all tenders
@app.route('/tenders', methods=['GET'])
@jwt_required()
def get_all_tenders():
    jwt_payload = get_jwt()
    if 'role' in jwt_payload and jwt_payload['role'] in ['admin', 'tender_manager']:
        owner_id = request.args.get('userid')
        tenders = mongo.db.tenders.find({'owner': owner_id})
        tenders_list = [tender for tender in tenders]
        for tender in tenders_list:
            tender['_id'] = str(tender['_id'])  # Convert ObjectId to string
        return jsonify({'success': True, 'tenders': tenders_list}), 200
    else:
        return jsonify({'success': False, 'message': 'Not authorized to access tenders.'}), 401

# Get a specific tender
@app.route('/tenders/<tender_id>', methods=['GET'])
@jwt_required()
def get_tender(tender_id):
    jwt_payload = get_jwt()
    if 'role' in jwt_payload and jwt_payload['role'] in ['admin', 'tender_manager']:
        tender = mongo.db.tenders.find_one({'_id': ObjectId(tender_id)})
        tender['_id'] = str(tender['_id'])  # Convert ObjectId to string
        if tender is not None:
            return jsonify({'success': True, 'tender': tender}), 200
        else:
            return jsonify({'success': False, 'message': 'Tender not found.'}), 404
    else:
        return jsonify({'success': False, 'message': 'Not authorized to access tender.'}), 401

# Delete a tender
@app.route('/tenders/<tender_id>', methods=['DELETE'])
@jwt_required()
def delete_tender(tender_id):
    jwt_payload = get_jwt()
    if 'role' in jwt_payload and jwt_payload['role'] in ['admin', 'tender_manager']:
        result = mongo.db.tenders.delete_one({'_id': ObjectId(tender_id)})
        if result.deleted_count == 1:
            return jsonify({'success': True}), 200
        else:
            return jsonify({'success': False, 'message': 'Tender not found.'}), 404
    else:
        return jsonify({'success': False, 'message': 'Not authorized to delete tender.'}), 401

# Assign a tender to list of vendors
@app.route('/tenders/assign', methods=['POST'])
@jwt_required()
def assign_tender():
    jwt_payload = get_jwt()
    if 'role' in jwt_payload and jwt_payload['role'] == 'tender_manager':
        tender_id = request.json.get('tender_id')
        vendor_ids = request.json.get('vendor_ids')

        if not tender_id or not vendor_ids:
            return jsonify({'status': 'fail', 'message': 'Missing required fields'}), 400
        tender = mongo.db.tenders.find_one({'_id': ObjectId(tender_id)})
        if not tender:
            return jsonify({'status': 'fail', 'message': 'Tender not found'}), 404

        vendors = mongo.db.users.find({'username': {'$in': vendor_ids}})

        if not vendors:
            return jsonify({'status': 'fail', 'message': 'No vendors found with provided IDs'}), 404

        # Add tender ID to vendor's assigned_tenders list
        for vendor in vendors:
            if 'assigned_tenders' not in vendor:
                vendor['assigned_tenders'] = []
            if tender_id not in vendor['assigned_tenders']:
                vendor['assigned_tenders'].append(tender_id)
            mongo.db.users.update_one({'_id': vendor['_id']}, {'$set': {'assigned_tenders': vendor['assigned_tenders']}})

        # Add vendor ID to tender's assigned_vendors list
        if 'assigned_vendors' not in tender:
            tender['assigned_vendors'] = []
        for vendor_id in vendor_ids:
            if vendor_id not in tender['assigned_vendors']:
                tender['assigned_vendors'].append(vendor_id)
        mongo.db.tenders.update_one({'_id': tender['_id']}, {'$set': {'assigned_vendors': tender['assigned_vendors']}})

        return jsonify({'status': 'success', 'message': 'Tender assigned to vendors successfully'}), 200
    else:
        return jsonify({'status': 'fail', 'message': 'Unauthorized access'}), 401

# Get all tenders assigned to a vendor
@app.route('/tenders/vendors/<vendor_id>', methods=['GET'])
@jwt_required()
def get_tenders_by_vendor(vendor_id):
    jwt_payload = get_jwt()
    if 'role' in jwt_payload and jwt_payload['role'] == 'vendor':
        tenders = mongo.db.tenders.find({'assigned_vendors': vendor_id})
        tenders_list = [tender for tender in tenders]
        for tender in tenders_list:
            tender['_id'] = str(tender['_id'])  # Convert ObjectId to string
        return jsonify({'status': 'success', 'tenders': tenders_list}), 200
    else:
        return jsonify({'status': 'fail', 'message': 'Unauthorized access'}), 401


# Update an existing tender
@app.route('/tenders/<tender_id>', methods=['PUT'])
@jwt_required()
def update_tender(tender_id):
    jwt_payload = get_jwt()
    if 'role' in jwt_payload and jwt_payload['role'] == 'tender_manager':
        tender = mongo.db.tenders.find_one({'_id': ObjectId(tender_id)})
        if tender:
            # Update tender details
            title = request.json.get('title')
            description = request.json.get('description')
            start_date = request.json.get('start_date')
            deadline = request.json.get('deadline')
            location = request.json.get('location')
            status = request.json.get('status')

            if title:
                mongo.db.tenders.update_one({'_id': ObjectId(tender_id)}, {'$set': {'title': title}})
            if description:
                mongo.db.tenders.update_one({'_id': ObjectId(tender_id)}, {'$set': {'description': description}})
            if start_date:
                mongo.db.tenders.update_one({'_id': ObjectId(tender_id)}, {'$set': {'start_date': start_date}})
            if deadline:
                mongo.db.tenders.update_one({'_id': ObjectId(tender_id)}, {'$set': {'deadline': deadline}})
            if location:
                mongo.db.tenders.update_one({'_id': ObjectId(tender_id)}, {'$set': {'location': location}})
            if status:
                mongo.db.tenders.update_one({'_id': ObjectId(tender_id)}, {'$set': {'status': status}})
            updated_tender = mongo.db.tenders.find_one({'_id': ObjectId(tender_id)})
            updated_tender['_id'] = str(updated_tender['_id'])  # Convert ObjectId to string
            return jsonify({'success': True, 'message': 'Tender updated successfully', 'tender': updated_tender}), 200
        else:
            return jsonify({'success': False, 'message': 'Tender not found.'}), 404
    else:
        return jsonify({'success': False, 'message': 'Not authorized to access tender.'}), 401

# Create a new quotation
@app.route('/quotations', methods=['POST'])
@jwt_required()
def create_quotation():
    jwt_payload = get_jwt()
    if 'role' in jwt_payload and jwt_payload['role'] == 'vendor':
        # Create new quotation
        tender_id = request.args.get('tender_id')
        vendor_id = request.args.get('userid')
        vendor_name = jwt_payload['sub']
        print('vendor_name: ', vendor_name)
        amount = request.json.get('amount')
        currency = request.json.get('currency')
        validity_days = request.json.get('validity_days')
        description = request.json.get('description')

        if not tender_id or not amount or not currency or not validity_days:
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400
        
        # Check if vendor has already submitted a quotation for this tender
        existing_quotation = mongo.db.quotations.find_one({'tender_id': tender_id, 'vendor_id': vendor_id})
        if existing_quotation:
            return jsonify({'success': False, 'message': 'Vendor has already submitted a quotation for this tender'}), 400

        tender = mongo.db.tenders.find_one({'_id': ObjectId(tender_id)})
        if not tender:
            return jsonify({'success': False, 'message': 'Tender not found'}), 404
        
        quotation = {
            'tender_id': tender_id,
            'vendor_id': vendor_id,
            'vendor_name': vendor_name,
            'amount': amount,
            'currency': currency,
            'validity_days': validity_days,
            'description': description,
            'status': 'submitted'
        }
        mongo.db.quotations.insert_one(quotation)
        quotation['_id'] = str(quotation['_id'])  # Convert ObjectId to string
        return jsonify({'success': True, 'message': 'Quotation created successfully', 'quotation': quotation}), 200
    else:
        return jsonify({'success': False, 'message': 'Unauthorized access'}), 401

# GET quotations for a given tender
@app.route('/tenders/<tender_id>/quotations', methods=['GET'])
@jwt_required()
def get_quotations_for_tender(tender_id):
    jwt_payload = get_jwt()
    if 'role' in jwt_payload and jwt_payload['role'] == 'tender_manager':
        tender = mongo.db.tenders.find_one({'_id': ObjectId(tender_id)})
        if tender:
            quotations = list(mongo.db.quotations.find({'tender_id': tender_id}))
            for quotation in quotations:
                quotation['_id'] = str(quotation['_id'])
            return jsonify({'success': True, 'quotations': quotations}), 200
        else:
            return jsonify({'success': False, 'message': 'Tender not found.'}), 404
    else:
        return jsonify({'success': False, 'message': 'Not authorized to access tender.'}), 401


# GET the quotation created by a vendor for a given tender
@app.route('/tenders/<tender_id>/quotations/<vendor_id>', methods=['GET'])
@jwt_required()
def get_quotation_for_tender_and_vendor(tender_id, vendor_id):
    jwt_payload = get_jwt()
    if 'role' in jwt_payload and jwt_payload['role'] == 'vendor':
        tender = mongo.db.tenders.find_one({'_id': ObjectId(tender_id)})
        if tender:
            quotation = mongo.db.quotations.find_one({'tender_id': tender_id, 'vendor_id': vendor_id})
            if quotation:
                quotation['_id'] = str(quotation['_id'])
                return jsonify({'success': True, 'quotation': quotation}), 200
            else:
                return jsonify({'success': False, 'message': 'Quotation not found for the given tender and vendor.'}), 404
        else:
            return jsonify({'success': False, 'message': 'Tender not found.'}), 404
    else:
        return jsonify({'success': False, 'message': 'Not authorized to access tender.'}), 401

# Update an existing quotation
@app.route('/quotations/<quotation_id>', methods=['PUT'])
@jwt_required()
def update_quotation(quotation_id):
    jwt_payload = get_jwt()
    vendor_id = request.args.get('userid')
    if 'role' in jwt_payload and jwt_payload['role'] == 'vendor':
        quotation = mongo.db.quotations.find_one({'_id': ObjectId(quotation_id)})
        if quotation:
            # Update quotation details
            amount = request.json.get('amount')
            currency = request.json.get('currency')
            validity_days = request.json.get('validity_days')
            description = request.json.get('description')
            if amount:
                mongo.db.quotations.update_one({'_id': ObjectId(quotation_id)}, {'$set': {'amount': amount}})
            if currency:
                mongo.db.quotations.update_one({'_id': ObjectId(quotation_id)}, {'$set': {'currency': currency}})
            if validity_days:
                mongo.db.quotations.update_one({'_id': ObjectId(quotation_id)}, {'$set': {'validity_days': validity_days}})
            if description:
                mongo.db.quotations.update_one({'_id': ObjectId(quotation_id)}, {'$set': {'description': description}})

            updated_quotation = mongo.db.quotations.find_one({'_id': ObjectId(quotation_id)})
            updated_quotation['_id'] = str(updated_quotation['_id'])  # Convert ObjectId to string
            return jsonify({'success': True, 'message': 'Quotation updated successfully', 'quotation': updated_quotation}), 200
        else:
            return jsonify({'success': False, 'message': 'Quotation not found'}), 404
    else:
        return jsonify({'success': False, 'message': 'Unauthorized access'}), 401

# Update decision (accepted/accepted) for a quotation
@app.route('/quotations/<quotation_id>/decision', methods=['PUT'])
@jwt_required()
def decide_quotation(quotation_id):
    jwt_payload = get_jwt()
    if 'role' in jwt_payload and jwt_payload['role'] == 'tender_manager':
        quotation = mongo.db.quotations.find_one({'_id': ObjectId(quotation_id)})
        if quotation:
            decision = request.json.get('status')
            tender_id = quotation['tender_id']
            if decision and decision in ['accepted', 'rejected']:
                if decision == 'accepted':
                    # update current quotation to accepted
                    mongo.db.quotations.update_one({'_id': ObjectId(quotation_id)}, {'$set': {'status': 'accepted'}})
                    # update all other quotations to rejected
                    mongo.db.quotations.update_many({'tender_id': tender_id, '_id': {'$ne': ObjectId(quotation_id)}}, {'$set': {'status': 'rejected'}})
                    return jsonify({'success': True, 'message': 'Quotation decision updated successfully.'}), 200
                else:
                    mongo.db.quotations.update_one({'_id': ObjectId(quotation_id)}, {'$set': {'status': 'rejected'}})
                    return jsonify({'success': True, 'message': 'Quotation decision updated successfully.'}), 200
            else:
                return jsonify({'success': False, 'message': 'Invalid decision.'}), 400
        else:
            return jsonify({'success': False, 'message': 'Quotation not found.'}), 404
    else:
        return jsonify({'success': False, 'message': 'Unauthorized access.'}), 401

# Delete a quotation
@app.route('/tenders/<tender_id>/quotations/<vendor_id>', methods=['DELETE'])
@jwt_required()
def delete_quotation(tender_id, vendor_id):
    jwt_payload = get_jwt()
    if 'role' in jwt_payload and jwt_payload['role'] == 'vendor':
        quotation = mongo.db.quotations.find_one({'tender_id': tender_id, 'vendor_id': vendor_id})
        if quotation:
            mongo.db.quotations.delete_one({'tender_id': tender_id, 'vendor_id': vendor_id})
            return jsonify({'success': True, 'message': 'Quotation deleted successfully'}), 200
        else:
            return jsonify({'success': False, 'message': 'Quotation not found'}), 404
    else:
        return jsonify({'success': False, 'message': 'You are not authorized to delete this quotation'}), 401
