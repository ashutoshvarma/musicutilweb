import musicutil
from ..utils import error


from flask import (Blueprint, g, render_template, request, session, url_for,
                   abort, Response, jsonify, app, redirect)

bp = Blueprint('api', __name__, url_prefix='/api')


@bp.route('/search', methods=['POST', 'GET'])
def api_search():
    resp = redirect('/')

    if request.method == 'POST':
        json_data = request.get_json()
        src_name = json_data.get('source')
        query = json_data.get('query')
        max = json_data.get('max')
        html = json_data.get('html')

        try:
            g.music = musicutil.get_source(src_name)()
            if query:
                if not (max and str(max).isdigit() and 1 <= int(max) <= musicutil.MusicSource.chiasenhac_vn._MAX_SEARCH):
                    max = musicutil.MusicSource.chiasenhac_vn._MAX_SEARCH
                if html:
                    results = g.music.search(query.strip(), max, False)
                    results = {'data': render_template('search/search_items.html', results=results)}
                else:
                    results = g.music.search(query.strip(), max, True)
                resp = jsonify(results)
            else:
                raise error.API.ParameterRequired("query")
        except KeyError:
            raise error.API.SourceNotFound(src_name)

    return resp


@bp.route('/download', methods=['POST', 'GET'])
def api_download():
    resp = redirect('/')

    if request.method == 'POST':
        json_data = request.get_json()
        src_name = json_data['source'].strip()
        song_url = json_data['url'].strip()
        html = json_data.get('html')
        parent_id = json_data.get('parentId')

        try:
            g.music = musicutil.get_source(src_name)()
            if song_url:
                if html:
                    if parent_id:
                        d_data = g.music.download_details(song_url, False)
                        d_data = {'data': render_template('search/download_item.html', data=d_data, parentId=parent_id)}
                        resp = jsonify(d_data)
                    else:
                        raise error.API.ParameterRequired("parentId")                  
                else:
                    d_data = g.music.download_details(song_url, True)
                    resp = jsonify(d_data)
            else:
                raise error.API.ParameterRequired("url")
        except KeyError:
            raise error.API.SourceNotFound(src_name)

    return resp


@bp.route('/song', methods=['POST', 'GET'])
def api_song_details():
    resp = redirect('/')

    if request.method == 'POST':
        json_data = request.get_json()
        src_name = json_data['source'].strip()
        song_url = json_data['url'].strip()
        html = json_data.get('html')

        try:
            g.music = musicutil.get_source(src_name)()
            if song_url:
                if html:
                    song_data = []
                    #Implement when html template is ready
                    # song_data = g.music.song_info(song_url, False)
                    # song_data = {'data': render_template('', data=song_data)}
                else:
                    song_data = g.music.song_info(song_url, True)
                resp = jsonify(song_data)
            else:
                raise error.API.ParameterRequired("url")
        except KeyError:
            raise error.API.SourceNotFound(src_name)

    return resp



@bp.errorhandler(error.API.InvalidUsage)
def handle_invalid_usage(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response