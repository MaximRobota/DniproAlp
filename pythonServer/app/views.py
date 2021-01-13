from .models import Claims
from app import app, db
from flask import jsonify, request
from .controllers.auth_controller import AuthController
from .controllers.claim_controller import ClaimController

auth_controller = AuthController()
claim_controller = ClaimController()

@app.before_first_request
def before_first_request_func():
    db.create_all()


@app.route('/')
def index():
    return 'Alp-prom-service is working =)'


@app.route('/auth/register/secretHide', methods=['POST'])
def register():
    return auth_controller.register(request.json)


@app.route('/auth/login', methods=['POST'])
def auth():
    return auth_controller.login(request.json)


@app.route('/auth/getIdByToken/<int:user_token>', methods=['GET'])
def get_id_by_token(user_token):
    return auth_controller.get_id_by_token(user_token)


@app.route('/auth/status', methods=['GET'])
def status():
    return auth_controller.status()


@app.route('/auth/logout', methods=['GET'])
def logout():
    return auth_controller.logout()


@app.route('/claims', methods=['POST'])
def new_claim():
    return claim_controller.new_claim(request.json)


@app.route('/claims', methods=['GET'])
def claims():
    return claim_controller.get_claims()


@app.route('/claims/<int:id>', methods=['DELETE'])
def delete(id):
    return claim_controller.delete_claim(id)
