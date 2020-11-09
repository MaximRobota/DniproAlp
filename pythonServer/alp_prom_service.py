from app import app

from flask_cors import CORS

CORS(app, support_credentials=True)

app.run(host='0.0.0.0', port=80, debug=True)
