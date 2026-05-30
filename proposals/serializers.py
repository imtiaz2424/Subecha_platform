from rest_framework import serializers
from .models import Proposal


class ProposalSerializer(serializers.ModelSerializer):
    freelancer_name = serializers.CharField(source='freelancer.full_name', read_only=True)
    freelancer_email = serializers.CharField(source='freelancer.email', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)
    project_budget = serializers.DecimalField(source='project.budget', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Proposal
        fields = ['id', 'project', 'project_title', 'project_budget', 'freelancer', 'freelancer_name', 'freelancer_email', 'cover_letter', 'status', 'submitted_at']
        read_only_fields = ['freelancer', 'status', 'submitted_at']