import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nokri_clone.settings')
django.setup()

from jobs.models import Category, Location, JobType

def seed():
    # Job Types
    job_types = ['Full Time', 'Part Time', 'Freelance', 'Contract', 'Internship']
    for name in job_types:
        JobType.objects.get_or_create(name=name)
    print(f"Seeded {len(job_types)} job types.")

    # Categories
    categories = [
        ('Software Development', 'Tech', 'code'),
        ('Design', 'Creative', 'palette'),
        ('Marketing', 'Business', 'megaphone'),
        ('Sales', 'Business', 'trending-up'),
        ('Customer Support', 'Service', 'headset'),
        ('Data Science', 'Tech', 'bar-chart'),
        ('Accountant', 'Finance', 'dollar-sign'),
    ]
    for name, desc, icon in categories:
        Category.objects.get_or_create(name=name, defaults={'description': desc, 'icon': icon})
    print(f"Seeded {len(categories)} categories.")

    # Locations
    locations = [
        ('Pakistan', 'Punjab', 'Lahore'),
        ('Pakistan', 'Sindh', 'Karachi'),
        ('Pakistan', 'Punjab', 'Islamabad'),
        ('United States', 'California', 'San Francisco'),
        ('United Kingdom', 'England', 'London'),
        ('United Arab Emirates', 'Dubai', 'Dubai'),
    ]
    for country, state, city in locations:
        Location.objects.get_or_create(country=country, state=state, city=city)
    print(f"Seeded {len(locations)} locations.")

if __name__ == '__main__':
    seed()
