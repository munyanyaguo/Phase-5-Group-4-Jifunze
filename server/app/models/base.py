from datetime import datetime, timezone

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy_serializer import SerializerMixin

db = SQLAlchemy()


class BaseModel(db.Model, SerializerMixin):
    __abstract__ = True  # prevents table creation for this base class

    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def save(self):
        """Add instance to DB and commit."""
        db.session.add(self)
        db.session.commit()

    def delete(self):
        """Delete instance from DB and commit."""
        db.session.delete(self)
        db.session.commit()

    def to_dict(self):
        """Serialize with timestamps in ISO format."""
        data = super().to_dict()
        data["created_at"] = self.created_at.isoformat() if self.created_at else None
        data["updated_at"] = self.updated_at.isoformat() if self.updated_at else None
        return data
