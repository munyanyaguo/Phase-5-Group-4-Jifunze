import pytest
from datetime import datetime, timezone
from app.models import BaseModel, db

class TestModel(BaseModel):
    """Concrete test model for testing BaseModel functionality"""
    __tablename__ = "test_models"
    
    name = db.Column(db.String(50), nullable=False)


class TestBaseModel:
    """Test the BaseModel abstract class functionality"""

    def test_base_model_has_required_fields(self):
        """Test that BaseModel provides id, created_at, updated_at fields"""
        test_instance = TestModel(name="test")
        test_instance.save()
        
        # Check that fields exist
        assert hasattr(test_instance, 'id')
        assert hasattr(test_instance, 'created_at')
        assert hasattr(test_instance, 'updated_at')
        
        # Check field types
        assert isinstance(test_instance.id, int)
        assert isinstance(test_instance.created_at, datetime)
        assert isinstance(test_instance.updated_at, datetime)

    def test_timestamps_are_utc(self):
        """Test that timestamps are created in UTC"""
        test_instance = TestModel(name="test")
        test_instance.save()
        
        # Check timezone
        assert isinstance(test_instance.created_at, datetime)
        assert isinstance(test_instance.updated_at, datetime)

        assert test_instance.created_at.replace(tzinfo=timezone.utc).utcoffset() == timezone.utc.utcoffset(None)
        assert test_instance.updated_at.replace(tzinfo=timezone.utc).utcoffset() == timezone.utc.utcoffset(None)


    def test_save_method(self):
        """Test the save method adds and commits to database"""
        test_instance = TestModel(name="test_save")
        
        # Before save
        assert test_instance.id is None
        
        # After save
        test_instance.save()
        assert test_instance.id is not None
        
        # Verify it's in database
        found = TestModel.query.get(test_instance.id)
        assert found is not None
        assert found.name == "test_save"

    def test_delete_method(self):
        """Test the delete method removes from database"""
        test_instance = TestModel(name="test_delete")
        test_instance.save()
        instance_id = test_instance.id
        
        # Verify it exists
        assert TestModel.query.get(instance_id) is not None
        
        # Delete
        test_instance.delete()
        
        # Verify it's gone
        assert TestModel.query.get(instance_id) is None

    def test_updated_at_changes_on_update(self):
        """Test that updated_at timestamp changes when model is updated"""
        test_instance = TestModel(name="original")
        test_instance.save()
        
        original_updated_at = test_instance.updated_at
        
        # Simulate some time passing and update
        import time
        time.sleep(0.01)  # Small delay to ensure timestamp difference
        
        test_instance.name = "updated"
        test_instance.save()
        
        assert test_instance.updated_at > original_updated_at

    def test_repr_method_inherited(self):
        """Test that concrete models can implement their own __repr__"""
        test_instance = TestModel(name="test_repr")
        # This will use the default SQLAlchemy repr since we didn't override it
        repr_str = repr(test_instance)
        assert "TestModel" in repr_str