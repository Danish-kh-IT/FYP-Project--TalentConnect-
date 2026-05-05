from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse
from django.utils import timezone
from companies.models import Company

class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']

    def __str__(self):
        return self.name

class Location(models.Model):
    country = models.CharField(max_length=100)
    state = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100)

    class Meta:
        ordering = ['country', 'state', 'city']
        unique_together = ['country', 'state', 'city']

    def __str__(self):
        if self.state:
            return f"{self.city}, {self.state}, {self.country}"
        return f"{self.city}, {self.country}"

class JobType(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name

class Job(models.Model):
    FEATURED_CHOICES = [
        ('normal', 'Normal'),
        ('featured', 'Featured'),
        ('spotlight', 'Spotlight'),
        ('urgent', 'Urgent'),
        ('private', 'Private'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending', 'Pending Approval'),
        ('active', 'Active'),
        ('closed', 'Closed'),
        ('rejected', 'Rejected'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    requirements = models.TextField(blank=True)
    responsibilities = models.TextField(blank=True)
    benefits = models.TextField(blank=True)

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='jobs')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='jobs')
    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='jobs')
    job_type = models.ForeignKey(JobType, on_delete=models.CASCADE, related_name='jobs')

    salary_min = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    salary_max = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    currency = models.CharField(max_length=3, default='USD')

    experience_level = models.CharField(max_length=50, blank=True)
    education_level = models.CharField(max_length=100, blank=True)

    # Status fields
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    is_active = models.BooleanField(default=True) # Legacy check, rely on status='active' preferably
    is_featured = models.CharField(max_length=20, choices=FEATURED_CHOICES, default='normal')
    is_remote = models.BooleanField(default=False)

    application_deadline = models.DateTimeField(blank=True, null=True)
    application_email = models.EmailField(blank=True)
    application_url = models.URLField(blank=True)
    views_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    posted_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} at {self.company.name}"

    @property
    def is_recent(self):
        return (timezone.now() - self.created_at).days <= 7

class SavedJob(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_jobs')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='saved_by')
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'job']
        ordering = ['-saved_at']

    def __str__(self):
        return f"{self.user.get_full_name()} saved {self.job.title}"
