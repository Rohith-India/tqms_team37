from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt
from flask_cors import CORS
from bson import ObjectId

app = Flask(__name__)

app.config['MONGO_DBNAME'] = 'mydatabase'
app.config['MONGO_URI'] = 'mongodb+srv://saisivarohith:TQMS123@cluster0.s6qo7ga.mongodb.net/TQMS_1'
app.config['JWT_SECRET_KEY'] = 'mysecretkey'

mongo = PyMongo(app)
jwt = JWTManager(app)
#CORS(app)
CORS(app, resources={r"/*": {"origins": "*"}})

# Default admin user
def create_admin_user():
    admin_user = mongo.db.users.find_one({'username': 'admin'})
    if admin_user is None:
        hashed_password = generate_password_hash('password', method='sha256')
        mongo.db.users.insert_one({
            'username': 'admin',
            'password': hashed_password,
            'role': 'admin'
        })

# Register a new user
@app.route('/register', methods=['POST'])
def register():
    create_admin_user()
    username = request.json.get('username')
    password = request.json.get('password')
    role = request.json.get('role')

    existing_user = mongo.db.users.find_one({'username': username})
    if existing_user is None:
        hashed_password = generate_password_hash(password, method='sha256')
        mongo.db.users.insert_one({
            'username': username,
            'password': hashed_password,
            'role': role
        })
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'message': 'User already exists.'})

# login
@app.route('/login', methods=['POST'])
def login():
    create_admin_user()
    username = request.json.get('username')
    password = request.json.get('password')

    user = mongo.db.users.find_one({'username': username})
    if user and check_password_hash(user['password'], password):
        access_token = create_access_token(identity=user['username'], additional_claims={'role': user['role']})
        return jsonify({'success': True, 'access_token': access_token, 'role': user['role'], 'username': user['username']})
    else:
        return jsonify({'success': False, 'message': 'Invalid credentials.'})

# Get all users
@app.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    jwt_payload = get_jwt()
    if 'role' in jwt_payload and jwt_payload['role'] in ['admin', 'tender_manager']:
        users = mongo.db.users.find({}, {'password': 0})
        user_list = []
        for user in users:
            user_list.append({'username': user['username'], 'role': user['role']})
        return jsonify({'success': True, 'users': user_list})
    else:
        return jsonify({'success': False, 'message': 'Not authorized to access users.'})

# Get a user
@app.route('/users/<username>', methods=['GET'])
@jwt_required()
def get_user(username):
    jwt_payload = get_jwt()
    if 'role' in jwt_payload and jwt_payload['role'] in ['admin', 'tender_manager']:
        user = mongo.db.users.find_one({'username': username}, {'password': 0})
        if user is not None:
            return jsonify({'success': True, 'user': {'username': user['username'], 'role': user['role']}})
        else:
            return jsonify({'success': False, 'message': 'User not found.'})
    else:
        return jsonify({'success': False, 'message': 'Not authorized to access users.'})

# Update an existing user
@app.route('/users/<username>', methods=['PUT'])
@jwt_required()
def update_user(username):
    jwt_payload = get_jwt()
    if 'role' in jwt_payload and jwt_payload['role'] == 'admin':
        user = mongo.db.users.find_one({'username': username})
        if user:
            # Update user details
            password = request.json.get('password')
            role = request.json.get('role')

            if password:
                hashed_password = generate_password_hash(password, method='sha256')
                mongo.db.users.update_one({'username': username}, {'$set': {'password': hashed_password}})
            if role:
                mongo.db.users.update_one({'username': username}, {'$set': {'role': role}})

            updated_user = mongo.db.users.find_one({'username': username}, {'password': 0})
            updated_user['_id'] = str(updated_user['_id'])  # Convert ObjectId to string

            return jsonify({'success': True, 'user': updated_user})
        else:
            return jsonify({'success': False, 'message': 'User not found.'})
    else:
        return jsonify({'success': False, 'message': 'Not authorized to update user details.'})

# Delete a user
@app.route('/users/<username>', methods=['DELETE'])
@jwt_required()
def delete_user(username):
    jwt_payload = get_jwt()
    if 'role' in jwt_payload and jwt_payload['role'] == 'admin':
        result = mongo.db.users.delete_one({'username': username})
        if result.deleted_count == 1:
            return jsonify({'success': True})
        else:
            return jsonify({'success': False, 'message': 'User not found.'})
    else:
        return jsonify({'success': False, 'message': 'Not authorized to delete user.'})

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
        print(jwt_payload)
        owner = jwt_payload['sub']

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
            return jsonify({'success': True})
        else:
            return jsonify({'success': False, 'message': 'Tender already exists.'})
    else:
        return jsonify({'success': False, 'message': 'Not authorized to create tender.'})


# Get all tenders
@app.route('/tenders', methods=['GET'])
@jwt_required()
def get_all_tenders():
    jwt_payload = get_jwt()
    if 'role' in jwt_payload and jwt_payload['role'] in ['admin', 'tender_manager']:
        owner_id = jwt_payload['sub']
        print(owner_id)
        tenders = mongo.db.tenders.find({'owner': owner_id})
        tenders_list = [tender for tender in tenders]
        for tender in tenders_list:
            tender['_id'] = str(tender['_id'])  # Convert ObjectId to string
        return jsonify({'success': True, 'tenders': tenders_list})
    else:
        return jsonify({'success': False, 'message': 'Not authorized to access tenders.'})

