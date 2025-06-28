from flask import Blueprint, jsonify, request
from sqlalchemy import text
from app.models import db, Notifications

notif = Blueprint('notif', __name__)

@notif.route('/add', methods=['POST'])
def add_notification():
    data = request.get_json()

    request_id = data.get('request_id')
    new_request = data.get('new_request')
    user_type = data.get('user_type')
    notification_body = data.get('notification_body')
    admin_id = data.get('admin_id')
    student_id = data.get('student_id')

    new_notification = Notifications(
        request_id=request_id if new_request == "" else None,
        new_request=new_request if user_type == 'user' and request_id == "" else None,
        user_type=user_type,
        notification_body=notification_body,
        admin_id=admin_id if user_type == 'user' and new_request == "" else None,
        student_id=student_id if user_type == 'admin' or (user_type == 'user' and new_request != "") else None
    )

    db.session.add(new_notification)
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to add notification", "details": str(e)}), 500
    return jsonify({"message": "Notification added successfully", "notification_id": new_notification.notification_id}), 201

# Make admin specific later ?
@notif.route('/get/admin', methods=['GET'])
def get_admin_notif():
    result = db.session.execute(
        text("""
                SELECT 
                    n.notification_body, 
                    n.notification_id, 
                    n.notification_datetime,
                    m.email,
                    m.last_name,
                    COALESCE(n.request_id, NULL) AS request_id,
                    n.read_status
                FROM 
                    notifications n
                LEFT JOIN 
                    Request r ON n.request_id = r.request_id
                LEFT JOIN 
                    Mock_User m ON COALESCE(r.student_id, n.student_id) = m.student_id
                WHERE 
                    n.user_type = 'user' 
                    OR n.new_request = TRUE
                ORDER BY
	                n.notification_datetime DESC;
        """)
    ).fetchall()

    if result:
        response = [
        {
            "notification_body": row.notification_body,
            "notification_id": row.notification_id,
            "notification_datetime": row.notification_datetime.strftime("%B %d, %Y %I:%M %p"),
            "email": row.email,
            "last_name": row.last_name,
            "request_id": row.request_id,
            "read_status": row.read_status
        }
        for row in result
    ]
        return jsonify(response), 200
    else:
        return jsonify({"error": "Notification list is empty"}), 404

# Make admin specific later ?
@notif.route('/get/admin/count', methods=['GET'])
def get_admin_notif_count():
    result = db.session.execute(
    text("""
            SELECT COUNT(notification_id) AS notif_count
            FROM notifications
            WHERE user_type = 'user';
    """)
    ).fetchone()

    if result:
        response = result[0]
        return jsonify(response), 200
    else:
        return jsonify({"error": "Notification list is empty"}), 200
    
@notif.route('/get/user/count/<id>', methods=['GET'])
def get_user_notif_count(id):
    result = db.session.execute(
    text("""
            SELECT COUNT(notification_id) AS notif_count
            FROM notifications
            WHERE user_type = 'admin'
            AND student_id = :id;
    """), {'id': id}
    ).fetchone()

    if result:
        response = result[0]
        return jsonify(response), 200
    else:
        return jsonify({"error": "Notification list is empty"}), 200
    
@notif.route('/set/read', methods=['PUT'])
def set_read():
    try:
        data = request.get_json()
        id = data.get('notification_id')

        notification_record = Notifications.query.get(id)
        notification_record.read_status = True

        db.session.commit()

        return jsonify(
            {
                'msg': 'Read status updated successfully'
            }
        ), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500