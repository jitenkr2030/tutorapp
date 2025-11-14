import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning and seeding database...');

  // Delete existing data in correct order to respect foreign key constraints
  await prisma.message.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.session.deleteMany();
  await prisma.learningPlan.deleteMany();
  await prisma.progressReport.deleteMany();
  await prisma.file.deleteMany();
  
  // Delete tutor-related data
  await prisma.verificationDocument.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.qualification.deleteMany();
  await prisma.tutorSubject.deleteMany();
  
  // Delete profiles
  await prisma.student.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.tutor.deleteMany();
  
  // Delete subjects
  await prisma.subject.deleteMany();
  
  // Delete users
  await prisma.user.deleteMany();
  await prisma.account.deleteMany();

  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 12);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // Create tutor users
  const tutor1 = await prisma.user.create({
    data: {
      email: 'tutor1@example.com',
      name: 'Dr. Sarah Johnson',
      password: hashedPassword,
      role: 'TUTOR',
      avatar: '/placeholder-avatar.svg',
      tutorProfile: {
        create: {
          bio: 'PhD in Mathematics with 10+ years of teaching experience. Specialized in Calculus and Algebra.',
          hourlyRate: 45,
          experience: 10,
          location: 'New York, NY',
          latitude: 40.7128,
          longitude: -74.0060,
          travelRadius: 25,
          profileCompleted: true,
          backgroundCheck: true,
          status: 'APPROVED',
          subjects: {
            create: [
              {
                subject: {
                  create: {
                    name: 'Mathematics',
                    description: 'Mathematics tutoring',
                    category: 'STEM',
                  },
                },
                level: 'Advanced',
                experience: 10,
              },
              {
                subject: {
                  create: {
                    name: 'Calculus',
                    description: 'Calculus tutoring',
                    category: 'STEM',
                  },
                },
                level: 'Advanced',
                experience: 8,
              },
            ],
          },
          qualifications: {
            create: [
              {
                title: 'PhD in Mathematics',
                institution: 'MIT',
                year: 2013,
                verified: true,
              },
              {
                title: 'Master of Science in Mathematics',
                institution: 'Stanford University',
                year: 2009,
                verified: true,
              },
            ],
          },
          availability: {
            create: [
              {
                dayOfWeek: 1, // Monday
                startTime: '09:00',
                endTime: '17:00',
                recurring: true,
              },
              {
                dayOfWeek: 2, // Tuesday
                startTime: '09:00',
                endTime: '17:00',
                recurring: true,
              },
              {
                dayOfWeek: 3, // Wednesday
                startTime: '09:00',
                endTime: '17:00',
                recurring: true,
              },
              {
                dayOfWeek: 4, // Thursday
                startTime: '09:00',
                endTime: '17:00',
                recurring: true,
              },
              {
                dayOfWeek: 5, // Friday
                startTime: '09:00',
                endTime: '17:00',
                recurring: true,
              },
            ],
          },
          verification: {
            create: {
              idVerified: true,
              backgroundCheckVerified: true,
              qualificationsVerified: true,
              overallStatus: 'approved',
              submittedAt: new Date(),
              reviewedAt: new Date(),
              reviewedBy: admin.id,
            },
          },
        },
      },
    },
  });

  const tutor2 = await prisma.user.create({
    data: {
      email: 'tutor2@example.com',
      name: 'Prof. Michael Chen',
      password: hashedPassword,
      role: 'TUTOR',
      avatar: '/placeholder-avatar.svg',
      tutorProfile: {
        create: {
          bio: 'University professor with expertise in Quantum Physics and Mechanics.',
          hourlyRate: 50,
          experience: 8,
          location: 'Boston, MA',
          latitude: 42.3601,
          longitude: -71.0589,
          travelRadius: 30,
          profileCompleted: true,
          backgroundCheck: true,
          status: 'APPROVED',
          subjects: {
            create: [
              {
                subject: {
                  create: {
                    name: 'Physics',
                    description: 'Physics tutoring',
                    category: 'STEM',
                  },
                },
                level: 'Advanced',
                experience: 8,
              },
              {
                subject: {
                  create: {
                    name: 'Quantum Physics',
                    description: 'Quantum Physics tutoring',
                    category: 'STEM',
                  },
                },
                level: 'Advanced',
                experience: 6,
              },
            ],
          },
          qualifications: {
            create: [
              {
                title: 'PhD in Physics',
                institution: 'Harvard University',
                year: 2015,
                verified: true,
              },
              {
                title: 'Master of Science in Physics',
                institution: 'MIT',
                year: 2011,
                verified: true,
              },
            ],
          },
          availability: {
            create: [
              {
                dayOfWeek: 1, // Monday
                startTime: '10:00',
                endTime: '18:00',
                recurring: true,
              },
              {
                dayOfWeek: 3, // Wednesday
                startTime: '10:00',
                endTime: '18:00',
                recurring: true,
              },
              {
                dayOfWeek: 5, // Friday
                startTime: '10:00',
                endTime: '18:00',
                recurring: true,
              },
            ],
          },
          verification: {
            create: {
              idVerified: true,
              backgroundCheckVerified: true,
              qualificationsVerified: true,
              overallStatus: 'approved',
              submittedAt: new Date(),
              reviewedAt: new Date(),
              reviewedBy: admin.id,
            },
          },
        },
      },
    },
  });

  const tutor3 = await prisma.user.create({
    data: {
      email: 'tutor3@example.com',
      name: 'Ms. Emily Rodriguez',
      password: hashedPassword,
      role: 'TUTOR',
      avatar: '/placeholder-avatar.svg',
      tutorProfile: {
        create: {
          bio: 'Certified English teacher specializing in literature and creative writing.',
          hourlyRate: 35,
          experience: 6,
          location: 'Los Angeles, CA',
          latitude: 34.0522,
          longitude: -118.2437,
          travelRadius: 20,
          profileCompleted: true,
          backgroundCheck: true,
          status: 'APPROVED',
          subjects: {
            create: [
              {
                subject: {
                  create: {
                    name: 'English',
                    description: 'English tutoring',
                    category: 'Humanities',
                  },
                },
                level: 'Intermediate',
                experience: 6,
              },
              {
                subject: {
                  create: {
                    name: 'Literature',
                    description: 'Literature tutoring',
                    category: 'Humanities',
                  },
                },
                level: 'Advanced',
                experience: 5,
              },
            ],
          },
          qualifications: {
            create: [
              {
                title: 'Master of Arts in English Literature',
                institution: 'UCLA',
                year: 2017,
                verified: true,
              },
              {
                title: 'Bachelor of Arts in English',
                institution: 'UC Berkeley',
                year: 2015,
                verified: true,
              },
            ],
          },
          availability: {
            create: [
              {
                dayOfWeek: 2, // Tuesday
                startTime: '14:00',
                endTime: '20:00',
                recurring: true,
              },
              {
                dayOfWeek: 4, // Thursday
                startTime: '14:00',
                endTime: '20:00',
                recurring: true,
              },
              {
                dayOfWeek: 6, // Saturday
                startTime: '09:00',
                endTime: '15:00',
                recurring: true,
              },
            ],
          },
          verification: {
            create: {
              idVerified: true,
              backgroundCheckVerified: true,
              qualificationsVerified: true,
              overallStatus: 'approved',
              submittedAt: new Date(),
              reviewedAt: new Date(),
              reviewedBy: admin.id,
            },
          },
        },
      },
    },
  });

  // Create parent user
  const parentUser = await prisma.user.create({
    data: {
      email: 'parent@example.com',
      name: 'John Smith',
      password: hashedPassword,
      role: 'PARENT',
      parentProfile: {
        create: {
          occupation: 'Software Engineer',
          bio: 'Parent looking for quality tutors for my children.',
        },
      },
    },
  });

  // Get the parent profile ID
  const parentProfile = await prisma.parent.findFirst({
    where: { userId: parentUser.id },
  });

  // Create student users
  const student1 = await prisma.user.create({
    data: {
      email: 'student1@example.com',
      name: 'Alice Smith',
      password: hashedPassword,
      role: 'STUDENT',
      studentProfile: {
        create: {
          dateOfBirth: new Date('2010-05-15'),
          grade: '8th Grade',
          school: 'Lincoln Middle School',
          bio: 'Student interested in improving math skills.',
          location: 'New York, NY',
          latitude: 40.7128,
          longitude: -74.0060,
          parentId: parentProfile?.id,
        },
      },
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: 'student2@example.com',
      name: 'Bob Smith',
      password: hashedPassword,
      role: 'STUDENT',
      studentProfile: {
        create: {
          dateOfBirth: new Date('2012-08-20'),
          grade: '6th Grade',
          school: 'Lincoln Middle School',
          bio: 'Student struggling with physics concepts.',
          location: 'New York, NY',
          latitude: 40.7128,
          longitude: -74.0060,
          parentId: parentProfile?.id,
        },
      },
    },
  });

  // Create sample sessions
  const session1 = await prisma.session.create({
    data: {
      tutorId: tutor1.id,
      studentId: student1.id,
      title: 'Calculus Tutoring Session',
      description: 'Focus on derivatives and integrals',
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      duration: 60,
      type: 'ONLINE',
      status: 'SCHEDULED',
      meetingLink: 'https://meet.example.com/calculus-session-1',
      price: 45,
      notes: 'Student needs help with chain rule and integration by parts.',
    },
  });

  const session2 = await prisma.session.create({
    data: {
      tutorId: tutor2.id,
      studentId: student2.id,
      title: 'Physics Fundamentals',
      description: 'Introduction to mechanics and motion',
      scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      duration: 90,
      type: 'ONLINE',
      status: 'SCHEDULED',
      meetingLink: 'https://meet.example.com/physics-session-1',
      price: 75,
      notes: 'Cover Newton\'s laws of motion and basic kinematics.',
    },
  });

  // Create bookings
  const booking1 = await prisma.booking.create({
    data: {
      sessionId: session1.id,
      studentId: student1.id,
      status: 'CONFIRMED',
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      sessionId: session2.id,
      studentId: student2.id,
      status: 'CONFIRMED',
    },
  });

  // Create payments
  await prisma.payment.create({
    data: {
      bookingId: booking1.id,
      userId: parentUser.id,
      amount: 45,
      status: 'COMPLETED',
      paymentMethod: 'credit_card',
      transactionId: 'txn_123456789',
      paidAt: new Date(),
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking2.id,
      userId: parentUser.id,
      amount: 75,
      status: 'COMPLETED',
      paymentMethod: 'credit_card',
      transactionId: 'txn_987654321',
      paidAt: new Date(),
    },
  });

  // Create reviews
  await prisma.review.create({
    data: {
      sessionId: session1.id,
      tutorId: tutor1.id,
      studentId: student1.id,
      rating: 5,
      comment: 'Excellent tutor! Very patient and explains concepts clearly.',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    },
  });

  await prisma.review.create({
    data: {
      sessionId: session2.id,
      tutorId: tutor2.id,
      studentId: student2.id,
      rating: 4,
      comment: 'Good tutor, but sometimes goes too fast. Overall helpful.',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
  });

  // Create sample notifications
  await prisma.notification.create({
    data: {
      userId: student1.id,
      type: 'SESSION_REMINDER',
      title: 'Upcoming Session Reminder',
      message: 'Your Calculus tutoring session with Dr. Sarah Johnson is scheduled for tomorrow at 3:00 PM.',
      read: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: student2.id,
      type: 'SESSION_REMINDER',
      title: 'Upcoming Session Reminder',
      message: 'Your Physics tutoring session with Prof. Michael Chen is scheduled for the day after tomorrow at 4:00 PM.',
      read: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: parentUser.id,
      type: 'PAYMENT_DUE',
      title: 'Payment Confirmation',
      message: 'Payment for Alice\'s Calculus session has been processed successfully.',
      read: true,
    },
  });

  // Create sample messages
  await prisma.message.create({
    data: {
      senderId: tutor1.id,
      receiverId: student1.id,
      content: 'Looking forward to our session tomorrow! Please review the chain rule examples I sent.',
      sessionId: session1.id,
    },
  });

  await prisma.message.create({
    data: {
      senderId: student1.id,
      receiverId: tutor1.id,
      content: 'Thank you! I\'ve reviewed the examples and have some questions about problem #3.',
      sessionId: session1.id,
    },
  });

  console.log('Database seeded successfully!');
  console.log('Sample users created:');
  console.log('Admin: admin@example.com / password123');
  console.log('Tutor 1: tutor1@example.com / password123');
  console.log('Tutor 2: tutor2@example.com / password123');
  console.log('Tutor 3: tutor3@example.com / password123');
  console.log('Parent: parent@example.com / password123');
  console.log('Student 1: student1@example.com / password123');
  console.log('Student 2: student2@example.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });