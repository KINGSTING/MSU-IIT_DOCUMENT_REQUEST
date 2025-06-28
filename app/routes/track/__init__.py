from flask import Blueprint, jsonify, render_template, request, redirect, url_for, session
from app.models import db, Request, Comment, Notifications
from .helpers import get_data, get_documents, get_comments, get_prices

track = Blueprint('track', __name__)

@track.route('/form', methods=['GET', 'POST'])
def track_form():
    if request.method == 'POST':
        code = request.form.get('tracking_code')
        id = request.form.get('student_id')

        request_record = Request.query.filter_by(tracking_code=code).first()

        if not request_record:
            return redirect(url_for('track.invalid_info', type="Invalid Code"))
        elif not request_record.student_id == id:
            return redirect(url_for('track.invalid_info', type="Invalid ID"))
        else:
            session['request_id'] = request_record.request_id
            return redirect(url_for('track.track_item', code=code))

    else:
        status = request.args.get('status')
        return render_template('/tracking/track-form.html', status=status)


@track.route('/invalid', methods=['GET'])
def invalid_info():
    type = request.args.get('type')
    return render_template('/tracking/invalid-info.html', type=type)


@track.route('/request', methods=['GET', 'POST'])
def track_item():
    print(session)
    if 'request_id' not in session:
        return redirect(url_for('track.track_form', status="Expired"))
    
    if request.method == 'POST':
        comment_body = request.form.get('comment_body')
        student_id = request.form.get('student_id')
        code = request.form.get('request_code')
        
        request_data = Request.query.filter_by(tracking_code=code).first()
        request_id = request_data.request_id

        new_comment = Comment(
            request_id=request_id,
            user_type='user',
            comment_body=comment_body,
            admin_id=None,
            student_id=student_id
        )
        
        new_notification = Notifications(
            request_id = request_id,
            new_request= False,
            user_type = "user",
            notification_body = "Added a comment",
            admin_id = None, # Add an id in the future?
            student_id = student_id
        )

        db.session.add(new_comment)
        db.session.add(new_notification)
        request_data.read_status = 0
        
        try:
            db.session.commit()
            return jsonify({
                'body': new_comment.comment_body,
                'date': new_comment.comment_datetime.strftime("%B %d, %Y %I:%M %p")
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    if request.method == 'GET':
        code = request.args.get('code')
        request_data = Request.query.filter_by(tracking_code=code).first()
        request_id = request_data.request_id
        print(request_data)
        
        data = get_data(request_id)
        documents = get_documents(request_id)
        comments = get_comments(request_id)
        prices = get_prices()
        
        has_transcript = any(doc[0] == 'Transcripts of Records' for doc in documents)

        return render_template('/tracking/track-item.html', request=data, documents=documents, comments=comments, 
                                                            request_code=code, has_transcript=has_transcript, 
                                                            prices=dict(prices))