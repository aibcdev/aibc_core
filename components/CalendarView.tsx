import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Video, Image as ImageIcon, FileText, Clock, X, Users, User, Calendar, MessageSquare, Send, Tag, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface CalendarEvent {
  id: string;
  date: number;
  title: string;
  description: string;
  type: 'video' | 'image' | 'document' | 'social' | 'email' | 'pr';
  time: string;
  thumbnail?: string;
  // Detailed info
  team?: string;
  status?: 'draft' | 'review' | 'approved' | 'scheduled' | 'published';
  lead?: { name: string; avatar?: string };
  assignee?: { name: string; avatar?: string };
  createdAt?: string;
  deadline?: string;
  platform?: string;
  tasks?: string[];
  comments?: { user: string; text: string; time: string }[];
}

const CalendarView: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [newComment, setNewComment] = useState('');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };
  
  // Load events from Production Room and localStorage
  useEffect(() => {
    const loadEvents = () => {
      try {
        // Get scheduled content from Production Room (stored in localStorage)
        const calendarEvents = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
        const productionAssets = JSON.parse(localStorage.getItem('productionAssets') || '[]');
        
        // Convert to CalendarEvent format
        const scheduledEvents: CalendarEvent[] = calendarEvents.map((event: any) => {
          const eventDate = new Date(event.date);
          return {
            id: event.id,
            date: eventDate.getDate(),
            title: event.title,
            description: event.description || '',
            type: event.type === 'thread' || event.type === 'reel' || event.type === 'carousel' ? 'social' : 
                  event.type === 'podcast' || event.type === 'audio' ? 'video' : 
                  event.type === 'document' ? 'document' : 'video',
            time: event.time || '00:00',
            thumbnail: event.platform === 'X' ? 'blue' : 
                       event.platform === 'YouTube' ? 'red' : 
                       event.platform === 'Instagram' ? 'purple' : 
                       event.platform === 'LinkedIn' ? 'green' : 'black',
            platform: event.platform,
            status: event.status?.toLowerCase() || 'scheduled',
            createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            deadline: eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            tasks: [],
            comments: []
          };
        });
        
        // Also check production assets for scheduled items
        const scheduledAssets = productionAssets
          .filter((asset: any) => asset.status === 'scheduled' && asset.scheduledDate)
          .map((asset: any) => {
            const eventDate = new Date(asset.scheduledDate);
            return {
              id: asset.id,
              date: eventDate.getDate(),
              title: asset.title,
              description: asset.description || '',
              type: asset.type === 'thread' || asset.type === 'reel' || asset.type === 'carousel' ? 'social' : 
                    asset.type === 'podcast' || asset.type === 'audio' ? 'video' : 
                    asset.type === 'document' ? 'document' : 'video',
              time: asset.scheduledTime || '00:00',
              thumbnail: asset.platform === 'X' ? 'blue' : 
                         asset.platform === 'YouTube' ? 'red' : 
                         asset.platform === 'Instagram' ? 'purple' : 
                         asset.platform === 'LinkedIn' ? 'green' : 'black',
              platform: asset.platform,
              status: 'scheduled',
              createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              deadline: eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              tasks: [],
              comments: []
            };
          });
        
        // Merge and deduplicate by id
        const allEvents = [...scheduledEvents, ...scheduledAssets];
        const uniqueEvents = Array.from(
          new Map(allEvents.map(event => [event.id, event])).values()
        );
        
        setEvents(uniqueEvents);
      } catch (e) {
        console.error('Error loading calendar events:', e);
        setEvents([]);
      }
    };
    
    loadEvents();
    
    // Listen for changes from Production Room
    const interval = setInterval(loadEvents, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4 text-red-400" />;
      case 'image': return <ImageIcon className="w-4 h-4 text-green-400" />;
      case 'document': return <FileText className="w-4 h-4 text-blue-400" />;
      case 'social': return <MessageSquare className="w-4 h-4 text-purple-400" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getThumbnailBg = (thumbnail?: string) => {
    if (!thumbnail) return 'bg-[#1A1A1A]';
    const colors: Record<string, string> = {
      'blue': 'bg-gradient-to-br from-blue-600 to-blue-800',
      'red': 'bg-gradient-to-br from-red-600 to-red-800',
      'purple': 'bg-gradient-to-br from-purple-600 to-pink-600',
      'black': 'bg-gradient-to-br from-gray-800 to-black border border-white/10',
      'orange': 'bg-gradient-to-br from-orange-500 to-amber-600',
      'green': 'bg-gradient-to-br from-green-600 to-emerald-700',
    };
    return colors[thumbnail] || 'bg-[#1A1A1A]';
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'draft': return 'bg-white/10 text-white/60 border-white/20';
      case 'review': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'scheduled': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'published': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-white/10 text-white/60 border-white/20';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'draft': return <FileText className="w-3 h-3" />;
      case 'review': return <AlertCircle className="w-3 h-3" />;
      case 'approved': return <CheckCircle className="w-3 h-3" />;
      case 'scheduled': return <Clock className="w-3 h-3" />;
      case 'published': return <CheckCircle className="w-3 h-3" />;
      default: return <Loader2 className="w-3 h-3" />;
    }
  };

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const handleAddComment = () => {
    if (newComment.trim() && selectedEvent) {
      // In production, this would save to backend
      console.log('Adding comment:', newComment);
      setNewComment('');
    }
  };

  return (
    <div className="h-full flex">
      {/* Main Calendar Area */}
      <div className={`flex-1 overflow-y-auto transition-all duration-300 ${selectedEvent ? 'mr-[420px]' : ''}`}>
        <div className="max-w-[1400px] mx-auto space-y-6 p-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">Schedule</h1>
              <p className="text-white/40 text-sm uppercase tracking-wider">Content Publication Calendar</p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-white/60" />
              </button>
              <span className="text-lg font-bold text-white px-4">{monthName}</span>
              <button 
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-white/60" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {days.map((day) => (
                <div key={day} className="text-center text-xs font-bold text-white/40 uppercase tracking-wider py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => {
                const dayEvents = events.filter(e => {
                  // Handle both date formats
                  if (typeof e.date === 'number') {
                    return e.date === day;
                  } else {
                    // If date is stored as string, parse it
                    try {
                      const eventDate = new Date(e.date);
                      return eventDate.getDate() === day && 
                             eventDate.getMonth() === currentMonth.getMonth() && 
                             eventDate.getFullYear() === currentMonth.getFullYear();
                    } catch {
                      return false;
                    }
                  }
                });
                const today = new Date();
                const isToday = day === today.getDate() && 
                               currentMonth.getMonth() === today.getMonth() && 
                               currentMonth.getFullYear() === today.getFullYear();
                
                return (
                  <div
                    key={index}
                    className={`min-h-[120px] border border-white/5 rounded-lg p-2 ${
                      day ? 'bg-[#080808] hover:bg-[#0A0A0A]' : 'bg-transparent'
                    } ${isToday ? 'ring-2 ring-green-500/50' : ''}`}
                  >
                    {day && (
                      <>
                        <div className={`text-xs font-bold mb-2 ${isToday ? 'text-green-400' : 'text-white/60'}`}>
                          {day}
                        </div>
                        {dayEvents.map((event) => (
                          <div
                            key={event.id}
                            className="mb-2 group cursor-pointer"
                            onClick={() => setSelectedEvent(event)}
                          >
                            <div className={`${getThumbnailBg(event.thumbnail)} rounded-lg p-2 relative overflow-hidden hover:ring-2 hover:ring-white/20 transition-all`}>
                              <div className="absolute top-1 right-1">
                                {getEventIcon(event.type)}
                              </div>
                              <div className="mt-6">
                                <div className="text-[10px] font-bold text-white mb-1 truncate">{event.title}</div>
                                {event.time && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                                    <span className="text-[9px] text-white/80">{event.time}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Event Detail Side Panel */}
      {selectedEvent && (
        <div className="fixed top-0 right-0 w-[420px] h-full bg-[#0A0A0A] border-l border-white/10 flex flex-col animate-in slide-in-from-right duration-300 z-50 overflow-hidden">
          {/* Panel Header */}
          <div className="flex-shrink-0 p-5 border-b border-white/10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-white/40">Shared to <span className="text-white font-medium">Main Board</span></span>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="p-1.5 text-white/40 hover:text-white hover:bg-white/5 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-5 space-y-5">
              {/* Title */}
              <h2 className="text-2xl font-bold text-white leading-tight">{selectedEvent.title}</h2>

              {/* Meta Info */}
              <div className="space-y-4">
                {/* Team */}
                {selectedEvent.team && (
                  <div className="flex items-center">
                    <span className="w-24 text-sm text-white/40">Team</span>
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-white">{selectedEvent.platform || 'Content'}</span>
                    </div>
                  </div>
                )}

                {/* Status */}
                {selectedEvent.status && (
                  <div className="flex items-center">
                    <span className="w-24 text-sm text-white/40">Status</span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${getStatusColor(selectedEvent.status)}`}>
                      {getStatusIcon(selectedEvent.status)}
                      {selectedEvent.status.toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Lead */}
                {selectedEvent.lead && (
                  <div className="flex items-center">
                    <span className="w-24 text-sm text-white/40">Lead</span>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                        <User className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm text-white">{selectedEvent.lead.name}</span>
                    </div>
                  </div>
                )}

                {/* Assignee */}
                {selectedEvent.assignee && (
                  <div className="flex items-center">
                    <span className="w-24 text-sm text-white/40">Assignee</span>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                        <User className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm text-white">{selectedEvent.assignee.name}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-white/5"></div>

              {/* Dates */}
              <div className="space-y-3">
                {selectedEvent.createdAt && (
                  <div className="flex items-center">
                    <span className="w-24 text-sm text-white/40">Created</span>
                    <span className="text-sm text-white/70">{selectedEvent.createdAt}</span>
                  </div>
                )}
                {selectedEvent.deadline && (
                  <div className="flex items-center">
                    <span className="w-24 text-sm text-white/40">Deadline</span>
                    <span className="text-sm text-red-400 font-medium">{selectedEvent.deadline}</span>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-white/5"></div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Description</h3>
                <p className="text-sm text-white/70 leading-relaxed mb-4">{selectedEvent.description}</p>
                
                {/* Tasks */}
                {selectedEvent.tasks && selectedEvent.tasks.length > 0 && (
                  <ul className="space-y-2">
                    {selectedEvent.tasks.map((task, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-white/60">
                        <span className="text-white/30 mt-0.5">•</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-white/5"></div>

              {/* Comments Section */}
              <div>
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">Comments</h3>
                
                {/* Comment Input */}
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Leave a comment..."
                    className="flex-1 bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-white/20 focus:outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  />
                  <button 
                    onClick={handleAddComment}
                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <Send className="w-4 h-4 text-white/60" />
                  </button>
                </div>

                {/* Existing Comments */}
                {selectedEvent.comments && selectedEvent.comments.length > 0 ? (
                  <div className="space-y-4">
                    {selectedEvent.comments.map((comment, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-white">{comment.user}</span>
                            <span className="text-xs text-white/30">{comment.time}</span>
                          </div>
                          <p className="text-sm text-white/60">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-white/30 text-center py-4">No comments yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Panel Footer */}
          <div className="flex-shrink-0 p-5 border-t border-white/10">
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  // Navigate to Production Room to edit this content
                  const event = new CustomEvent('navigateToPage', { detail: { page: 'production', assetId: selectedEvent?.id } });
                  window.dispatchEvent(event);
                  setSelectedEvent(null);
                }}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium rounded-xl transition-colors"
              >
                Edit
              </button>
              <button 
                onClick={() => {
                  // Mark event as complete
                  if (selectedEvent) {
                    const updatedEvents = events.map(e => 
                      e.id === selectedEvent.id 
                        ? { ...e, status: 'published' as const }
                        : e
                    );
                    setEvents(updatedEvents);
                    localStorage.setItem('calendarEvents', JSON.stringify(updatedEvents));
                    setSelectedEvent(null);
                  }
                }}
                className="flex-1 py-2.5 bg-green-500 hover:bg-green-400 text-black text-sm font-bold rounded-xl transition-colors"
              >
                Mark Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
