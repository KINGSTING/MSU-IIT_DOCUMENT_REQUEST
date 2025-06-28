from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os
import datetime
from flask_jwt_extended import JWTManager
from flask_mail import Mail
import cloudinary

db = SQLAlchemy()


def create_app():
    load_dotenv()

    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(minutes=30)
    app.config['PERMANENT_SESSION_LIFETIME'] = datetime.timedelta(hours=24)

    CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

    jwt = JWTManager(app)

    # Email stuff
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
    app.config['MAIL_PORT'] = os.getenv('MAIL_PORT')
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS')
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

    mail = Mail(app)

    app.config['SQLALCHEMY_DATABASE_URI'] = (
        f"mysql+mysqlconnector://{os.getenv('MYSQL_USER')}:"
        f"{os.getenv('MYSQL_PASS')}@{os.getenv('MYSQL_HOST')}:"
        f"{os.getenv('MYSQL_PORT')}/{os.getenv('MYSQL_DB')}"
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    

    db.init_app(app)

    # with app.app_context():
    #     from .models import (
    #         MockUser,
    #         Admin,
    #         ReceiveInfo,
    #         Payment,
    #         Request,
    #         Comment,
    #         Notifications,
    #         Document,
    #         DocumentRequest,
    #         ShippingPrice
    #     )
    #     db.create_all()

    # Register Blueprints
    from app.routes.document.docu import docu 
    app.register_blueprint(docu, url_prefix='/request') 

    from app.routes.shipping.ship import ship 
    app.register_blueprint(ship, url_prefix='/request')

    from .api.admin import admin
    app.register_blueprint(admin, url_prefix='/api')

    from .api.auth import admin_auth
    app.register_blueprint(admin_auth, url_prefix='/api/auth')
    
    from .auth import auth
    app.register_blueprint(auth, url_prefix="/auth")

    from .api.email import email
    app.register_blueprint(email, url_prefix='/api/email')
    
    from .api.notifications import notif
    app.register_blueprint(notif, url_prefix='/api/notification')

    from .routes.track import track
    app.register_blueprint(track, url_prefix='/tracking')

    from app.routes.request_summary.routes import summary_bp
    app.register_blueprint(summary_bp, url_prefix='/request')
    
    from app.routes.User_iit import user_iit
    app.register_blueprint(user_iit, url_prefix='/user')

    cloudinary.config(
        cloud_name = os.getenv ('CLOUD_NAME'),
        api_key = os.getenv('CLOUD_KEY'),
        api_secret = os.getenv('CLOUD_KEY_SECRET'),
        secure = True
    )
    
    return app
