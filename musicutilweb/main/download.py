import musicutil

from flask import (
    Blueprint, g, render_template, request, session, url_for, abort, Response, jsonify
)

bp = Blueprint('download', __name__, url_prefix='/download')


@bp.route('/', methods=['POST'])
def index():
    src_name = request.form['source'].strip()
    song_url = request.form['url'].strip()

    try:
        g.music_source = musicutil.get_source(src_name)
    except KeyError:
        abort(Response('Given music source [{}] not supported'.format(src_name)))

    d_details = g.music_source.download_details(song_url)

    resp = jsonify(d_details)
    resp.status_code = 200

    return resp

    
    


