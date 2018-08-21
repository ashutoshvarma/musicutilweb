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


    try:
        from blueprints import search, api
    except ModuleNotFoundError:
        from musicutilweb.blueprints import search , api

    app.register_blueprint(search.bp)
    app.register_blueprint(api.bp)
    app.add_url_rule('/', endpoint='index')         #url_for('index) and url_for('search.index) will point same view.

    csrf.init_app(app)
    # csrf.exempt(download.bp)


    return app