from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Proposal
from .serializers import ProposalSerializer


class SubmitProposalView(generics.CreateAPIView):
    serializer_class = ProposalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(freelancer=self.request.user)

    def create(self, request, *args, **kwargs):
        project_id = request.data.get('project')
        if Proposal.objects.filter(project_id=project_id, freelancer=request.user).exists():
            return Response({'error': 'You have already applied for this project.'}, status=status.HTTP_400_BAD_REQUEST)
        return super().create(request, *args, **kwargs)


class ProjectProposalsView(generics.ListAPIView):
    serializer_class = ProposalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs['project_id']
        return Proposal.objects.filter(project__id=project_id, project__client=self.request.user)


class UpdateProposalStatusView(generics.UpdateAPIView):
    serializer_class = ProposalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Proposal.objects.filter(project__client=self.request.user)

    def partial_update(self, request, *args, **kwargs):
        proposal = self.get_object()
        new_status = request.data.get('status')
        if new_status in ['accepted', 'rejected', 'pending']:
            proposal.status = new_status
            proposal.save()
            return Response(ProposalSerializer(proposal).data)
        return Response({'error': 'Invalid status'}, status=400)