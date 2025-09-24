from datetime import datetime, timezone
from app.extensions import db


class BaseModel(db.Model):
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
        
