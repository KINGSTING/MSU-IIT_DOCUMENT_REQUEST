from flask import Blueprint, jsonify, render_template, session, redirect, url_for
from app.models import db, Request, MockUser
from sqlalchemy import text

user_iit = Blueprint('user_iit', __name__)

@user_iit.route('/dashboard', methods=['GET'])
def user_home():    
    if 'google_info' not in session:
        return redirect(url_for('auth.login'))
    info = session['google_info']
    
    with_liabilities = False
    
    student = MockUser.query.filter_by(email=info.get('email')).first()
    if student.liabilities == 1:
        print(f"YOU HAVE LIABILITIES: {student.liabilities}")
        with_liabilities = True
    
    student_id = student.student_id
    session['id_number'] = student_id
    session['user_info'] = 'verified'
    
    
    
    request = db.session.execute(
        text("""
        SELECT  r.request_id, r.student_id, r.student_type AS category, m.last_name, m.first_name, 
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
        WHERE r.student_id = :id
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
        """), {'id': student_id}
    ).fetchall()

    if request:
        response1 = [
        {
            "request_id": row.request_id,
            "student_id": row.student_id,
            "category": row.category,
            "first_name": row.first_name,
            "last_name": row.last_name,
            "requested_documents": row.requested_documents,
            "receive_type": row.receive_type,
            "date_of_request": row.date_of_request.strftime("%B %d, %Y %I:%M %p"),
            "assigned": row.assigned,
            "status": row.status
        }
        for row in request
    ]

    notifications = db.session.execute(
        text("""
                SELECT 
                    n.notification_body, 
                    n.notification_id, 
                    n.notification_datetime,
                    a.email,
                    a.last_name,
                    COALESCE(n.request_id, NULL) AS request_id,
                    n.read_status
                FROM 
                    notifications n
                LEFT JOIN 
                    Request r ON n.request_id = r.request_id
                LEFT JOIN 
                    Admin a ON r.admin_id = a.admin_id
                WHERE 
                    n.user_type = 'admin' 
                    AND n.student_id = :id
                ORDER BY
	                n.notification_datetime DESC;
        """), {'id': student_id}
    ).fetchall()
    
    unread_count = 0
    if notifications:
        response2 = [
        {
            "notification_body": row.notification_body,
            "notification_id": row.notification_id,
            "notification_datetime": row.notification_datetime.strftime("%B %d, %Y %I:%M %p"),
            "email": row.email,
            "last_name": row.last_name,
            "request_id": row.request_id,
            "read_status": row.read_status
        }
        for row in notifications
    ]
        unread_count = len(list(filter(lambda request: request['read_status'] == 0, response2)))
        
    return render_template('/User_iit/User_dashboard.html', with_liabilities=with_liabilities, student_id=student_id, data=response1 if request else [], notif=response2 if notifications else [], unread_count=unread_count, student=student)

@user_iit.route('/dashboard/track/<int:id>', methods=['GET'])
def user_track(id):
    if 'google_info' not in session:
        return jsonify({"error": "Unauthorized", "redirect": url_for('auth.login')})

    session['request_id'] = id
    request = Request.query.get(id)
    
    return jsonify({"success": "Success", "redirect": url_for('track.track_item', code=request.tracking_code)})

@user_iit.route('/dashboard/sign-out', methods=['GET'])
def sign_out():
    session.clear()
    return jsonify({"success": "Successfully signed out", "redirect": url_for('auth.login')})