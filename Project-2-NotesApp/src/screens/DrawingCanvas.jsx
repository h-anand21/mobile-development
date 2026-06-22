import React, { useState, useRef } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Path, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = [
  '#000000', // Black
  '#6B7280', // Gray
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber/Yellow
  '#10B981', // Green
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#78350F', // Brown
];

const EXTRA_COLORS = [
  '#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA', '#FFC6FF', // Pastels
  '#FF007F', '#7FFF00', '#00FFFF', '#FF00FF', '#FFFF00', '#00FF00', // Brights
  '#800000', '#808000', '#008000', '#008080', '#000080', '#800080', // Classics
  '#4A0E4E', '#1A365D', '#2C3E50', '#16A085', '#27AE60', '#D35400', // Muted / Dark
];

const BRUSH_SIZES = [2, 4, 8, 12, 16];

export default function DrawingCanvas({ visible, onClose, onSave, theme, initialLines }) {
  const insets = useSafeAreaInsets();
  const [lines, setLines] = useState(initialLines || []);
  const [currentLine, setCurrentLine] = useState([]);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(4);
  
  // Tool state: 'pen', 'marker', 'highlighter', 'shape', 'eraser', 'select'
  const [tool, setTool] = useState('pen');
  const [selectedShape, setSelectedShape] = useState('rectangle'); // 'line', 'rectangle', 'circle', 'triangle', 'hexagon', 'star', 'arrow'
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(true);
  const [selectedLineIndex, setSelectedLineIndex] = useState(null);
  const [dragStartPoint, setDragStartPoint] = useState(null);

  // Advanced States
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 350, height: 450 });
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [resizeSide, setResizeSide] = useState(null); // 'left', 'right', 'top', 'bottom'
  const [isPanningTwoFingers, setIsPanningTwoFingers] = useState(false);
  const [resizeStartBox, setResizeStartBox] = useState(null);
  const [originalLine, setOriginalLine] = useState(null);
  const [shapeText, setShapeText] = useState('');
  const [isTextInputVisible, setIsTextInputVisible] = useState(false);
  const canvasRef = useRef(null);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });

  const updateCanvasOffset = () => {
    canvasRef.current?.measure((x, y, width, height, pageX, pageY) => {
      if (pageX !== undefined && pageY !== undefined) {
        setCanvasOffset({ x: pageX, y: pageY });
      }
    });
  };

  const getBoundingBox = (line) => {
    if (!line || line.length === 0) return null;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    line.forEach((p) => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });
    return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
  };

  const checkProximityAndErase = (x, y) => {
    setLines((prevLines) =>
      prevLines.filter((line) => {
        const isClose = line.some((point) => {
          const dx = point.x - x;
          const dy = point.y - y;
          return Math.sqrt(dx * dx + dy * dy) < 25; // 25px erase radius
        });
        return !isClose;
      })
    );
  };

  const findClosestLineIndex = (x, y) => {
    // 1. Check if touch is inside the bounding box of a closed shape
    for (let idx = lines.length - 1; idx >= 0; idx--) {
      const line = lines[idx];
      if (line && line.length >= 3) {
        const first = line[0];
        const last = line[line.length - 1];
        if (first && last) {
          // Check if path is closed (start and end points are near each other)
          const isClosed = Math.sqrt((first.x - last.x) ** 2 + (first.y - last.y) ** 2) < 15;
          if (isClosed) {
            const box = getBoundingBox(line);
            if (box && x >= box.minX && x <= box.maxX && y >= box.minY && y <= box.maxY) {
              return idx;
            }
          }
        }
      }
    }

    // 2. Fall back to point proximity (closest line path)
    let closestIndex = null;
    let minDistance = 35; // 35px selection radius
    
    lines.forEach((line, idx) => {
      line.forEach((point) => {
        const dx = point.x - x;
        const dy = point.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDistance) {
          minDistance = dist;
          closestIndex = idx;
        }
      });
    });
    
    return closestIndex;
  };

  const handleCanvasLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    setCanvasSize({ width: width || 350, height: height || 450 });
    updateCanvasOffset();
  };

  const handleTouchStart = (event) => {
    updateCanvasOffset();
    const touches = event.nativeEvent.touches;
    
    // 2-Finger scroll canvas detection
    if (touches && touches.length === 2) {
      const p1 = touches[0];
      const p2 = touches[1];
      const midX = canvasOffset.x !== 0 
        ? ((p1.pageX + p2.pageX) / 2) - canvasOffset.x 
        : (p1.locationX + p2.locationX) / 2;
      const midY = canvasOffset.y !== 0 
        ? ((p1.pageY + p2.pageY) / 2) - canvasOffset.y 
        : (p1.locationY + p2.locationY) / 2;
      setDragStartPoint({ x: midX, y: midY });
      setIsPanningTwoFingers(true);
      return;
    }

    setIsPanningTwoFingers(false);

    const { pageX, pageY, locationX, locationY } = event.nativeEvent;
    const actualX = canvasOffset.x !== 0 
      ? pageX - canvasOffset.x + panOffset.x 
      : locationX + panOffset.x;
    const actualY = canvasOffset.y !== 0 
      ? pageY - canvasOffset.y + panOffset.y 
      : locationY + panOffset.y;

    if (tool === 'eraser') {
      checkProximityAndErase(actualX, actualY);
    } else if (tool === 'select') {
      if (selectedLineIndex !== null) {
        const box = getBoundingBox(lines[selectedLineIndex]);
        if (box) {
          const cx = (box.minX + box.maxX) / 2;
          const cy = (box.minY + box.maxY) / 2;

          // 1. Delete Handle (Top-Left)
          if (Math.sqrt((actualX - box.minX) ** 2 + (actualY - box.minY) ** 2) < 20) {
            setLines((prev) => prev.filter((_, i) => i !== selectedLineIndex));
            setSelectedLineIndex(null);
            return;
          }

          // 2. Duplicate Handle (Top-Right)
          if (Math.sqrt((actualX - box.maxX) ** 2 + (actualY - box.minY) ** 2) < 20) {
            const sourceLine = lines[selectedLineIndex];
            const duplicatedLine = sourceLine.map(p => ({
              ...p,
              x: p.x + 25,
              y: p.y + 25
            }));
            setLines((prev) => {
              const next = [...prev, duplicatedLine];
              setSelectedLineIndex(next.length - 1);
              return next;
            });
            return;
          }

          // 3. Text Handle (Bottom-Left)
          if (Math.sqrt((actualX - box.minX) ** 2 + (actualY - box.maxY) ** 2) < 20) {
            setShapeText(lines[selectedLineIndex][0]?.text || '');
            setIsTextInputVisible(true);
            return;
          }

          // 4. Rotate Handle (Bottom-Right)
          if (Math.sqrt((actualX - box.maxX) ** 2 + (actualY - box.maxY) ** 2) < 20) {
            setIsRotating(true);
            setDragStartPoint({ x: actualX, y: actualY });
            setResizeStartBox(box);
            setOriginalLine(lines[selectedLineIndex]);
            return;
          }

          // 5. Left Resize Handle (Left-Center Dot)
          if (Math.sqrt((actualX - box.minX) ** 2 + (actualY - cy) ** 2) < 18) {
            setResizeSide('left');
            setDragStartPoint({ x: actualX, y: actualY });
            setResizeStartBox(box);
            setOriginalLine(lines[selectedLineIndex]);
            return;
          }

          // 6. Right Resize Handle (Right-Center Dot)
          if (Math.sqrt((actualX - box.maxX) ** 2 + (actualY - cy) ** 2) < 18) {
            setResizeSide('right');
            setDragStartPoint({ x: actualX, y: actualY });
            setResizeStartBox(box);
            setOriginalLine(lines[selectedLineIndex]);
            return;
          }

          // 7. Top Resize Handle (Top-Center Dot)
          if (Math.sqrt((actualX - cx) ** 2 + (actualY - box.minY) ** 2) < 18) {
            setResizeSide('top');
            setDragStartPoint({ x: actualX, y: actualY });
            setResizeStartBox(box);
            setOriginalLine(lines[selectedLineIndex]);
            return;
          }

          // 8. Bottom Resize Handle (Bottom-Center Dot)
          if (Math.sqrt((actualX - cx) ** 2 + (actualY - box.maxY) ** 2) < 18) {
            setResizeSide('bottom');
            setDragStartPoint({ x: actualX, y: actualY });
            setResizeStartBox(box);
            setOriginalLine(lines[selectedLineIndex]);
            return;
          }

          // 9. Drag Anchor (Click anywhere inside bounding box to move)
          if (actualX >= box.minX && actualX <= box.maxX && actualY >= box.minY && actualY <= box.maxY) {
            setDragStartPoint({ x: actualX, y: actualY });
            setOriginalLine(lines[selectedLineIndex]);
            return;
          }
        }
      }

      const idx = findClosestLineIndex(actualX, actualY);
      setSelectedLineIndex(idx);
      if (idx !== null) {
        setDragStartPoint({ x: actualX, y: actualY });
        setOriginalLine(lines[idx]);
      }
    } else if (tool === 'shape') {
      setDragStartPoint({ x: actualX, y: actualY });
      let initialPoints = [];
      const currentWidth = strokeWidth;
      const opacity = 1;
      
      if (selectedShape === 'line') {
        initialPoints = [
          { x: actualX, y: actualY, color: strokeColor, width: currentWidth, opacity },
          { x: actualX, y: actualY, color: strokeColor, width: currentWidth, opacity }
        ];
      } else if (selectedShape === 'rectangle') {
        initialPoints = Array(5).fill({ x: actualX, y: actualY, color: strokeColor, width: currentWidth, opacity });
      } else if (selectedShape === 'circle') {
        initialPoints = Array(65).fill({ x: actualX, y: actualY, color: strokeColor, width: currentWidth, opacity });
      } else if (selectedShape === 'triangle') {
        initialPoints = Array(4).fill({ x: actualX, y: actualY, color: strokeColor, width: currentWidth, opacity });
      } else if (selectedShape === 'hexagon') {
        initialPoints = Array(7).fill({ x: actualX, y: actualY, color: strokeColor, width: currentWidth, opacity });
      } else if (selectedShape === 'star') {
        initialPoints = Array(11).fill({ x: actualX, y: actualY, color: strokeColor, width: currentWidth, opacity });
      } else if (selectedShape === 'arrow') {
        initialPoints = Array(5).fill({ x: actualX, y: actualY, color: strokeColor, width: currentWidth, opacity });
      }
      setCurrentLine(initialPoints);
    } else {
      // Drawing mode: determine width and opacity
      let currentWidth = strokeWidth;
      let opacity = 1;

      if (tool === 'marker') {
        currentWidth = strokeWidth * 2;
      } else if (tool === 'highlighter') {
        currentWidth = strokeWidth * 3.5;
        opacity = 0.35;
      }

      setCurrentLine([{ 
        x: actualX, 
        y: actualY, 
        color: strokeColor, 
        width: currentWidth,
        opacity
      }]);
    }
  };

  const handleTouchMove = (event) => {
    const touches = event.nativeEvent.touches;

    // 2-Finger scroll canvas movement
    if (touches && touches.length === 2 && isPanningTwoFingers && dragStartPoint) {
      const p1 = touches[0];
      const p2 = touches[1];
      const midX = canvasOffset.x !== 0 
        ? ((p1.pageX + p2.pageX) / 2) - canvasOffset.x 
        : (p1.locationX + p2.locationX) / 2;
      const midY = canvasOffset.y !== 0 
        ? ((p1.pageY + p2.pageY) / 2) - canvasOffset.y 
        : (p1.locationY + p2.locationY) / 2;

      const dx = midX - dragStartPoint.x;
      const dy = midY - dragStartPoint.y;

      setPanOffset((prev) => ({
        x: prev.x - dx,
        y: prev.y - dy,
      }));
      setDragStartPoint({ x: midX, y: midY });
      return;
    }

    if (isPanningTwoFingers) return;

    const { pageX, pageY, locationX, locationY } = event.nativeEvent;
    const actualX = canvasOffset.x !== 0 
      ? pageX - canvasOffset.x + panOffset.x 
      : locationX + panOffset.x;
    const actualY = canvasOffset.y !== 0 
      ? pageY - canvasOffset.y + panOffset.y 
      : locationY + panOffset.y;

    if (tool === 'eraser') {
      checkProximityAndErase(actualX, actualY);
    } else if (tool === 'select') {
      if (selectedLineIndex !== null && dragStartPoint && originalLine) {
        if (isRotating && resizeStartBox) {
          const box = resizeStartBox;
          const cx = (box.minX + box.maxX) / 2;
          const cy = (box.minY + box.maxY) / 2;

          const startAngle = Math.atan2(dragStartPoint.y - cy, dragStartPoint.x - cx);
          const currentAngle = Math.atan2(actualY - cy, actualX - cx);
          const dTheta = currentAngle - startAngle;

          const cosT = Math.cos(dTheta);
          const sinT = Math.sin(dTheta);

          setLines((prevLines) =>
            prevLines.map((line, idx) => {
              if (idx === selectedLineIndex) {
                const rotatedPoints = originalLine.map((point) => {
                  const dx = point.x - cx;
                  const dy = point.y - cy;
                  return {
                    ...point,
                    x: cx + dx * cosT - dy * sinT,
                    y: cy + dx * sinT + dy * cosT,
                  };
                });
                if (rotatedPoints[0]) {
                  rotatedPoints[0].rotation = (originalLine[0]?.rotation || 0) + dTheta;
                }
                return rotatedPoints;
              }
              return line;
            })
          );
        } else if (resizeSide && resizeStartBox) {
          const box = resizeStartBox;
          setLines((prevLines) =>
            prevLines.map((line, idx) => {
              if (idx === selectedLineIndex) {
                return originalLine.map((point) => {
                  let newPoint = { ...point };
                  if (resizeSide === 'right') {
                    const oldWidth = box.width || 1;
                    const newWidth = Math.max(10, actualX - box.minX);
                    const scaleX = newWidth / oldWidth;
                    newPoint.x = box.minX + (point.x - box.minX) * scaleX;
                  } else if (resizeSide === 'left') {
                    const oldWidth = box.width || 1;
                    const newWidth = Math.max(10, box.maxX - actualX);
                    const scaleX = newWidth / oldWidth;
                    newPoint.x = box.maxX - (box.maxX - point.x) * scaleX;
                  } else if (resizeSide === 'bottom') {
                    const oldHeight = box.height || 1;
                    const newHeight = Math.max(10, actualY - box.minY);
                    const scaleY = newHeight / oldHeight;
                    newPoint.y = box.minY + (point.y - box.minY) * scaleY;
                  } else if (resizeSide === 'top') {
                    const oldHeight = box.height || 1;
                    const newHeight = Math.max(10, box.maxY - actualY);
                    const scaleY = newHeight / oldHeight;
                    newPoint.y = box.maxY - (box.maxY - point.y) * scaleY;
                  }
                  return newPoint;
                });
              }
              return line;
            })
          );
        } else {
          const dx = actualX - dragStartPoint.x;
          const dy = actualY - dragStartPoint.y;

          setLines((prevLines) =>
            prevLines.map((line, idx) => {
              if (idx === selectedLineIndex) {
                return originalLine.map((point) => ({
                  ...point,
                  x: point.x + dx,
                  y: point.y + dy,
                }));
              }
              return line;
            })
          );
        }
      }
    } else if (tool === 'shape' && dragStartPoint) {
      const startX = dragStartPoint.x;
      const startY = dragStartPoint.y;
      const curX = actualX;
      const curY = actualY;
      
      const width = strokeWidth;
      const opacity = 1;
      let points = [];
      
      if (selectedShape === 'line') {
        points = [
          { x: startX, y: startY, color: strokeColor, width, opacity },
          { x: curX, y: curY, color: strokeColor, width, opacity }
        ];
      } else if (selectedShape === 'rectangle') {
        points = [
          { x: startX, y: startY, color: strokeColor, width, opacity },
          { x: curX, y: startY, color: strokeColor, width, opacity },
          { x: curX, y: curY, color: strokeColor, width, opacity },
          { x: startX, y: curY, color: strokeColor, width, opacity },
          { x: startX, y: startY, color: strokeColor, width, opacity }
        ];
      } else if (selectedShape === 'circle') {
        const dx = curX - startX;
        const dy = curY - startY;
        const radius = Math.sqrt(dx * dx + dy * dy);
        
        for (let i = 0; i <= 64; i++) {
          const theta = (i * 2 * Math.PI) / 64;
          points.push({
            x: startX + radius * Math.cos(theta),
            y: startY + radius * Math.sin(theta),
            color: strokeColor,
            width,
            opacity
          });
        }
      } else if (selectedShape === 'triangle') {
        points = [
          { x: (startX + curX) / 2, y: startY, color: strokeColor, width, opacity },
          { x: curX, y: curY, color: strokeColor, width, opacity },
          { x: startX, y: curY, color: strokeColor, width, opacity },
          { x: (startX + curX) / 2, y: startY, color: strokeColor, width, opacity }
        ];
      } else if (selectedShape === 'hexagon') {
        const cx = (startX + curX) / 2;
        const cy = (startY + curY) / 2;
        const rx = Math.abs(curX - startX) / 2;
        const ry = Math.abs(curY - startY) / 2;
        for (let i = 0; i <= 6; i++) {
          const angle = (i * Math.PI) / 3;
          points.push({
            x: cx + rx * Math.cos(angle),
            y: cy + ry * Math.sin(angle),
            color: strokeColor,
            width,
            opacity
          });
        }
      } else if (selectedShape === 'star') {
        const cx = (startX + curX) / 2;
        const cy = (startY + curY) / 2;
        const rx = Math.abs(curX - startX) / 2;
        const ry = Math.abs(curY - startY) / 2;
        const rInnerX = rx * 0.4;
        const rInnerY = ry * 0.4;
        for (let i = 0; i <= 10; i++) {
          const angle = (i * Math.PI) / 5 - Math.PI / 2;
          const rX = i % 2 === 0 ? rx : rInnerX;
          const rY = i % 2 === 0 ? ry : rInnerY;
          points.push({
            x: cx + rX * Math.cos(angle),
            y: cy + rY * Math.sin(angle),
            color: strokeColor,
            width,
            opacity
          });
        }
      } else if (selectedShape === 'arrow') {
        const angle = Math.atan2(curY - startY, curX - startX);
        const arrowLength = 20;
        const arrowAngle = Math.PI / 6;
        const x1 = curX - arrowLength * Math.cos(angle - arrowAngle);
        const y1 = curY - arrowLength * Math.sin(angle - arrowAngle);
        const x2 = curX - arrowLength * Math.cos(angle + arrowAngle);
        const y2 = curY - arrowLength * Math.sin(angle + arrowAngle);
        points = [
          { x: startX, y: startY, color: strokeColor, width, opacity },
          { x: curX, y: curY, color: strokeColor, width, opacity },
          { x: x1, y: y1, color: strokeColor, width, opacity },
          { x: curX, y: curY, color: strokeColor, width, opacity },
          { x: x2, y: y2, color: strokeColor, width, opacity }
        ];
      }
      setCurrentLine(points);
    } else {
      let currentWidth = strokeWidth;
      let opacity = 1;

      if (tool === 'marker') {
        currentWidth = strokeWidth * 2;
      } else if (tool === 'highlighter') {
        currentWidth = strokeWidth * 3.5;
        opacity = 0.35;
      }

      setCurrentLine((prev) => [
        ...prev,
        { 
          x: actualX, 
          y: actualY, 
          color: strokeColor, 
          width: currentWidth,
          opacity
        },
      ]);
    }
  };

  const handleTouchEnd = () => {
    setIsResizing(false);
    setIsRotating(false);
    setResizeSide(null);
    setResizeStartBox(null);
    setOriginalLine(null);
    setIsPanningTwoFingers(false);
    if (tool !== 'select' && tool !== 'eraser') {
      if (currentLine.length > 0) {
        if (tool === 'shape') {
          setLines((prev) => {
            const newLines = [...prev, currentLine];
            setSelectedLineIndex(newLines.length - 1);
            return newLines;
          });
          setTool('select');
        } else {
          setLines((prev) => [...prev, currentLine]);
        }
        setCurrentLine([]);
      }
    }
  };

  const handleClear = () => {
    setLines([]);
    setCurrentLine([]);
    setSelectedLineIndex(null);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleSave = () => {
    if (lines.length === 0) {
      onClose();
      return;
    }
    onSave(lines);
    handleClear();
  };

  const getPathData = (points) => {
    if (points.length === 0) return '';
    const path = points.reduce((acc, point, idx) => {
      if (idx === 0) {
        return `M ${point.x} ${point.y}`;
      }
      return `${acc} L ${point.x} ${point.y}`;
    }, '');

    // Close shape paths to avoid gaps/breaks
    const first = points[0];
    const last = points[points.length - 1];
    if (first && last && points.length > 2) {
      const dist = Math.sqrt((first.x - last.x) ** 2 + (first.y - last.y) ** 2);
      if (dist < 8) {
        return path + ' Z';
      }
    }
    return path;
  };

  const isColorLight = (color) => {
    const lights = ['#F59E0B', '#FFD700', '#FBBF24', '#FFFF00', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#FFC6FF'];
    return lights.includes(color.toUpperCase());
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header Bar */}
        <LinearGradient
          colors={['#FF8C00', '#FFD700']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerGradient, { paddingTop: insets.top > 0 ? insets.top + 10 : 35 }]}
        >
          <View style={styles.headerTop}>
            <Pressable onPress={onClose} style={styles.iconBtn}>
              <Ionicons name="close" size={24} color="#1C1C1C" />
            </Pressable>
            <Text style={styles.headerTitle}>Sketch Canvas</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable onPress={handleClear} style={styles.iconBtn}>
                <Ionicons name="trash-outline" size={22} color="#1C1C1C" />
              </Pressable>
              <Pressable onPress={handleSave} style={styles.iconBtn}>
                <Ionicons name="checkmark" size={24} color="#1C1C1C" />
              </Pressable>
            </View>
          </View>
        </LinearGradient>

        {/* Drawing Board */}
        <Pressable
          ref={canvasRef}
          style={[styles.canvasContainer, { backgroundColor: '#FFFFFF' }]}
          onLayout={handleCanvasLayout}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Svg 
            style={StyleSheet.absoluteFill}
            viewBox={`${panOffset.x} ${panOffset.y} ${canvasSize.width} ${canvasSize.height}`}
          >
            {/* Draw completed lines */}
            {lines.map((line, idx) => (
              <Path
                key={idx}
                d={getPathData(line)}
                stroke={line[0]?.color || '#000000'}
                strokeWidth={line[0]?.width || 4}
                strokeOpacity={line[0]?.opacity !== undefined ? line[0].opacity : 1}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                {...(selectedLineIndex === idx && tool === 'select' && {
                  stroke: '#3B82F6',
                  strokeDasharray: '4,4',
                  strokeWidth: (line[0]?.width || 4) + 6,
                })}
              />
            ))}

            {/* Draw text inside shapes */}
            {lines.map((line, idx) => {
              if (line[0]?.text) {
                const box = getBoundingBox(line);
                if (box) {
                  const cx = (box.minX + box.maxX) / 2;
                  const cy = (box.minY + box.maxY) / 2;
                  return (
                    <SvgText
                      key={`text-${idx}`}
                      x={cx}
                      y={cy + 5}
                      fill={line[0].color || '#000000'}
                      fontSize={14}
                      fontWeight="bold"
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      {...(line[0].rotation !== undefined && {
                        transform: `rotate(${(line[0].rotation * 180) / Math.PI}, ${cx}, ${cy})`
                      })}
                    >
                      {line[0].text}
                    </SvgText>
                  );
                }
              }
              return null;
            })}

            {/* In select mode, draw the selected line on top of selection border */}
            {selectedLineIndex !== null && tool === 'select' && lines[selectedLineIndex] && (
              <Path
                d={getPathData(lines[selectedLineIndex])}
                stroke={lines[selectedLineIndex][0]?.color || '#000000'}
                strokeWidth={lines[selectedLineIndex][0]?.width || 4}
                strokeOpacity={0.85}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Bounding box and resize/rotate handles for Select Mode */}
            {selectedLineIndex !== null && tool === 'select' && lines[selectedLineIndex] && (() => {
              const box = getBoundingBox(lines[selectedLineIndex]);
              if (!box) return null;
              const cx = (box.minX + box.maxX) / 2;
              const cy = (box.minY + box.maxY) / 2;
              return (
                <>
                  {/* Dashed boundary */}
                  <Path
                    d={`M ${box.minX} ${box.minY} L ${box.maxX} ${box.minY} L ${box.maxX} ${box.maxY} L ${box.minX} ${box.maxY} Z`}
                    stroke="#3B82F6"
                    strokeWidth={1.5}
                    strokeDasharray="4,4"
                    fill="none"
                  />

                  {/* 1. Delete Handle (Top-Left) */}
                  <Path
                    d={`M ${box.minX} ${box.minY} m -12 0 a 12 12 0 1 0 24 0 a 12 12 0 1 0 -24 0`}
                    fill="#FF4444"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  />
                  <Path
                    d={`M ${box.minX - 4} ${box.minY - 4} L ${box.minX + 4} ${box.minY + 4} M ${box.minX + 4} ${box.minY - 4} L ${box.minX - 4} ${box.minY + 4}`}
                    stroke="#FFFFFF"
                    strokeWidth={2}
                    strokeLinecap="round"
                  />

                  {/* 2. Duplicate Handle (Top-Right) */}
                  <Path
                    d={`M ${box.maxX} ${box.minY} m -12 0 a 12 12 0 1 0 24 0 a 12 12 0 1 0 -24 0`}
                    fill="#3B82F6"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  />
                  <Path
                    d={`M ${box.maxX - 5} ${box.minY - 5} h 6 v 6 h -6 Z M ${box.maxX - 2} ${box.minY - 2} h 6 v 6 h -6 Z`}
                    stroke="#FFFFFF"
                    strokeWidth={1.5}
                    fill="none"
                  />

                  {/* 3. Text Handle (Bottom-Left) */}
                  <Path
                    d={`M ${box.minX} ${box.maxY} m -12 0 a 12 12 0 1 0 24 0 a 12 12 0 1 0 -24 0`}
                    fill="#10B981"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  />
                  <Path
                    d={`M ${box.minX - 5} ${box.maxY - 4} h 10 M ${box.minX} ${box.maxY - 4} v 8`}
                    stroke="#FFFFFF"
                    strokeWidth={2}
                    strokeLinecap="round"
                  />

                  {/* 4. Rotate Handle (Bottom-Right) */}
                  <Path
                    d={`M ${box.maxX} ${box.maxY} m -12 0 a 12 12 0 1 0 24 0 a 12 12 0 1 0 -24 0`}
                    fill="#F59E0B"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  />
                  <Path
                    d={`M ${box.maxX - 4} ${box.maxY} a 4 4 0 1 1 4 4 M ${box.maxX} ${box.maxY + 4} l -2 -3 M ${box.maxX} ${box.maxY + 4} l 3 -1`}
                    stroke="#FFFFFF"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />

                  {/* 5. Left Resize Handle (Left-Center Dot) */}
                  <Path
                    d={`M ${box.minX} ${cy} m -6 0 a 6 6 0 1 0 12 0 a 6 6 0 1 0 -12 0`}
                    fill="#3B82F6"
                    stroke="#FFFFFF"
                    strokeWidth={1.5}
                  />

                  {/* 6. Right Resize Handle (Right-Center Dot) */}
                  <Path
                    d={`M ${box.maxX} ${cy} m -6 0 a 6 6 0 1 0 12 0 a 6 6 0 1 0 -12 0`}
                    fill="#3B82F6"
                    stroke="#FFFFFF"
                    strokeWidth={1.5}
                  />

                  {/* 7. Top Resize Handle (Top-Center Dot) */}
                  <Path
                    d={`M ${cx} ${box.minY} m -6 0 a 6 6 0 1 0 12 0 a 6 6 0 1 0 -12 0`}
                    fill="#3B82F6"
                    stroke="#FFFFFF"
                    strokeWidth={1.5}
                  />

                  {/* 8. Bottom Resize Handle (Bottom-Center Dot) */}
                  <Path
                    d={`M ${cx} ${box.maxY} m -6 0 a 6 6 0 1 0 12 0 a 6 6 0 1 0 -12 0`}
                    fill="#3B82F6"
                    stroke="#FFFFFF"
                    strokeWidth={1.5}
                  />
                </>
              );
            })()}

            {/* Draw current line in progress */}
            {currentLine.length > 0 && (
              <Path
                d={getPathData(currentLine)}
                stroke={strokeColor}
                strokeWidth={currentLine[0]?.width || strokeWidth}
                strokeOpacity={currentLine[0]?.opacity !== undefined ? currentLine[0].opacity : 1}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            
            {/* Draw current line text preview */}
            {currentLine.length > 0 && currentLine[0]?.text && (() => {
              const box = getBoundingBox(currentLine);
              if (box) {
                const cx = (box.minX + box.maxX) / 2;
                const cy = (box.minY + box.maxY) / 2;
                return (
                  <SvgText
                    x={cx}
                    y={cy + 5}
                    fill={currentLine[0].color || '#000000'}
                    fontSize={14}
                    fontWeight="bold"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    {...(currentLine[0].rotation && {
                      transform: `rotate(${(currentLine[0].rotation * 180) / Math.PI}, ${cx}, ${cy})`
                    })}
                  >
                    {currentLine[0].text}
                  </SvgText>
                );
              }
              return null;
            })()}
          </Svg>
        </Pressable>

        {/* Collapsed/Expanded Toolbar Container */}
        <View style={[
          styles.toolbar, 
          { 
            backgroundColor: theme.surface,
            paddingBottom: insets.bottom > 0 ? insets.bottom + 10 : 20
          },
          !isToolbarExpanded && styles.toolbarCollapsed
        ]}>
          {/* Header Row with Title and Up/Down Toggle Arrow */}
          <View style={styles.toolbarHeader}>
            <Text style={[styles.toolbarLabel, { color: theme.mutedText, marginBottom: 0 }]}>
              {isToolbarExpanded ? 'Drawing Tools' : 'Tools Collapsed'}
            </Text>
            <Pressable 
              onPress={() => setIsToolbarExpanded(!isToolbarExpanded)} 
              style={[styles.collapseBtn, { backgroundColor: theme.border }]}
            >
              <Ionicons 
                name={isToolbarExpanded ? "chevron-down" : "chevron-up"} 
                size={18} 
                color={theme.text} 
              />
            </Pressable>
          </View>

          {isToolbarExpanded ? (
            <>
              {/* Tool Selector Row */}
              <View style={styles.toolSelectorRow}>
                {/* Pen Tool */}
                <Pressable 
                  onPress={() => { setTool('pen'); setSelectedLineIndex(null); }}
                  style={[styles.toolBtn, tool === 'pen' && [styles.toolBtnActive, { backgroundColor: theme.primary }]]}
                >
                  <Ionicons name="pencil" size={20} color={tool === 'pen' ? '#FFFFFF' : theme.text} />
                </Pressable>

                {/* Marker Tool */}
                <Pressable 
                  onPress={() => { setTool('marker'); setSelectedLineIndex(null); }}
                  style={[styles.toolBtn, tool === 'marker' && [styles.toolBtnActive, { backgroundColor: theme.primary }]]}
                >
                  <Ionicons name="create-outline" size={20} color={tool === 'marker' ? '#FFFFFF' : theme.text} />
                </Pressable>

                {/* Highlighter Tool */}
                <Pressable 
                  onPress={() => { setTool('highlighter'); setSelectedLineIndex(null); }}
                  style={[styles.toolBtn, tool === 'highlighter' && [styles.toolBtnActive, { backgroundColor: theme.primary }]]}
                >
                  <Ionicons name="brush-outline" size={20} color={tool === 'highlighter' ? '#FFFFFF' : theme.text} />
                </Pressable>

                {/* Shape Tool */}
                <Pressable 
                  onPress={() => { setTool('shape'); setSelectedLineIndex(null); }}
                  style={[styles.toolBtn, tool === 'shape' && [styles.toolBtnActive, { backgroundColor: theme.primary }]]}
                >
                  <Ionicons name="shapes-outline" size={20} color={tool === 'shape' ? '#FFFFFF' : theme.text} />
                </Pressable>

                {/* Eraser Tool */}
                <Pressable 
                  onPress={() => { setTool('eraser'); setSelectedLineIndex(null); }}
                  style={[styles.toolBtn, tool === 'eraser' && [styles.toolBtnActive, { backgroundColor: theme.primary }]]}
                >
                  <Ionicons name="cut-outline" size={20} color={tool === 'eraser' ? '#FFFFFF' : theme.text} />
                </Pressable>

                {/* Select/Move Tool */}
                <Pressable 
                  onPress={() => { setTool('select'); }}
                  style={[styles.toolBtn, tool === 'select' && [styles.toolBtnActive, { backgroundColor: theme.primary }]]}
                >
                  <Ionicons name="move-outline" size={20} color={tool === 'select' ? '#FFFFFF' : theme.text} />
                </Pressable>
              </View>

              {/* Shapes Sub-Selector Row */}
              {tool === 'shape' && (
                <View style={styles.shapeSelectorContainer}>
                  <Text style={[styles.toolbarLabel, { color: theme.mutedText, marginBottom: 8 }]}>Select Shape</Text>
                  <View style={styles.shapeSelectorRow}>
                    {[
                      { type: 'line', name: 'Line', icon: 'remove-outline' },
                      { type: 'rectangle', name: 'Rect', icon: 'square-outline' },
                      { type: 'circle', name: 'Circle', icon: 'ellipse-outline' },
                      { type: 'triangle', name: 'Triangle', icon: 'triangle-outline' },
                      { type: 'hexagon', name: 'Hexagon', icon: 'hexagon-outline' },
                      { type: 'star', name: 'Star', icon: 'star-outline' },
                      { type: 'arrow', name: 'Arrow', icon: 'arrow-forward-outline' },
                    ].map((shape) => (
                      <Pressable 
                        key={shape.type}
                        onPress={() => setSelectedShape(shape.type)}
                        style={[
                          styles.shapeBtn, 
                          selectedShape === shape.type && { borderColor: theme.primary, backgroundColor: 'rgba(0,0,0,0.03)' }
                        ]}
                      >
                        <Ionicons 
                          name={shape.icon} 
                          size={15} 
                          color={selectedShape === shape.type ? theme.primary : theme.text} 
                        />
                        <Text style={[styles.shapeBtnText, { color: selectedShape === shape.type ? theme.primary : theme.text }]}>
                          {shape.name}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              {/* Hide colors and brush size for eraser/select/pan tools */}
              {tool !== 'eraser' && tool !== 'select' && (
                <>
                  {/* Colors Selection */}
                  <Text style={[styles.toolbarLabel, { color: theme.mutedText, marginTop: 4 }]}>Brush Color</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.colorPalette}
                    style={{ maxHeight: 42, marginBottom: 8 }}
                  >
                    {COLORS.map((color) => (
                      <Pressable
                        key={color}
                        onPress={() => setStrokeColor(color)}
                        style={[
                          styles.colorCircle,
                          { backgroundColor: color },
                          strokeColor === color && {
                            borderColor: '#000000',
                            borderWidth: 2,
                            transform: [{ scale: 1.15 }],
                          },
                        ]}
                      >
                        {strokeColor === color && (
                          <Ionicons 
                            name="checkmark" 
                            size={16} 
                            color={isColorLight(color) ? '#000000' : '#FFFFFF'} 
                            style={{ alignSelf: 'center', marginTop: 6 }}
                          />
                        )}
                      </Pressable>
                    ))}
                    {/* 13th Color Wheel / Custom Picker trigger */}
                    <Pressable
                      onPress={() => setIsColorPickerVisible(true)}
                      style={[
                        styles.colorCircle,
                        { 
                          backgroundColor: '#E0E0E0', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          borderWidth: 1.5,
                          borderColor: theme.border
                        }
                      ]}
                    >
                      <Ionicons name="color-palette-outline" size={18} color={theme.text} />
                    </Pressable>
                  </ScrollView>

                  {/* Stroke Width Selection */}
                  <Text style={[styles.toolbarLabel, { color: theme.mutedText, marginTop: 8 }]}>
                    Brush Size
                  </Text>
                  <View style={styles.widthPalette}>
                    {BRUSH_SIZES.map((size) => (
                      <Pressable
                        key={size}
                        onPress={() => setStrokeWidth(size)}
                        style={[
                          styles.widthCircle,
                          strokeWidth === size && { backgroundColor: theme.primary },
                        ]}
                      >
                        <View
                          style={[
                            styles.widthDot,
                            {
                              width: size,
                              height: size,
                              borderRadius: size / 2,
                              backgroundColor: strokeWidth === size ? '#FFFFFF' : theme.text,
                            },
                          ]}
                        />
                      </Pressable>
                    ))}
                  </View>
                </>
              )}

              <Text style={{ textAlign: 'center', fontSize: 11, color: theme.mutedText, marginVertical: 4, fontStyle: 'italic' }}>
                💡 Tip: Drag with 2 fingers to scroll the canvas in any direction! ✋
              </Text>

              {tool === 'eraser' && (
                <Text style={{ textAlign: 'center', fontSize: 13, color: theme.mutedText, marginVertical: 10, fontWeight: '600' }}>
                  Eraser Active: Drag or tap over lines to delete them! 🧽
                </Text>
              )}

              {tool === 'select' && (
                <Text style={{ textAlign: 'center', fontSize: 13, color: theme.mutedText, marginVertical: 10, fontWeight: '600' }}>
                  Select Active: Tap a shape to edit. Use corners: ❌ Delete, 📋 Copy, 🔤 Text, 🔄 Rotate. Use dots to resize!
                </Text>
              )}
            </>
          ) : null}
        </View>

        {/* Custom Color Grid Modal */}
        <Modal
          visible={isColorPickerVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsColorPickerVisible(false)}
        >
          <Pressable 
            style={styles.pickerOverlay} 
            onPress={() => setIsColorPickerVisible(false)}
          >
            <View style={[styles.pickerContainer, { backgroundColor: theme.surface }]}>
              <Text style={[styles.pickerTitle, { color: theme.text }]}>Choose Custom Color</Text>
              <View style={styles.pickerGrid}>
                {EXTRA_COLORS.map((color) => (
                  <Pressable
                    key={color}
                    onPress={() => {
                      setStrokeColor(color);
                      setIsColorPickerVisible(false);
                    }}
                    style={[
                      styles.pickerColorCircle,
                      { backgroundColor: color }
                    ]}
                  />
                ))}
              </View>
              <Pressable 
                onPress={() => setIsColorPickerVisible(false)} 
                style={[styles.pickerCloseBtn, { backgroundColor: theme.primary }]}
              >
                <Text style={styles.pickerCloseBtnText}>Close</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

        {/* Shape Text Input Modal */}
        <Modal
          visible={isTextInputVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsTextInputVisible(false)}
        >
          <Pressable 
            style={styles.pickerOverlay} 
            onPress={() => setIsTextInputVisible(false)}
          >
            <View style={[styles.pickerContainer, { backgroundColor: theme.surface, width: '80%' }]}>
              <Text style={[styles.pickerTitle, { color: theme.text }]}>Add Text inside Shape</Text>
              <TextInput
                value={shapeText}
                onChangeText={setShapeText}
                placeholder="Enter text..."
                placeholderTextColor={theme.placeholder}
                style={[
                  styles.shapeTextInput, 
                  { 
                    color: theme.text, 
                    borderColor: theme.border, 
                    backgroundColor: theme.background 
                  }
                ]}
                autoFocus
              />
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                <Pressable 
                  onPress={() => setIsTextInputVisible(false)} 
                  style={[styles.pickerCloseBtn, { backgroundColor: theme.border, flex: 1, alignItems: 'center' }]}
                >
                  <Text style={[styles.pickerCloseBtnText, { color: theme.text }]}>Cancel</Text>
                </Pressable>
                <Pressable 
                  onPress={() => {
                    setLines((prevLines) =>
                      prevLines.map((line, idx) => {
                        if (idx === selectedLineIndex) {
                          return line.map((point, pIdx) => {
                            if (pIdx === 0) {
                              return { ...point, text: shapeText };
                            }
                            return point;
                          });
                        }
                        return line;
                      })
                    );
                    setIsTextInputVisible(false);
                  }} 
                  style={[styles.pickerCloseBtn, { backgroundColor: theme.primary, flex: 1, alignItems: 'center' }]}
                >
                  <Text style={styles.pickerCloseBtnText}>Save</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
  },
  headerTitle: {
    color: '#1C1C1C',
    fontSize: 20,
    fontWeight: '900',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(28,28,28,0.15)',
  },
  canvasContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  toolbar: {
    padding: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  toolbarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  collapseBtn: {
    padding: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarCollapsed: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  toolbarLabel: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  toolSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    paddingBottom: 12,
  },
  toolBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  toolBtnActive: {
    elevation: 2,
  },
  shapeSelectorContainer: {
    marginBottom: 14,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    paddingBottom: 12,
  },
  shapeSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 8,
  },
  shapeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    minWidth: 78,
  },
  shapeBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  colorPalette: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 5,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderColor: 'transparent',
    borderWidth: 2,
  },
  widthPalette: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  widthCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  widthDot: {
    alignSelf: 'center',
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerContainer: {
    width: '85%',
    borderRadius: 20,
    padding: 24,
    elevation: 10,
    alignItems: 'center',
  },
  pickerTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  pickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  pickerColorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  pickerCloseBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  pickerCloseBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  shapeTextInput: {
    width: '100%',
    height: 50,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    marginBottom: 16,
  },
});
