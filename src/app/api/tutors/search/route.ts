import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface SearchQuery {
  q?: string;
  subject?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  minExperience?: number;
  availability?: string;
  tutorStatus?: string;
  lessonType?: string;
  onlineOnly?: boolean;
  inPersonOnly?: boolean;
  backgroundCheck?: boolean;
  verifiedOnly?: boolean;
  page?: number;
  sortBy?: string;
  userLat?: number;
  userLng?: number;
}

interface TutorWithDistance {
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

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const query: SearchQuery = {
      q: searchParams.get('q') || undefined,
      subject: searchParams.get('subject') || undefined,
      location: searchParams.get('location') || undefined,
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined,
      minExperience: searchParams.get('minExperience') ? parseInt(searchParams.get('minExperience')!) : undefined,
      availability: searchParams.get('availability') || undefined,
      tutorStatus: searchParams.get('tutorStatus') || undefined,
      lessonType: searchParams.get('lessonType') || undefined,
      onlineOnly: searchParams.get('onlineOnly') === 'true',
      inPersonOnly: searchParams.get('inPersonOnly') === 'true',
      backgroundCheck: searchParams.get('backgroundCheck') === 'true',
      verifiedOnly: searchParams.get('verifiedOnly') === 'true',
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      sortBy: searchParams.get('sortBy') || 'relevance',
      userLat: searchParams.get('userLat') ? parseFloat(searchParams.get('userLat')!) : undefined,
      userLng: searchParams.get('userLng') ? parseFloat(searchParams.get('userLng')!) : undefined,
    };

    const page = query.page || 1;
    const limit = 12;
    const offset = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {
      status: 'APPROVED' // Only show approved tutors by default
    };

    // Add status filter if specified
    if (query.tutorStatus && query.tutorStatus !== 'all') {
      where.status = query.tutorStatus;
    }

    // Subject filter
    if (query.subject) {
      where.subjects = {
        some: {
          subject: {
            name: {
              contains: query.subject,
              mode: 'insensitive'
            }
          }
        }
      };
    }

    // Price range filter
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.hourlyRate = {};
      if (query.minPrice !== undefined) {
        where.hourlyRate.gte = query.minPrice;
      }
      if (query.maxPrice !== undefined) {
        where.hourlyRate.lte = query.maxPrice;
      }
    }

    // Experience filter
    if (query.minExperience !== undefined) {
      where.experience = {
        gte: query.minExperience
      };
    }

    // Background check filter
    if (query.backgroundCheck) {
      where.backgroundCheck = true;
    }

    // Verified filter
    if (query.verifiedOnly) {
      where.verification = {
        overallStatus: 'approved'
      };
    }

    // Lesson type filters
    if (query.onlineOnly || query.inPersonOnly) {
      where.AND = [];
      
      if (query.onlineOnly && query.inPersonOnly) {
        // Both online and in-person - no additional filter needed
      } else if (query.onlineOnly) {
        // Online only - need to check if tutor offers online sessions
        // This would require additional logic based on your availability/session types
      } else if (query.inPersonOnly) {
        // In-person only - need to check if tutor offers in-person sessions
        // This would require additional logic based on your availability/session types
      }
    }

    // Search query (name, bio, subjects)
    if (query.q) {
      where.OR = [
        {
          user: {
            name: {
              contains: query.q,
              mode: 'insensitive'
            }
          }
        },
        {
          bio: {
            contains: query.q,
            mode: 'insensitive'
          }
        },
        {
          subjects: {
            some: {
              subject: {
                name: {
                  contains: query.q,
                  mode: 'insensitive'
                }
              }
            }
          }
        }
      ];
    }

    // Build order by clause
    let orderBy: any = {};
    switch (query.sortBy) {
      case 'rating':
        orderBy = {
          tutorReviews: {
            _count: 'desc'
          }
        };
        break;
      case 'price-low':
        orderBy = { hourlyRate: 'asc' };
        break;
      case 'price-high':
        orderBy = { hourlyRate: 'desc' };
        break;
      case 'experience':
        orderBy = { experience: 'desc' };
        break;
      case 'distance':
        // Distance sorting will be handled after fetching
        orderBy = { id: 'asc' };
        break;
      default:
        // Relevance sorting (prioritize exact matches)
        orderBy = [
          { status: 'desc' },
          { backgroundCheck: 'desc' },
          { experience: 'desc' }
        ];
    }

    // Fetch tutors with filters
    const tutors = await db.tutor.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        subjects: {
          include: {
            subject: true
          }
        },
        verification: {
          select: {
            overallStatus: true
          }
        },
        tutorReviews: {
          select: {
            rating: true
          }
        }
      },
      orderBy,
      skip: offset,
      take: limit
    });

    // Process results and calculate ratings/distances
    const processedTutors: TutorWithDistance[] = tutors.map(tutor => {
      // Calculate average rating
      const totalRating = tutor.tutorReviews.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = tutor.tutorReviews.length > 0 ? totalRating / tutor.tutorReviews.length : 0;

      // Calculate distance if user location is provided
      let distance: number | undefined;
      if (query.userLat && query.userLng && tutor.latitude && tutor.longitude) {
        distance = calculateDistance(
          query.userLat,
          query.userLng,
          tutor.latitude,
          tutor.longitude
        );
      }

      return {
        id: tutor.id,
        name: tutor.user.name,
        email: tutor.user.email,
        avatar: tutor.user.avatar,
        subjects: tutor.subjects.map(ts => ts.subject.name),
        rating: Math.round(avgRating * 10) / 10,
        reviews: tutor.tutorReviews.length,
        experience: tutor.experience,
        hourlyRate: tutor.hourlyRate,
        location: tutor.location || 'Remote',
        status: tutor.status,
        backgroundCheck: tutor.backgroundCheck,
        verified: tutor.verification?.overallStatus === 'approved',
        online: true, // You might want to determine this based on availability
        inPerson: true, // You might want to determine this based on availability
        bio: tutor.bio || '',
        distance
      };
    });

    // Apply additional filters that need post-processing
    let filteredTutors = processedTutors;

    // Location filter (post-processing for text search)
    if (query.location) {
      filteredTutors = filteredTutors.filter(tutor => 
        tutor.location.toLowerCase().includes(query.location!.toLowerCase())
      );
    }

    // Rating filter (post-processing)
    if (query.minRating !== undefined) {
      filteredTutors = filteredTutors.filter(tutor => tutor.rating >= query.minRating!);
    }

    // Availability filter (simplified - you might want to implement proper availability checking)
    if (query.availability) {
      const availabilityArray = query.availability.split(',').filter(Boolean);
      // This is a simplified version - you'd want to check actual availability slots
      // For now, we'll assume all tutors have some availability
    }

    // Sort by distance if requested
    if (query.sortBy === 'distance') {
      filteredTutors.sort((a, b) => {
        if (a.distance === undefined && b.distance === undefined) return 0;
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      });
    }

    // Get total count for pagination
    const total = await db.tutor.count({ where });

    return NextResponse.json({
      tutors: filteredTutors,
      total: filteredTutors.length,
      page,
      totalPages: Math.ceil(filteredTutors.length / limit)
    });

  } catch (error) {
    console.error('Error searching tutors:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}