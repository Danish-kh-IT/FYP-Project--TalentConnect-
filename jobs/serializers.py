from rest_framework import serializers
from .models import Job, Category, Location, JobType, SavedJob
from companies.serializers import CompanySerializer

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'

class JobTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobType
        fields = '__all__'

class JobSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True
    )
    category = CategorySerializer(read_only=True)
    
    location_id = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all(), source='location', write_only=True
    )
    location = LocationSerializer(read_only=True)
    
    job_type_id = serializers.PrimaryKeyRelatedField(
        queryset=JobType.objects.all(), source='job_type', write_only=True
    )
    job_type = JobTypeSerializer(read_only=True)
    applications_count = serializers.SerializerMethodField()

    def get_applications_count(self, obj):
        return obj.applications.count()
    
    class Meta:
        model = Job
        fields = '__all__'
        read_only_fields = ['company', 'created_at', 'updated_at', 'posted_at', 'is_active', 'status']

class SavedJobSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)
    
    class Meta:
        model = SavedJob
        fields = '__all__'
