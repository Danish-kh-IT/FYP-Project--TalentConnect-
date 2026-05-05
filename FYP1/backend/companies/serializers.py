from rest_framework import serializers
from .models import Company, Industry, CompanySize
from users.serializers import UserSerializer

class IndustrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Industry
        fields = '__all__'

class CompanySizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanySize
        fields = '__all__'

class CompanySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Company
        fields = '__all__'
        read_only_fields = ['user', 'is_verified', 'created_at', 'updated_at']
