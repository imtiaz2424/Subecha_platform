from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.CategoryListView.as_view(), name='categories'),
    path('', views.ProjectListView.as_view(), name='project-list'),
    path('create/', views.ProjectCreateView.as_view(), name='project-create'),
    path('<int:pk>/', views.ProjectDetailView.as_view(), name='project-detail'),
    path('<int:pk>/edit/', views.ProjectUpdateDeleteView.as_view(), name='project-edit'),
    path('reviews/create/', views.ReviewCreateView.as_view(), name='review-create'),
    path('freelancer/<uuid:freelancer_id>/reviews/', views.FreelancerReviewsView.as_view(), name='freelancer-reviews'),
]