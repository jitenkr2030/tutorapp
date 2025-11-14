'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  DollarSign, 
  Filter, 
  X,
  ChevronDown,
  ChevronUp,
  Heart,
  RotateCcw,
  Save,
  Grid,
  List
} from 'lucide-react';
import { toast } from 'sonner';

interface SearchFilters {
  query: string;
  subject: string;
  location: string;
  priceRange: [number, number];
  rating: number;
  experience: number;
  availability: string[];
  tutorStatus: string;
  lessonType: string;
  onlineOnly: boolean;
  inPersonOnly: boolean;
  backgroundCheck: boolean;
  verifiedOnly: boolean;
}

interface TutorResult {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  subjects: string[];
  rating: number;
  reviews: number;
  experience: number;
  hourlyRate: number;
  location: string;
  status: string;
  backgroundCheck: boolean;
  verified: boolean;
  online: boolean;
  inPerson: boolean;
  bio: string;
  distance?: number;
}

const subjects = [
  "Mathematics", "Science", "English", "History", "Geography",
  "Physics", "Chemistry", "Biology", "Computer Science", "Languages",
  "Calculus", "Algebra", "Geometry", "Statistics", "Trigonometry",
  "Literature", "Writing", "Grammar", "Reading", "Vocabulary",
  "World History", "US History", "European History", "Geography", "Economics",
  "General Science", "Environmental Science", "Astronomy", "Psychology", "Sociology"
];

const availabilityOptions = [
  "Weekday Mornings", "Weekday Afternoons", "Weekday Evenings",
  "Weekend Mornings", "Weekend Afternoons", "Weekend Evenings"
];

