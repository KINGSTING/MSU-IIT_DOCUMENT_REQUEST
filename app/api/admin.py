from datetime import datetime
from flask import Blueprint, jsonify, request, session
from sqlalchemy import text
from app.models import db, ReceiveInfo, Request,  RequestStatusEnum, Comment, ShippingPrice

admin = Blueprint('admin', __name__)
    
@admin.before_request
def check_auth_status():
    admin_id = request.args.get('admin_id')
    if not admin_id:
        return jsonify({'err': 'Unauthorized'}), 401
    
    result = db.session.execute(
        text("""
             SELECT logged_in 
             FROM Admin
             WHERE admin_id = :id
        """),
        {'id': admin_id}
    ).fetchone()
    
    if not result or not result[0]:
        return jsonify({'err': 'Unauthorized'}), 401
        
    return


@admin.route('/admin/all', methods=['GET'])
def get_all_admin():
    result = db.session.execute(
        text("""
            SELECT 
                admin_id, 
                last_name
            FROM Admin;
        """)
    ).fetchall()
    
    if result:
        response = [
            {
                "admin_id": row.admin_id,
                "last_name": row.last_name
            }
            for row in result
        ]
        
        return jsonify(response), 200
    else:
        return jsonify({"error": "Admin list is empty"}), 200

@admin.route('/requests', methods=['GET'])
def get_all_requests():
    result = db.session.execute(
        text("""
        SELECT  r.request_id, r.student_id, r.student_type AS category, CONCAT(m.last_name, ', ',m.first_name) AS full_name, 
                GROUP_CONCAT(
                    CONCAT(
                        doc.document_type, 
                        IF(dr.copies_requested > 0, CONCAT(' (', dr.copies_requested, ')'), '')
                    )
                    SEPARATOR ', '
                ) AS requested_documents,
                rec.category AS receive_type, r.request_datetime AS date_of_request, ad.last_name AS assigned,  r.category AS status
        FROM Request r
        LEFT JOIN Mock_User m
        ON r.student_id = m.student_id
        LEFT JOIN ReceiveInfo rec
        ON rec.request_id = r.request_id
        LEFT JOIN Admin ad
        ON r.admin_id = ad.admin_id
        LEFT JOIN Document_Request dr
        ON r.request_id = dr.request_id
        LEFT JOIN Document doc
        ON dr.document_id = doc.document_id
        WHERE NOT r.category = 'Completed'
        GROUP BY 
            r.request_id, 
            r.student_id, 
            r.student_type, 
            m.last_name, 
            m.first_name, 
            rec.category, 
            r.request_datetime, 
            ad.last_name, 
            r.category
        ORDER BY r.request_datetime DESC;
        """)
    ).fetchall()

    if result:
        response = [
        {
            "request_id": row.request_id,
            "student_id": row.student_id,
            "category": row.category,
            "full_name": row.full_name,
            "requested_documents": row.requested_documents,
            "receive_type": row.receive_type,
            "date_of_request": row.date_of_request.strftime("%B %d, %Y %I:%M %p"),
            "assigned": row.assigned,
            "status": row.status
        }
        for row in result
    ]
        return jsonify(response), 200
    else:
        return jsonify({"error": "Request list is empty"}), 200
    
@admin.route('/requests/completed', methods=['GET'])
def get_completed_requests():
    result = db.session.execute(
        text("""
        SELECT  r.request_id, r.student_id, r.student_type AS category, CONCAT(m.last_name, ', ',m.first_name) AS full_name, 
                GROUP_CONCAT(
                    CONCAT(
                        doc.document_type, 
                        IF(dr.copies_requested > 0, CONCAT(' (', dr.copies_requested, ')'), '')
                    )
                    SEPARATOR ', '
                ) AS requested_documents,
                rec.category AS receive_type, r.request_datetime AS date_of_request, ad.last_name AS assigned,  r.category AS status
        FROM Request r
        LEFT JOIN Mock_User m
        ON r.student_id = m.student_id
        LEFT JOIN ReceiveInfo rec
        ON rec.request_id = r.request_id
        LEFT JOIN Admin ad
        ON r.admin_id = ad.admin_id
        LEFT JOIN Document_Request dr
        ON r.request_id = dr.request_id
        LEFT JOIN Document doc
        ON dr.document_id = doc.document_id
        WHERE r.category = 'Completed'
        GROUP BY 
            r.request_id, 
            r.student_id, 
            r.student_type, 
            m.last_name, 
            m.first_name, 
            rec.category, 
            r.request_datetime, 
            ad.last_name, 
            r.category
        ORDER BY r.request_datetime DESC;
        """)
    ).fetchall()

    if result:
        response = [
        {
            "request_id": row.request_id,
            "student_id": row.student_id,
            "category": row.category,
            "full_name": row.full_name,
            "requested_documents": row.requested_documents,
            "receive_type": row.receive_type,
            "date_of_request": row.date_of_request.strftime("%B %d, %Y %I:%M %p"),
            "assigned": row.assigned,
            "status": row.status
        }
        for row in result
    ]
        return jsonify(response), 200
    else:
        return jsonify({"error": "Request list is empty"}), 200
    
