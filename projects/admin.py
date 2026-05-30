from django.contrib import admin
from .models import Project, Category, Review

admin.site.register(Category)
admin.site.register(Project)
admin.site.register(Review)