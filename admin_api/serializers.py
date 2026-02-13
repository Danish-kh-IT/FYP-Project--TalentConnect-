from rest_framework import serializers
from django.contrib.auth.models import User
from users.models import UserProfile
from companies.models import Company
from jobs.models import Job

class AdminUserSerializer(serializers.ModelSerializer):
    user_type = serializers.CharField(source='profile.user_type', read_only=True)
    is_verified = serializers.BooleanField(source='profile.is_verified', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'user_type', 'is_verified', 'date_joined']

class AdminCompanySerializer(serializers.ModelSerializer):
    employer_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = Company
        fields = '__all__'

class AdminJobSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    
    class Meta:
        model = Job
        fields = '__all__'