@admin.route('/request/<int:id>', methods=['GET'])
def get_one_request(id):    
    # Mark request as read
    request_record = Request.query.get(id)
    request_record.read_status = 1
    db.session.commit()
    
    result = db.session.execute(
        text("""
            SELECT
                Request.category AS stage,  
                Request.student_type AS category,
                Request.admin_id,
                Request.category AS status,
                Mock_User.student_id,
                CONCAT(Mock_User.first_name, ' ', Mock_User.last_name) AS full_name,
                Mock_User.email,
                Mock_User.tor_pages,
                Request.request_datetime AS date_of_request,
                ReceiveInfo.category AS receive_type,
                ReceiveInfo.courier,
                ReceiveInfo.address,
                ReceiveInfo.contact_number,
                ReceiveInfo.shipping_number,
                Request.read_status,
                Request.purpose,
                Request.category AS status,
                Payment.amount AS payment_total,
                Payment.proof_of_payment,
                Admin.last_name AS admin_name
                
            FROM 
                Request
            LEFT JOIN 
                Mock_User ON Request.student_id = Mock_User.student_id
            LEFT JOIN 
                Document_Request ON Request.request_id = Document_Request.request_id
            LEFT JOIN 
                ReceiveInfo ON Request.request_id = ReceiveInfo.request_id
            LEFT JOIN 
                Payment ON Request.request_id = Payment.request_id
            LEFT JOIN
                Admin ON Request.admin_id = Admin.admin_id
            WHERE 
                Request.request_id = :id
        """),
        {'id': id}
    ).fetchone()
    if result:
        response = {
            "stage": result.stage.lower(),
            "category": result.category,
            "status": result.status,
            "admin_id": result.admin_id,
            "student_id": result.student_id,
            "full_name": result.full_name,
            "admin_name": result.admin_name,
            "email": result.email,
            "tor_pages": result.tor_pages,
            "date_of_request": result.date_of_request.strftime("%B %d, %Y %I:%M %p"),
            "receive_type": result.receive_type,
            "courier": result.courier,
            "address": result.address,
            "contact_number": result.contact_number,
            "shipping_number": result.shipping_number,
            "read_status": result.read_status,
            "purpose": result.purpose,
            "status": result.status,
            "payment_total" : result.payment_total,
            "proof_of_payment" : result.proof_of_payment,
        }
        return jsonify(response), 200
    else:
        return jsonify({"error": "Request not found"}), 404

@admin.route('/request/documents/<int:id>', methods=['GET'])
def get_documents(id):
    result = db.session.execute(
        text("""
            SELECT document_type, price, copies_requested, sem_year, file_upload, document_category
            FROM Document_Request
            LEFT JOIN Document ON Document_Request.document_id = Document.document_id
            WHERE request_id = :id;
        """),
        {'id': id}
    ).fetchall()
    if result:
        response = [
            {
                "document_type": row.document_type,
                "price": row.price,
                "copies_requested": row.copies_requested,
                "sem_year": row.sem_year,
                "file_upload": row.file_upload,
                "document_category": row.document_category
            }
            for row in result
        ]
        print(response)
        return jsonify(response), 200
    else:
        return jsonify({"error": "Request not found"}), 404
    
