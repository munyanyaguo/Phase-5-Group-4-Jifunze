from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from marshmallow import ValidationError

from models.school import School
from models.user import User, ROLES
from models.base import db
from schemas.schools import SchoolSchema
from schemas.user import UserSchema
from utils.responses import success_response, error_response

