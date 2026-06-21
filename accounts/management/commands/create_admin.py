from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        email = 'admin@subecha.com'
        if not User.objects.filter(email=email).exists():
            User.objects.create_superuser(
                email=email,
                password='Admin@12345',
                full_name='Admin User'
            )
            self.stdout.write(self.style.SUCCESS('Superuser created!'))
        else:
            self.stdout.write('Superuser already exists.')

        from projects.models import Category
        categories = ['Web Development', 'Mobile App', 'Design', 'Writing', 'Data Entry']
        for cat in categories:
            Category.objects.get_or_create(name=cat)
        self.stdout.write(self.style.SUCCESS('Categories created!'))