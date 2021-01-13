import smtplib
from ..models import Claims, User
from app import app, db
from flask import request, make_response, jsonify


class ClaimController:
    @staticmethod
    def new_claim(body):
        email = body['email']
        full_name = body['full_name']
        message = body['message']
        phone = body['phone']
        claim_type = body['claim_type']

        claim = Claims(email=email, full_name=full_name, message=message, phone=phone, claim_type=claim_type)

        try:
            email_message = f'Message: {message}'
            # print(email_message)
            # server_ssl = smtplib.SMTP_SSL("smtp.gmail.com", 465)
            # server_ssl.ehlo()
            # server_ssl.login('maxim11061106@gmail.com', '')
            # server_ssl.login('dniproalpprom@gmail.com', '')
            # server_ssl.sendmail('maxim11061106@gmail.com', 'maxim11061106@gmail.com', email_message)
            # server_ssl.sendmail('maxim11061106@gmail.com', 'dniproalpprom@gmail.com', 'hi lol')
              # f'Name: {full_name} / Email: {email} / Phone: {phone} / Type: {claim_type} / message: {message}')
            # server_ssl.close()

            db.session.add(claim)
            db.session.commit()
            return {
              "meta": {"status": "success"},
              "claim": claim.serialize()
            }
        except Exception as e:
            return {
               "meta": {"status": "error"},
               "error": str(e)
            }, 500

    @staticmethod
    def get_claims():
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                auth_token = auth_header.split(" ")[1]
            except IndexError:
                responseObject = {
                    'status': 'fail',
                    'message': 'Bearer token malformed.'
                }
                return make_response(jsonify(responseObject)), 401
        else:
            auth_token = None

        if auth_token:
            resp = User.decode_auth_token(auth_token)
            if not isinstance(resp, str):
                try:
                    return make_response(jsonify({'claims': list(map(lambda claims: claims.serialize(), Claims.query.all()))})), 200

                except Exception as e:
                    return {"error": f'Try again. {e}'}, 500

            responseObject = {
                'status': 'fail',
                'message': resp
            }
            return make_response(jsonify(responseObject)), 401
        else:
            responseObject = {
                'status': 'fail',
                'message': 'Provide a valid auth token.'
            }
            return make_response(jsonify(responseObject)), 401

    @staticmethod
    def delete_claim(id):
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                auth_token = auth_header.split(" ")[1]
            except IndexError:
                responseObject = {
                    'status': 'fail',
                    'message': 'Bearer token malformed.'
                }
                return make_response(jsonify(responseObject)), 401
        else:
            auth_token = None

        if auth_token:
            resp = User.decode_auth_token(auth_token)
            if not isinstance(resp, str):
                try:
                    db.session.delete(Claims.query.filter_by(id=id).first())
                    db.session.commit()
                    return make_response({
                        "meta": {"status": "success"},
                        "message": "Claim was successfully deleted."
                    }), 200
                except Exception as e:
                    return {
                       "meta": {"status": "error"},
                       "error": str(e)
                    }, 500

                responseObject = {
                   'status': 'fail',
                   'message': resp
                }
            return make_response(jsonify(responseObject)), 401
        else:
            responseObject = {
               'status': 'fail',
               'message': 'Provide a valid auth token.'
            }
            return make_response(jsonify(responseObject)), 401

