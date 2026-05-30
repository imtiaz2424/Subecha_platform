from django.urls import path
from . import views

urlpatterns = [
    path('submit/', views.SubmitProposalView.as_view(), name='submit-proposal'),
    path('project/<int:project_id>/', views.ProjectProposalsView.as_view(), name='project-proposals'),
    path('<int:pk>/status/', views.UpdateProposalStatusView.as_view(), name='update-proposal-status'),
]