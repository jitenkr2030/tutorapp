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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Calendar,
  BookOpen,
  TrendingUp,
  Settings,
  Shield,
  UserPlus
} from 'lucide-react';
import { toast } from 'sonner';

interface Student {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  dateOfBirth?: string;
  grade?: string;
  school?: string;
  bio?: string;
  location?: string;
}

interface ParentProfile {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  occupation?: string;
  bio?: string;
}

interface FamilyStats {
  totalStudents: number;
  activeSessions: number;
  completedSessions: number;
  totalSpent: number;
}

export default function FamilyManagement() {
  const { data: session } = useSession();
  const [students, setStudents] = useState<Student[]>([]);
  const [parentProfile, setParentProfile] = useState<ParentProfile | null>(null);
  const [familyStats, setFamilyStats] = useState<FamilyStats>({
    totalStudents: 0,
    activeSessions: 0,
    completedSessions: 0,
    totalSpent: 0
  });
  const [loading, setLoading] = useState(true);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showEditParent, setShowEditParent] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form states
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    dateOfBirth: '',
    grade: '',
    school: '',
    bio: '',
    location: ''
  });

  const [parentForm, setParentForm] = useState({
    name: '',
    email: '',
    phone: '',
    occupation: '',
    bio: ''
  });

  useEffect(() => {
    if (session) {
      fetchFamilyData();
    }
  }, [session]);

  const fetchFamilyData = async () => {
    try {
      // Fetch students
      const studentsResponse = await fetch('/api/family/students');
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        setStudents(studentsData.students || []);
      }

      // Fetch parent profile
      const parentResponse = await fetch('/api/family/parent');
      if (parentResponse.ok) {
        const parentData = await parentResponse.json();
        setParentProfile(parentData.parent);
        setParentForm({
          name: parentData.parent.user.name,
          email: parentData.parent.user.email,
          phone: parentData.parent.user.phone || '',
          occupation: parentData.parent.occupation || '',
          bio: parentData.parent.bio || ''
        });
      }

      // Fetch family stats
      const statsResponse = await fetch('/api/family/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setFamilyStats(statsData.stats);
      }
    } catch (error) {
      console.error('Error fetching family data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/family/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStudent),
      });

      if (response.ok) {
        toast.success('Student added successfully');
        setShowAddStudent(false);
        setNewStudent({
          name: '',
          email: '',
          dateOfBirth: '',
          grade: '',
          school: '',
          bio: '',
          location: ''
        });
        fetchFamilyData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add student');
      }
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error('Failed to add student');
    }
  };

  const handleUpdateParent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/family/parent', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parentForm),
      });

      if (response.ok) {
        toast.success('Profile updated successfully');
        setShowEditParent(false);
        fetchFamilyData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating parent profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to remove this student from your family account?')) {
      return;
    }

    try {
      const response = await fetch(`/api/family/students/${studentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Student removed successfully');
        fetchFamilyData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to remove student');
      }
    } catch (error) {
      console.error('Error removing student:', error);
      toast.error('Failed to remove student');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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
          <h1 className="text-3xl font-bold">Family Management</h1>
          <p className="text-muted-foreground">
            Manage your family account and children's profiles
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={showAddStudent} onOpenChange={setShowAddStudent}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Child
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Child</DialogTitle>
                <DialogDescription>
                  Add a new child to your family account
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddStudent} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newStudent.email}
                      onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={newStudent.dateOfBirth}
                      onChange={(e) => setNewStudent({...newStudent, dateOfBirth: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grade">Grade</Label>
                    <Select value={newStudent.grade} onValueChange={(value) => setNewStudent({...newStudent, grade: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kindergarten">Kindergarten</SelectItem>
                        <SelectItem value="1st Grade">1st Grade</SelectItem>
                        <SelectItem value="2nd Grade">2nd Grade</SelectItem>
                        <SelectItem value="3rd Grade">3rd Grade</SelectItem>
                        <SelectItem value="4th Grade">4th Grade</SelectItem>
                        <SelectItem value="5th Grade">5th Grade</SelectItem>
                        <SelectItem value="6th Grade">6th Grade</SelectItem>
                        <SelectItem value="7th Grade">7th Grade</SelectItem>
                        <SelectItem value="8th Grade">8th Grade</SelectItem>
                        <SelectItem value="9th Grade">9th Grade</SelectItem>
                        <SelectItem value="10th Grade">10th Grade</SelectItem>
                        <SelectItem value="11th Grade">11th Grade</SelectItem>
                        <SelectItem value="12th Grade">12th Grade</SelectItem>
                        <SelectItem value="College">College</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school">School</Label>
                  <Input
                    id="school"
                    value={newStudent.school}
                    onChange={(e) => setNewStudent({...newStudent, school: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newStudent.location}
                    onChange={(e) => setNewStudent({...newStudent, location: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio (Optional)</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about your child..."
                    value={newStudent.bio}
                    onChange={(e) => setNewStudent({...newStudent, bio: e.target.value})}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddStudent(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Child</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Family Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{familyStats.totalStudents}</p>
                <p className="text-xs text-muted-foreground">Children</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{familyStats.activeSessions}</p>
                <p className="text-xs text-muted-foreground">Active Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{familyStats.completedSessions}</p>
                <p className="text-xs text-muted-foreground">Completed Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">${familyStats.totalSpent}</p>
                <p className="text-xs text-muted-foreground">Total Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="children" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="children">Children</TabsTrigger>
          <TabsTrigger value="profile">Parent Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="children" className="space-y-4">
          {students.length > 0 ? (
            <div className="grid gap-6">
              {students.map((student) => (
                <Card key={student.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={student.user.avatar} />
                          <AvatarFallback>
                            {getInitials(student.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle>{student.user.name}</CardTitle>
                          <CardDescription>
                            {student.grade} • {student.school}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteStudent(student.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <p className="text-sm text-muted-foreground">{student.user.email}</p>
                      </div>
                      {student.dateOfBirth && (
                        <div>
                          <Label className="text-sm font-medium">Date of Birth</Label>
                          <p className="text-sm text-muted-foreground">
                            {new Date(student.dateOfBirth).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {student.location && (
                        <div>
                          <Label className="text-sm font-medium">Location</Label>
                          <p className="text-sm text-muted-foreground">{student.location}</p>
                        </div>
                      )}
                      {student.bio && (
                        <div className="md:col-span-2">
                          <Label className="text-sm font-medium">Bio</Label>
                          <p className="text-sm text-muted-foreground">{student.bio}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No children added</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your children to start managing their learning journey
                  </p>
                  <Button onClick={() => setShowAddStudent(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Child
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          {parentProfile && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={parentProfile.user.avatar} />
                      <AvatarFallback>
                        {getInitials(parentProfile.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{parentProfile.user.name}</CardTitle>
                      <CardDescription>Parent Account</CardDescription>
                    </div>
                  </div>
                  <Dialog open={showEditParent} onOpenChange={setShowEditParent}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Parent Profile</DialogTitle>
                        <DialogDescription>
                          Update your personal information
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleUpdateParent} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="parentName">Full Name</Label>
                            <Input
                              id="parentName"
                              value={parentForm.name}
                              onChange={(e) => setParentForm({...parentForm, name: e.target.value})}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="parentEmail">Email</Label>
                            <Input
                              id="parentEmail"
                              type="email"
                              value={parentForm.email}
                              onChange={(e) => setParentForm({...parentForm, email: e.target.value})}
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="parentPhone">Phone</Label>
                            <Input
                              id="parentPhone"
                              type="tel"
                              value={parentForm.phone}
                              onChange={(e) => setParentForm({...parentForm, phone: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="parentOccupation">Occupation</Label>
                            <Input
                              id="parentOccupation"
                              value={parentForm.occupation}
                              onChange={(e) => setParentForm({...parentForm, occupation: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="parentBio">Bio</Label>
                          <Textarea
                            id="parentBio"
                            placeholder="Tell us about yourself..."
                            value={parentForm.bio}
                            onChange={(e) => setParentForm({...parentForm, bio: e.target.value})}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setShowEditParent(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">Update Profile</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm text-muted-foreground">{parentProfile.user.email}</p>
                  </div>
                  {parentProfile.user.phone && (
                    <div>
                      <Label className="text-sm font-medium">Phone</Label>
                      <p className="text-sm text-muted-foreground">{parentProfile.user.phone}</p>
                    </div>
                  )}
                  {parentProfile.occupation && (
                    <div>
                      <Label className="text-sm font-medium">Occupation</Label>
                      <p className="text-sm text-muted-foreground">{parentProfile.occupation}</p>
                    </div>
                  )}
                  {parentProfile.bio && (
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium">Bio</Label>
                      <p className="text-sm text-muted-foreground">{parentProfile.bio}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}