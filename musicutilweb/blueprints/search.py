import functools
import musicutil

from flask import (
    Blueprint, g, render_template, request, session, url_for
)


bp = Blueprint('search', __name__)



@bp.route('/', methods=['GET'])
def index():
    return render_template('search/index.html')
    
    


    