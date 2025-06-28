from flask import Blueprint, render_template, request
from flask_mail import Message
from flask_mail import Mail
from app.models import Request, MockUser

email = Blueprint('email', __name__)

mail = Mail()

@email.route('/send', methods=['POST'])
def send_email():
    try:
        data = request.get_json()
        subject = data.get('subject')
        body = data.get('body')
        code = data.get('code')
        recipient = data.get('recipient')
        
        request_data = Request.query.get(code)
        student_info = MockUser.query.get(request_data.student_id)
        
        html_content = render_template('email_template.html', subject=subject, body=body, code=request_data.tracking_code)

        msg = Message(
            subject=subject,
            recipients=[student_info.email]
        )
        msg.html = html_content
        
        mail.send(msg)
        return "Email sent to Mailtrap inbox!"
    except Exception as e:
        return f"Error: {e}"