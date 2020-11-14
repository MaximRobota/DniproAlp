from .models import Claims
from app import app, db
from flask import jsonify
from flask import request


@app.before_first_request
def before_first_request_func():
    db.create_all()


@app.route('/')
def index():
    return 'Alp-prom-service is working =)'


@app.route('/claims', methods=['POST'])
def new_claim():
    body = request.json
    # app.logger.info(body)
    email = body['email']
    full_name = body['full_name']
    message = body['message']
    phone = body['phone']
    claim_type = body['claim_type']

    claim = Claims(email=email, full_name=full_name, message=message, phone=phone, claim_type=claim_type)

    try:
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


# Display All claims from database
@app.route('/claims', methods=['GET'])
def claims():
    return jsonify({'claims': list(map(lambda claims: claims.serialize(), Claims.query.all()))})


# # Route to Delete an claim from the MySQL Database
@app.route('/claims/<int:id>', methods=['DELETE'])
def delete(id):
    try:
        db.session.delete(Claims.query.filter_by(id=id).first())
        db.session.commit()
        return {
          "meta": {"status": "success"},
          "message": "Claim was successfully deleted."
        }
    except Exception as e:
        return {
           "meta": {"status": "error"},
           "error": str(e)
        }, 500
