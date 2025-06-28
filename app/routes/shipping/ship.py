from flask import jsonify, request, Blueprint, render_template, session, redirect, url_for

from app import db
from app.models import ReceiveInfo, Request

ship = Blueprint("ship", __name__)

@ship.route('/ship/')
def shipping():
    print("Session Keys in Shipping:", session.keys())
    if "user_info" not in session or "purpose" not in session:
        return redirect(url_for("auth.login"))

    return render_template('user_client/shipping_details/shipping.html')

# Shipping page
@ship.route('/submit-shipping', methods=['POST'])
def submit_shipping():
    print("Session Keys in Submit Shipping:", session.keys())
    if "user_info" not in session and "id_number" not in session:
        return redirect(url_for("auth.login"))

    # Get JSON data from the request
    data = request.get_json()

    # Extract the data fields
    category = data.get('category')
    courier = data.get('courier')
    contact_number = data.get('contactNumber')
    price = data.get('price')
    area = None
    address = None
    if category == 'philippines':
        area = data.get('area')
        address = data.get('address')

    # Insert data into session
    session["ship_category"] = category
    session["courier"] = courier
    if category == 'philippines':
        session["area"] = area
        session["address"] = address
    session["contact_number"] = contact_number
    session["price"] = price

    # Debugging prints
    print("Received data:")
    print(f"Category: {category}")
    print(f"Courier: {courier}")
    print(f"Address: {address}")
    print(f"Contact Number: {contact_number}")
    print(f"Region: {area}")

    # Define valid categories based on the ENUM values in the database
    valid_categories = ['philippines', 'abroad', 'pickup']

    # Check if the category is valid
    if category not in valid_categories:
        return jsonify({
            "status": "error",
            "message": f"Invalid category value: {category}. Valid categories are {', '.join(valid_categories)}."
        }), 400

    return jsonify({
        "status": "success",
        "message": "Shipping details added successfully.",
    }), 200