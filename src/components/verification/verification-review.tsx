'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, CheckCircle, XCircle, Clock, Eye, Download } from 'lucide-react';
import { toast } from 'sonner';

interface VerificationDocument {
  id: string;
  type: string;
  name: string;
  status: string;
  uploadedAt: string;
  fileUrl: string;
  mimeType: string;
}

interface Tutor {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  verificationDocuments: VerificationDocument[];
}

interface PendingVerification {
  id: string;
  tutorId: string;
  overallStatus: string;
  submittedAt?: string;
  tutor: Tutor;
}

export default function VerificationReview() {
  const { data: session } = useSession();
  const [pendingVerifications, setPendingVerifications] = useState<PendingVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<VerificationDocument | null>(null);
  const [reviewStatus, setReviewStatus] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [notes, setNotes] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('pending');

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchPendingVerifications();
    }
  }, [session, statusFilter]);

  const fetchPendingVerifications = async () => {
    try {
      const response = await fetch(`/api/verification/review?status=${statusFilter}`);
      if (response.ok) {
        const data = await response.json();
        setPendingVerifications(data.pendingVerifications);
      }
    } catch (error) {
      console.error('Error fetching pending verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (documentId: string) => {
    if (!reviewStatus) {
      toast.error('Please select a review status');
      return;
    }

    if (reviewStatus === 'rejected' && !rejectionReason) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setReviewing(true);
    try {
      const response = await fetch('/api/verification/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId,
          status: reviewStatus,
          rejectionReason: reviewStatus === 'rejected' ? rejectionReason : null,
          notes
        }),
      });

      if (response.ok) {
        toast.success('Document reviewed successfully');
        setSelectedDocument(null);
        setReviewStatus('');
        setRejectionReason('');
        setNotes('');
        fetchPendingVerifications();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to review document');
      }
    } catch (error) {
      console.error('Error reviewing document:', error);
      toast.error('Failed to review document');
    } finally {
      setReviewing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      approved: 'default',
      rejected: 'destructive',
      pending: 'secondary',
      not_started: 'outline'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </Badge>
    );
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      id_proof: 'ID Proof',
      background_check: 'Background Check',
      degree: 'Degree Certificate',
      certificate: 'Professional Certificate',
      other: 'Other Document'
    };
    return labels[type] || type;
  };

  if (session?.user?.role !== 'ADMIN') {
    return (
      <Alert>
        <AlertDescription>
          Only administrators can access this page.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Verification Review</h1>
          <p className="text-muted-foreground">
            Review tutor verification documents and applications
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {pendingVerifications.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No pending verifications</h3>
              <p className="text-muted-foreground">
                {statusFilter === 'pending' 
                  ? 'All tutors have been verified or no verifications are pending.'
                  : `No ${statusFilter} verifications found.`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {pendingVerifications.map((verification) => (
            <Card key={verification.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{verification.tutor.user.name}</CardTitle>
                    <CardDescription>{verification.tutor.user.email}</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(verification.overallStatus)}
                    {verification.submittedAt && (
                      <span className="text-sm text-muted-foreground">
                        Submitted: {new Date(verification.submittedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Documents</h4>
                    <div className="grid gap-2">
                      {verification.tutor.verificationDocuments.map((document) => (
                        <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{document.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {getDocumentTypeLabel(document.type)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(document.status)}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedDocument(document)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Review
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Review Document</DialogTitle>
                                  <DialogDescription>
                                    Review and approve or reject this verification document
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedDocument && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <strong>Document Type:</strong>
                                        <div>{getDocumentTypeLabel(selectedDocument.type)}</div>
                                      </div>
                                      <div>
                                        <strong>Status:</strong>
                                        <div>{getStatusBadge(selectedDocument.status)}</div>
                                      </div>
                                      <div>
                                        <strong>File Name:</strong>
                                        <div>{selectedDocument.name}</div>
                                      </div>
                                      <div>
                                        <strong>Uploaded:</strong>
                                        <div>{new Date(selectedDocument.uploadedAt).toLocaleDateString()}</div>
                                      </div>
                                    </div>
                                    
                                    <div className="border rounded-lg p-4">
                                      <div className="flex items-center justify-between mb-2">
                                        <strong>Document Preview</strong>
                                        <Button variant="outline" size="sm">
                                          <Download className="h-4 w-4 mr-1" />
                                          Download
                                        </Button>
                                      </div>
                                      <div className="text-center text-muted-foreground py-8">
                                        <FileText className="h-12 w-12 mx-auto mb-2" />
                                        <p>Document preview would be displayed here</p>
                                        <p className="text-sm">File type: {selectedDocument.mimeType}</p>
                                      </div>
                                    </div>

                                    <div className="space-y-4">
                                      <div className="space-y-2">
                                        <Label>Review Decision</Label>
                                        <Select value={reviewStatus} onValueChange={setReviewStatus}>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select decision" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="approved">Approve</SelectItem>
                                            <SelectItem value="rejected">Reject</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      {reviewStatus === 'rejected' && (
                                        <div className="space-y-2">
                                          <Label>Rejection Reason</Label>
                                          <Textarea
                                            placeholder="Please explain why this document is being rejected..."
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                          />
                                        </div>
                                      )}

                                      <div className="space-y-2">
                                        <Label>Additional Notes (Optional)</Label>
                                        <Textarea
                                          placeholder="Add any additional notes for the tutor..."
                                          value={notes}
                                          onChange={(e) => setNotes(e.target.value)}
                                        />
                                      </div>

                                      <div className="flex justify-end space-x-2">
                                        <Button variant="outline" onClick={() => setSelectedDocument(null)}>
                                          Cancel
                                        </Button>
                                        <Button
                                          onClick={() => handleReview(selectedDocument.id)}
                                          disabled={!reviewStatus || reviewing}
                                        >
                                          {reviewing ? 'Submitting...' : 'Submit Review'}
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}