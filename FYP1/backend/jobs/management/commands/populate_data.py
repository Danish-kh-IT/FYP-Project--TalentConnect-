from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from jobs.models import Category, Location, JobType, Company, Job
from users.models import UserProfile


class Command(BaseCommand):
    help = 'Populate the database with sample data'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')

        # Create Categories
        categories_data = [
            ('Technology', 'Software development, IT, and tech roles'),
            ('Healthcare', 'Medical, nursing, and healthcare positions'),
            ('Education', 'Teaching, training, and educational roles'),
            ('Finance', 'Banking, accounting, and financial services'),
            ('Marketing', 'Digital marketing, advertising, and PR'),
            ('Engineering', 'Mechanical, civil, and software engineering'),
            ('Sales', 'Sales representatives and account managers'),
            ('Design', 'Graphic design, UI/UX, and creative roles'),
        ]
        
        categories = []
        for name, description in categories_data:
            category, created = Category.objects.get_or_create(
                name=name,
                defaults={'description': description, 'icon': 'fas fa-briefcase'}
            )
            categories.append(category)
            if created:
                self.stdout.write(f'Created category: {name}')

        # Create Locations
        locations_data = [
            ('Pakistan', 'Punjab', 'Lahore'),
            ('Pakistan', 'Sindh', 'Karachi'),
            ('USA', 'California', 'San Francisco'),
            ('USA', 'New York', 'New York'),
            ('India', 'Delhi', 'New Delhi'),
            ('India', 'Maharashtra', 'Mumbai'),
            ('Germany', 'Bavaria', 'Munich'),
            ('UAE', 'Dubai', 'Dubai'),
        ]
        
        locations = []
        for country, state, city in locations_data:
            location, created = Location.objects.get_or_create(
                country=country,
                state=state,
                city=city
            )
            locations.append(location)
            if created:
                self.stdout.write(f'Created location: {city}, {state}, {country}')

        # Create Job Types
        job_types_data = [
            'Full Time',
            'Part Time',
            'Contract',
            'Freelance',
            'Internship',
            'Temporary',
        ]
        
        job_types = []
        for job_type_name in job_types_data:
            job_type, created = JobType.objects.get_or_create(name=job_type_name)
            job_types.append(job_type)
            if created:
                self.stdout.write(f'Created job type: {job_type_name}')

        # Create Companies
        companies_data = [
            {
                'name': 'TechCorp Solutions',
                'description': 'Leading technology company specializing in software development and AI solutions.',
                'industry': 'Technology',
                'size': '51-200',
                'email': 'contact@techcorp.com',
                'website': 'https://techcorp.com',
                'location': locations[0],  # Lahore
            },
            {
                'name': 'HealthPlus Medical',
                'description': 'Premier healthcare provider offering comprehensive medical services.',
                'industry': 'Healthcare',
                'size': '201-500',
                'email': 'hr@healthplus.com',
                'website': 'https://healthplus.com',
                'location': locations[1],  # Karachi
            },
            {
                'name': 'EduLearn Academy',
                'description': 'Innovative educational institution focused on modern learning methods.',
                'industry': 'Education',
                'size': '11-50',
                'email': 'info@edulearn.com',
                'website': 'https://edulearn.com',
                'location': locations[4],  # New Delhi
            },
            {
                'name': 'FinanceFirst Bank',
                'description': 'Trusted financial institution providing banking and investment services.',
                'industry': 'Finance',
                'size': '1000+',
                'email': 'careers@financefirst.com',
                'website': 'https://financefirst.com',
                'location': locations[2],  # San Francisco
            },
            {
                'name': 'DesignStudio Creative',
                'description': 'Creative agency specializing in branding and digital design.',
                'industry': 'Design',
                'size': '1-10',
                'email': 'hello@designstudio.com',
                'website': 'https://designstudio.com',
                'location': locations[7],  # Dubai
            },
        ]
        
        companies = []
        for i, company_data in enumerate(companies_data):
            # Create user for company
            username = f'company_{i+1}'
            user, user_created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': company_data['email'],
                    'first_name': company_data['name'].split()[0],
                    'last_name': ' '.join(company_data['name'].split()[1:]) if len(company_data['name'].split()) > 1 else 'Corp'
                }
            )
            
            if user_created:
                user.set_password('password123')
                user.save()
                
                # Create user profile
                UserProfile.objects.create(
                    user=user,
                    user_type='employer'
                )
            
            # Create company
            location = company_data.pop('location')
            company, created = Company.objects.get_or_create(
                user=user,
                defaults={
                    'name': company_data['name'],
                    'description': company_data['description'],
                    'industry': company_data['industry'],
                    'size': company_data['size'],
                    'email': company_data['email'],
                    'website': company_data['website'],
                    'address': f"123 Main St, {location.city}, {location.country}"
                }
            )
            companies.append(company)
            if created:
                self.stdout.write(f'Created company: {company_data["name"]}')

        # Create Jobs
        jobs_data = [
            {
                'title': 'Senior Software Developer',
                'description': 'We are looking for an experienced software developer to join our team. You will be responsible for developing high-quality software solutions and collaborating with cross-functional teams.',
                'requirements': 'Bachelor\'s degree in Computer Science or related field\n5+ years of software development experience\nProficiency in Python, JavaScript, and React\nExperience with cloud platforms (AWS, Azure)',
                'responsibilities': 'Design and develop software applications\nCollaborate with product managers and designers\nWrite clean, maintainable code\nParticipate in code reviews and technical discussions',
                'benefits': 'Competitive salary\nHealth insurance\nFlexible working hours\nProfessional development opportunities',
                'company': companies[0],
                'category': categories[0],  # Technology
                'location': locations[0],   # Lahore
                'job_type': job_types[0],   # Full Time
                'salary_min': 150000,
                'salary_max': 250000,
                'experience_level': 'Senior',
                'education_level': 'Bachelor\'s Degree',
                'is_featured': 'featured',
            },
            {
                'title': 'Registered Nurse',
                'description': 'Join our healthcare team as a registered nurse. Provide compassionate care to patients and work in a supportive environment.',
                'requirements': 'Valid nursing license\nBachelor\'s degree in Nursing\n2+ years of clinical experience\nCPR certification',
                'responsibilities': 'Provide direct patient care\nMonitor patient conditions\nAdminister medications\nCollaborate with healthcare team',
                'benefits': 'Health insurance\nRetirement plan\nPaid time off\nContinuing education support',
                'company': companies[1],
                'category': categories[1],  # Healthcare
                'location': locations[1],   # Karachi
                'job_type': job_types[0],   # Full Time
                'salary_min': 80000,
                'salary_max': 120000,
                'experience_level': 'Mid-level',
                'education_level': 'Bachelor\'s Degree',
                'is_featured': 'normal',
            },
            {
                'title': 'Marketing Manager',
                'description': 'Lead our marketing initiatives and drive brand growth. Develop and execute marketing strategies to reach target audiences.',
                'requirements': 'Bachelor\'s degree in Marketing or related field\n3+ years of marketing experience\nDigital marketing expertise\nAnalytics and reporting skills',
                'responsibilities': 'Develop marketing strategies\nManage digital campaigns\nAnalyze marketing performance\nLead marketing team',
                'benefits': 'Competitive salary\nBonus opportunities\nHealth benefits\nRemote work options',
                'company': companies[0],
                'category': categories[4],  # Marketing
                'location': locations[2],   # San Francisco
                'job_type': job_types[0],   # Full Time
                'salary_min': 90000,
                'salary_max': 130000,
                'experience_level': 'Mid-level',
                'education_level': 'Bachelor\'s Degree',
                'is_featured': 'urgent',
            },
            {
                'title': 'Frontend Developer',
                'description': 'Create amazing user experiences with modern web technologies. Join our creative team and build beautiful, responsive web applications.',
                'requirements': '2+ years of frontend development experience\nProficiency in HTML, CSS, JavaScript\nExperience with React or Vue.js\nUnderstanding of responsive design',
                'responsibilities': 'Develop user interfaces\nImplement responsive designs\nCollaborate with UX/UI designers\nOptimize web performance',
                'benefits': 'Flexible schedule\nRemote work options\nLearning budget\nTeam building events',
                'company': companies[4],
                'category': categories[0],  # Technology
                'location': locations[7],   # Dubai
                'job_type': job_types[0],   # Full Time
                'salary_min': 70000,
                'salary_max': 110000,
                'experience_level': 'Mid-level',
                'education_level': 'Bachelor\'s Degree',
                'is_featured': 'normal',
            },
            {
                'title': 'Financial Analyst',
                'description': 'Analyze financial data and provide insights to support business decisions. Work with cross-functional teams on financial planning and analysis.',
                'requirements': 'Bachelor\'s degree in Finance or related field\n2+ years of financial analysis experience\nExcel and financial modeling skills\nStrong analytical abilities',
                'responsibilities': 'Analyze financial data\nPrepare financial reports\nSupport budgeting and forecasting\nProvide financial insights',
                'benefits': 'Competitive compensation\n401(k) matching\nHealth insurance\nProfessional development',
                'company': companies[3],
                'category': categories[3],  # Finance
                'location': locations[3],   # New York
                'job_type': job_types[0],   # Full Time
                'salary_min': 75000,
                'salary_max': 100000,
                'experience_level': 'Mid-level',
                'education_level': 'Bachelor\'s Degree',
                'is_featured': 'private',
            },
            {
                'title': 'UX Designer',
                'description': 'Design intuitive and user-friendly interfaces. Work closely with product teams to create exceptional user experiences.',
                'requirements': 'Bachelor\'s degree in Design or related field\n3+ years of UX design experience\nProficiency in design tools (Figma, Sketch)\nPortfolio demonstrating UX skills',
                'responsibilities': 'Design user interfaces\nConduct user research\nCreate wireframes and prototypes\nCollaborate with development teams',
                'benefits': 'Creative work environment\nProfessional development\nHealth benefits\nFlexible hours',
                'company': companies[4],
                'category': categories[7],  # Design
                'location': locations[7],   # Dubai
                'job_type': job_types[0],   # Full Time
                'salary_min': 80000,
                'salary_max': 120000,
                'experience_level': 'Mid-level',
                'education_level': 'Bachelor\'s Degree',
                'is_featured': 'normal',
            },
        ]
        
        for job_data in jobs_data:
            job, created = Job.objects.get_or_create(
                title=job_data['title'],
                company=job_data['company'],
                defaults=job_data
            )
            if created:
                self.stdout.write(f'Created job: {job_data["title"]}')

        self.stdout.write(
            self.style.SUCCESS('Successfully populated database with sample data!')
        )