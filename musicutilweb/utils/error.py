from flask import jsonify


class API:
    class InvalidUsage(Exception):
        status_code = 400
        error_name = '[musicutil] - InvalidUsage'

        def __init__(self, message, status_code=None, payload=None):
            Exception.__init__(self)
            self.message = message
            if status_code:
                self.status_code = status_code
            self.payload = payload

        def to_dict(self):
            rv = dict(self.payload or ())
            rv['message'] = self.message
            rv['error'] = self.error_name
            return rv


    class ParameterRequired(InvalidUsage):
        error_name = '[musicutil] - ParameterRequired'

        def __init__(self, parameter=None, status_code=None):
            message = "{} Required parameter is missing!".format("'{}'".format(parameter) if parameter else "One or more")
            super().__init__(message,status_code)

    class SourceNotFound:
        error_name = '[musicutil] - SourceNotFound'

        def __init__(self, source, status_code=None):
            message = "Given source [{}] not supported".format(source)
            super().__init__(message, status_code)

