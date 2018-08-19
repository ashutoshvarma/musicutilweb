from flask import jsonify

API_ERROR_ID = 102


def error(id, error_name, **kargs):
    json_data = dict(id=id, errorName=error_name)
    json_data.update(kargs)
    resp = jsonify(json_data)
    resp.status_code = 400
    return resp


def api_invalid(at, msg):
    return error(API_ERROR_ID, "API ERROR", errorSource=at, error=msg)


def source_not_found(at, source):
    return api_invalid(
        at, 'Given music source [{}] not supported yet.'.format(source))
