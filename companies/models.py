from django.db import models
from django.contrib.auth.models import User

class Industry(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
    class Meta:
        verbose_name_plural = "Industries"
        ordering = ['name']
    
    def __str__(self):
        return self.name

class CompanySize(models.Model):
    size_range = models.CharField(max_length=50)  # e.g., "1-10", "11-50", "51-200", etc.
    description = models.CharField(max_length=100, blank=True)
    
    class Meta:
        ordering = ['size_range']
    
    def __str__(self):
        return self.size_range

class Company(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='company_profile')
    name = models.CharField(max_length=200)
    description = models.TextField()
    logo = models.ImageField(upload_to='company_logos/', blank=True, null=True)
    website = models.URLField(blank=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    founded_year = models.IntegerField(blank=True, null=True)
    size = models.CharField(max_length=50, blank=True) # Could use ForeignKey to CompanySize if strictly enforced, but CharField is flexible
    industry = models.CharField(max_length=100, blank=True) # Could use ForeignKey to Industry
    
    is_verified = models.BooleanField(default=False) # Verification status
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Companies"
        ordering = ['name']

    def __str__(self):
        return self.name