from app import db
from datetime import datetime


class Claims(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(80), unique=True)
    fullName = db.Column(db.String(80))
    message = db.Column(db.String(80))
    phone = db.Column(db.String(80))
    type = db.Column(db.String(120))
    created_on = db.Column(db.DateTime(), default=datetime.utcnow)

    def __init__(self, email, fullName, message, phone, type):
        self.email = email
        self.fullName = fullName
        self.message = message
        self.phone = phone
        self.type = type


    def serialize(self):
        return {"id": self.id,
                "email": self.email,
                "fullName": self.fullName,
                "message": self.message,
                "phone": self.phone,
                "type": self.type,
                "created_on": self.created_on}
