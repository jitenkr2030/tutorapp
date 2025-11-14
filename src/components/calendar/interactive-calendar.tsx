'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Video, 
  Plus, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Users,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  Globe,
  Map
} from 'lucide-react';
import { toast } from 'sonner';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'session' | 'availability' | 'break' | 'holiday';
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  tutor?: {
    name: string;
    id: string;
  };
  student?: {
    name: string;
    id: string;
  };
  location?: string;
  isOnline: boolean;
  price?: number;
  description?: string;
  color: string;
}

interface AvailabilitySlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  recurring: boolean;
  specificDate?: Date;
}

interface TimeSlot {
  time: string;
  available: boolean;
  event?: CalendarEvent;
}

interface InteractiveCalendarProps {
  tutorId?: string;
  studentId?: string;
  isTutor?: boolean;
  onEventSelect?: (event: CalendarEvent) => void;
  onSlotSelect?: (slot: { date: Date; startTime: string; endTime: string }) => void;
}

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const timeSlots = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00'
];

export default function InteractiveCalendar({ 
  tutorId, 
  studentId, 
  isTutor = false, 
  onEventSelect, 
  onSlotSelect 
}: InteractiveCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('week');
  const [timeZone, setTimeZone] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [loading, setLoading] = useState(true);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; startTime: string; endTime: string } | null>(null);

  // Form states
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
    isOnline: true,
    price: 0
  });

  const [availabilityForm, setAvailabilityForm] = useState({
    dayOfWeek: 0,
    startTime: '09:00',
    endTime: '17:00',
    recurring: true
  });

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate, viewMode, tutorId, studentId]);

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      // Fetch events
      const eventsResponse = await fetch(`/api/calendar/events?start=${startOfMonth.toISOString()}&end=${endOfMonth.toISOString()}&tutorId=${tutorId || ''}&studentId=${studentId || ''}`);
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setEvents(eventsData.events.map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end)
        })));
      }

      // Fetch availability if tutor
      if (isTutor && tutorId) {
        const availabilityResponse = await fetch(`/api/calendar/availability?tutorId=${tutorId}`);
        if (availabilityResponse.ok) {
          const availabilityData = await availabilityResponse.json();
          setAvailability(availabilityData.availability);
        }
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      toast.error('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateTimeSlots = (date: Date): TimeSlot[] => {
    return timeSlots.map(time => {
      const eventForSlot = events.find(event => {
        const eventDate = new Date(event.start);
        return eventDate.toDateString() === date.toDateString() && 
               eventDate.toTimeString().slice(0, 5) === time;
      });

      const isAvailable = checkAvailability(date, time);

      return {
        time,
        available: isAvailable && !eventForSlot,
        event: eventForSlot
      };
    });
  };

  const checkAvailability = (date: Date, time: string): boolean => {
    if (!isTutor) return true;

    const dayOfWeek = date.getDay();
    const [hours, minutes] = time.split(':').map(Number);
    const slotTime = hours * 60 + minutes;

    // Check recurring availability
    const recurringSlot = availability.find(slot => 
      slot.dayOfWeek === dayOfWeek && slot.recurring
    );

    if (recurringSlot) {
      const [startHours, startMinutes] = recurringSlot.startTime.split(':').map(Number);
      const [endHours, endMinutes] = recurringSlot.endTime.split(':').map(Number);
      const startTime = startHours * 60 + startMinutes;
      const endTime = endHours * 60 + endMinutes;

      return slotTime >= startTime && slotTime < endTime;
    }

    // Check specific date availability
    const specificSlot = availability.find(slot => 
      slot.specificDate && 
      new Date(slot.specificDate).toDateString() === date.toDateString()
    );

    if (specificSlot) {
      const [startHours, startMinutes] = specificSlot.startTime.split(':').map(Number);
      const [endHours, endMinutes] = specificSlot.endTime.split(':').map(Number);
      const startTime = startHours * 60 + startMinutes;
      const endTime = endHours * 60 + endMinutes;

      return slotTime >= startTime && slotTime < endTime;
    }

    return false;
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (viewMode === 'day') {
      // For day view, we might want to show time slots
    }
  };

  const handleSlotClick = (time: string) => {
    if (!selectedDate) return;

    const slot = {
      date: selectedDate,
      startTime: time,
      endTime: addHoursToTime(time, 1)
    };

    if (isTutor) {
      // Tutors can set availability or create events
      setSelectedSlot(slot);
      setShowAvailabilityDialog(true);
    } else {
      // Students can book sessions
      if (onSlotSelect) {
        onSlotSelect(slot);
      } else {
        setSelectedSlot(slot);
        setShowEventDialog(true);
      }
    }
  };

  const addHoursToTime = (time: string, hours: number): string => {
    const [h, m] = time.split(':').map(Number);
    const totalMinutes = (h * 60 + m) + (hours * 60);
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  };

  const createEvent = async () => {
    if (!selectedSlot) return;

    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: eventForm.title,
          description: eventForm.description,
          start: new Date(selectedSlot.date.toDateString() + ' ' + selectedSlot.startTime),
          end: new Date(selectedSlot.date.toDateString() + ' ' + selectedSlot.endTime),
          location: eventForm.location,
          isOnline: eventForm.isOnline,
          price: eventForm.price,
          tutorId,
          studentId,
          type: 'session'
        }),
      });

      if (response.ok) {
        toast.success('Event created successfully');
        setShowEventDialog(false);
        setEventForm({
          title: '',
          description: '',
          startTime: '',
          endTime: '',
          location: '',
          isOnline: true,
          price: 0
        });
        fetchCalendarData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    }
  };

  const createAvailability = async () => {
    if (!selectedSlot) return;

    try {
      const response = await fetch('/api/calendar/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tutorId,
          dayOfWeek: selectedSlot.date.getDay(),
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          recurring: availabilityForm.recurring,
          specificDate: availabilityForm.recurring ? null : selectedSlot.date
        }),
      });

      if (response.ok) {
        toast.success('Availability set successfully');
        setShowAvailabilityDialog(false);
        fetchCalendarData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to set availability');
      }
    } catch (error) {
      console.error('Error setting availability:', error);
      toast.error('Failed to set availability');
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/calendar/events/${eventId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Event deleted successfully');
        fetchCalendarData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'prev' ? -7 : 7));
    setCurrentDate(newDate);
  };

  const getEventColor = (event: CalendarEvent) => {
    switch (event.type) {
      case 'session':
        switch (event.status) {
          case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-300';
          case 'confirmed': return 'bg-green-100 text-green-800 border-green-300';
          case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
          case 'completed': return 'bg-gray-100 text-gray-800 border-gray-300';
          default: return 'bg-blue-100 text-blue-800 border-blue-300';
        }
      case 'availability':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'break':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'holiday':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDateTime = (date: Date, timeZone: string) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone,
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(date);
  };

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      days.push(date);
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {daysOfWeek.map(day => (
          <div key={day} className="p-2 text-center font-semibold text-sm text-gray-600">
            {day}
          </div>
        ))}
        {days.map((date, index) => {
          if (!date) {
            return <div key={index} className="p-2"></div>;
          }

          const dayEvents = events.filter(event => 
            event.start.toDateString() === date.toDateString()
          );

          const isToday = date.toDateString() === new Date().toDateString();
          const isSelected = selectedDate?.toDateString() === date.toDateString();

          return (
            <div
              key={index}
              className={`
                min-h-24 p-1 border border-gray-200 cursor-pointer hover:bg-gray-50
                ${isToday ? 'bg-blue-50 border-blue-300' : ''}
                ${isSelected ? 'ring-2 ring-blue-500' : ''}
              `}
              onClick={() => handleDateClick(date)}
            >
              <div className="text-sm font-medium mb-1">{date.getDate()}</div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    className={`text-xs p-1 rounded truncate ${getEventColor(event)}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onEventSelect) onEventSelect(event);
                    }}
                  >
                    {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500">+{dayEvents.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push(date);
    }

    return (
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-8 gap-1">
            <div className="p-2"></div>
            {weekDays.map((date, index) => {
              const isToday = date.toDateString() === new Date().toDateString();
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              
              return (
                <div
                  key={index}
                  className={`
                    p-2 text-center border-b cursor-pointer hover:bg-gray-50
                    ${isToday ? 'bg-blue-50' : ''}
                    ${isSelected ? 'ring-2 ring-blue-500' : ''}
                  `}
                  onClick={() => handleDateClick(date)}
                >
                  <div className="font-semibold">{daysOfWeek[date.getDay()]}</div>
                  <div className={`text-sm ${isToday ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>
                    {date.getDate()}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="grid grid-cols-8 gap-1">
            <div className="space-y-1">
              {timeSlots.map(time => (
                <div key={time} className="h-12 text-xs text-gray-500 pr-2 text-right">
                  {time}
                </div>
              ))}
            </div>
            
            {weekDays.map((date, dayIndex) => (
              <div key={dayIndex} className="space-y-1">
                {timeSlots.map(time => {
                  const timeSlot = generateTimeSlots(date).find(slot => slot.time === time);
                  
                  return (
                    <div
                      key={time}
                      className={`
                        h-12 border border-gray-100 p-1 cursor-pointer hover:bg-gray-50
                        ${timeSlot?.available ? 'bg-green-50' : ''}
                        ${selectedDate?.toDateString() === date.toDateString() ? 'bg-blue-50' : ''}
                      `}
                      onClick={() => handleSlotClick(time)}
                    >
                      {timeSlot?.event && (
                        <div
                          className={`text-xs p-1 rounded truncate ${getEventColor(timeSlot.event)}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onEventSelect) onEventSelect(timeSlot.event);
                          }}
                        >
                          {timeSlot.event.title}
                        </div>
                      )}
                      {timeSlot?.available && !timeSlot.event && (
                        <div className="text-xs text-green-600">Available</div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    if (!selectedDate) {
      return <div className="text-center p-8">Select a date to view day schedule</div>;
    }

    const dayEvents = events.filter(event => 
      event.start.toDateString() === selectedDate.toDateString()
    );

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          <div className="text-sm text-gray-600">
            Time zone: {timeZone}
          </div>
        </div>

        <div className="space-y-2">
          {timeSlots.map(time => {
            const event = dayEvents.find(event => 
              event.start.toTimeString().slice(0, 5) === time
            );
            const available = checkAvailability(selectedDate, time);

            return (
              <div
                key={time}
                className={`
                  flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50
                  ${event ? getEventColor(event) : ''}
                  ${available && !event ? 'bg-green-50' : ''}
                `}
                onClick={() => handleSlotClick(time)}
              >
                <div className="w-20 text-sm font-medium">{time}</div>
                <div className="flex-1">
                  {event ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{event.title}</div>
                        <div className="text-sm text-gray-600">
                          {formatDateTime(event.start, timeZone)} - {formatDateTime(event.end, timeZone)}
                        </div>
                        {event.location && (
                          <div className="text-sm text-gray-600 flex items-center">
                            {event.isOnline ? <Video className="h-3 w-3 mr-1" /> : <MapPin className="h-3 w-3 mr-1" />}
                            {event.location}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {event.price && (
                          <Badge variant="outline">${event.price}</Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteEvent(event.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : available ? (
                    <div className="text-green-600 font-medium">Available for booking</div>
                  ) : (
                    <div className="text-gray-400">Not available</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
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
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Calendar & Scheduling</CardTitle>
              <CardDescription>
                Manage your schedule and availability
              </CardDescription>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label>Time Zone:</Label>
                <Select value={timeZone} onValueChange={setTimeZone}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Intl.supportedValuesOf('timeZone').map(tz => (
                      <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => viewMode === 'month' ? navigateMonth('prev') : navigateWeek('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="text-center min-w-[200px]">
                  <div className="font-semibold">
                    {viewMode === 'month' 
                      ? months[currentDate.getMonth()] + ' ' + currentDate.getFullYear()
                      : 'Week of ' + currentDate.toLocaleDateString()
                    }
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => viewMode === 'month' ? navigateMonth('next') : navigateWeek('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-1">
                <Button
                  variant={viewMode === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('month')}
                >
                  Month
                </Button>
                <Button
                  variant={viewMode === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('week')}
                >
                  Week
                </Button>
                <Button
                  variant={viewMode === 'day' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('day')}
                >
                  Day
                </Button>
              </div>
              
              {isTutor && (
                <Button onClick={() => setShowAvailabilityDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Set Availability
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar View */}
      <Card>
        <CardContent className="p-4">
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'day' && renderDayView()}
        </CardContent>
      </Card>

      {/* Event Creation Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              {selectedSlot && (
                <>
                  {selectedSlot.date.toLocaleDateString()} from {selectedSlot.startTime} to {selectedSlot.endTime}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={eventForm.title}
                onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                placeholder="Session title..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={eventForm.description}
                onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                placeholder="Event description..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={eventForm.startTime || selectedSlot?.startTime}
                  onChange={(e) => setEventForm({...eventForm, startTime: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={eventForm.endTime || selectedSlot?.endTime}
                  onChange={(e) => setEventForm({...eventForm, endTime: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={eventForm.location}
                onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
                placeholder="Meeting location or online link..."
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isOnline"
                  checked={eventForm.isOnline}
                  onChange={(e) => setEventForm({...eventForm, isOnline: e.target.checked})}
                />
                <Label htmlFor="isOnline">Online Session</Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  value={eventForm.price}
                  onChange={(e) => setEventForm({...eventForm, price: parseFloat(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                Cancel
              </Button>
              <Button onClick={createEvent}>
                Create Event
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Availability Dialog */}
      <Dialog open={showAvailabilityDialog} onOpenChange={setShowAvailabilityDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Availability</DialogTitle>
            <DialogDescription>
              {selectedSlot && (
                <>
                  Set your availability for {selectedSlot.date.toLocaleDateString()} from {selectedSlot.startTime} to {selectedSlot.endTime}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="recurring"
                checked={availabilityForm.recurring}
                onChange={(e) => setAvailabilityForm({...availabilityForm, recurring: e.target.checked})}
              />
              <Label htmlFor="recurring">Recurring weekly</Label>
            </div>
            
            {!availabilityForm.recurring && selectedSlot && (
              <div className="space-y-2">
                <Label>Specific Date</Label>
                <div className="p-2 bg-gray-100 rounded">
                  {selectedSlot.date.toLocaleDateString()}
                </div>
              </div>
            )}
            
            {availabilityForm.recurring && (
              <div className="space-y-2">
                <Label>Day of Week</Label>
                <Select 
                  value={availabilityForm.dayOfWeek.toString()} 
                  onValueChange={(value) => setAvailabilityForm({...availabilityForm, dayOfWeek: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map((day, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="availStartTime">Start Time</Label>
                <Input
                  id="availStartTime"
                  type="time"
                  value={availabilityForm.startTime}
                  onChange={(e) => setAvailabilityForm({...availabilityForm, startTime: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="availEndTime">End Time</Label>
                <Input
                  id="availEndTime"
                  type="time"
                  value={availabilityForm.endTime}
                  onChange={(e) => setAvailabilityForm({...availabilityForm, endTime: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAvailabilityDialog(false)}>
                Cancel
              </Button>
              <Button onClick={createAvailability}>
                Set Availability
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}