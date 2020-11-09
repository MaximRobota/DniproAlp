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
    email = request.form['email']
    fullName = request.form['fullName']
    message = request.form['message']
    phone = request.form['phone']
    type = request.form['type']
    claim = Claims(email=email, fullName=fullName, message=message, phone=phone, type=type)

    try:
        db.session.add(claim)
        db.session.commit()
        return 'Added new claim'
    except Exception as e:
        return f'Error: {e}'


# Display All claims from database
@app.route('/claims/', methods=['GET'])
def claims():
    return jsonify({'claims': list(map(lambda claims: claims.serialize(), Claims.query.all()))})


# # Route to Delete an claim from the MySQL Database
@app.route('/claims/<int:id>', methods=['DELETE'])
def delete(id):
    try:
        db.session.delete(Claims.query.filter_by(id=id).first())
        db.session.commit()
        return 'Deleted claim #' + id
    except Exception as e:
        return f'Error: {e}'
