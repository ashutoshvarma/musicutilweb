import os

from flask import Flask
from config import config

from flask_wtf.csrf import CSRFProtect

csrf = CSRFProtect()



def create_app(config_name):
    #create and config app
    app = Flask(__name__)

    app.config.from_object(config[config_name])
    config[config_name].init_app(app)
    

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path, exist_ok=True)
    except OSError:    #No need for to catch OSError as exist_ok=True
        pass


    csrf.init_app(app)


    try:
        from main import search
    except ModuleNotFoundError:
        from musicutilweb.main import search , download

    app.register_blueprint(search.bp)
    app.register_blueprint(download.bp)
    app.add_url_rule('/', endpoint='index')         #url_for('index) and url_for('search.index) will point same view.

    return app