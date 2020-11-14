from app import db
from datetime import datetime


class Claims(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(80))
    full_name = db.Column(db.String(80))
    message = db.Column(db.String(80))
    phone = db.Column(db.String(80))
    claim_type = db.Column(db.String(120))
    created_on = db.Column(db.DateTime(), default=datetime.utcnow)

    def __init__(self, email, full_name, message, phone, claim_type):
        self.email = email
        self.full_name = full_name
        self.message = message
        self.phone = phone
        self.claim_type = claim_type


    def serialize(self):
        return {"id": self.id,
                "email": self.email,
                "full_name": self.full_name,
                "message": self.message,
                "phone": self.phone,
                "claim_type": self.claim_type,
                "created_on": self.created_on}
