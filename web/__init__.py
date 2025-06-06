from flask import Flask

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'nasdnajsdn nasdjansdjan'

    from .views import views
    from .auth import auth

    app.register_blueprint(views, url_prefix='/home') #localhost:5002/home
    app.register_blueprint(auth, url_prefix='/auth') #localhost:5002/login
    
    return app
