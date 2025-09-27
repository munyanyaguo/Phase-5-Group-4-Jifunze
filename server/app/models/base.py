from datetime import datetime, timezone
from app.extensions import db
from sqlalchemy.exc import IntegrityError, SQLAlchemyError, DataError


class BaseModel(db.Model):
    __abstract__ = True  # prevents table creation for this base class

    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def save(self):
        """Add instance to DB and commit."""
        try:
            db.session.add(self)
            db.session.flush()
            db.session.commit()
            return True
        except (IntegrityError, DataError) as e:
            db.session.rollback()
            raise e
        except SQLAlchemyError as e:
            db.session.rollback()
            raise e
        except Exception as e:
            db.session.rollback()
            raise e

    def delete(self):
        """Delete instance from DB and commit."""
        try:
            db.session.delete(self)
            db.session.commit()
            return True
        except SQLAlchemyError as e:
            db.session.rollback()
            raise e
        except Exception as e:
            db.session.rollback()
            raise e
    
    @classmethod
    def get_by_id(cls, id):
        """Retrieves an instance by its ID."""
        return cls.query.get(id)

    @classmethod
    def get_all(cls):
        """Retrieves all instances of the model."""
        return cls.query.all()
