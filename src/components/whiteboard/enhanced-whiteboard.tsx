"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Pencil, 
  Eraser, 
  Trash2, 
  Download, 
  Upload, 
  Palette,
  Square,
  Circle,
  Type,
  Triangle,
  Line,
  Undo,
  Redo,
  Save,
  Share,
  Users,
  MessageSquare,
  Layers,
  Grid,
  ZoomIn,
  ZoomOut,
  Move,
  Hand,
  Image,
  FileText,
  Calculator,
  Shapes,
  StickyNote,
  Highlighter,
  Marker,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Settings,
  History,
  Star
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

interface WhiteboardProps {
  sessionId: string;
  userId: string;
  userName: string;
  isTutor: boolean;
}

interface DrawingAction {
  id: string;
  type: 'draw' | 'erase' | 'clear' | 'text' | 'shape' | 'image' | 'sticky-note';
  data: any;
  userId: string;
  userName: string;
  timestamp: string;
  layer: number;
}

interface WhiteboardUser {
  id: string;
  name: string;
  color: string;
  isTutor: boolean;
  isActive: boolean;
  lastSeen: string;
}

interface WhiteboardTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  data: any;
}

interface CollaborativeCursor {
  userId: string;
  userName: string;
  x: number;
  y: number;
  color: string;
}

