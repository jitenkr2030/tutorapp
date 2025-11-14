'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  Pencil, 
  Eraser, 
  Trash2, 
  Download, 
  Upload, 
  Palette,
  Square,
  Circle,
  Type
} from 'lucide-react'
import { io, Socket } from 'socket.io-client'

interface WhiteboardProps {
  sessionId: string
  userId: string
  userName: string
}

interface DrawingAction {
  type: 'draw' | 'erase' | 'clear' | 'text' | 'shape'
  data: any
  userId: string
  userName: string
  timestamp: string
}

export default function DigitalWhiteboard({ sessionId, userId, userName }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState<'pencil' | 'eraser' | 'text' | 'rectangle' | 'circle'>('pencil')
  const [color, setColor] = useState('#000000')
  const [lineWidth, setLineWidth] = useState(2)
  const [textInput, setTextInput] = useState('')
  const [isAddingText, setIsAddingText] = useState(false)
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 })
  
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)
  const startXRef = useRef(0)
  const startYRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const context = canvas.getContext('2d')
    if (context) {
      context.lineCap = 'round'
      context.strokeStyle = color
      context.lineWidth = lineWidth
      contextRef.current = context
    }

    // Initialize socket connection
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001')
    setSocket(socketInstance)

    socketInstance.on('connect', () => {
      console.log('Whiteboard connected to socket')
    })

    // Handle whiteboard updates from other users
    socketInstance.on('whiteboard-updated', (action: DrawingAction) => {
      if (action.userId !== userId) {
        applyDrawingAction(action)
      }
    })

    return () => {
      socketInstance.disconnect()
    }
  }, [userId])

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = color
      contextRef.current.lineWidth = lineWidth
    }
  }, [color, lineWidth])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!contextRef.current) return

    const { offsetX, offsetY } = e.nativeEvent
    
    if (tool === 'text') {
      setTextPosition({ x: offsetX, y: offsetY })
      setIsAddingText(true)
      return
    }

    setIsDrawing(true)
    startXRef.current = offsetX
    startYRef.current = offsetY

    if (tool === 'pencil') {
      contextRef.current.beginPath()
      contextRef.current.moveTo(offsetX, offsetY)
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current) return

    const { offsetX, offsetY } = e.nativeEvent

    if (tool === 'pencil') {
      contextRef.current.lineTo(offsetX, offsetY)
      contextRef.current.stroke()
    } else if (tool === 'eraser') {
      contextRef.current.save()
      contextRef.current.globalCompositeOperation = 'destination-out'
      contextRef.current.beginPath()
      contextRef.current.arc(offsetX, offsetY, lineWidth * 2, 0, 2 * Math.PI)
      contextRef.current.fill()
      contextRef.current.restore()
    }
  }

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current) return

    const { offsetX, offsetY } = e.nativeEvent

    if (tool === 'rectangle') {
      drawRectangle(startXRef.current, startYRef.current, offsetX, offsetY)
    } else if (tool === 'circle') {
      drawCircle(startXRef.current, startYRef.current, offsetX, offsetY)
    }

    setIsDrawing(false)

    // Send drawing action to other users
    if (socket) {
      const action: DrawingAction = {
        type: tool === 'eraser' ? 'erase' : 'draw',
        data: {
          startX: startXRef.current,
          startY: startYRef.current,
          endX: offsetX,
          endY: offsetY,
          tool,
          color,
          lineWidth
        },
        userId,
        userName,
        timestamp: new Date().toISOString()
      }
      
      socket.emit('whiteboard-update', {
        sessionId,
        update: action
      })
    }
  }

  const drawRectangle = (startX: number, startY: number, endX: number, endY: number) => {
    if (!contextRef.current) return

    const width = endX - startX
    const height = endY - startY

    contextRef.current.strokeRect(startX, startY, width, height)
  }

  const drawCircle = (startX: number, startY: number, endX: number, endY: number) => {
    if (!contextRef.current) return

    const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2))
    
    contextRef.current.beginPath()
    contextRef.current.arc(startX, startY, radius, 0, 2 * Math.PI)
    contextRef.current.stroke()
  }

  const addText = () => {
    if (!textInput.trim() || !contextRef.current) return

    contextRef.current.font = `${lineWidth * 8}px Arial`
    contextRef.current.fillStyle = color
    contextRef.current.fillText(textInput, textPosition.x, textPosition.y)

    // Send text action to other users
    if (socket) {
      const action: DrawingAction = {
        type: 'text',
        data: {
          text: textInput,
          x: textPosition.x,
          y: textPosition.y,
          color,
          fontSize: lineWidth * 8
        },
        userId,
        userName,
        timestamp: new Date().toISOString()
      }
      
      socket.emit('whiteboard-update', {
        sessionId,
        update: action
      })
    }

    setTextInput('')
    setIsAddingText(false)
  }

  const clearCanvas = () => {
    if (!contextRef.current || !canvasRef.current) return

    contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    // Send clear action to other users
    if (socket) {
      const action: DrawingAction = {
        type: 'clear',
        data: {},
        userId,
        userName,
        timestamp: new Date().toISOString()
      }
      
      socket.emit('whiteboard-update', {
        sessionId,
        update: action
      })
    }
  }

  const applyDrawingAction = (action: DrawingAction) => {
    if (!contextRef.current || !canvasRef.current) return

    const originalStrokeStyle = contextRef.current.strokeStyle
    const originalLineWidth = contextRef.current.lineWidth

    switch (action.type) {
      case 'draw':
        contextRef.current.strokeStyle = action.data.color
        contextRef.current.lineWidth = action.data.lineWidth
        
        if (action.data.tool === 'pencil') {
          contextRef.current.beginPath()
          contextRef.current.moveTo(action.data.startX, action.data.startY)
          contextRef.current.lineTo(action.data.endX, action.data.endY)
          contextRef.current.stroke()
        } else if (action.data.tool === 'rectangle') {
          drawRectangle(action.data.startX, action.data.startY, action.data.endX, action.data.endY)
        } else if (action.data.tool === 'circle') {
          drawCircle(action.data.startX, action.data.startY, action.data.endX, action.data.endY)
        }
        break

      case 'erase':
        contextRef.current.save()
        contextRef.current.globalCompositeOperation = 'destination-out'
        contextRef.current.beginPath()
        contextRef.current.arc(action.data.endX, action.data.endY, action.data.lineWidth * 2, 0, 2 * Math.PI)
        contextRef.current.fill()
        contextRef.current.restore()
        break

      case 'text':
        contextRef.current.font = `${action.data.fontSize}px Arial`
        contextRef.current.fillStyle = action.data.color
        contextRef.current.fillText(action.data.text, action.data.x, action.data.y)
        break

      case 'clear':
        contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        break
    }

    // Restore original settings
    contextRef.current.strokeStyle = originalStrokeStyle
    contextRef.current.lineWidth = originalLineWidth
  }

  const downloadCanvas = () => {
    if (!canvasRef.current) return

    const link = document.createElement('a')
    link.download = `whiteboard-${sessionId}-${Date.now()}.png`
    link.href = canvasRef.current.toDataURL()
    link.click()
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Digital Whiteboard
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={downloadCanvas}>
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={clearCanvas}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-2 p-2 bg-muted rounded-lg">
            <Button
              variant={tool === 'pencil' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('pencil')}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant={tool === 'eraser' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('eraser')}
            >
              <Eraser className="w-4 h-4" />
            </Button>
            <Button
              variant={tool === 'text' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('text')}
            >
              <Type className="w-4 h-4" />
            </Button>
            <Button
              variant={tool === 'rectangle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('rectangle')}
            >
              <Square className="w-4 h-4" />
            </Button>
            <Button
              variant={tool === 'circle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('circle')}
            >
              <Circle className="w-4 h-4" />
            </Button>
            
            <Separator orientation="vertical" className="h-8" />
            
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded border cursor-pointer"
            />
            
            <input
              type="range"
              min="1"
              max="20"
              value={lineWidth}
              onChange={(e) => setLineWidth(parseInt(e.target.value))}
              className="w-20"
            />
            <span className="text-sm text-muted-foreground self-center">
              {lineWidth}px
            </span>
          </div>

          {/* Canvas */}
          <div className="border rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              className="w-full h-96 bg-white cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
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
                    <input
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Enter text..."
                      className="w-full p-2 border rounded"
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
        </div>
      </CardContent>
    </Card>
  )
}