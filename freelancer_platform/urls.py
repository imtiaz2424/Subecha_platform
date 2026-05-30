"""
URL configuration for freelancer_platform project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    # API endpoints
    path('api/auth/', include('accounts.urls')),
    path('api/projects/', include('projects.urls')),
    path('api/proposals/', include('proposals.urls')),
    # Frontend pages
    path('', TemplateView.as_view(template_name='index.html'), name='home'),
    path('login/', TemplateView.as_view(template_name='login.html'), name='login-page'),
    path('register/', TemplateView.as_view(template_name='register.html'), name='register-page'),
    path('verify-email/', TemplateView.as_view(template_name='verify_email.html'), name='verify-page'),
    path('projects/', TemplateView.as_view(template_name='projects.html'), name='projects-page'),
    path('projects/<int:pk>/', TemplateView.as_view(template_name='project_detail.html'), name='project-detail-page'),
    path('profile/', TemplateView.as_view(template_name='profile.html'), name='profile-page'),
    path('post-project/', TemplateView.as_view(template_name='post_project.html'), name='post-project-page'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) \
  + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
