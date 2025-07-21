import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useParams, useLocation } from 'wouter';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Mail, Globe, Linkedin, Building, Edit2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function Profile() {
  const params = useParams();
  const profileId = parseInt(params.id as string);
  const { user, token } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const isOwnProfile = user?.id === profileId;

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['/api/profile', profileId],
    enabled: !!token && !!profileId,
  });

  const [formData, setFormData] = useState({
    company: '',
    title: '',
    industry: '',
    stage: '',
    founded: '',
    employees: '',
    fundingAmount: '',
    fundingUse: '',
    equityOffered: '',
    website: '',
    linkedin: '',
    skills: [] as string[],
  });

  // Initialize form data when profile loads
  useState(() => {
    if (profileData?.profile) {
      setFormData({
        company: profileData.profile.company || '',
        title: profileData.profile.title || '',
        industry: profileData.profile.industry || '',
        stage: profileData.profile.stage || '',
        founded: profileData.profile.founded?.toString() || '',
        employees: profileData.profile.employees?.toString() || '',
        fundingAmount: profileData.profile.fundingAmount?.toString() || '',
        fundingUse: profileData.profile.fundingUse || '',
        equityOffered: profileData.profile.equityOffered?.toString() || '',
        website: profileData.profile.website || '',
        linkedin: profileData.profile.linkedin || '',
        skills: profileData.profile.skills || [],
      });
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      return await apiRequest('PUT', '/api/profile', profileData);
    },
    onSuccess: () => {
      toast({
        title: "Profile updated!",
        description: "Your profile information has been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/profile', profileId] });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to update profile",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    },
  });

  const handleSave = () => {
    const profilePayload = {
      ...formData,
      founded: formData.founded ? parseInt(formData.founded) : null,
      employees: formData.employees ? parseInt(formData.employees) : null,
      fundingAmount: formData.fundingAmount ? parseInt(formData.fundingAmount) : null,
      equityOffered: formData.equityOffered ? parseInt(formData.equityOffered) : null,
    };
    updateProfileMutation.mutate(profilePayload);
  };

  const handleConnect = () => {
    setLocation(`/chat/${profileId}`);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8">
              <div className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-xl mb-8"></div>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-8 bg-gray-200 rounded w-48"></div>
                    <div className="h-6 bg-gray-200 rounded w-36"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!profileData) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Profile not found</h3>
              <p className="text-gray-600">The requested profile could not be found.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="overflow-hidden mb-8">
          <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          </div>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center -mt-20 md:-mt-16">
              <Avatar className="w-32 h-32 border-4 border-white">
                <AvatarImage src={profileData.avatar || undefined} />
                <AvatarFallback className="text-2xl">
                  {profileData.firstName[0]}{profileData.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="md:ml-8 mt-4 md:mt-0 flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {profileData.firstName} {profileData.lastName}
                    </h1>
                    <p className="text-xl text-gray-600">
                      {formData.title || `${profileData.role.charAt(0).toUpperCase()}${profileData.role.slice(1)}`}
                      {formData.company && ` at ${formData.company}`}
                    </p>
                    {profileData.location && (
                      <p className="text-gray-500 mt-1 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {profileData.location}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-3 mt-4 md:mt-0">
                    {isOwnProfile ? (
                      <Button
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        disabled={updateProfileMutation.isPending}
                        className="bg-primary text-white hover:bg-secondary transition-colors"
                      >
                        {isEditing ? (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
                          </>
                        ) : (
                          <>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Profile
                          </>
                        )}
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={handleConnect}
                          className="bg-primary text-white hover:bg-secondary transition-colors"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                        <Button variant="outline">
                          Connect
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                {profileData.bio ? (
                  <p className="text-gray-600 leading-relaxed">{profileData.bio}</p>
                ) : (
                  <p className="text-gray-500 italic">No bio available</p>
                )}
              </CardContent>
            </Card>

            {/* Company/Startup Details */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {profileData.role === 'entrepreneur' ? 'Startup Details' : 'Investment Focus'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          placeholder="Company name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Job title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="industry">Industry</Label>
                        <Select
                          value={formData.industry}
                          onValueChange={(value) => setFormData({ ...formData, industry: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="sustainability">Sustainability</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="stage">Stage</Label>
                        <Select
                          value={formData.stage}
                          onValueChange={(value) => setFormData({ ...formData, stage: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select stage" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="seed">Seed</SelectItem>
                            <SelectItem value="series-a">Series A</SelectItem>
                            <SelectItem value="series-b">Series B</SelectItem>
                            <SelectItem value="series-c">Series C</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="founded">Founded</Label>
                        <Input
                          id="founded"
                          type="number"
                          value={formData.founded}
                          onChange={(e) => setFormData({ ...formData, founded: e.target.value })}
                          placeholder="2020"
                        />
                      </div>
                      <div>
                        <Label htmlFor="employees">Employees</Label>
                        <Input
                          id="employees"
                          type="number"
                          value={formData.employees}
                          onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
                          placeholder="15"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {formData.industry && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Industry</h3>
                        <p className="text-gray-600">{formData.industry}</p>
                      </div>
                    )}
                    {formData.stage && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Stage</h3>
                        <p className="text-gray-600">{formData.stage}</p>
                      </div>
                    )}
                    {formData.founded && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Founded</h3>
                        <p className="text-gray-600">{formData.founded}</p>
                      </div>
                    )}
                    {formData.employees && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Employees</h3>
                        <p className="text-gray-600">{formData.employees}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Funding Requirements (for entrepreneurs) */}
            {profileData.role === 'entrepreneur' && (
              <Card>
                <CardHeader>
                  <CardTitle>Funding Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="fundingAmount">Seeking Amount ($)</Label>
                        <Input
                          id="fundingAmount"
                          type="number"
                          value={formData.fundingAmount}
                          onChange={(e) => setFormData({ ...formData, fundingAmount: e.target.value })}
                          placeholder="500000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fundingUse">Use of Funds</Label>
                        <Input
                          id="fundingUse"
                          value={formData.fundingUse}
                          onChange={(e) => setFormData({ ...formData, fundingUse: e.target.value })}
                          placeholder="R&D, Marketing, Hiring"
                        />
                      </div>
                      <div>
                        <Label htmlFor="equityOffered">Equity Offered (%)</Label>
                        <Input
                          id="equityOffered"
                          type="number"
                          value={formData.equityOffered}
                          onChange={(e) => setFormData({ ...formData, equityOffered: e.target.value })}
                          placeholder="15"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.fundingAmount && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Seeking Amount</span>
                          <span className="font-semibold text-gray-900">
                            ${parseInt(formData.fundingAmount).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {formData.fundingUse && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Use of Funds</span>
                          <span className="font-semibold text-gray-900">{formData.fundingUse}</span>
                        </div>
                      )}
                      {formData.equityOffered && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Equity Offered</span>
                          <span className="font-semibold text-gray-900">{formData.equityOffered}%</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center">
                  <Mail className="text-gray-400 w-5 h-5" />
                  <span className="text-gray-600 ml-3">{profileData.email}</span>
                </div>
                {isEditing ? (
                  <>
                    <div className="flex items-center">
                      <Linkedin className="text-gray-400 w-5 h-5" />
                      <Input
                        value={formData.linkedin}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                        placeholder="linkedin.com/in/username"
                        className="ml-3"
                      />
                    </div>
                    <div className="flex items-center">
                      <Globe className="text-gray-400 w-5 h-5" />
                      <Input
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="company.com"
                        className="ml-3"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {formData.linkedin && (
                      <div className="flex items-center">
                        <Linkedin className="text-gray-400 w-5 h-5" />
                        <span className="text-gray-600 ml-3">{formData.linkedin}</span>
                      </div>
                    )}
                    {formData.website && (
                      <div className="flex items-center">
                        <Globe className="text-gray-400 w-5 h-5" />
                        <span className="text-gray-600 ml-3">{formData.website}</span>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Skills & Expertise */}
            <Card>
              <CardHeader>
                <CardTitle>Skills & Expertise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.length > 0 ? (
                    formData.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No skills listed</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