export default function EnhancedWhiteboard({ sessionId, userId, userName, isTutor }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pencil' | 'eraser' | 'text' | 'rectangle' | 'circle' | 'triangle' | 'line' | 'arrow' | 'highlighter' | 'sticky-note'>('pencil');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [textInput, setTextInput] = useState('');
  const [isAddingText, setIsAddingText] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [currentLayer, setCurrentLayer] = useState(0);
  const [layers, setLayers] = useState([{ id: 0, name: 'Main Layer', visible: true, locked: false }]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [history, setHistory] = useState<DrawingAction[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [users, setUsers] = useState<WhiteboardUser[]>([]);
  const [collaborativeCursors, setCollaborativeCursors] = useState<CollaborativeCursor[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WhiteboardTemplate | null>(null);
  const [whiteboardLocked, setWhiteboardLocked] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [stickyNotes, setStickyNotes] = useState<Array<{id: string, x: number, y: number, text: string, color: string}>>([]);
  const [isAddingStickyNote, setIsAddingStickyNote] = useState(false);
  
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const panStartRef = useRef({ x: 0, y: 0 });

  // Whiteboard templates
  const templates: WhiteboardTemplate[] = [
    {
      id: 'math-grid',
      name: 'Math Grid',
      description: 'Grid paper for mathematical problems',
      category: 'Education',
      thumbnail: '',
      data: { type: 'grid', spacing: 20 }
    },
    {
      id: 'essay-outline',
      name: 'Essay Outline',
      description: 'Structured template for essay planning',
      category: 'Writing',
      thumbnail: '',
      data: { type: 'outline', sections: ['Introduction', 'Body 1', 'Body 2', 'Body 3', 'Conclusion'] }
    },
    {
      id: 'science-diagram',
      name: 'Science Diagram',
      description: 'Template for scientific diagrams',
      category: 'Science',
      thumbnail: '',
      data: { type: 'diagram' }
    },
    {
      id: 'mind-map',
      name: 'Mind Map',
      description: 'Template for brainstorming and mind mapping',
      category: 'Planning',
      thumbnail: '',
      data: { type: 'mindmap' }
    }
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const context = canvas.getContext('2d');
    if (context) {
      context.lineCap = 'round';
      context.strokeStyle = color;
      context.lineWidth = lineWidth;
      contextRef.current = context;
    }

    // Initialize socket connection
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000');
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Enhanced whiteboard connected to socket');
      
      // Join whiteboard room
      socketInstance.emit('join-whiteboard', {
        sessionId,
        userId,
        userName,
        isTutor
      });
    });

    // Handle whiteboard updates from other users
    socketInstance.on('whiteboard-updated', (action: DrawingAction) => {
      if (action.userId !== userId) {
        applyDrawingAction(action);
        addToHistory(action);
      }
    });

    // Handle user presence
    socketInstance.on('whiteboard-users', (usersList: WhiteboardUser[]) => {
      setUsers(usersList);
    });

    // Handle collaborative cursors
    socketInstance.on('cursor-move', (cursor: CollaborativeCursor) => {
      if (cursor.userId !== userId) {
        setCollaborativeCursors(prev => {
          const existing = prev.find(c => c.userId === cursor.userId);
          if (existing) {
            return prev.map(c => c.userId === cursor.userId ? cursor : c);
          }
          return [...prev, cursor];
        });
      }
    });

    // Handle whiteboard lock state
    socketInstance.on('whiteboard-locked', (locked: boolean, byUserId: string, byUserName: string) => {
      setWhiteboardLocked(locked);
      if (locked && byUserId !== userId) {
        toast.info(`Whiteboard locked by ${byUserName}`);
      }
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [userId, sessionId, userName, isTutor]);

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = color;
      contextRef.current.lineWidth = lineWidth;
    }
  }, [color, lineWidth]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (whiteboardLocked || !contextRef.current) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    
    if (tool === 'text') {
      setTextPosition({ x, y });
      setIsAddingText(true);
      return;
    }

    if (tool === 'sticky-note') {
      setStickyNotes(prev => [...prev, {
        id: `note-${Date.now()}`,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        text: 'New note',
        color: '#ffeb3b'
      }]);
      return;
    }

    if (tool === 'pan') {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      return;
    }

    setIsDrawing(true);
    startXRef.current = x;
    startYRef.current = y;

    if (tool === 'pencil' || tool === 'highlighter') {
      contextRef.current.beginPath();
      contextRef.current.moveTo(x, y);
      
      if (tool === 'highlighter') {
        contextRef.current.globalAlpha = 0.3;
        contextRef.current.lineWidth = lineWidth * 3;
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing && !isPanning) return;
    if (!contextRef.current) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    if (isPanning) {
      setPan({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y
      });
      return;
    }

    // Send cursor position
    if (socket) {
      socket.emit('cursor-move', {
        sessionId,
        userId,
        userName,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        color: users.find(u => u.id === userId)?.color || '#000000'
      });
    }

    if (tool === 'pencil') {
      contextRef.current.lineTo(x, y);
      contextRef.current.stroke();
    } else if (tool === 'highlighter') {
      contextRef.current.lineTo(x, y);
      contextRef.current.stroke();
    } else if (tool === 'eraser') {
      contextRef.current.save();
      contextRef.current.globalCompositeOperation = 'destination-out';
      contextRef.current.beginPath();
      contextRef.current.arc(x, y, lineWidth * 2, 0, 2 * Math.PI);
      contextRef.current.fill();
      contextRef.current.restore();
    }
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing && !isPanning) return;
    if (!contextRef.current) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    if (isPanning) {
      setIsPanning(false);
      return;
    }

    let action: DrawingAction | null = null;

    if (tool === 'rectangle') {
      drawRectangle(startXRef.current, startYRef.current, x, y);
      action = createDrawingAction('shape', {
        shape: 'rectangle',
        startX: startXRef.current,
        startY: startYRef.current,
        endX: x,
        endY: y,
        color,
        lineWidth
      });
    } else if (tool === 'circle') {
      drawCircle(startXRef.current, startYRef.current, x, y);
      action = createDrawingAction('shape', {
        shape: 'circle',
        startX: startXRef.current,
        startY: startYRef.current,
        endX: x,
        endY: y,
        color,
        lineWidth
      });
    } else if (tool === 'triangle') {
      drawTriangle(startXRef.current, startYRef.current, x, y);
      action = createDrawingAction('shape', {
        shape: 'triangle',
        startX: startXRef.current,
        startY: startYRef.current,
        endX: x,
        endY: y,
        color,
        lineWidth
      });
    } else if (tool === 'line') {
      drawLine(startXRef.current, startYRef.current, x, y);
      action = createDrawingAction('shape', {
        shape: 'line',
        startX: startXRef.current,
        startY: startYRef.current,
        endX: x,
        endY: y,
        color,
        lineWidth
      });
    } else if (tool === 'pencil' || tool === 'highlighter') {
      action = createDrawingAction('draw', {
        startX: startXRef.current,
        startY: startYRef.current,
        endX: x,
        endY: y,
        tool,
        color,
        lineWidth
      });
      
      if (tool === 'highlighter') {
        contextRef.current.globalAlpha = 1;
        contextRef.current.lineWidth = lineWidth;
      }
    } else if (tool === 'eraser') {
      action = createDrawingAction('erase', {
        x,
        y,
        lineWidth
      });
    }

    setIsDrawing(false);

    if (action && socket) {
      socket.emit('whiteboard-update', {
        sessionId,
        update: action
      });
      addToHistory(action);
    }
  };

  const createDrawingAction = (type: DrawingAction['type'], data: any): DrawingAction => {
    return {
      id: `action-${Date.now()}`,
      type,
      data,
      userId,
      userName,
      timestamp: new Date().toISOString(),
      layer: currentLayer
    };
  };

  const addToHistory = (action: DrawingAction) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      return [...newHistory, action];
    });
    setHistoryIndex(prev => prev + 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      redrawCanvas();
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      redrawCanvas();
    }
  };

  const redrawCanvas = () => {
    if (!contextRef.current || !canvasRef.current) return;

    contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Draw grid if enabled
    if (showGrid) {
      drawGrid();
    }

    // Redraw all actions up to current history index
    for (let i = 0; i <= historyIndex; i++) {
      applyDrawingAction(history[i]);
    }
  };

  const drawGrid = () => {
    if (!contextRef.current || !canvasRef.current) return;

    const context = contextRef.current;
    const canvas = canvasRef.current;
    const gridSize = 20 * zoom;

    context.save();
    context.strokeStyle = '#e0e0e0';
    context.lineWidth = 1;
    context.globalAlpha = 0.5;

    // Vertical lines
    for (let x = pan.x % gridSize; x < canvas.width; x += gridSize) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, canvas.height);
      context.stroke();
    }

    // Horizontal lines
    for (let y = pan.y % gridSize; y < canvas.height; y += gridSize) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(canvas.width, y);
      context.stroke();
    }

    context.restore();
  };

  const drawRectangle = (startX: number, startY: number, endX: number, endY: number) => {
    if (!contextRef.current) return;

    const width = endX - startX;
    const height = endY - startY;

    contextRef.current.strokeRect(startX, startY, width, height);
  };

  const drawCircle = (startX: number, startY: number, endX: number, endY: number) => {
    if (!contextRef.current) return;

    const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
    
    contextRef.current.beginPath();
    contextRef.current.arc(startX, startY, radius, 0, 2 * Math.PI);
    contextRef.current.stroke();
  };

  const drawTriangle = (startX: number, startY: number, endX: number, endY: number) => {
    if (!contextRef.current) return;

    contextRef.current.beginPath();
    contextRef.current.moveTo(startX, startY);
    contextRef.current.lineTo(endX, endY);
    contextRef.current.lineTo(startX - (endX - startX), endY);
    contextRef.current.closePath();
    contextRef.current.stroke();
  };

  const drawLine = (startX: number, startY: number, endX: number, endY: number) => {
    if (!contextRef.current) return;

    contextRef.current.beginPath();
    contextRef.current.moveTo(startX, startY);
    contextRef.current.lineTo(endX, endY);
    contextRef.current.stroke();
  };

  const addText = () => {
    if (!textInput.trim() || !contextRef.current) return;

    contextRef.current.font = `${lineWidth * 8}px Arial`;
    contextRef.current.fillStyle = color;
    contextRef.current.fillText(textInput, textPosition.x, textPosition.y);

    const action = createDrawingAction('text', {
      text: textInput,
      x: textPosition.x,
      y: textPosition.y,
      color,
      fontSize: lineWidth * 8
    });

    if (socket) {
      socket.emit('whiteboard-update', {
        sessionId,
        update: action
      });
    }

    addToHistory(action);
    setTextInput('');
    setIsAddingText(false);
  };

  const clearCanvas = () => {
    if (!contextRef.current || !canvasRef.current) return;

    contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const action = createDrawingAction('clear', {});

    if (socket) {
      socket.emit('whiteboard-update', {
        sessionId,
        update: action
      });
    }

    addToHistory(action);
  };

  const applyDrawingAction = (action: DrawingAction) => {
    if (!contextRef.current || !canvasRef.current) return;

    const originalStrokeStyle = contextRef.current.strokeStyle;
    const originalLineWidth = contextRef.current.lineWidth;

    switch (action.type) {
      case 'draw':
        contextRef.current.strokeStyle = action.data.color;
        contextRef.current.lineWidth = action.data.lineWidth;
        
        if (action.data.tool === 'highlighter') {
          contextRef.current.globalAlpha = 0.3;
          contextRef.current.lineWidth = action.data.lineWidth * 3;
        }
        
        contextRef.current.beginPath();
        contextRef.current.moveTo(action.data.startX, action.data.startY);
        contextRef.current.lineTo(action.data.endX, action.data.endY);
        contextRef.current.stroke();
        
        if (action.data.tool === 'highlighter') {
          contextRef.current.globalAlpha = 1;
        }
        break;

      case 'erase':
        contextRef.current.save();
        contextRef.current.globalCompositeOperation = 'destination-out';
        contextRef.current.beginPath();
        contextRef.current.arc(action.data.x, action.data.y, action.data.lineWidth * 2, 0, 2 * Math.PI);
        contextRef.current.fill();
        contextRef.current.restore();
        break;

      case 'text':
        contextRef.current.font = `${action.data.fontSize}px Arial`;
        contextRef.current.fillStyle = action.data.color;
        contextRef.current.fillText(action.data.text, action.data.x, action.data.y);
        break;

      case 'shape':
        contextRef.current.strokeStyle = action.data.color;
        contextRef.current.lineWidth = action.data.lineWidth;
        
        switch (action.data.shape) {
          case 'rectangle':
            drawRectangle(action.data.startX, action.data.startY, action.data.endX, action.data.endY);
            break;
          case 'circle':
            drawCircle(action.data.startX, action.data.startY, action.data.endX, action.data.endY);
            break;
          case 'triangle':
            drawTriangle(action.data.startX, action.data.startY, action.data.endX, action.data.endY);
            break;
          case 'line':
            drawLine(action.data.startX, action.data.startY, action.data.endX, action.data.endY);
            break;
        }
        break;

      case 'clear':
        contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        break;
    }

    contextRef.current.strokeStyle = originalStrokeStyle;
    contextRef.current.lineWidth = originalLineWidth;
  };

  const downloadCanvas = () => {
    if (!canvasRef.current) return;

    const link = document.createElement('a');
    link.download = `whiteboard-${sessionId}-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const toggleWhiteboardLock = () => {
    const newLockedState = !whiteboardLocked;
    setWhiteboardLocked(newLockedState);
    
    if (socket) {
      socket.emit('lock-whiteboard', {
        sessionId,
        locked: newLockedState,
        userId,
        userName
      });
    }
    
    toast(newLockedState ? 'Whiteboard locked' : 'Whiteboard unlocked');
  };

  const applyTemplate = (template: WhiteboardTemplate) => {
    // In a real implementation, this would apply the template to the canvas
    toast(`Template "${template.name}" applied`);
    setShowTemplates(false);
    setSelectedTemplate(null);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Enhanced Whiteboard</span>
            {whiteboardLocked && (
              <Badge variant="destructive">
                <Lock className="w-3 h-3 mr-1" />
                Locked
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {users.filter(u => u.isActive).length}
            </Badge>
            <Button variant="outline" size="sm" onClick={downloadCanvas}>
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={clearCanvas}>
              <Trash2 className="w-4 h-4" />
            </Button>
            {isTutor && (
              <Button variant="outline" size="sm" onClick={toggleWhiteboardLock}>
                {whiteboardLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          Collaborative whiteboard with advanced tools and real-time collaboration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Main Toolbar */}
          <div className="flex flex-wrap gap-2 p-2 bg-muted rounded-lg">
            {/* Drawing Tools */}
            <Button
              variant={tool === 'pencil' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('pencil')}
              disabled={whiteboardLocked}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant={tool === 'eraser' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('eraser')}
              disabled={whiteboardLocked}
            >
              <Eraser className="w-4 h-4" />
            </Button>
            <Button
              variant={tool === 'highlighter' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('highlighter')}
              disabled={whiteboardLocked}
            >
              <Highlighter className="w-4 h-4" />
            </Button>
            
            <Separator orientation="vertical" className="h-8" />
            
            {/* Shape Tools */}
            <Button
              variant={tool === 'rectangle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('rectangle')}
              disabled={whiteboardLocked}
            >
              <Square className="w-4 h-4" />
            </Button>
            <Button
              variant={tool === 'circle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('circle')}
              disabled={whiteboardLocked}
            >
              <Circle className="w-4 h-4" />
            </Button>
            <Button
              variant={tool === 'triangle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('triangle')}
              disabled={whiteboardLocked}
            >
              <Triangle className="w-4 h-4" />
            </Button>
            <Button
              variant={tool === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('line')}
              disabled={whiteboardLocked}
            >
              <Line className="w-4 h-4" />
            </Button>
            
            <Separator orientation="vertical" className="h-8" />
            
            {/* Text and Notes */}
            <Button
              variant={tool === 'text' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('text')}
              disabled={whiteboardLocked}
            >
              <Type className="w-4 h-4" />
            </Button>
            <Button
              variant={tool === 'sticky-note' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('sticky-note')}
              disabled={whiteboardLocked}
            >
              <StickyNote className="w-4 h-4" />
            </Button>
            
            <Separator orientation="vertical" className="h-8" />
            
            {/* View Tools */}
            <Button
              variant={tool === 'pan' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('pan')}
            >
              <Hand className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setZoom(zoom + 0.1)}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowGrid(!showGrid)}>
              <Grid className="w-4 h-4" />
            </Button>
            
            <Separator orientation="vertical" className="h-8" />
            
            {/* History */}
            <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0}>
              <Undo className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
              <Redo className="w-4 h-4" />
            </Button>
            
            <Separator orientation="vertical" className="h-8" />
            
            {/* Templates */}
            <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Whiteboard Templates</DialogTitle>
                  <DialogDescription>
                    Choose a template to get started quickly
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-sm">{template.name}</CardTitle>
                        <CardDescription className="text-xs">{template.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => applyTemplate(template)}
                        >
                          Apply Template
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            
            {/* Color and Size Controls */}
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded border cursor-pointer"
              disabled={whiteboardLocked}
            />
            
            <input
              type="range"
              min="1"
              max="20"
              value={lineWidth}
              onChange={(e) => setLineWidth(parseInt(e.target.value))}
              className="w-20"
              disabled={whiteboardLocked}
            />
            <span className="text-sm text-muted-foreground self-center">
              {lineWidth}px
            </span>
          </div>

          {/* Active Users */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Active users:</span>
            {users.filter(u => u.isActive).map((user) => (
              <Badge key={user.id} variant="outline" className="flex items-center gap-1">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: user.color }}
                />
                {user.name}
                {user.isTutor && <Star className="w-3 h-3" />}
              </Badge>
            ))}
          </div>

          {/* Canvas Container */}
          <div className="relative border rounded-lg overflow-hidden bg-white">
            <canvas
              ref={canvasRef}
              className="w-full h-96 cursor-crosshair"
              style={{
                transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                transformOrigin: '0 0'
              }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
            
            {/* Collaborative Cursors */}
            {collaborativeCursors.map((cursor) => (
              <div
                key={cursor.userId}
                className="absolute pointer-events-none z-10"
                style={{
                  left: cursor.x,
                  top: cursor.y,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="flex items-center gap-1 bg-black/80 text-white text-xs px-2 py-1 rounded">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: cursor.color }}
                  />
                  {cursor.userName}
                </div>
              </div>
            ))}
            
            {/* Sticky Notes */}
            {stickyNotes.map((note) => (
              <div
                key={note.id}
                className="absolute p-2 rounded shadow-lg max-w-xs"
                style={{
                  left: note.x,
                  top: note.y,
                  backgroundColor: note.color,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <Textarea
                  value={note.text}
                  onChange={(e) => {
                    setStickyNotes(prev => 
                      prev.map(n => n.id === note.id ? { ...n, text: e.target.value } : n)
                    );
                  }}
                  className="min-h-[60px] border-0 bg-transparent resize-none text-sm"
                  placeholder="Type your note..."
                />
              </div>
            ))}
          </div>

          {/* Text Input Modal */}
          {isAddingText && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-96">
                <CardHeader>
                  <CardTitle>Add Text</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Input
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Enter text..."
                      autoFocus
                      onKeyPress={(e) => e.key === 'Enter' && addText()}
                    />
                    <div className="flex gap-2">
                      <Button onClick={addText} disabled={!textInput.trim()}>
                        Add
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddingText(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Status Bar */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Tool: {tool}</span>
              <span>Zoom: {Math.round(zoom * 100)}%</span>
              <span>Layer: {currentLayer + 1}</span>
            </div>
            <div className="flex items-center gap-4">
              <span>History: {historyIndex + 1}/{history.length}</span>
              {whiteboardLocked && <span className="text-red-500">Whiteboard Locked</span>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}