# app/routes/notifications.py
from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models import db
from app.models.user import User
from app.models.notification import Notification
from app.utils.responses import success_response, error_response


class NotificationListResource(Resource):
    @jwt_required()
    def get(self):
        """Get all notifications for current user"""
        current_user_public_id = get_jwt_identity()
        
        # Get query params
        unread_only = request.args.get('unread_only', 'false').lower() == 'true'
        limit = request.args.get('limit', 20, type=int)
        
        # Build query
        query = Notification.query.filter_by(user_public_id=current_user_public_id)
        
        if unread_only:
            query = query.filter_by(is_read=False)
        
        # Order by newest first and limit
        notifications = query.order_by(Notification.created_at.desc()).limit(limit).all()
        
        # Serialize
        result = [{
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "type": n.type,
            "is_read": n.is_read,
            "link": n.link,
            "created_at": n.created_at.isoformat() if n.created_at else None
        } for n in notifications]
        
        # Count unread
        unread_count = Notification.query.filter_by(
            user_public_id=current_user_public_id, 
            is_read=False
        ).count()
        
        return success_response("Notifications retrieved successfully", {
            "notifications": result,
            "unread_count": unread_count
        })


class NotificationResource(Resource):
    @jwt_required()
    def patch(self, notification_id):
        """Mark notification as read"""
        current_user_public_id = get_jwt_identity()
        
        notification = Notification.query.filter_by(
            id=notification_id,
            user_public_id=current_user_public_id
        ).first()
        
        if not notification:
            return error_response("Notification not found", status_code=404)
        
        notification.is_read = True
        db.session.commit()
        
        return success_response("Notification marked as read")
    
    @jwt_required()
    def delete(self, notification_id):
        """Delete notification"""
        current_user_public_id = get_jwt_identity()
        
        notification = Notification.query.filter_by(
            id=notification_id,
            user_public_id=current_user_public_id
        ).first()
        
        if not notification:
            return error_response("Notification not found", status_code=404)
        
        db.session.delete(notification)
        db.session.commit()
        
        return success_response("Notification deleted")


class NotificationMarkAllReadResource(Resource):
    @jwt_required()
    def post(self):
        """Mark all notifications as read"""
        current_user_public_id = get_jwt_identity()
        
        Notification.query.filter_by(
            user_public_id=current_user_public_id,
            is_read=False
        ).update({"is_read": True})
        
        db.session.commit()
        
        return success_response("All notifications marked as read")