# Get a tender
@app.route('/tenders/<tender_id>', methods=['GET'])
@jwt_required()
def get_tender(tender_id):
    jwt_payload = get_jwt()
    if 'role' in jwt_payload and jwt_payload['role'] in ['admin', 'tender_manager']:
        tender = mongo.db.tenders.find_one({'_id': ObjectId(tender_id)})
        if tender is not None:
            return jsonify({'success': True, 'tender': tender})
        else:
            return jsonify({'success': False, 'message': 'Tender not found.'})
    else:
        return jsonify({'success': False, 'message': 'Not authorized to access tender.'})

# Delete a tender
@app.route('/tenders/<tender_id>', methods=['DELETE'])
@jwt_required()
def delete_tender(tender_id):
    jwt_payload = get_jwt()
    if 'role' in jwt_payload and jwt_payload['role'] in ['admin', 'tender_manager']:
        result = mongo.db.tenders.delete_one({'_id': ObjectId(tender_id)})
        if result.deleted_count == 1:
            return jsonify({'success': True})
        else:
            return jsonify({'success': False, 'message': 'Tender not found.'})
    else:
        return jsonify({'success': False, 'message': 'Not authorized to delete tender.'})

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

        tender = mongo.db.tenders.find_one({'title': tender_id})
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

        return jsonify({'status': 'success', 'message': 'Tender assigned to vendors successfully'}), 201
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

            return jsonify({'status': 'success', 'message': 'Tender updated successfully', 'tender': updated_tender})
        else:
            return jsonify({'status': 'fail', 'message': 'Tender not found'}), 404
    else:
        return jsonify({'status': 'fail', 'message': 'Unauthorized access'}), 401

# Create a new quotation
@app.route('/quotations', methods=['POST'])
@jwt_required()
def create_quotation():
    jwt_payload = get_jwt()
    if 'role' in jwt_payload and jwt_payload['role'] == 'vendor':
        # Create new quotation
        tender_id = request.json.get('tender_id')
        vendor_id = jwt_payload['id']
        amount = request.json.get('amount')
        currency = request.json.get('currency')
        validity_days = request.json.get('validity_days')
        description = request.json.get('description')

        if not tender_id or not amount or not currency or not validity_days:
            return jsonify({'status': 'fail', 'message': 'Missing required fields'}), 400

        tender = mongo.db.tenders.find_one({'_id': ObjectId(tender_id)})
        if not tender:
            return jsonify({'status': 'fail', 'message': 'Tender not found'}), 404

        quotation = {
            'tender_id': tender_id,
            'vendor_id': vendor_id,
            'amount': amount,
            'currency': currency,
            'validity_days': validity_days,
            'description': description,
            'status': 'submitted'
        }

        mongo.db.quotations.insert_one(quotation)

        return jsonify({'status': 'success', 'message': 'Quotation created successfully', 'quotation': quotation}), 201
    else:
        return jsonify({'status': 'fail', 'message': 'Unauthorized access'}), 401

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
            return jsonify({'quotations': quotations}), 200
        else:
            return jsonify({'message': 'Tender not found'}), 404
    else:
        return jsonify({'message': 'Unauthorized access'}), 401
    
# Update an existing quotation
@app.route('/quotations/<quotation_id>', methods=['PUT'])
@jwt_required()
def update_quotation(quotation_id):
    jwt_payload = get_jwt()
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
            return jsonify({'status': 'success', 'message': 'Quotation updated successfully', 'quotation': updated_quotation})
        else:
            return jsonify({'status': 'fail', 'message': 'Quotation not found'})
    else:
        return jsonify({'status': 'fail', 'message': 'Unauthorized access'}), 401

# Update decision (accepted/accepted) for a quotation
@app.route('/quotations/<quotation_id>/decision', methods=['PUT'])
@jwt_required()
def decide_quotation(quotation_id):
    jwt_payload = get_jwt()
    if 'role' in jwt_payload and jwt_payload['role'] == 'tender_manager':
        quotation = mongo.db.quotations.find_one({'_id': ObjectId(quotation_id)})
        if quotation:
            decision = request.json.get('decision')
            tender_id = quotation['tender_id']
            if decision and decision in ['accepted', 'rejected']:
                if decision == 'accepted':
                    # update current quotation to accepted
                    mongo.db.quotations.update_one({'_id': ObjectId(quotation_id)}, {'$set': {'status': 'accepted'}})
                    # update all other quotations to rejected
                    mongo.db.quotations.update_many({'tender_id': tender_id, '_id': {'$ne': ObjectId(quotation_id)}}, {'$set': {'status': 'rejected'}})
                    return jsonify({'message': 'Quotation decision updated successfully.'}), 200
                else:
                    mongo.db.quotations.update_one({'_id': ObjectId(quotation_id)}, {'$set': {'status': 'rejected'}})
                    return jsonify({'message': 'Quotation decision updated successfully.'}), 200
            else:
                return jsonify({'message': 'Invalid decision.'}), 400
        else:
            return jsonify({'message': 'Quotation not found.'}), 404
    else:
        return jsonify({'message': 'Unauthorized access.'}), 401

# Delete a quotation
@app.route('/quotations/<quotation_id>', methods=['DELETE'])
@jwt_required()
def delete_quotation(quotation_id):
    jwt_payload = get_jwt()
    if 'role' in jwt_payload and jwt_payload['role'] == 'quotation_manager':
        quotation = mongo.db.quotations.find_one({'_id': ObjectId(quotation_id)})
        if quotation:
            mongo.db.quotations.delete_one({'_id': ObjectId(quotation_id)})
            return jsonify({'message': 'Quotation deleted successfully'}), 200
        else:
            return jsonify({'message': 'Quotation not found'}), 404
    else:
        return jsonify({'message': 'You are not authorized to delete this quotation'}), 401