export default function AdvancedSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchResults, setSearchResults] = useState<TutorResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(true);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('relevance');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || '',
    subject: searchParams.get('subject') || '',
    location: searchParams.get('location') || '',
    priceRange: [0, 200],
    rating: 0,
    experience: 0,
    availability: [],
    tutorStatus: 'all',
    lessonType: 'all',
    onlineOnly: false,
    inPersonOnly: false,
    backgroundCheck: false,
    verifiedOnly: false
  });

  useEffect(() => {
    // Get user's location for distance calculations
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }

    // Load saved searches from localStorage
    const saved = localStorage.getItem('savedTutorSearches');
    if (saved) {
      setSavedSearches(JSON.parse(saved));
    }

    // Perform initial search if there are search params
    if (searchParams.toString()) {
      performSearch();
    }
  }, []);

  const performSearch = async (page = 1) => {
    setLoading(true);
    try {
      const searchParams = new URLSearchParams({
        q: filters.query,
        subject: filters.subject,
        location: filters.location,
        minPrice: filters.priceRange[0].toString(),
        maxPrice: filters.priceRange[1].toString(),
        minRating: filters.rating.toString(),
        minExperience: filters.experience.toString(),
        availability: filters.availability.join(','),
        tutorStatus: filters.tutorStatus,
        lessonType: filters.lessonType,
        onlineOnly: filters.onlineOnly.toString(),
        inPersonOnly: filters.inPersonOnly.toString(),
        backgroundCheck: filters.backgroundCheck.toString(),
        verifiedOnly: filters.verifiedOnly.toString(),
        page: page.toString(),
        sortBy,
        ...(userLocation && {
          userLat: userLocation.lat.toString(),
          userLng: userLocation.lng.toString()
        })
      });

      const response = await fetch(`/api/tutors/search?${searchParams}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.tutors || []);
        setTotalResults(data.total || 0);
        setCurrentPage(page);
      } else {
        toast.error('Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search tutors');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // Update URL with search parameters
    const params = new URLSearchParams();
    if (filters.query) params.set('q', filters.query);
    if (filters.subject) params.set('subject', filters.subject);
    if (filters.location) params.set('location', filters.location);
    
    router.push(`/search?${params.toString()}`);
    performSearch(1);
  };

  const saveSearch = () => {
    const searchToSave = {
      id: Date.now(),
      name: `${filters.subject || 'All'} in ${filters.location || 'Anywhere'}`,
      filters: { ...filters },
      createdAt: new Date().toISOString(),
      resultsCount: totalResults
    };

    const updated = [...savedSearches, searchToSave];
    setSavedSearches(updated);
    localStorage.setItem('savedTutorSearches', JSON.stringify(updated));
    toast.success('Search saved successfully');
  };

  const loadSavedSearch = (savedSearch: any) => {
    setFilters(savedSearch.filters);
    performSearch(1);
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      subject: '',
      location: '',
      priceRange: [0, 200],
      rating: 0,
      experience: 0,
      availability: [],
      tutorStatus: 'all',
      lessonType: 'all',
      onlineOnly: false,
      inPersonOnly: false,
      backgroundCheck: false,
      verifiedOnly: false
    });
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return '';
    if (distance < 1) return `${Math.round(distance * 1000)}m away`;
    return `${Math.round(distance)}km away`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Tutor</h1>
          <p className="text-gray-600">Search from thousands of qualified tutors with advanced filters</p>
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div className="w-80 flex-shrink-0">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Filters</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={saveSearch}>
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {showFilters && (
                <CardContent className="space-y-6">
                  {/* Basic Search */}
                  <div className="space-y-3">
                    <Label>Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Tutor name or subject..."
                        value={filters.query}
                        onChange={(e) => updateFilter('query', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-3">
                    <Label>Subject</Label>
                    <Select value={filters.subject} onValueChange={(value) => updateFilter('subject', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All subjects" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All subjects</SelectItem>
                        {subjects.map(subject => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location */}
                  <div className="space-y-3">
                    <Label>Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="City or postal code..."
                        value={filters.location}
                        onChange={(e) => updateFilter('location', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-3">
                    <Label>Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}</Label>
                    <Slider
                      value={filters.priceRange}
                      onValueChange={(value) => updateFilter('priceRange', value)}
                      max={200}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  {/* Rating */}
                  <div className="space-y-3">
                    <Label>Minimum Rating: {filters.rating > 0 ? `${filters.rating}+` : 'Any'}</Label>
                    <Slider
                      value={[filters.rating]}
                      onValueChange={(value) => updateFilter('rating', value[0])}
                      max={5}
                      min={0}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  {/* Experience */}
                  <div className="space-y-3">
                    <Label>Minimum Experience: {filters.experience > 0 ? `${filters.experience}+ years` : 'Any'}</Label>
                    <Slider
                      value={[filters.experience]}
                      onValueChange={(value) => updateFilter('experience', value[0])}
                      max={20}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Availability */}
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        Availability
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-2">
                      {availabilityOptions.map(option => (
                        <div key={option} className="flex items-center space-x-2">
                          <Checkbox
                            id={option}
                            checked={filters.availability.includes(option)}
                            onCheckedChange={(checked) => {
                              const updated = checked
                                ? [...filters.availability, option]
                                : filters.availability.filter(a => a !== option);
                              updateFilter('availability', updated);
                            }}
                          />
                          <Label htmlFor={option} className="text-sm">{option}</Label>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Additional Filters */}
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        More Filters
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-3 mt-2">
                      <div>
                        <Label>Tutor Status</Label>
                        <Select value={filters.tutorStatus} onValueChange={(value) => updateFilter('tutorStatus', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="APPROVED">Approved</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Lesson Type</Label>
                        <Select value={filters.lessonType} onValueChange={(value) => updateFilter('lessonType', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All types</SelectItem>
                            <SelectItem value="ONLINE">Online only</SelectItem>
                            <SelectItem value="IN_PERSON">In-person only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="online"
                          checked={filters.onlineOnly}
                          onCheckedChange={(checked) => updateFilter('onlineOnly', checked as boolean)}
                        />
                        <Label htmlFor="online">Online tutoring</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="inperson"
                          checked={filters.inPersonOnly}
                          onCheckedChange={(checked) => updateFilter('inPersonOnly', checked as boolean)}
                        />
                        <Label htmlFor="inperson">In-person tutoring</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="background"
                          checked={filters.backgroundCheck}
                          onCheckedChange={(checked) => updateFilter('backgroundCheck', checked as boolean)}
                        />
                        <Label htmlFor="background">Background checked</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="verified"
                          checked={filters.verifiedOnly}
                          onCheckedChange={(checked) => updateFilter('verifiedOnly', checked as boolean)}
                        />
                        <Label htmlFor="verified">Verified only</Label>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Search Button */}
                  <Button onClick={handleSearch} className="w-full">
                    <Search className="h-4 w-4 mr-2" />
                    Search Tutors
                  </Button>
                </CardContent>
              )}
            </Card>

            {/* Saved Searches */}
            {savedSearches.length > 0 && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-base">Saved Searches</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {savedSearches.slice(0, 3).map(saved => (
                    <Button
                      key={saved.id}
                      variant="outline"
                      className="w-full justify-start text-left"
                      onClick={() => loadSavedSearch(saved)}
                    >
                      {saved.name}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results Area */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="bg-white rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    {totalResults} {totalResults === 1 ? 'Tutor' : 'Tutors'} Found
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {filters.query && `Searching for "${filters.query}"`}
                    {filters.subject && ` in ${filters.subject}`}
                    {filters.location && ` near ${filters.location}`}
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Most Relevant</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="experience">Most Experience</SelectItem>
                      <SelectItem value="distance">Nearest</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : searchResults.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No tutors found</h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your search criteria or filters
                    </p>
                    <Button onClick={clearFilters}>
                      Clear All Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
                  : "space-y-4"
              }>
                {searchResults.map(tutor => (
                  <Card key={tutor.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          {tutor.avatar ? (
                            <img 
                              src={tutor.avatar} 
                              alt={tutor.name} 
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-semibold text-gray-600">
                              {getInitials(tutor.name)}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">{tutor.name}</h3>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span>{tutor.rating}</span>
                                  <span>({tutor.reviews} reviews)</span>
                                </div>
                                {tutor.distance && (
                                  <span>• {formatDistance(tutor.distance)}</span>
                                )}
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Heart className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mb-3">
                            {tutor.subjects.slice(0, 3).map(subject => (
                              <Badge key={subject} variant="secondary" className="text-xs">
                                {subject}
                              </Badge>
                            ))}
                            {tutor.subjects.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{tutor.subjects.length - 3}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{tutor.experience} years</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-3 w-3" />
                              <span>${tutor.hourlyRate}/hr</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{tutor.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              {tutor.online && <span>• Online</span>}
                              {tutor.inPerson && <span>• In-person</span>}
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {tutor.bio}
                          </p>
                          
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => router.push(`/tutor/${tutor.id}`)}
                            >
                              View Profile
                            </Button>
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => router.push(`/book/${tutor.id}`)}
                            >
                              Book Session
                            </Button>
                          </div>
                          
                          <div className="flex items-center space-x-2 mt-3">
                            {tutor.verified && (
                              <Badge variant="default" className="text-xs">
                                ✓ Verified
                              </Badge>
                            )}
                            {tutor.backgroundCheck && (
                              <Badge variant="secondary" className="text-xs">
                                ✓ Background Checked
                              </Badge>
                            )}
                            {tutor.status === 'APPROVED' && (
                              <Badge variant="outline" className="text-xs">
                                Approved
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalResults > 12 && (
              <div className="flex justify-center mt-6">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => performSearch(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4">
                    Page {currentPage} of {Math.ceil(totalResults / 12)}
                  </span>
                  <Button
                    variant="outline"
                    disabled={currentPage >= Math.ceil(totalResults / 12)}
                    onClick={() => performSearch(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}