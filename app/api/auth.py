from flask import Blueprint, request, jsonify, session
from app.models import db, Admin

admin_auth = Blueprint( "admin_auth", __name__)

@admin_auth.route('/login', methods=['POST'])
def admin_login():
    cred = request.get_json()
    email = cred.get('email')
    password = cred.get('password')
    admin = Admin.query.filter_by(email=email).first()

    if not admin:
        return jsonify({'err': 'Admin does not exist'})

    try:
        if admin.password == password:
            admin.logged_in = True
            db.session.commit()

            return jsonify({
                'msg': 'Login Successfuly',
                'admin_name': admin.first_name + ' ' + admin.last_name,
                'admin_id': admin.admin_id,
            }), 200
        
        else:
            return jsonify({'err': 'Invalid password'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
@admin_auth.route('/logout', methods=['GET'])
def admin_logout():
    admin_id = request.args.get('admin_id')
    
    admin = Admin.query.get(admin_id)

    if not admin:
        return jsonify({'err': 'Admin does not exist'}), 404
    
    try:
        admin.logged_in = False
        db.session.commit()        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
    session.clear()
    return jsonify({'msg': 'Logged out successfully'}), 200