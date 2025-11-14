"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  List,
  Users,
  BookOpen,
  Shield
} from "lucide-react";
import { toast } from "sonner";

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
  "Physics", "Chemistry", "Biology", "Computer Science", "Languages"
];

const availabilityOptions = [
  "Weekday Mornings", "Weekday Afternoons", "Weekday Evenings",
  "Weekend Mornings", "Weekend Afternoons", "Weekend Evenings"
];

interface MobileSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSearch({ isOpen, onClose }: MobileSearchProps) {
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
    if (isOpen) {
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
    }
  }, [isOpen, searchParams]);

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return '';
    if (distance < 1) return `${Math.round(distance * 1000)}m away`;
    return `${Math.round(distance)}km away`;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full h-full p-0 mobile-dialog">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background border-b p-4 safe-area-top">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Find Tutors</h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by subject or tutor name..."
                value={filters.query}
                onChange={(e) => updateFilter('query', e.target.value)}
                className="pl-10 h-12 mobile-input"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto mobile-scroll">
            {/* Quick Filters */}
            <div className="p-4 space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-2">
                <Button
                  variant={filters.subject === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilter('subject', '')}
                  className="whitespace-nowrap"
                >
                  All Subjects
                </Button>
                {subjects.slice(0, 5).map(subject => (
                  <Button
                    key={subject}
                    variant={filters.subject === subject ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateFilter('subject', subject)}
                    className="whitespace-nowrap"
                  >
                    {subject}
                  </Button>
                ))}
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                <Button
                  variant={filters.location === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilter('location', '')}
                  className="whitespace-nowrap"
                >
                  Anywhere
                </Button>
                <Button
                  variant={filters.location === 'Online' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilter('location', 'Online')}
                  className="whitespace-nowrap"
                >
                  Online Only
                </Button>
                <Button
                  variant={filters.verifiedOnly ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilter('verifiedOnly', !filters.verifiedOnly)}
                  className="whitespace-nowrap"
                >
                  <Shield className="h-4 w-4 mr-1" />
                  Verified
                </Button>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
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

              {/* Results */}
              <div className="space-y-3">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((tutor) => (
                    <Card key={tutor.id} className="mobile-card">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                            {tutor.avatar ? (
                              <img src={tutor.avatar} alt={tutor.name} className="h-full w-full rounded-full object-cover" />
                            ) : (
                              <span className="text-lg font-semibold">{getInitials(tutor.name)}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-base truncate">{tutor.name}</h3>
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium">{tutor.rating}</span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{tutor.subjects.join(', ')}</p>
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-semibold">${tutor.hourlyRate}/hr</span>
                              {tutor.distance && (
                                <span className="text-muted-foreground">{formatDistance(tutor.distance)}</span>
                              )}
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="flex-1"
                                onClick={() => {
                                  router.push(`/tutor/${tutor.id}`);
                                  onClose();
                                }}
                              >
                                View
                              </Button>
                              <Button 
                                size="sm" 
                                className="flex-1"
                                onClick={() => {
                                  router.push(`/book/${tutor.id}`);
                                  onClose();
                                }}
                              >
                                Book
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tutors found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-background border-t p-4 safe-area-bottom">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearFilters}
                className="flex-1"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear
              </Button>
              <Button 
                size="sm" 
                onClick={handleSearch}
                className="flex-1"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}