@admin.route('/requests/update/<int:id>', methods=['PUT'])
def update(id):
    try:
        data = request.get_json()
        new_category = data.get('category')

        request_record = Request.query.get(id)
        request_record.category = RequestStatusEnum[new_category]
        request_record.request_updated_datetime = datetime.now()
        
        if new_category != 'Clarifying':
            request_record.read_status = 0

        db.session.commit()

        return jsonify(
            {
                'msg': 'Category updated successfully',
                'updated at': datetime.now()
            }
        ), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
@admin.route('/requests/assign/<int:id>', methods=['PUT'])
def assign(id):
    try:
        data = request.get_json()
        assigned_id = data.get('assigned_admin_id')

        request_record = Request.query.get(id)
        request_record.admin_id = assigned_id

        db.session.commit()

        return jsonify(
            {
                'msg': 'Request assigned successfully'
            }
        ), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@admin.route('/requests/shipping_number/<int:id>', methods=['PUT'])
def shipping_number(id):
    try:
        data = request.json
        shipping_number = data.get('shipping_number')

        if not shipping_number or not isinstance(shipping_number, str) or len(shipping_number) != 12:
            return jsonify({"error": "Invalid shipping_number. It must be a 12-digit string."}), 400

        db.session.execute(
            text("""
                UPDATE ReceiveInfo
                SET shipping_number = :shipping_number
                WHERE request_id = :id
            """),
            {'id': id, 'shipping_number': shipping_number}
        )
        db.session.commit()

        return jsonify({"msg": "Shipping number updated successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
@admin.route('/request/comments/<int:id>', methods=['GET'])
def get_comment(id):
    result = db.session.execute(
        text("""
            SELECT 
                comment_id,
                comment_body,
                user_type,
                CONCAT(Admin.first_name, ' ', Admin.last_name) AS admin_name,
                comment_datetime AS comment_date,
                CONCAT(Mock_User.first_name, ' ', Mock_User.last_name) AS user_name
            FROM 
                comments
            LEFT JOIN Admin ON comments.admin_id = Admin.admin_id
            LEFT JOIN Mock_User ON comments.student_id = Mock_User.student_id
            WHERE 
                request_id = :id;
        """),
        {'id': id}
    ).fetchall()

    if result:
        response = [
            {
                "comment_id": row.comment_id,
                "comment_body": row.comment_body,
                "user_type": row.user_type,
                "admin_name": row.admin_name,
                "user_name": row.user_name,
                "comment_date": row.comment_date.strftime("%B %d, %Y %I:%M %p"),
            }
            for row in result
        ]
        return jsonify(response), 200
    else:
        return jsonify({}), 200

@admin.route('/request/comment/add', methods=['POST'])
def add_comment():
    data = request.get_json()

    request_id = data.get('request_id')
    user_type = data.get('user_type')
    comment_body = data.get('comment_body')
    admin_id = data.get('admin_id')
    student_id = data.get('student_id')

    new_comment = Comment(
        request_id=request_id,
        user_type=user_type,
        comment_body=comment_body,
        admin_id=admin_id if user_type == 'admin' else None,
        student_id=student_id if user_type == 'user' else None
    )

    db.session.add(new_comment)
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to add comment", "details": str(e)}), 500

    return jsonify({"message": "Comment added successfully", "comment_id": new_comment.comment_id}), 201
    
@admin.route('/shipping', methods=['GET', 'POST'])
def shipping():
    if request.method == 'GET':
        try:
            shipping_prices = db.session.query(ShippingPrice).all()
            if shipping_prices:
                response = {
                    row.region: row.price
                    for row in shipping_prices
                }
                return jsonify(response), 200
            else:
                return jsonify({"msg": "Price list is empty"}), 200
        except Exception as e:
            return jsonify({"error": "Failed to fetch shipping prices", "details": str(e)}), 500
        
    if request.method == 'POST':
        data = request.get_json()
        
        mindanao = ShippingPrice.query.filter_by(region='Mindanao').first()
        visayas = ShippingPrice.query.filter_by(region='Visayas').first()
        luzon = ShippingPrice.query.filter_by(region='Luzon').first()
        
        mindanao.price = data.get('mindanao')
        visayas.price = data.get('visayas')
        luzon.price = data.get('luzon')
        
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": "Failed to update prices", "details": str(e)}), 500
        return jsonify({"msg": "Successfuly updated the prices"}), 200