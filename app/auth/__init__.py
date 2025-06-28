from flask import Blueprint, render_template, request, jsonify, session, redirect, url_for
from sqlalchemy import text
from ..models import db, MockUser
import random
from flask_mail import Message, Mail
from dotenv import load_dotenv
from os import getenv, environ
from google.oauth2 import id_token # type: ignore
from google.auth.transport import requests # type: ignore
import google.auth.transport.requests # type: ignore
import google.oauth2.credentials # type: ignore
import google_auth_oauthlib.flow # type: ignore

environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

mail = Mail()

auth = Blueprint('auth', __name__)

load_dotenv()

SCOPES = ['openid', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile']
GOOGLE_CLIENT_ID = getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = getenv("GOOGLE_SECRET_KEY")
REDIRECT_URI = 'http://127.0.0.1:5001/auth/myiit-callback'
AUTHORIZATION_BASE_URL = 'https://accounts.google.com/o/oauth2/auth'
TOKEN_URL = 'https://accounts.google.com/o/oauth2/token'

def create_code():
    return random.randint(100000, 999999)

"""id number, name
birthday, id number
email, code"""

@auth.before_app_request
def check_session():
    blocked_endpoints = [
        "docu.document_page", "docu.submit_request",
        "ship.shipping", "ship.submit_shipping", "ship.shipping", 
        "summary_bp.request_summary",
        "auth.user_info", "auth.verify_email"
    ]
    if request.endpoint in blocked_endpoints and "user_info" not in session and "id_number" not in session:
        return redirect(url_for("auth.login"))


@auth.route("/login", methods=["POST", "GET"])
def login():
    if request.method == 'POST':
        data = request.get_json()
        if data["choice"] == "no":  # if the user as no my.iit account
            return jsonify({
                "redirect": "user_info"
            }), 200
        else: # if the user has a my.iit account
            return jsonify({
                "redirect": url_for('auth.myiit_signin') # will automatically go to my.iit mock login site
            }), 200
    return render_template("user_client/signing/index.html")


@auth.route('/user_info', methods=["POST", "GET"])
def additional_info():
    if request.method == "POST":
        data = request.get_json()
        print(data)
        result = db.session.execute(
            text("SELECT * FROM Mock_User WHERE first_name = :first_name AND last_name = :last_name AND birth_date = :birth_date"),
            {
                "first_name": data["first_name"].capitalize(), 
                "last_name": data["last_name"].capitalize(),
                "birth_date": data["birth_date"]
            }
        ).fetchone()
        print(result)
        if result:
            session["user_info"] = "verified"
            session["first_name"] = data["first_name"]
            session["last_name"] = data["last_name"]
            session["birth_date"] = data["birth_date"]
            return jsonify({
                'redirect': url_for("auth.verify_email")
            })
        else:
            return jsonify({
                'redirect': 'validation_failed'
            })
    return render_template("user_client/signing/user_info.html")


@auth.route('/verify_email', methods=["POST", "GET"])
def verify_email():
    print("Session Keys in Verify Email:", session.keys())
    
    if request.method == "POST":
        data = request.get_json()
        
        id_number_valid = db.session.execute(
            text("SELECT * FROM Mock_User WHERE student_id = :id_number"),
            {"id_number": data["id_number"]}
        ).fetchone()
        if not id_number_valid:
            return jsonify({
                "redirect": "validation_failed?error=id_number"
            })
        
        # Add the email, id_number, and logged_in in the session
        session["email"] = data["email"]
        session["id_number"] = data["id_number"]
        
        # check liabilities
        result = db.session.execute(
            text("SELECT liabilities FROM Mock_User WHERE student_id = :id_number"),
            {
                "id_number": session["id_number"]
            }
        ).fetchone()
        if result[0] == 1:
            redirect = url_for("auth.liabilities_detected")
            return jsonify({
                "redirect": redirect
            })

        # Send mail
        code = random.randint(100000,999999)
        print(f"ACCESS CODE: {code}")
        try:
            html_content = render_template('email_template.html', 
                                        subject="Email Verification", 
                                        body="Please enter this code to proceed with the request process", 
                                        code=code,  
                                        status="verify")
            
            msg = Message(
                subject="Email Verification",
                recipients=[session["email"]]
            )
            msg.html = html_content
            mail.send(msg)
        except Exception as e:
            return f"Error: {e}"
        
        # Insert into web_session
        try:
            db.session.execute(
                text("INSERT INTO web_session(id_number, email, email_code) VALUES(:id_number, :email, :email_code)"),
                {"id_number": data["id_number"], "email": data["email"], "email_code": code}
            )
            db.session.commit()
            
            return jsonify({'redirect': 'verify_code'}), 200
        except Exception as e:
            return jsonify({'error': True}), 500
        
    return render_template("user_client/signing/account.html")


@auth.route('/verify_code', methods=["POST", "GET"])
def verify_code():
    print("Session Keys in Verify Code:", session.keys())
    
    if request.method == "POST":
        data = request.get_json()
        result = db.session.execute(
            text("SELECT * FROM web_session WHERE email = :email AND id_number = :id_number AND email_code = :code"),
            {"email": session["email"], "id_number": session["id_number"], "code": int(data["code"])}
        ).fetchone()
        if result:
            redirect = url_for("docu.document_page")
            return jsonify({
                "redirect": redirect
            })
        else:
            return jsonify({
                "invalid": True
            })

    return render_template("user_client/signing/confirm.html")



@auth.route("/validation_failed")
def validation_failed():
    print("Session Keys in Validation Failed:", session.keys())
    
    error = request.args.get("error")
    
    if error == "id_number":
        return render_template("user_client/signing/validation_failed.html", message="Your ID Number does not appear in our records.")
    return render_template("user_client/signing/validation_failed.html")


@auth.route("/liabilities_detected")
def liabilities_detected():
    return render_template("user_client/signing/liabilities_detected.html")

@auth.route("/cancel", methods=['POST'])
def cancel_session():
    data = request.get_json()

    if data.get('action') == 'cancel':
        if 'google_info' in session:
            session_google_info = session['google_info']
            session.clear()
            session['google_info'] = session_google_info
        else:
            session.clear()
        return jsonify({"success": "Cancelled"}), 200
    else:
        return jsonify({"failed": "Cancel Failed"}), 400



@auth.route("/myiit-signin", methods=['POST'])
def myiit_signin():
    if 'google_info' in session:
        return jsonify({
            "redirect": url_for('user_iit.user_home')
        }), 200
    if request.method == "POST":
        flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file("google_client.json", scopes=SCOPES)
        flow.redirect_uri = REDIRECT_URI

        authorization_url, state = flow.authorization_url(access_type='offline', include_granted_scopes='true')
        session["state"] = state
        return jsonify({
                "redirect": authorization_url
            }), 200

@auth.route('/myiit-callback')
def myiit_callback():
        # Get the state from the session and verify it
    state = session['state']

    # Create the flow using the client ID, client secret, and redirect URI
    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
        'google_client.json',
        scopes=SCOPES,
        state=state)
    flow.redirect_uri = REDIRECT_URI

    # Exchange the authorization code for credentials
    authorization_response = request.url
    flow.fetch_token(authorization_response=authorization_response)

    # Get the credentials and user's profile information
    credentials = flow.credentials
    request_session = requests.Request()
    id_info = id_token.verify_oauth2_token(credentials.id_token, request_session, GOOGLE_CLIENT_ID)

    # Store the user's profile information in the session
    session['email'] = id_info.get('email')
    session['google_info'] = id_info
    session["user_info"] = "verified"
    return redirect(url_for('user_iit.user_home'))
            
    