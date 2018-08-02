import functools
import musicutil

from flask import (
    Blueprint, g, render_template, request, session, url_for
)

import musicutil 


bp = Blueprint('search', __name__)



@bp.route('/', methods=['GET', 'POST'])
def index():
    
    g.music_source = musicutil.get_default()()

    results = None

    if request.method == 'POST':
        query = request.form['query'].strip()
        if query:
            results = tuple(g.music_source.search(query))
       
    return render_template('search/index.html', results=results)


    