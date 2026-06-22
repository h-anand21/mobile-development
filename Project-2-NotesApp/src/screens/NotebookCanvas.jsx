import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import Svg, { Path, Circle, Rect, Text as SvgText, G } from 'react-native-svg';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

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
const FONT_SIZES = [12, 14, 16, 20, 24, 28];

const TABLE_TEMPLATES = [
  {
    id: 'gray',
    name: 'Classic Gray',
    headerBg: '#475569',
    headerText: '#FFFFFF',
    cellBg: '#FFFFFF',
    altCellBg: '#F8FAFC',
    borderColor: '#94A3B8'
  },
  {
    id: 'amber',
    name: 'Warm Amber',
    headerBg: '#D97706',
    headerText: '#FFFFFF',
    cellBg: '#FFFBEB',
    altCellBg: '#FEF3C7',
    borderColor: '#F59E0B'
  },
  {
    id: 'green',
    name: 'Forest Green',
    headerBg: '#059669',
    headerText: '#FFFFFF',
    cellBg: '#ECFDF5',
    altCellBg: '#D1FAE5',
    borderColor: '#10B981'
  },
  {
    id: 'blue',
    name: 'Ocean Blue',
    headerBg: '#2563EB',
    headerText: '#FFFFFF',
    cellBg: '#EFF6FF',
    altCellBg: '#DBEAFE',
    borderColor: '#3B82F6'
  },
  {
    id: 'lavender',
    name: 'Lavender',
    headerBg: '#7C3AED',
    headerText: '#FFFFFF',
    cellBg: '#F5F3FF',
    altCellBg: '#EDE9FE',
    borderColor: '#8B5CF6'
  }
];

const EMOJI_CATEGORIES = [
  {
    id: 'smileys',
    icon: 'happy-outline',
    title: 'Smileys',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕'
    ]
  },
  {
    id: 'gestures',
    icon: 'hand-left-outline',
    title: 'Gestures',
    emojis: [
      '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🧠', '🦷', '👀', '👁️', '👅', '👄', '💋', '❤️', '💔', '💖', '🔥'
    ]
  },
  {
    id: 'animals',
    icon: 'paw-outline',
    title: 'Animals & Nature',
    emojis: [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎', '🐙', '🦑', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🐈', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦡', '🐾', '🌵', '🎄', '🌲', '🌳', '🌴', '🌱', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃'
    ]
  },
  {
    id: 'food',
    icon: 'cafe-outline',
    title: 'Food & Drink',
    emojis: [
      '🍏', '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🌽', '🥕', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🥞', '🧇', '🥓', '🥩', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🥗', '🥘', '🍲', '🥣', '🥫', '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🍝', '🍢', '🍣', '🍤', '🍥', '🥮', '🍡', '🥟', '🥠', '🥡', '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫', '🍬', '🍭', '🍯', '🍼', '🥛', '☕', '🍵', '🍶', '🍾', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃', '🥤', '🧉', '🧊'
    ]
  },
  {
    id: 'travel',
    icon: 'airplane-outline',
    title: 'Travel & Places',
    emojis: [
      '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🛴', '🚲', '🛵', '🏍️', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩️', '💺', '🛰️', '🚀', '🛸', '🚁', '🛶', '⛵', '🚤', '🛥️', '🛳️', '⚓', '🚧', '⛽', '🏣', '🏥', '🏦', '🏨', '🏪', '🏫', '🏬', '🏭', '🏯', '🏰', '💒', '🗼', '🗽', '⛪', '🕌', '🛕', '⛩️', '🕋', '⛲', '⛺', '🌁', '🌃', '🏙️', '🌄', '🌅', '🌆', '🌇', '🌉', '🎠', '🎡', '🎢', '⛰️', '🏔️', '🗻', '🌋', '🏕️', '🏖️', '🏜️', '🏝️', '🏞️'
    ]
  },
  {
    id: 'activities',
    icon: 'football-outline',
    title: 'Activities & Sports',
    emojis: [
      '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🏏', '⛳', '🏹', '🎣', '🤿', '🥊', '🥋', '⛸️', '🎿', '🛷', '🥌', '🛹', '🛼', '🏋️', '🤼', '🤸', '⛹️', '🤺', '🤾', '🏌️', '🏄', '🏊', '🤽', '🚣', '🧗', '🚴', '🚵', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🎫', '🎟️', '🎪', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻', '🎲', '🧩', '♟️', '🎯', '🎳', '🎮', '🎰'
    ]
  },
  {
    id: 'objects',
    icon: 'bulb-outline',
    title: 'Objects',
    emojis: [
      '🔇', '🔈', '🔉', '🔊', '📢', '📣', '📯', '🔔', '🔕', '🎼', '🎵', '🎶', '🎙️', '🎚️', '🎛️', '📱', '📲', '☎️', '📞', '🔋', '🔌', '💻', '🖥️', '🖨️', '鼠标', '🖱️', '🖲️', '💽', '💾', '💿', '📀', '🧮', '🎥', '🎞️', '📽️', '🎬', '相机', '📷', '📸', '📹', '📼', '🔍', '🔎', '💡', '🔦', '🏮', '🧱', '🧯', '🛒', '💸', '💵', '🪙', '💳', '🧾', '✉️', '📧', '📨', '📩', '📤', '📥', '📦', '📫', '📪', '📬', '📭', '📮', '🗳️', '✏️', '✒️', '🖋️', '🖊️', '🖌️', '🖍️', '📝', '💼', '📁', '📂', '🗂️', '📅', '📆', '🗒️', '🗓️', '📇', '📈', '📉', '📊', '📋', '📌', '📍', '📎', '📏', '📐', '剪刀', '🔑', '🗝️', '🔨', '🪓', '⛏️', '🛡️', '🔧', '🔩', '⚙️', '⚖️', '🔗', '⛓️', '🧰', '🧲', '🪜', '🧪', '🔬', '🔭', '📡', '💉', '🩸', '💊', '🩹', '🩺', '🚪', '🛗', '🪞', '🪟', '🛏️', '🛋️', '🪑', '🚽', '🪠', '🧼', '🧹', '🧺', '🧻', '🧽', '🚿', '🛁'
    ]
  },
  {
    id: 'symbols',
    icon: 'heart-outline',
    title: 'Symbols & Badges',
    emojis: [
      '⚠️ URGENT', '📌 IMPORTANT', '💡 IDEA', '📝 TO-DO', '✅ DONE', '❌ CANCELLED', '🎓 STUDY TIME', '☕ BREAK TIME', '⭐ STAR ITEM', '🎯 DAILY GOAL', '👍 APPROVED', '🎉 CELEBRATE',
      '💚', '💙', '💜', '🖤', '🤍', '🤎', '❣️', '💕', '💞', '💓', '💗', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '☯️', '🛐', '⛎', '🆔', '⚛️', '☣️', '📴', '📳', '🈶', '🈚', '✴️', '🆚', '💮', '🅰️', '🅱️', '🆎', '🅾️', '🆘', '🚫', '❌', '⭕', '🛑', '⛔', '📛', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '⚠️', '🚸', '🔰', '♻️', '✅', '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤'
    ]
  }
];

const getBadgeStyles = (text) => {
  if (text.startsWith('⚠️ URGENT')) return { bgColor: '#FF3B30', color: '#FFFFFF', width: 110, fontSize: 13 };
  if (text.startsWith('📌 IMPORTANT')) return { bgColor: '#FF9500', color: '#FFFFFF', width: 120, fontSize: 13 };
  if (text.startsWith('💡 IDEA')) return { bgColor: '#FFCC00', color: '#000000', width: 80, fontSize: 13 };
  if (text.startsWith('📝 TO-DO')) return { bgColor: '#5856D6', color: '#FFFFFF', width: 90, fontSize: 13 };
  if (text.startsWith('✅ DONE')) return { bgColor: '#34C759', color: '#FFFFFF', width: 90, fontSize: 13 };
  if (text.startsWith('❌ CANCELLED')) return { bgColor: '#8E8E93', color: '#FFFFFF', width: 125, fontSize: 13 };
  if (text.startsWith('🎓 STUDY TIME')) return { bgColor: '#007AFF', color: '#FFFFFF', width: 130, fontSize: 13 };
  if (text.startsWith('☕ BREAK TIME')) return { bgColor: '#A27B5C', color: '#FFFFFF', width: 130, fontSize: 13 };
  if (text.startsWith('⭐ STAR ITEM')) return { bgColor: '#FFD700', color: '#000000', width: 115, fontSize: 13 };
  if (text.startsWith('🎯 DAILY GOAL')) return { bgColor: '#FF2D55', color: '#FFFFFF', width: 125, fontSize: 13 };
  if (text.startsWith('👍 APPROVED')) return { bgColor: '#30B0C7', color: '#FFFFFF', width: 115, fontSize: 13 };
  if (text.startsWith('🎉 CELEBRATE')) return { bgColor: '#AF52DE', color: '#FFFFFF', width: 120, fontSize: 13 };
  return null;
};

const CANVAS_WIDTH = 360;
const CANVAS_HEIGHT = 500;

export default function NotebookCanvas({ visible, onClose, onSave, theme, initialPages }) {
  const insets = useSafeAreaInsets();
  
  // Notebook Pages state
  const [pages, setPages] = useState(
    initialPages && initialPages.length > 0
      ? initialPages.map(p => ({
          pageStyle: p.pageStyle || 'ruled',
          borderDesign: p.borderDesign || 'classic',
          lines: p.lines || [],
          textBoxes: p.textBoxes || [],
          images: p.images || [],
          tapes: p.tapes || [],
          tables: p.tables || [],
          pageThemeMode: p.pageThemeMode || null,
          pageHeight: p.pageHeight || 1500
        }))
      : [
          {
            pageStyle: 'ruled',
            borderDesign: 'classic',
            lines: [],
            textBoxes: [],
            images: [],
            tapes: [],
            tables: [],
            pageHeight: 1500
          }
        ]
  );
  
  const [currentPageIdx, setCurrentPageIdx] = useState(0);

  // Undo/Redo history states
  const [pagesHistory, setPagesHistory] = useState([]);
  const [pagesRedoStack, setPagesRedoStack] = useState([]);

  const saveToHistory = (customPagesState = null) => {
    const targetState = customPagesState || pages;
    const pagesCopy = JSON.parse(JSON.stringify(targetState));
    setPagesHistory(prev => {
      const nextHist = [...prev, pagesCopy];
      if (nextHist.length > 30) {
        nextHist.shift();
      }
      return nextHist;
    });
    setPagesRedoStack([]); // Clear redo stack on new actions
  };

  const handleUndo = () => {
    if (pagesHistory.length === 0) return;
    const previousState = pagesHistory[pagesHistory.length - 1];
    const currentState = JSON.parse(JSON.stringify(pages));
    
    setPagesRedoStack(prev => [...prev, currentState]);
    setPages(previousState);
    setPagesHistory(prev => prev.slice(0, -1));
  };

  const handleRedo = () => {
    if (pagesRedoStack.length === 0) return;
    const nextState = pagesRedoStack[pagesRedoStack.length - 1];
    const currentState = JSON.parse(JSON.stringify(pages));
    
    setPagesHistory(prev => [...prev, currentState]);
    setPages(nextState);
    setPagesRedoStack(prev => prev.slice(0, -1));
  };

  // Active page getters/setters
  const currentPage = pages[currentPageIdx] || { pageStyle: 'ruled', borderDesign: 'classic', lines: [], textBoxes: [], images: [], tapes: [], tables: [] };
  const lines = currentPage.lines;
  const textBoxes = currentPage.textBoxes;
  const images = currentPage.images || [];
  const tapes = currentPage.tapes || [];
  const tables = currentPage.tables || [];

  const setTapes = (newTapesOrFn) => {
    const nextTapes = typeof newTapesOrFn === 'function' ? newTapesOrFn(tapes) : newTapesOrFn;
    updateCurrentPageData({ tapes: nextTapes });
  };

  const setTables = (newTablesOrFn) => {
    const nextTables = typeof newTablesOrFn === 'function' ? newTablesOrFn(tables) : newTablesOrFn;
    updateCurrentPageData({ tables: nextTables });
  };

  // Drawing state
  const isDark = theme.background === '#121212';
  const isPageDark = currentPage.pageThemeMode ? currentPage.pageThemeMode === 'dark' : isDark;

  const resolveColor = (color) => {
    if (!color) return isPageDark ? '#FFFFFF' : '#000000';
    const c = color.toUpperCase();
    if (c === '#000000' && isPageDark) return '#FFFFFF';
    if (c === '#FFFFFF' && !isPageDark) return '#000000';
    return color;
  };
  const [currentLine, setCurrentLine] = useState([]);
  const [strokeColor, setStrokeColor] = useState(isPageDark ? '#FFFFFF' : '#000000');
  const [strokeWidth, setStrokeWidth] = useState(4);

  useEffect(() => {
    setStrokeColor(isPageDark ? '#FFFFFF' : '#000000');
    setActiveTextColor(isPageDark ? '#FFFFFF' : '#000000');
  }, [isPageDark]);

  // Reset pages and drawing states when the canvas becomes visible (to load the correct note's pages)
  useEffect(() => {
    if (visible) {
      const parsedPages = initialPages && initialPages.length > 0
        ? initialPages.map(p => ({
            pageStyle: p.pageStyle || 'ruled',
            borderDesign: p.borderDesign || 'classic',
            lines: p.lines || [],
            textBoxes: p.textBoxes || [],
            images: p.images || [],
            tapes: p.tapes || [],
            tables: p.tables || [],
            pageThemeMode: p.pageThemeMode || null,
            pageHeight: p.pageHeight || 1500
          }))
        : [
            {
              pageStyle: 'ruled',
              borderDesign: 'classic',
              lines: [],
              textBoxes: [],
              images: [],
              tapes: [],
              tables: [],
              pageHeight: 1500
            }
          ];
      setPages(parsedPages);
      setCurrentPageIdx(0);
      setPagesHistory([]);
      setPagesRedoStack([]);
      // Clear selection states
      setSelectedLineIndex(null);
      setSelectedTextBoxId(null);
      setSelectedImageId(null);
      setLassoGroup(null);
      setTool('pen');
    }
  }, [visible, initialPages]);
  
  // Tool state: 'pen', 'marker', 'highlighter', 'shape', 'eraser', 'text', 'select'
  const [tool, setTool] = useState('pen');
  const [selectedShape, setSelectedShape] = useState('rectangle'); // 'line', 'rectangle', 'circle', 'triangle', 'star', 'arrow'
  const [selectedLineIndex, setSelectedLineIndex] = useState(null);
  const [selectedTextBoxId, setSelectedTextBoxId] = useState(null);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [dragStartPoint, setDragStartPoint] = useState(null);

  // Text formatting states (for new/selected text boxes)
  const [activeFontSize, setActiveFontSize] = useState(16);
  const [activeTextColor, setActiveTextColor] = useState(isPageDark ? '#FFFFFF' : '#000000');
  const [activeAlignment, setActiveAlignment] = useState('left'); // 'left', 'center', 'right'
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  // Advanced States
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [resizeSide, setResizeSide] = useState(null); // 'left', 'right', 'top', 'bottom'
  const [resizeStartBox, setResizeStartBox] = useState(null);
  const [originalLine, setOriginalLine] = useState(null);
  
  // Text Editor modal
  const [isTextEditVisible, setIsTextEditVisible] = useState(false);
  const [editingTextValue, setEditingTextValue] = useState('');
  const [lastTap, setLastTap] = useState({ id: null, time: 0 });
  const canvasRef = useRef(null);
  const scrollViewRef = useRef(null);
  const [isMultiTouch, setIsMultiTouch] = useState(false);
  const scrollOffsetRef = useRef(0);
  const lastTouchYRef = useRef(0);
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(true);

  // Advanced States extra
  const [tableResize, setTableResize] = useState(null); // { tableId, type: 'col'|'row', index, startPos, startSizes }

  const getTableCellAt = (table, localX, localY) => {
    let currentX = 0;
    let colIdx = -1;
    for (let c = 0; c < table.cols; c++) {
      if (localX >= currentX && localX <= currentX + table.cellWidths[c]) {
        colIdx = c;
        break;
      }
      currentX += table.cellWidths[c];
    }

    let currentY = 0;
    let rowIdx = -1;
    for (let r = 0; r < table.rows; r++) {
      if (localY >= currentY && localY <= currentY + table.cellHeights[r]) {
        rowIdx = r;
        break;
      }
      currentY += table.cellHeights[r];
    }

    return { rowIdx, colIdx };
  };

  const handleAddTableRow = (tableId) => {
    setTables(prev => prev.map(t => {
      if (t.id === tableId) {
        const defaultCellH = 30;
        const newRowData = Array(t.cols).fill('');
        return {
          ...t,
          rows: t.rows + 1,
          cellHeights: [...t.cellHeights, defaultCellH],
          height: t.height + defaultCellH,
          data: [...t.data, newRowData]
        };
      }
      return t;
    }));
  };

  const handleRemoveTableRow = (tableId) => {
    setTables(prev => prev.map(t => {
      if (t.id === tableId && t.rows > 1) {
        const lastHeight = t.cellHeights[t.cellHeights.length - 1];
        return {
          ...t,
          rows: t.rows - 1,
          cellHeights: t.cellHeights.slice(0, -1),
          height: t.height - lastHeight,
          data: t.data.slice(0, -1)
        };
      }
      return t;
    }));
  };

  const handleAddTableColumn = (tableId) => {
    setTables(prev => prev.map(t => {
      if (t.id === tableId) {
        const defaultCellW = 80;
        return {
          ...t,
          cols: t.cols + 1,
          cellWidths: [...t.cellWidths, defaultCellW],
          width: t.width + defaultCellW,
          data: t.data.map(row => [...row, ''])
        };
      }
      return t;
    }));
  };

  const handleRemoveTableColumn = (tableId) => {
    setTables(prev => prev.map(t => {
      if (t.id === tableId && t.cols > 1) {
        const lastWidth = t.cellWidths[t.cellWidths.length - 1];
        return {
          ...t,
          cols: t.cols - 1,
          cellWidths: t.cellWidths.slice(0, -1),
          width: t.width - lastWidth,
          data: t.data.map(row => row.slice(0, -1))
        };
      }
      return t;
    }));
  };

  const handleChangeTableTemplate = (tableId, templateId) => {
    setTables(prev => prev.map(t => {
      if (t.id === tableId) {
        return { ...t, template: templateId };
      }
      return t;
    }));
  };

  const handleToggleTableBorderDark = (tableId) => {
    setTables(prev => prev.map(t => {
      if (t.id === tableId) {
        return { ...t, borderDark: !t.borderDark };
      }
      return t;
    }));
  };

  // Advanced Tools States
  const [activeTape, setActiveTape] = useState(null);
  const [ruler, setRuler] = useState({ visible: false, x: 40, y: 180, angle: 0, length: 280, height: 40 });
  const [rulerDragStart, setRulerDragStart] = useState(null);
  const [rulerRotateStart, setRulerRotateStart] = useState(null);
  const [pointerPath, setPointerPath] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [editingTableCell, setEditingTableCell] = useState(null); // { tableId, rIdx, cIdx }
  const [isLibraryVisible, setIsLibraryVisible] = useState(false);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState('smileys');
  
  // Lasso selection states
  const [lassoPoints, setLassoPoints] = useState(null); // Array of loop points
  const [lassoGroup, setLassoGroup] = useState(null); // { lines: [], textBoxes: [], images: [], tables: [] }
  const [lassoDragStart, setLassoDragStart] = useState(null);
  const [originalLassoGroupPos, setOriginalLassoGroupPos] = useState(null);

  // Zoombox states
  const [zoombox, setZoombox] = useState({ visible: false, x: 50, y: 150, width: 140, height: 70 });
  const [zoomboxDragStart, setZoomboxDragStart] = useState(null);

  // Track the layout coordinates of the SVG to compute scaling of absolute clicks
  const [layoutSize, setLayoutSize] = useState({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
  const scaleFactorX = layoutSize.width / CANVAS_WIDTH;
  const scaleFactorY = scaleFactorX;

  const updateCurrentPageData = (updatedFields) => {
    setPages((prevPages) =>
      prevPages.map((page, idx) => (idx === currentPageIdx ? { ...page, ...updatedFields } : page))
    );
  };

  const setLines = (newLinesOrFn) => {
    const nextLines = typeof newLinesOrFn === 'function' ? newLinesOrFn(lines) : newLinesOrFn;
    updateCurrentPageData({ lines: nextLines });
  };

  const setTextBoxes = (newTextBoxesOrFn) => {
    const nextBoxes = typeof newTextBoxesOrFn === 'function' ? newTextBoxesOrFn(textBoxes) : newTextBoxesOrFn;
    updateCurrentPageData({ textBoxes: nextBoxes });
  };

  const setImages = (newImagesOrFn) => {
    const nextImages = typeof newImagesOrFn === 'function' ? newImagesOrFn(images) : newImagesOrFn;
    updateCurrentPageData({ images: nextImages });
  };

  // Helper: Bounding Box
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

  // Eraser
  const checkProximityAndErase = (x, y) => {
    // 1. Erase lines
    setLines((prevLines) =>
      prevLines.filter((line) => {
        const isClose = line.some((point) => {
          const dx = point.x - x;
          const dy = point.y - y;
          return Math.sqrt(dx * dx + dy * dy) < 22; // 22px erase radius
        });
        return !isClose;
      })
    );

    // 2. Erase text boxes
    setTextBoxes((prevBoxes) =>
      prevBoxes.filter((box) => {
        // Check if cursor falls within bounding box (expanded by margin)
        const margin = 15;
        return !(
          x >= box.x - margin &&
          x <= box.x + box.width + margin &&
          y >= box.y - margin &&
          y <= box.y + box.height + margin
        );
      })
    );

    // 3. Erase images
    setImages((prevImages) =>
      prevImages.filter((img) => {
        const margin = 15;
        return !(
          x >= img.x - margin &&
          x <= img.x + img.width + margin &&
          y >= img.y - margin &&
          y <= img.y + img.height + margin
        );
      })
    );

    // 4. Erase tapes
    setTapes((prevTapes) =>
      prevTapes.filter((t) => {
        return !(x >= t.x && x <= t.x + t.width && y >= t.y && y <= t.y + t.height);
      })
    );

    // 5. Erase tables
    setTables((prevTables) =>
      prevTables.filter((t) => {
        return !(x >= t.x && x <= t.x + t.width && y >= t.y && y <= t.y + t.height);
      })
    );
  };

  // Lasso selection point-in-polygon helper
  const isPointInPolygon = (point, polygon) => {
    const x = point.x, y = point.y;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x, yi = polygon[i].y;
      const xj = polygon[j].x, yj = polygon[j].y;
      const intersect = ((yi > y) !== (yj > y))
          && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  // Get combined bounding box bounds for lasso selection
  const getLassoGroupBounds = () => {
    if (!lassoGroup) return null;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    
    lassoGroup.textBoxes.forEach(id => {
      const b = textBoxes.find(t => t.id === id);
      if (b) {
        minX = Math.min(minX, b.x); maxX = Math.max(maxX, b.x + b.width);
        minY = Math.min(minY, b.y); maxY = Math.max(maxY, b.y + b.height);
      }
    });
    lassoGroup.images.forEach(id => {
      const img = images.find(i => i.id === id);
      if (img) {
        minX = Math.min(minX, img.x); maxX = Math.max(maxX, img.x + img.width);
        minY = Math.min(minY, img.y); maxY = Math.max(maxY, img.y + img.height);
      }
    });
    lassoGroup.tables.forEach(id => {
      const tab = tables.find(t => t.id === id);
      if (tab) {
        minX = Math.min(minX, tab.x); maxX = Math.max(maxX, tab.x + tab.width);
        minY = Math.min(minY, tab.y); maxY = Math.max(maxY, tab.y + tab.height);
      }
    });
    lassoGroup.lines.forEach(idx => {
      const line = lines[idx];
      const box = getBoundingBox(line);
      if (box) {
        minX = Math.min(minX, box.minX); maxX = Math.max(maxX, box.maxX);
        minY = Math.min(minY, box.minY); maxY = Math.max(maxY, box.maxY);
      }
    });
    
    if (minX === Infinity) return null;
    return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
  };

  // Laser pointer fade effect
  useEffect(() => {
    if (tool !== 'pointer' && pointerPath.length === 0) return;
    const interval = setInterval(() => {
      const now = Date.now();
      setPointerPath(prev => prev.filter(p => now - p.time < 1200));
    }, 50);
    return () => clearInterval(interval);
  }, [pointerPath, tool]);

  // Find closest drawn line
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
    let minDistance = 25; // 25px selection radius
    
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

  // Find selected Text Box
  const findSelectedTextBoxId = (x, y) => {
    // Iterate in reverse (top elements first)
    for (let i = textBoxes.length - 1; i >= 0; i--) {
      const box = textBoxes[i];
      if (x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height) {
        return box.id;
      }
    }
    return null;
  };

  // Find selected Image
  const findSelectedImageId = (x, y) => {
    // Iterate in reverse (top elements first)
    const pageImages = currentPage.images || [];
    for (let i = pageImages.length - 1; i >= 0; i--) {
      const img = pageImages[i];
      if (x >= img.x && x <= img.x + img.width && y >= img.y && y <= img.y + img.height) {
        return img.id;
      }
    }
    return null;
  };

  // Load layout dimensions dynamically
  const handleCanvasLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    setLayoutSize({ width: width || CANVAS_WIDTH, height: height || CANVAS_HEIGHT });
  };

  // Touch handlers
  const handleTouchStart = (event) => {
    const { locationX, locationY, touches } = event.nativeEvent;
    
    const activeTouches = touches || [];
    if (activeTouches.length > 1) {
      setIsMultiTouch(true);
      const avgY = (activeTouches[0].pageY + activeTouches[1].pageY) / 2;
      lastTouchYRef.current = avgY;
      setCurrentLine([]);
      return;
    } else {
      setIsMultiTouch(false);
    }
    
    // Scale local touch coordinates to 360x[pageHeight] system
    let actualX = locationX / scaleFactorX;
    let actualY = locationY / scaleFactorY;

    saveToHistory();

    // 1. Ruler Interaction Check (FIRST, before snapping)
    if (ruler.visible) {
      const cx = ruler.x + ruler.length / 2;
      const cy = ruler.y + ruler.height / 2;
      const dx = actualX - cx;
      const dy = actualY - cy;
      const theta = (ruler.angle * Math.PI) / 180;
      const cosT = Math.cos(-theta);
      const sinT = Math.sin(-theta);
      const localX = dx * cosT - dy * sinT;
      const localY = dx * sinT + dy * cosT;

      // Check if touch is inside the ruler's boundary box
      if (Math.abs(localX) <= ruler.length / 2 && Math.abs(localY) <= ruler.height / 2) {
        // Check if near close button (within 16px of localX = ruler.length/2 - 16, localY = 0)
        const closeX = ruler.length / 2 - 16;
        const closeY = 0;
        const distToClose = Math.sqrt((localX - closeX) * (localX - closeX) + (localY - closeY) * (localY - closeY));
        if (distToClose < 16) {
          setRuler(prev => ({ ...prev, visible: false }));
          return;
        }

        // If near center rotation wheel (within 22px)
        if (Math.sqrt(localX * localX + localY * localY) < 22) {
          setRulerRotateStart({
            angle: ruler.angle,
            startAngle: Math.atan2(actualY - cy, actualX - cx) * 180 / Math.PI
          });
        } else {
          // Dragging ruler
          setRulerDragStart({
            x: actualX,
            y: actualY,
            rx: ruler.x,
            ry: ruler.y
          });
        }
        return; // Consume touch event so we don't draw or snap!
      }
    }

    // 2. Snapping math for ruler (only for drawing tools)
    if (ruler.visible && (tool === 'pen' || tool === 'marker' || tool === 'highlighter' || tool === 'shape')) {
      const cx = ruler.x + ruler.length / 2;
      const cy = ruler.y + ruler.height / 2;
      const dx = actualX - cx;
      const dy = actualY - cy;
      const theta = (ruler.angle * Math.PI) / 180;
      const cosT = Math.cos(-theta);
      const sinT = Math.sin(-theta);
      const localX = dx * cosT - dy * sinT;
      const localY = dx * sinT + dy * cosT;

      const halfH = ruler.height / 2;
      const snapThreshold = 30; // slightly increased snap range for comfort

      if (Math.abs(localY - (-halfH)) < snapThreshold) {
        const snappedLocalY = -halfH;
        const cosT2 = Math.cos(theta);
        const sinT2 = Math.sin(theta);
        actualX = cx + localX * cosT2 - snappedLocalY * sinT2;
        actualY = cy + localX * sinT2 + snappedLocalY * cosT2;
      } else if (Math.abs(localY - halfH) < snapThreshold) {
        const snappedLocalY = halfH;
        const cosT2 = Math.cos(theta);
        const sinT2 = Math.sin(theta);
        actualX = cx + localX * cosT2 - snappedLocalY * sinT2;
        actualY = cy + localX * sinT2 + snappedLocalY * cosT2;
      }
    }

    if (tool === 'pan') {
      // Scroll tool: let native ScrollView handle gestures
      return;
    }

    // Check if clicked Zoombox target to drag it
    if (zoombox.visible && actualX >= zoombox.x && actualX <= zoombox.x + zoombox.width && actualY >= zoombox.y && actualY <= zoombox.y + zoombox.height) {
      setZoomboxDragStart({ x: actualX, y: actualY, zx: zoombox.x, zy: zoombox.y });
      return;
    }

    if (tool === 'eraser') {
      checkProximityAndErase(actualX, actualY);
    } else if (tool === 'select') {
      // 1. Check if clicked a tape to toggle
      const clickedTapeIdx = tapes.findIndex(t => 
        actualX >= t.x && 
        actualX <= t.x + t.width && 
        actualY >= t.y && 
        actualY <= t.y + t.height
      );
      if (clickedTapeIdx !== -1) {
        setTapes(prev => prev.map((t, idx) => 
          idx === clickedTapeIdx ? { ...t, hidden: !t.hidden } : t
        ));
        return;
      }

      // 2. Check if clicked inside active lasso group combined boundary
      if (lassoGroup) {
        const box = getLassoGroupBounds();
        if (box) {
          // Check lasso group delete button
          if (Math.sqrt((actualX - (box.minX - 4)) ** 2 + (actualY - (box.minY - 4)) ** 2) < 20) {
            setLines(prev => prev.filter((_, idx) => !lassoGroup.lines.includes(idx)));
            setTextBoxes(prev => prev.filter(t => !lassoGroup.textBoxes.includes(t.id)));
            setImages(prev => prev.filter(i => !lassoGroup.images.includes(i.id)));
            setTables(prev => prev.filter(t => !lassoGroup.tables.includes(t.id)));
            setLassoGroup(null);
            return;
          }
          
          if (actualX >= box.minX && actualX <= box.maxX && actualY >= box.minY && actualY <= box.maxY) {
            setLassoDragStart({ x: actualX, y: actualY });
            const originalGroupPos = {
              textBoxes: textBoxes.filter(t => lassoGroup.textBoxes.includes(t.id)).map(t => ({ id: t.id, x: t.x, y: t.y })),
              images: images.filter(i => lassoGroup.images.includes(i.id)).map(i => ({ id: i.id, x: i.x, y: i.y })),
              tables: tables.filter(t => lassoGroup.tables.includes(t.id)).map(t => ({ id: t.id, x: t.x, y: t.y })),
              lines: lassoGroup.lines.map(idx => ({ idx, points: [...lines[idx]] }))
            };
            setOriginalLassoGroupPos(originalGroupPos);
            return;
          } else {
            setLassoGroup(null);
          }
        }
      }

      // 3. Check if we clicked a table (select, double-tap, or resize separators)
      if (selectedTableId !== null) {
        const t = tables.find(tab => tab.id === selectedTableId);
        if (t) {
          // Check column resizers
          let currentX = t.x;
          for (let c = 0; c < t.cols; c++) {
            currentX += t.cellWidths[c];
            const dist = Math.abs(actualX - currentX);
            if (dist < 12 && actualY >= t.y && actualY <= t.y + t.height) {
              setTableResize({
                tableId: t.id,
                type: 'col',
                index: c,
                startPos: actualX,
                startSizes: [...t.cellWidths]
              });
              setDragStartPoint({ x: actualX, y: actualY });
              return;
            }
          }

          // Check row resizers
          let currentY = t.y;
          for (let r = 0; r < t.rows; r++) {
            currentY += t.cellHeights[r];
            const dist = Math.abs(actualY - currentY);
            if (dist < 12 && actualX >= t.x && actualX <= t.x + t.width) {
              setTableResize({
                tableId: t.id,
                type: 'row',
                index: r,
                startPos: actualY,
                startSizes: [...t.cellHeights]
              });
              setDragStartPoint({ x: actualX, y: actualY });
              return;
            }
          }
        }
      }

      const tab = tables.find(t => 
        actualX >= t.x && 
        actualX <= t.x + t.width && 
        actualY >= t.y && 
        actualY <= t.y + t.height
      );
      if (tab) {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;
        const isDoubleTap = lastTap.id === `cell_${tab.id}` && (now - lastTap.time) < DOUBLE_TAP_DELAY;
        
        const localX = actualX - tab.x;
        const localY = actualY - tab.y;
        const { rowIdx, colIdx } = getTableCellAt(tab, localX, localY);
        
        if (isDoubleTap && rowIdx !== -1 && colIdx !== -1) {
          setEditingTableCell({ tableId: tab.id, rIdx: rowIdx, cIdx: colIdx });
          setEditingTextValue(tab.data[rowIdx][colIdx] || '');
          setIsTextEditVisible(true);
          setLastTap({ id: null, time: 0 });
          return;
        }
        
        setLastTap({ id: `cell_${tab.id}`, time: now });
        setSelectedTableId(tab.id);
        setSelectedTextBoxId(null);
        setSelectedImageId(null);
        setSelectedLineIndex(null);
        setDragStartPoint({ x: actualX, y: actualY });
        return;
      }

      // Deselect table if clicked elsewhere
      setSelectedTableId(null);

      // 4. Check if we clicked handles of the selected drawing
      if (selectedLineIndex !== null && lines[selectedLineIndex]) {
        const box = getBoundingBox(lines[selectedLineIndex]);
        if (box) {
          const cx = (box.minX + box.maxX) / 2;
          const cy = (box.minY + box.maxY) / 2;

          // Delete Anchor (Top-Left)
          if (Math.sqrt((actualX - box.minX) ** 2 + (actualY - box.minY) ** 2) < 22) {
            setLines((prev) => prev.filter((_, i) => i !== selectedLineIndex));
            setSelectedLineIndex(null);
            return;
          }

          // Duplicate Anchor (Top-Right)
          if (Math.sqrt((actualX - box.maxX) ** 2 + (actualY - box.minY) ** 2) < 22) {
            const sourceLine = lines[selectedLineIndex];
            const duplicatedLine = sourceLine.map(p => ({
              ...p,
              x: Math.min(CANVAS_WIDTH - 20, p.x + 25),
              y: Math.min(CANVAS_HEIGHT - 20, p.y + 25)
            }));
            setLines((prev) => {
              const next = [...prev, duplicatedLine];
              setSelectedLineIndex(next.length - 1);
              return next;
            });
            return;
          }

          // Text/Label Anchor (Bottom-Left)
          if (Math.sqrt((actualX - box.minX) ** 2 + (actualY - box.maxY) ** 2) < 22) {
            setEditingTextValue(lines[selectedLineIndex][0]?.text || '');
            setIsTextEditVisible(true);
            return;
          }

          // Rotate Anchor (Bottom-Right)
          if (Math.sqrt((actualX - box.maxX) ** 2 + (actualY - box.maxY) ** 2) < 22) {
            setIsRotating(true);
            setDragStartPoint({ x: actualX, y: actualY });
            setResizeStartBox(box);
            setOriginalLine(lines[selectedLineIndex]);
            return;
          }

          // Resize Anchor Points (Middle of margins)
          if (Math.sqrt((actualX - box.minX) ** 2 + (actualY - cy) ** 2) < 18) {
            setResizeSide('left');
            setDragStartPoint({ x: actualX, y: actualY });
            setResizeStartBox(box);
            setOriginalLine(lines[selectedLineIndex]);
            return;
          }
          if (Math.sqrt((actualX - box.maxX) ** 2 + (actualY - cy) ** 2) < 18) {
            setResizeSide('right');
            setDragStartPoint({ x: actualX, y: actualY });
            setResizeStartBox(box);
            setOriginalLine(lines[selectedLineIndex]);
            return;
          }
          if (Math.sqrt((actualX - cx) ** 2 + (actualY - box.minY) ** 2) < 18) {
            setResizeSide('top');
            setDragStartPoint({ x: actualX, y: actualY });
            setResizeStartBox(box);
            setOriginalLine(lines[selectedLineIndex]);
            return;
          }
          if (Math.sqrt((actualX - cx) ** 2 + (actualY - box.maxY) ** 2) < 18) {
            setResizeSide('bottom');
            setDragStartPoint({ x: actualX, y: actualY });
            setResizeStartBox(box);
            setOriginalLine(lines[selectedLineIndex]);
            return;
          }

          // Drag Anchor (Click anywhere inside bounding box to move)
          if (actualX >= box.minX && actualX <= box.maxX && actualY >= box.minY && actualY <= box.maxY) {
            setDragStartPoint({ x: actualX, y: actualY });
            setOriginalLine(lines[selectedLineIndex]);
            return;
          }
        }
      }

      // 2. Check if we clicked handles of selected Text Box
      if (selectedTextBoxId !== null) {
        const box = textBoxes.find(t => t.id === selectedTextBoxId);
        if (box) {
          // Delete Anchor (Top-Left)
          if (Math.sqrt((actualX - box.x) ** 2 + (actualY - box.y) ** 2) < 20) {
            setTextBoxes((prev) => prev.filter(t => t.id !== selectedTextBoxId));
            setSelectedTextBoxId(null);
            return;
          }
          // Edit Text Anchor (Top-Right)
          if (Math.sqrt((actualX - (box.x + box.width)) ** 2 + (actualY - box.y) ** 2) < 20) {
            setEditingTextValue(box.text === 'Tap to edit text' ? '' : box.text);
            setIsTextEditVisible(true);
            return;
          }
          // Bottom-Right corner resize anchor
          if (Math.sqrt((actualX - (box.x + box.width)) ** 2 + (actualY - (box.y + box.height)) ** 2) < 22) {
            setResizeSide('textbox');
            setDragStartPoint({ x: actualX, y: actualY });
            setResizeStartBox({ x: box.x, y: box.y, width: box.width, height: box.height });
            return;
          }
        }
      }

      // 3. Check if we clicked handles of selected Image
      if (selectedImageId !== null) {
        const img = images.find(i => i.id === selectedImageId);
        if (img) {
          // Delete Anchor (Top-Left)
          if (Math.sqrt((actualX - img.x) ** 2 + (actualY - img.y) ** 2) < 22) {
            setImages((prev) => prev.filter(i => i.id !== selectedImageId));
            setSelectedImageId(null);
            return;
          }
          // Resize Anchor (Bottom-Right corner)
          if (Math.sqrt((actualX - (img.x + img.width)) ** 2 + (actualY - (img.y + img.height)) ** 2) < 22) {
            setResizeSide('image');
            setDragStartPoint({ x: actualX, y: actualY });
            setResizeStartBox({ x: img.x, y: img.y, width: img.width, height: img.height });
            return;
          }
        }
      }

      // 4. Try to select a Text Box (Top Layer)
      const boxId = findSelectedTextBoxId(actualX, actualY);
      if (boxId) {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;
        const isDoubleTap = lastTap.id === boxId && (now - lastTap.time) < DOUBLE_TAP_DELAY;
        setLastTap({ id: boxId, time: now });

        if (isDoubleTap) {
          const box = textBoxes.find(t => t.id === boxId);
          if (box) {
            setEditingTextValue(box.text === 'Tap to edit text' ? '' : box.text);
            setIsTextEditVisible(true);
          }
          return;
        }

        setSelectedTextBoxId(boxId);
        setSelectedLineIndex(null);
        setSelectedImageId(null);
        setDragStartPoint({ x: actualX, y: actualY });
        
        // Load properties into formatting states
        const box = textBoxes.find(t => t.id === boxId);
        if (box) {
          setActiveFontSize(box.fontSize || 16);
          setActiveTextColor(box.color || '#000000');
          setActiveAlignment(box.alignment || 'left');
          setIsBold(box.fontStyle?.includes('bold') || false);
          setIsItalic(box.fontStyle?.includes('italic') || false);
        }
        return;
      }

      // 5. Try to select an Image (Middle Layer)
      const imgId = findSelectedImageId(actualX, actualY);
      if (imgId) {
        setSelectedImageId(imgId);
        setSelectedTextBoxId(null);
        setSelectedLineIndex(null);
        setDragStartPoint({ x: actualX, y: actualY });
        return;
      }

      // 6. Try to select a Line (Bottom Layer)
      const idx = findClosestLineIndex(actualX, actualY);
      if (idx !== null) {
        setSelectedLineIndex(idx);
        setSelectedTextBoxId(null);
        setSelectedImageId(null);
        setDragStartPoint({ x: actualX, y: actualY });
        setOriginalLine(lines[idx]);
        return;
      }

      // 7. Otherwise, clicked blank background -> Deselect all
      setSelectedLineIndex(null);
      setSelectedTextBoxId(null);
      setSelectedImageId(null);
    } else if (tool === 'text') {
      // Tap to place a text box
      const boxId = `txt_${Date.now()}`;
      const newBox = {
        id: boxId,
        text: 'Tap to edit text',
        x: Math.min(CANVAS_WIDTH - 150, Math.max(10, actualX - 75)),
        y: Math.min(CANVAS_HEIGHT - 40, Math.max(10, actualY - 15)),
        width: 150,
        height: 38,
        color: activeTextColor,
        fontSize: activeFontSize,
        alignment: activeAlignment,
        fontStyle: `${isBold ? 'bold' : ''} ${isItalic ? 'italic' : ''}`.trim() || 'normal'
      };
      setTextBoxes(prev => [...prev, newBox]);
      setSelectedTextBoxId(boxId);
      setEditingTextValue('');
      setIsTextEditVisible(true);
      setTool('select');
    } else if (tool === 'table') {
      const tableId = `table_${Date.now()}`;
      const defaultRows = 3;
      const defaultCols = 3;
      const defaultCellW = 80;
      const defaultCellH = 30;
      const newTable = {
        id: tableId,
        x: Math.min(CANVAS_WIDTH - 240, Math.max(10, actualX - 120)),
        y: Math.min(currentPage.pageHeight - 90, Math.max(10, actualY - 45)),
        rows: defaultRows,
        cols: defaultCols,
        cellWidths: Array(defaultCols).fill(defaultCellW),
        cellHeights: Array(defaultRows).fill(defaultCellH),
        width: defaultCols * defaultCellW,
        height: defaultRows * defaultCellH,
        data: Array(defaultRows).fill(null).map(() => Array(defaultCols).fill(''))
      };
      setTables(prev => [...prev, newTable]);
      setSelectedTableId(tableId);
      setTool('select');
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
        initialPoints = Array(33).fill({ x: actualX, y: actualY, color: strokeColor, width: currentWidth, opacity });
      } else if (selectedShape === 'triangle') {
        initialPoints = Array(4).fill({ x: actualX, y: actualY, color: strokeColor, width: currentWidth, opacity });
      } else if (selectedShape === 'star') {
        initialPoints = Array(11).fill({ x: actualX, y: actualY, color: strokeColor, width: currentWidth, opacity });
      } else if (selectedShape === 'arrow') {
        initialPoints = Array(5).fill({ x: actualX, y: actualY, color: strokeColor, width: currentWidth, opacity });
      }
      setCurrentLine(initialPoints);
    } else if (tool === 'lasso') {
      setLassoPoints([{ x: actualX, y: actualY }]);
      setLassoGroup(null);
    } else if (tool === 'pointer') {
      setPointerPath([{ x: actualX, y: actualY, time: Date.now() }]);
    } else if (tool === 'tape') {
      setDragStartPoint({ x: actualX, y: actualY });
      setActiveTape({
        id: `tape_${Date.now()}`,
        x: actualX,
        y: actualY - 12,
        width: 1,
        height: 24,
        color: strokeColor,
        hidden: false
      });
    } else {
      // Drawing mode: pen, marker, highlighter
      let currentWidth = strokeWidth;
      let opacity = 1;

      if (tool === 'marker') {
        currentWidth = strokeWidth * 2;
      } else if (tool === 'highlighter') {
        currentWidth = strokeWidth * 3.5;
        opacity = 0.35;
      }

      const pressure = event.nativeEvent.pressure || event.nativeEvent.force || 0.5;
      const finalWidth = Math.max(1.5, currentWidth * (0.4 + pressure * 1.2));

      setCurrentLine([{ 
        x: actualX, 
        y: actualY, 
        color: strokeColor, 
        width: finalWidth,
        opacity
      }]);
    }
  };

  const handleTouchMove = (event) => {
    const { locationX, locationY, touches } = event.nativeEvent;
    
    const activeTouches = touches || [];
    if (activeTouches.length > 1 || isMultiTouch) {
      if (!isMultiTouch) {
        setIsMultiTouch(true);
        const avgY = (activeTouches[0].pageY + (activeTouches[1] ? activeTouches[1].pageY : activeTouches[0].pageY)) / 2;
        lastTouchYRef.current = avgY;
        setCurrentLine([]);
        return;
      }
      
      const avgY = (activeTouches[0].pageY + (activeTouches[1] ? activeTouches[1].pageY : activeTouches[0].pageY)) / 2;
      const deltaY = avgY - lastTouchYRef.current;
      lastTouchYRef.current = avgY;
      
      const currentScroll = scrollOffsetRef.current;
      scrollViewRef.current?.scrollTo({ 
        y: Math.max(0, currentScroll - deltaY), 
        animated: false 
      });
      setCurrentLine([]);
      return;
    }

    let actualX = locationX / scaleFactorX;
    let actualY = locationY / scaleFactorY;

    // Ruler Interaction Move Check
    if (ruler.visible && rulerRotateStart) {
      const cx = ruler.x + ruler.length / 2;
      const cy = ruler.y + ruler.height / 2;
      const currentAngle = Math.atan2(actualY - cy, actualX - cx) * 180 / Math.PI;
      let newAngle = rulerRotateStart.angle + (currentAngle - rulerRotateStart.startAngle);
      // Snap to 0, 45, 90, 135, 180 degrees if close (within 4 degrees)
      const snapAngles = [0, 45, 90, 135, 180, -45, -90, -135, -180];
      for (const snap of snapAngles) {
        if (Math.abs(newAngle - snap) < 4) {
          newAngle = snap;
          break;
        }
      }
      setRuler(prev => ({ ...prev, angle: newAngle }));
      return;
    }

    if (ruler.visible && rulerDragStart) {
      const dx = actualX - rulerDragStart.x;
      const dy = actualY - rulerDragStart.y;
      setRuler(prev => ({
        ...prev,
        x: rulerDragStart.rx + dx,
        y: rulerDragStart.ry + dy
      }));
      return;
    }

    // Snapping math for ruler
    if (ruler.visible && (tool === 'pen' || tool === 'marker' || tool === 'highlighter' || tool === 'shape')) {
      const cx = ruler.x + ruler.length / 2;
      const cy = ruler.y + ruler.height / 2;
      const dx = actualX - cx;
      const dy = actualY - cy;
      const theta = (ruler.angle * Math.PI) / 180;
      const cosT = Math.cos(-theta);
      const sinT = Math.sin(-theta);
      const localX = dx * cosT - dy * sinT;
      const localY = dx * sinT + dy * cosT;

      const halfH = ruler.height / 2;
      const snapThreshold = 25;

      if (Math.abs(localY - (-halfH)) < snapThreshold) {
        const snappedLocalY = -halfH;
        const cosT2 = Math.cos(theta);
        const sinT2 = Math.sin(theta);
        actualX = cx + localX * cosT2 - snappedLocalY * sinT2;
        actualY = cy + localX * sinT2 + snappedLocalY * cosT2;
      } else if (Math.abs(localY - halfH) < snapThreshold) {
        const snappedLocalY = halfH;
        const cosT2 = Math.cos(theta);
        const sinT2 = Math.sin(theta);
        actualX = cx + localX * cosT2 - snappedLocalY * sinT2;
        actualY = cy + localX * sinT2 + snappedLocalY * cosT2;
      }
    }

    if (tool === 'select' && tableResize) {
      setTables(prev => prev.map(t => {
        if (t.id === tableResize.tableId) {
          if (tableResize.type === 'col') {
            const dx = actualX - tableResize.startPos;
            const newWidths = [...tableResize.startSizes];
            newWidths[tableResize.index] = Math.max(30, tableResize.startSizes[tableResize.index] + dx);
            const totalW = newWidths.reduce((a, b) => a + b, 0);
            return {
              ...t,
              cellWidths: newWidths,
              width: totalW
            };
          } else {
            const dy = actualY - tableResize.startPos;
            const newHeights = [...tableResize.startSizes];
            newHeights[tableResize.index] = Math.max(20, tableResize.startSizes[tableResize.index] + dy);
            const totalH = newHeights.reduce((a, b) => a + b, 0);
            return {
              ...t,
              cellHeights: newHeights,
              height: totalH
            };
          }
        }
        return t;
      }));
      return;
    }

    if (tool === 'pan') {
      // Scroll tool: let native ScrollView handle gestures
      return;
    }

    if (tool === 'lasso' && lassoPoints) {
      setLassoPoints(prev => [...prev, { x: actualX, y: actualY }]);
      return;
    } else if (tool === 'pointer' && pointerPath.length > 0) {
      setPointerPath(prev => [...prev, { x: actualX, y: actualY, time: Date.now() }]);
      return;
    } else if (tool === 'tape' && dragStartPoint && activeTape) {
      const width = actualX - dragStartPoint.x;
      setActiveTape(prev => ({
        ...prev,
        width: Math.abs(width),
        x: width < 0 ? actualX : dragStartPoint.x
      }));
      return;
    } else if (zoombox.visible && zoomboxDragStart) {
      const dx = actualX - zoomboxDragStart.x;
      const dy = actualY - zoomboxDragStart.y;
      setZoombox(prev => ({
        ...prev,
        x: Math.max(10, Math.min(CANVAS_WIDTH - prev.width - 10, zoomboxDragStart.zx + dx)),
        y: Math.max(10, Math.min(currentPage.pageHeight - prev.height - 10, zoomboxDragStart.zy + dy))
      }));
      return;
    } else if (tool === 'select' && lassoDragStart && originalLassoGroupPos) {
      const dx = actualX - lassoDragStart.x;
      const dy = actualY - lassoDragStart.y;
      setTextBoxes(prev => prev.map(t => {
        const orig = originalLassoGroupPos.textBoxes.find(o => o.id === t.id);
        return orig ? { ...t, x: orig.x + dx, y: orig.y + dy } : t;
      }));
      setImages(prev => prev.map(i => {
        const orig = originalLassoGroupPos.images.find(o => o.id === i.id);
        return orig ? { ...i, x: orig.x + dx, y: orig.y + dy } : i;
      }));
      setTables(prev => prev.map(t => {
        const orig = originalLassoGroupPos.tables.find(o => o.id === t.id);
        return orig ? { ...t, x: orig.x + dx, y: orig.y + dy } : t;
      }));
      setLines(prev => prev.map((line, idx) => {
        const orig = originalLassoGroupPos.lines.find(o => o.idx === idx);
        return orig ? orig.points.map(pt => ({ ...pt, x: pt.x + dx, y: pt.y + dy })) : line;
      }));
      return;
    } else if (tool === 'select' && selectedTableId !== null && dragStartPoint) {
      const dx = actualX - dragStartPoint.x;
      const dy = actualY - dragStartPoint.y;
      setTables(prev => prev.map(t => 
        t.id === selectedTableId 
          ? { 
              ...t, 
              x: Math.min(CANVAS_WIDTH - 20, Math.max(-t.width + 20, t.x + dx)), 
              y: Math.min(currentPage.pageHeight - 20, Math.max(-t.height + 20, t.y + dy)) 
            }
          : t
      ));
      setDragStartPoint({ x: actualX, y: actualY });
      return;
    }

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
        } else if (resizeSide && resizeStartBox && resizeSide !== 'textbox') {
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
          // Standard dragging for lines
          const dx = actualX - dragStartPoint.x;
          const dy = actualY - dragStartPoint.y;

          setLines((prevLines) =>
            prevLines.map((line, idx) => {
              if (idx === selectedLineIndex) {
                return originalLine.map((point) => ({
                  ...point,
                  x: Math.min(CANVAS_WIDTH - 5, Math.max(5, point.x + dx)),
                  y: Math.min(CANVAS_HEIGHT - 5, Math.max(5, point.y + dy)),
                }));
              }
              return line;
            })
          );
        }
      } else if (selectedTextBoxId !== null && dragStartPoint) {
        if (resizeSide === 'textbox' && resizeStartBox) {
          // Resizing text box width & height
          const dx = actualX - dragStartPoint.x;
          const dy = actualY - dragStartPoint.y;
          const newW = Math.max(60, resizeStartBox.width + dx);
          const newH = Math.max(25, resizeStartBox.height + dy);
          
          setTextBoxes((prev) =>
            prev.map((box) =>
              box.id === selectedTextBoxId
                ? { ...box, width: newW, height: newH }
                : box
            )
          );
        } else {
          // Dragging text box around
          const dx = actualX - dragStartPoint.x;
          const dy = actualY - dragStartPoint.y;
          setTextBoxes((prev) =>
            prev.map((box) => {
              if (box.id === selectedTextBoxId) {
                return {
                  ...box,
                  x: Math.min(CANVAS_WIDTH - 20, Math.max(-box.width + 20, box.x + dx)),
                  y: Math.min(CANVAS_HEIGHT - 20, Math.max(-box.height + 20, box.y + dy)),
                };
              }
              return box;
            })
          );
          setDragStartPoint({ x: actualX, y: actualY });
        }
      } else if (selectedImageId !== null && dragStartPoint) {
        if (resizeSide === 'image' && resizeStartBox) {
          // Resizing image width & height
          const dx = actualX - dragStartPoint.x;
          const dy = actualY - dragStartPoint.y;
          const newW = Math.max(30, resizeStartBox.width + dx);
          const newH = Math.max(30, resizeStartBox.height + dy);
          
          setImages((prev) =>
            prev.map((img) =>
              img.id === selectedImageId
                ? { ...img, width: newW, height: newH }
                : img
            )
          );
        } else {
          // Dragging image around
          const dx = actualX - dragStartPoint.x;
          const dy = actualY - dragStartPoint.y;
          setImages((prev) =>
            prev.map((img) => {
              if (img.id === selectedImageId) {
                return {
                  ...img,
                  x: Math.min(CANVAS_WIDTH - 20, Math.max(-img.width + 20, img.x + dx)),
                  y: Math.min(CANVAS_HEIGHT - 20, Math.max(-img.height + 20, img.y + dy)),
                };
              }
              return img;
            })
          );
          setDragStartPoint({ x: actualX, y: actualY });
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
        
        for (let i = 0; i <= 32; i++) {
          const theta = (i * 2 * Math.PI) / 32;
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
      // Drawing in progress
      let currentWidth = strokeWidth;
      let opacity = 1;

      if (tool === 'marker') {
        currentWidth = strokeWidth * 2;
      } else if (tool === 'highlighter') {
        currentWidth = strokeWidth * 3.5;
        opacity = 0.35;
      }

      const pressure = event.nativeEvent.pressure || event.nativeEvent.force || 0.5;
      const finalWidth = Math.max(1.5, currentWidth * (0.4 + pressure * 1.2));

      setCurrentLine((prev) => [
        ...prev,
        { 
          x: actualX, 
          y: actualY, 
          color: strokeColor, 
          width: finalWidth,
          opacity
        },
      ]);
    }
  };

  const handleTouchEnd = () => {
    setIsRotating(false);
    setResizeSide(null);
    setResizeStartBox(null);
    setOriginalLine(null);
    setIsMultiTouch(false);
    setZoomboxDragStart(null);
    setLassoDragStart(null);
    setTableResize(null);
    setRulerDragStart(null);
    setRulerRotateStart(null);

    if (tool === 'lasso' && lassoPoints) {
      const selectedLines = [];
      const selectedTextBoxes = [];
      const selectedImages = [];
      const selectedTables = [];

      lines.forEach((line, idx) => {
        const box = getBoundingBox(line);
        if (box) {
          const cx = (box.minX + box.maxX) / 2;
          const cy = (box.minY + box.maxY) / 2;
          if (isPointInPolygon({ x: cx, y: cy }, lassoPoints)) {
            selectedLines.push(idx);
          }
        }
      });

      textBoxes.forEach(b => {
        const cx = b.x + b.width / 2;
        const cy = b.y + b.height / 2;
        if (isPointInPolygon({ x: cx, y: cy }, lassoPoints)) {
          selectedTextBoxes.push(b.id);
        }
      });

      images.forEach(i => {
        const cx = i.x + i.width / 2;
        const cy = i.y + i.height / 2;
        if (isPointInPolygon({ x: cx, y: cy }, lassoPoints)) {
          selectedImages.push(i.id);
        }
      });

      tables.forEach(t => {
        const cx = t.x + t.width / 2;
        const cy = t.y + t.height / 2;
        if (isPointInPolygon({ x: cx, y: cy }, lassoPoints)) {
          selectedTables.push(t.id);
        }
      });

      const totalCount = selectedLines.length + selectedTextBoxes.length + selectedImages.length + selectedTables.length;
      if (totalCount > 0) {
        setLassoGroup({
          lines: selectedLines,
          textBoxes: selectedTextBoxes,
          images: selectedImages,
          tables: selectedTables
        });
        setTool('select');
      }
      setLassoPoints(null);
    } else if (tool === 'tape' && activeTape) {
      if (activeTape.width > 5) {
        setTapes(prev => [...prev, activeTape]);
      }
      setActiveTape(null);
      setTool('select');
    }

    if (tool !== 'select' && tool !== 'eraser' && tool !== 'pan' && tool !== 'lasso' && tool !== 'pointer' && tool !== 'tape') {
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

  const handleZoomPanelTouchStart = (event) => {
    const { locationX, locationY } = event.nativeEvent;
    const mappedX = zoombox.x + locationX / 2;
    const mappedY = zoombox.y + locationY / 2;

    if (tool === 'eraser') {
      checkProximityAndErase(mappedX, mappedY);
      return;
    }

    let currentWidth = strokeWidth;
    let opacity = 1;
    if (tool === 'marker') {
      currentWidth = strokeWidth * 2;
    } else if (tool === 'highlighter') {
      currentWidth = strokeWidth * 3.5;
      opacity = 0.35;
    }

    setCurrentLine([{ 
      x: mappedX, 
      y: mappedY, 
      color: strokeColor, 
      width: currentWidth,
      opacity
    }]);
  };

  const handleZoomPanelTouchMove = (event) => {
    const { locationX, locationY } = event.nativeEvent;
    const mappedX = zoombox.x + locationX / 2;
    const mappedY = zoombox.y + locationY / 2;

    if (tool === 'eraser') {
      checkProximityAndErase(mappedX, mappedY);
      return;
    }

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
        x: mappedX, 
        y: mappedY, 
        color: strokeColor, 
        width: currentWidth,
        opacity
      },
    ]);
  };

  const handleZoomPanelTouchEnd = () => {
    if (currentLine.length > 0) {
      setLines((prev) => [...prev, currentLine]);
      setCurrentLine([]);
    }
  };



  const handleSave = () => {
    onSave(pages);
  };

  const handleScroll = (event) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const scrollY = contentOffset.y;
    scrollOffsetRef.current = scrollY;

    const currentPageHeight = currentPage.pageHeight || 1500;
    // Auto expand page height by 1000px when user scrolls close to the bottom of the viewport
    if (scrollY + layoutMeasurement.height > contentSize.height - 150) {
      updateCurrentPageData({ pageHeight: currentPageHeight + 1000 });
    }
  };

  const handleTogglePageTheme = () => {
    saveToHistory();
    const currentMode = currentPage.pageThemeMode || (isDark ? 'dark' : 'light');
    const nextMode = currentMode === 'dark' ? 'light' : 'dark';
    updateCurrentPageData({ pageThemeMode: nextMode });
  };

  const handleAddPage = () => {
    saveToHistory();
    // Add page next to the current one
    const newPage = {
      pageStyle: currentPage.pageStyle || 'ruled',
      borderDesign: currentPage.borderDesign || 'classic',
      lines: [],
      textBoxes: [],
      images: [],
      pageHeight: 1500
    };
    
    const updatedPages = [...pages];
    updatedPages.splice(currentPageIdx + 1, 0, newPage);
    setPages(updatedPages);
    setCurrentPageIdx(currentPageIdx + 1);
    setSelectedLineIndex(null);
    setSelectedTextBoxId(null);
    setSelectedImageId(null);
  };

  const handleDeletePage = () => {
    if (pages.length === 1) {
      Alert.alert("Cannot Delete", "Your notebook must contain at least one page!");
      return;
    }

    Alert.alert(
      "Delete Page",
      `Are you sure you want to delete Page ${currentPageIdx + 1}? All drawings and text on this page will be permanently lost.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            saveToHistory();
            const updatedPages = pages.filter((_, idx) => idx !== currentPageIdx);
            setPages(updatedPages);
            setCurrentPageIdx(Math.max(0, currentPageIdx - 1));
            setSelectedLineIndex(null);
            setSelectedTextBoxId(null);
            setSelectedImageId(null);
          }
        }
      ]
    );
  };

  const handleAddImage = async (useCamera = false) => {
    const permissionResult = useCamera 
      ? await ImagePicker.requestCameraPermissionsAsync() 
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        'Permission Required',
        `We need ${useCamera ? 'camera' : 'gallery'} permission to add photos!`
      );
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.8,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.8,
        });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const selectedUri = asset.uri;
      
      const assetW = asset.width || 300;
      const assetH = asset.height || 300;
      const initialWidth = 150;
      const initialHeight = Math.round((initialWidth * assetH) / assetW);
      
      const newImg = {
        id: `img_${Date.now()}`,
        uri: selectedUri,
        x: Math.round((CANVAS_WIDTH - initialWidth) / 2),
        y: Math.round((CANVAS_HEIGHT - initialHeight) / 2),
        width: initialWidth,
        height: initialHeight
      };
      
      setImages(prev => [...prev, newImg]);
      setSelectedImageId(newImg.id);
      setSelectedTextBoxId(null);
      setSelectedLineIndex(null);
      setTool('select');
    }
  };

  const triggerImagePickerOptions = () => {
    Alert.alert(
      "Add Image",
      "Choose an option to add an image:",
      [
        {
          text: "Camera (Take Photo)",
          onPress: () => handleAddImage(true),
        },
        {
          text: "Gallery (Choose Photo)",
          onPress: () => handleAddImage(false),
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  const getPathData = (points) => {
    if (points.length === 0) return '';
    if (points.length === 1) {
      return `M ${points[0].x} ${points[0].y} L ${points[0].x + 0.01} ${points[0].y}`;
    }
    const path = points.reduce((acc, point, idx) => {
      if (idx === 0) {
        return `M ${point.x} ${point.y}`;
      }
      return `${acc} L ${point.x} ${point.y}`;
    }, '');

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

  // Text formatting modifications
  const handleToggleBold = () => {
    const nextVal = !isBold;
    setIsBold(nextVal);
    if (selectedTextBoxId !== null) {
      setTextBoxes(prev =>
        prev.map(box =>
          box.id === selectedTextBoxId
            ? { ...box, fontStyle: `${nextVal ? 'bold' : ''} ${isItalic ? 'italic' : ''}`.trim() || 'normal' }
            : box
        )
      );
    }
  };

  const handleToggleItalic = () => {
    const nextVal = !isItalic;
    setIsItalic(nextVal);
    if (selectedTextBoxId !== null) {
      setTextBoxes(prev =>
        prev.map(box =>
          box.id === selectedTextBoxId
            ? { ...box, fontStyle: `${isBold ? 'bold' : ''} ${nextVal ? 'italic' : ''}`.trim() || 'normal' }
            : box
        )
      );
    }
  };

  const handleFontSizeChange = (size) => {
    setActiveFontSize(size);
    if (selectedTextBoxId !== null) {
      setTextBoxes(prev =>
        prev.map(box =>
          box.id === selectedTextBoxId
            ? { ...box, fontSize: size }
            : box
        )
      );
    }
  };

  const handleAlignmentChange = (align) => {
    setActiveAlignment(align);
    if (selectedTextBoxId !== null) {
      setTextBoxes(prev =>
        prev.map(box =>
          box.id === selectedTextBoxId
            ? { ...box, alignment: align }
            : box
        )
      );
    }
  };

  const handleTextColorChange = (color) => {
    setActiveTextColor(color);
    if (selectedTextBoxId !== null) {
      setTextBoxes(prev =>
        prev.map(box =>
          box.id === selectedTextBoxId
            ? { ...box, color }
            : box
        )
      );
    }
  };

  // Renders ruled line patterns inside the SVG
  const renderPageGuidelines = () => {
    const pageHeight = currentPage.pageHeight || 500;
    if (currentPage.pageStyle === 'ruled') {
      const lineSlots = Math.floor(pageHeight / 24);
      return (
        <>
          {Array.from({ length: lineSlots }).map((_, i) => (
            <Path
              key={`ruled-${i}`}
              d={`M 0 ${(i + 1) * 24} L ${CANVAS_WIDTH} ${(i + 1) * 24}`}
              stroke={isPageDark ? "#2C3E50" : "#5D9CEC"}
              strokeWidth={0.8}
              opacity={isPageDark ? 0.6 : 0.8}
            />
          ))}
          {/* Vertical left margin line */}
          <Path
            d={`M 45 0 L 45 ${pageHeight}`}
            stroke={isPageDark ? "#E74C3C" : "#D32F2F"}
            strokeWidth={1.2}
            opacity={isPageDark ? 0.5 : 0.8}
          />
        </>
      );
    }
    if (currentPage.pageStyle === 'grid') {
      const hSlots = Math.floor(pageHeight / 20);
      const vSlots = Math.floor(CANVAS_WIDTH / 20);
      return (
        <>
          {Array.from({ length: hSlots }).map((_, i) => (
            <Path
              key={`grid-h-${i}`}
              d={`M 0 ${(i + 1) * 20} L ${CANVAS_WIDTH} ${(i + 1) * 20}`}
              stroke={isPageDark ? "#2A2A2A" : "#B0BEC5"}
              strokeWidth={0.8}
            />
          ))}
          {Array.from({ length: vSlots }).map((_, i) => (
            <Path
              key={`grid-v-${i}`}
              d={`M ${(i + 1) * 20} 0 L ${(i + 1) * 20} ${pageHeight}`}
              stroke={isPageDark ? "#2A2A2A" : "#B0BEC5"}
              strokeWidth={0.8}
            />
          ))}
        </>
      );
    }
    if (currentPage.pageStyle === 'dotted') {
      const rCount = Math.floor(pageHeight / 20);
      const cCount = Math.floor(CANVAS_WIDTH / 20);
      const dots = [];
      for (let r = 1; r < rCount; r++) {
        for (let c = 1; c < cCount; c++) {
          dots.push(
            <Circle
              key={`dot-${r}-${c}`}
              cx={c * 20}
              cy={r * 20}
              r={1.2}
              fill={isPageDark ? "#444444" : "#78909C"}
              opacity={0.8}
            />
          );
        }
      }
      return dots;
    }
    return null;
  };

  const renderPageBorderDesign = () => {
    const design = currentPage.borderDesign || 'classic';
    const pageHeight = currentPage.pageHeight || 500;
    if (design === 'minimal') {
      return (
        <Rect
          x={10}
          y={10}
          width={CANVAS_WIDTH - 20}
          height={pageHeight - 20}
          rx={10}
          stroke="#B0BEC5"
          strokeWidth={1.5}
          fill="none"
        />
      );
    }
    if (design === 'classic') {
      return (
        <>
          <Rect
            x={10}
            y={10}
            width={CANVAS_WIDTH - 20}
            height={pageHeight - 20}
            rx={6}
            stroke="#5D4037"
            strokeWidth={1.5}
            fill="none"
          />
          <Rect
            x={14}
            y={14}
            width={CANVAS_WIDTH - 28}
            height={pageHeight - 28}
            rx={4}
            stroke="#8D6E63"
            strokeWidth={0.6}
            fill="none"
          />
        </>
      );
    }
    if (design === 'cute') {
      return (
        <>
          <Rect
            x={12}
            y={12}
            width={CANVAS_WIDTH - 24}
            height={pageHeight - 24}
            rx={20}
            stroke="#FF8A80"
            strokeDasharray="4,4"
            strokeWidth={2}
            fill="none"
          />
          {/* Corner star decals */}
          <Path d="M 22 22 L 25 28 L 31 29 L 26 33 L 28 39 L 22 36 L 16 39 L 18 33 L 13 29 L 19 28 Z" fill="#FF8A80" />
          <Path d="M 338 22 L 341 28 L 347 29 L 342 33 L 344 39 L 338 36 L 332 39 L 334 33 L 329 29 L 335 28 Z" fill="#FF8A80" />
          <Path d={`M 22 ${pageHeight - 22} L 25 ${pageHeight - 16} L 31 ${pageHeight - 15} L 26 ${pageHeight - 11} L 28 ${pageHeight - 5} L 22 ${pageHeight - 8} L 16 ${pageHeight - 5} L 18 ${pageHeight - 11} L 13 ${pageHeight - 15} L 19 ${pageHeight - 16} Z`} fill="#FF8A80" />
          <Path d={`M 338 ${pageHeight - 22} L 341 ${pageHeight - 16} L 347 ${pageHeight - 15} L 342 ${pageHeight - 11} L 344 ${pageHeight - 5} L 338 ${pageHeight - 8} L 332 ${pageHeight - 5} L 334 ${pageHeight - 11} L 329 ${pageHeight - 15} L 335 ${pageHeight - 16} Z`} fill="#FF8A80" />
        </>
      );
    }
    if (design === 'elegant') {
      return (
        <>
          <Rect
            x={10}
            y={10}
            width={CANVAS_WIDTH - 20}
            height={pageHeight - 20}
            stroke="#D4AF37"
            strokeWidth={1.5}
            fill="none"
          />
          <Path d={`M 6 15 L 15 6 M 354 15 L 345 6 M 6 ${pageHeight - 15} L 15 ${pageHeight - 6} M 354 ${pageHeight - 15} L 345 ${pageHeight - 6}`} stroke="#D4AF37" strokeWidth={1.5} />
          <Rect
            x={15}
            y={15}
            width={CANVAS_WIDTH - 30}
            height={pageHeight - 30}
            stroke="#D4AF37"
            strokeWidth={0.8}
            fill="none"
          />
        </>
      );
    }
    if (design === 'floral') {
      return (
        <>
          <Rect
            x={12}
            y={12}
            width={CANVAS_WIDTH - 24}
            height={pageHeight - 24}
            rx={12}
            stroke="#81C784"
            strokeWidth={1.2}
            fill="none"
          />
          {/* Leaf vectors in corners */}
          <Path d="M 12 25 Q 25 25 25 12 Q 20 20 12 25 Z" fill="#4CAF50" />
          <Path d="M 348 25 Q 335 25 335 12 Q 340 20 348 25 Z" fill="#4CAF50" />
          <Path d={`M 12 ${pageHeight - 25} Q 25 ${pageHeight - 25} 25 ${pageHeight - 12} Q 20 ${pageHeight - 20} 12 ${pageHeight - 25} Z`} fill="#4CAF50" />
          <Path d={`M 348 ${pageHeight - 25} Q 335 ${pageHeight - 25} 335 ${pageHeight - 12} Q 340 ${pageHeight - 20} 348 ${pageHeight - 25} Z`} fill="#4CAF50" />
        </>
      );
    }
    return null;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleSave}
    >
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: theme.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header Ribbon */}
        <LinearGradient
          colors={['#FF8C00', '#FFD700']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerGradient, { paddingTop: insets.top > 0 ? insets.top + 8 : 30 }]}
        >
          <View style={styles.headerTop}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <Pressable onPress={handleSave} style={[styles.iconBtn, { width: 34, height: 34 }]}>
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </Pressable>
              <Pressable onPress={handleSave} style={[styles.iconBtn, { width: 34, height: 34 }]}>
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              </Pressable>
            </View>
            
            {/* Page Navigation */}
            <View style={[styles.pageNavigator, { gap: 8, paddingHorizontal: 8, paddingVertical: 4 }]}>
               <Pressable
                onPress={() => {
                  if (currentPageIdx > 0) {
                    setCurrentPageIdx(currentPageIdx - 1);
                    setSelectedLineIndex(null);
                    setSelectedTextBoxId(null);
                    setSelectedImageId(null);
                  }
                }}
                disabled={currentPageIdx === 0}
                style={[styles.pageNavBtn, currentPageIdx === 0 && { opacity: 0.4 }]}
              >
                <Ionicons name="chevron-back" size={16} color="#FFFFFF" />
              </Pressable>
              
              <Text style={[styles.pageIndicator, { fontSize: 12 }]}>
                {currentPageIdx + 1}/{pages.length}
              </Text>
              
              <Pressable
                onPress={() => {
                  if (currentPageIdx < pages.length - 1) {
                    setCurrentPageIdx(currentPageIdx + 1);
                    setSelectedLineIndex(null);
                    setSelectedTextBoxId(null);
                    setSelectedImageId(null);
                  } else {
                    handleAddPage();
                  }
                }}
                style={styles.pageNavBtn}
              >
                <Ionicons 
                  name={currentPageIdx === pages.length - 1 ? "add" : "chevron-forward"} 
                  size={16} 
                  color="#FFFFFF" 
                />
              </Pressable>
            </View>

            <View style={{ flexDirection: 'row', gap: 6 }}>
              <Pressable 
                onPress={handleUndo} 
                disabled={pagesHistory.length === 0}
                style={[styles.iconBtn, { width: 34, height: 34 }, pagesHistory.length === 0 && { opacity: 0.4 }]}
              >
                <Ionicons name="arrow-undo-outline" size={18} color="#FFFFFF" />
              </Pressable>
              <Pressable 
                onPress={handleRedo} 
                disabled={pagesRedoStack.length === 0}
                style={[styles.iconBtn, { width: 34, height: 34 }, pagesRedoStack.length === 0 && { opacity: 0.4 }]}
              >
                <Ionicons name="arrow-redo-outline" size={18} color="#FFFFFF" />
              </Pressable>
              <Pressable onPress={handleTogglePageTheme} style={[styles.iconBtn, { width: 34, height: 34 }]}>
                <Ionicons name={isPageDark ? "sunny-outline" : "moon-outline"} size={18} color="#FFFFFF" />
              </Pressable>
              <Pressable onPress={handleDeletePage} style={[styles.iconBtn, { width: 34, height: 34 }]}>
                <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        </LinearGradient>

        {/* Styled Page Content Area */}
        <View style={[styles.canvasWrapper, { backgroundColor: isPageDark ? '#121212' : '#F5F5F5' }]}>
          <ScrollView
            ref={scrollViewRef}
            style={{ flex: 1, width: '100%', backgroundColor: isPageDark ? '#121212' : '#F5F5F5' }}
            contentContainerStyle={{ alignItems: 'center', backgroundColor: isPageDark ? '#121212' : '#F5F5F5' }}
            scrollEnabled={tool === 'pan' || isMultiTouch}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            <Pressable
              ref={canvasRef}
              style={[
                styles.canvasContainer,
                {
                  backgroundColor: isPageDark ? '#121212' : '#FFFFFF',
                  height: (currentPage.pageHeight || 500) * scaleFactorX,
                  aspectRatio: undefined,
                  maxHeight: undefined
                }
              ]}
              onLayout={handleCanvasLayout}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <Svg 
                pointerEvents="none"
                style={StyleSheet.absoluteFill}
                viewBox={`0 0 ${CANVAS_WIDTH} ${currentPage.pageHeight || 500}`}
              >
              {/* Rules/Grids Background */}
              {renderPageGuidelines()}

              {/* Decorative Border frame */}
              {renderPageBorderDesign()}

              {/* Render Saved Lines */}
              {lines.map((line, idx) => (
                <Path
                  key={idx}
                  d={getPathData(line)}
                  stroke={resolveColor(line[0]?.color)}
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

              {/* Render Line Labels/Text inside shapes */}
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
                        y={cy + 4}
                        fill={resolveColor(line[0].color)}
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

              {/* Duplicate copy render for active selection layer */}
              {selectedLineIndex !== null && tool === 'select' && lines[selectedLineIndex] && (
                <Path
                  d={getPathData(lines[selectedLineIndex])}
                  stroke={resolveColor(lines[selectedLineIndex][0]?.color)}
                  strokeWidth={lines[selectedLineIndex][0]?.width || 4}
                  strokeOpacity={0.85}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Draw Shape/Drawing Selection Boundary Box */}
              {selectedLineIndex !== null && tool === 'select' && lines[selectedLineIndex] && (() => {
                const box = getBoundingBox(lines[selectedLineIndex]);
                if (!box) return null;
                const cx = (box.minX + box.maxX) / 2;
                const cy = (box.minY + box.maxY) / 2;
                return (
                  <>
                    <Path
                      d={`M ${box.minX} ${box.minY} L ${box.maxX} ${box.minY} L ${box.maxX} ${box.maxY} L ${box.minX} ${box.maxY} Z`}
                      stroke="#3B82F6"
                      strokeWidth={1.5}
                      strokeDasharray="4,4"
                      fill="none"
                    />

                    {/* Anchors: Delete, Copy, Text, Rotate */}
                    <Circle cx={box.minX} cy={box.minY} r={12} fill="#FF4444" stroke="#FFFFFF" strokeWidth={2} />
                    <Path d={`M ${box.minX - 4} ${box.minY - 4} L ${box.minX + 4} ${box.minY + 4} M ${box.minX + 4} ${box.minY - 4} L ${box.minX - 4} ${box.minY + 4}`} stroke="#FFFFFF" strokeWidth={2} />

                    <Circle cx={box.maxX} cy={box.minY} r={12} fill="#3B82F6" stroke="#FFFFFF" strokeWidth={2} />
                    <Path d={`M ${box.maxX - 5} ${box.minY - 5} h 6 v 6 h -6 Z M ${box.maxX - 2} ${box.minY - 2} h 6 v 6 h -6 Z`} stroke="#FFFFFF" strokeWidth={1.5} fill="none" />

                    <Circle cx={box.minX} cy={box.maxY} r={12} fill="#10B981" stroke="#FFFFFF" strokeWidth={2} />
                    <Path d={`M ${box.minX - 5} ${box.maxY - 4} h 10 M ${box.minX} ${box.maxY - 4} v 8`} stroke="#FFFFFF" strokeWidth={2} />

                    <Circle cx={box.maxX} cy={box.maxY} r={12} fill="#F59E0B" stroke="#FFFFFF" strokeWidth={2} />
                    <Path d={`M ${box.maxX - 4} ${box.maxY} a 4 4 0 1 1 4 4 M ${box.maxX} ${box.maxY + 4} l -2 -3 M ${box.maxX} ${box.maxY + 4} l 3 -1`} stroke="#FFFFFF" strokeWidth={1.5} fill="none" />

                    {/* Resizing Center anchors */}
                    <Circle cx={box.minX} cy={cy} r={6} fill="#3B82F6" stroke="#FFFFFF" strokeWidth={1.5} />
                    <Circle cx={box.maxX} cy={cy} r={6} fill="#3B82F6" stroke="#FFFFFF" strokeWidth={1.5} />
                    <Circle cx={cx} cy={box.minY} r={6} fill="#3B82F6" stroke="#FFFFFF" strokeWidth={1.5} />
                    <Circle cx={cx} cy={box.maxY} r={6} fill="#3B82F6" stroke="#FFFFFF" strokeWidth={1.5} />
                  </>
                );
              })()}

              {/* Rendering current line path in progress */}
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
              {/* Laser Pointer Trail */}
              {tool === 'pointer' && pointerPath.length > 1 && (
                <Path
                  d={getPathData(pointerPath)}
                  stroke="#FF3B30"
                  strokeWidth={6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity={0.8}
                />
              )}

              {/* Lasso Path Selection Loop in progress */}
              {tool === 'lasso' && lassoPoints && lassoPoints.length > 1 && (
                <Path
                  d={getPathData(lassoPoints)}
                  stroke="#3B82F6"
                  strokeWidth={1.5}
                  strokeDasharray="4,4"
                  fill="rgba(59, 130, 246, 0.08)"
                />
              )}

              {/* Lasso Selected Group Boundary */}
              {lassoGroup && (() => {
                const box = getLassoGroupBounds();
                if (!box) return null;
                return (
                  <>
                    <Rect
                      x={box.minX - 4}
                      y={box.minY - 4}
                      width={box.width + 8}
                      height={box.height + 8}
                      stroke="#3B82F6"
                      strokeWidth={1.5}
                      strokeDasharray="4,4"
                      fill="rgba(59, 130, 246, 0.03)"
                    />
                    {/* Delete Group Button Anchor */}
                    <Circle cx={box.minX - 4} cy={box.minY - 4} r={10} fill="#FF4444" />
                    <Path d={`M ${box.minX - 7} ${box.minY - 7} L ${box.minX - 1} ${box.minY - 1} M ${box.minX - 1} ${box.minY - 7} L ${box.minX - 7} ${box.minY - 1}`} stroke="#FFFFFF" strokeWidth={1.5} />
                  </>
                );
              })()}

              {/* Render Saved Tapes */}
              {tapes.map((t) => (
                <Rect
                  key={t.id}
                  x={t.x}
                  y={t.y}
                  width={t.width}
                  height={t.height}
                  rx={4}
                  fill={t.color}
                  opacity={t.hidden ? 0.15 : 0.95}
                  stroke={t.hidden ? undefined : resolveColor(t.color)}
                  strokeWidth={t.hidden ? 0 : 1}
                  strokeDasharray={t.hidden ? '2,2' : undefined}
                />
              ))}

              {/* Render Active Tape in progress */}
              {activeTape && (
                <Rect
                  x={activeTape.x}
                  y={activeTape.y}
                  width={activeTape.width}
                  height={activeTape.height}
                  rx={4}
                  fill={activeTape.color}
                  opacity={0.7}
                  stroke={resolveColor(activeTape.color)}
                  strokeWidth={1}
                />
              )}

              {/* Zoombox Target Area Box overlay */}
              {zoombox.visible && (
                <Rect
                  x={zoombox.x}
                  y={zoombox.y}
                  width={zoombox.width}
                  height={zoombox.height}
                  stroke="#10B981"
                  strokeWidth={2}
                  fill="rgba(16, 185, 129, 0.05)"
                  strokeDasharray="4,4"
                />
              )}

              {/* Ruler Overlay Graphic */}
              {ruler.visible && (
                <G transform={`translate(${ruler.x}, ${ruler.y}) rotate(${ruler.angle}, ${ruler.length / 2}, ${ruler.height / 2})`}>
                  {/* Ruler Body */}
                  <Rect
                    x={0}
                    y={0}
                    width={ruler.length}
                    height={ruler.height}
                    rx={8}
                    fill={isPageDark ? 'rgba(30, 41, 59, 0.88)' : 'rgba(255, 255, 255, 0.88)'}
                    stroke={isPageDark ? '#475569' : '#CBD5E1'}
                    strokeWidth={1.5}
                  />

                  {/* Tick Marks along the top and bottom edges */}
                  {Array.from({ length: Math.floor((ruler.length - 20) / 10) + 1 }).map((_, i) => {
                    const x = 10 + i * 10;
                    const isMajor = i % 5 === 0;
                    const tickHeight = isMajor ? 10 : 5;
                    return (
                      <G key={`tick-${i}`}>
                        {/* Top ticks */}
                        <Path
                          d={`M ${x} 0 L ${x} ${tickHeight}`}
                          stroke={isPageDark ? '#94A3B8' : '#64748B'}
                          strokeWidth={1}
                        />
                        {/* Bottom ticks */}
                        <Path
                          d={`M ${x} ${ruler.height} L ${x} ${ruler.height - tickHeight}`}
                          stroke={isPageDark ? '#94A3B8' : '#64748B'}
                          strokeWidth={1}
                        />
                        {/* Numbers on major ticks */}
                        {isMajor && (
                          <SvgText
                            x={x}
                            y={ruler.height / 2 + 3}
                            fill={isPageDark ? '#94A3B8' : '#64748B'}
                            fontSize={8}
                            textAnchor="middle"
                            fontWeight="bold"
                          >
                            {String(i * 2)}
                          </SvgText>
                        )}
                      </G>
                    );
                  })}

                  {/* Center Rotation Wheel */}
                  <Circle
                    cx={ruler.length / 2}
                    cy={ruler.height / 2}
                    r={18}
                    fill={isPageDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)'}
                    stroke={theme.primary}
                    strokeWidth={1.5}
                  />
                  {/* Rotation Guide Text */}
                  <SvgText
                    x={ruler.length / 2}
                    y={ruler.height / 2 + 3}
                    fill={theme.primary}
                    fontSize={8}
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {`${Math.round(((ruler.angle % 360) + 360) % 360)}°`}
                  </SvgText>

                  {/* Close (Disable) Button at the right edge */}
                  <G transform={`translate(${ruler.length - 24}, ${ruler.height / 2 - 8})`}>
                    <Circle
                      cx={8}
                      cy={8}
                      r={7}
                      fill="#EF4444"
                    />
                    <Path
                      d="M 5 5 L 11 11 M 11 5 L 5 11"
                      stroke="#FFFFFF"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                    />
                  </G>
                </G>
              )}
            </Svg>

            {/* Absolute Images Layer overlay */}
            {images.map((img) => {
              const isSelected = selectedImageId === img.id && tool === 'select';

              return (
                <View
                  key={img.id}
                  pointerEvents="box-none"
                  style={[
                    styles.imageOverlay,
                    {
                      left: img.x * scaleFactorX,
                      top: img.y * scaleFactorY,
                      width: img.width * scaleFactorX,
                      height: img.height * scaleFactorY,
                    },
                    isSelected && styles.imageSelected,
                  ]}
                >
                  <Image
                    pointerEvents="none"
                    source={{ uri: img.uri }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="contain"
                  />

                  {/* Drag handles for selected image */}
                  {isSelected && (
                    <>
                      {/* Delete Handle (Top-Left) */}
                      <Pressable
                        onPress={() => {
                          saveToHistory();
                          setImages((prev) => prev.filter(i => i.id !== img.id));
                          setSelectedImageId(null);
                        }}
                        style={[styles.textboxActionAnchor, { top: -10, left: -10, backgroundColor: '#FF4444' }]}
                      >
                        <Ionicons name="close" size={12} color="#FFFFFF" />
                      </Pressable>

                      {/* Resize Handle (Bottom-Right) */}
                      <View
                        style={[styles.textboxActionAnchor, { bottom: -10, right: -10, backgroundColor: '#3B82F6' }]}
                      >
                        <Ionicons name="expand" size={10} color="#FFFFFF" />
                      </View>
                    </>
                  )}
                </View>
              );
            })}

            {/* Absolute Text Boxes Layer overlay */}
            {textBoxes.map((box) => {
              const isSelected = selectedTextBoxId === box.id && tool === 'select';
              const alignmentStyle = box.alignment || 'left';
              const isBoxBold = box.fontStyle?.includes('bold');
              const isBoxItalic = box.fontStyle?.includes('italic');

              return (
                <View
                  key={box.id}
                  pointerEvents="box-none"
                  style={[
                    styles.textBoxOverlay,
                    {
                      left: box.x * scaleFactorX,
                      top: box.y * scaleFactorY,
                      width: box.width * scaleFactorX,
                      height: box.height * scaleFactorY,
                      backgroundColor: box.bgColor || 'transparent',
                      borderRadius: box.bgColor ? 6 : 0,
                      padding: box.bgColor ? 8 : 4,
                      elevation: box.bgColor ? 2 : 0,
                    },
                    isSelected && styles.textBoxSelected,
                  ]}
                >
                  <View pointerEvents="none" style={{ flex: 1, width: '100%', height: '100%', justifyContent: 'center' }}>
                    <Text
                      style={{
                        fontSize: box.fontSize || 16,
                        color: box.bgColor ? box.color : resolveColor(box.color),
                        textAlign: alignmentStyle,
                        fontWeight: isBoxBold ? 'bold' : 'normal',
                        fontStyle: isBoxItalic ? 'italic' : 'normal',
                      }}
                      numberOfLines={4}
                    >
                      {box.text}
                    </Text>
                  </View>

                  {/* Drag handles for selected text box */}
                  {isSelected && (
                    <>
                      {/* Delete Handle (Top-Left) */}
                      <Pressable
                        onPress={() => {
                          saveToHistory();
                          setTextBoxes((prev) => prev.filter(t => t.id !== box.id));
                          setSelectedTextBoxId(null);
                        }}
                        style={[styles.textboxActionAnchor, { top: -10, left: -10, backgroundColor: '#FF4444' }]}
                      >
                        <Ionicons name="close" size={12} color="#FFFFFF" />
                      </Pressable>

                      {/* Edit Handle (Top-Right) */}
                      <Pressable
                        onPress={() => {
                          setEditingTextValue(box.text === 'Tap to edit text' ? '' : box.text);
                          setIsTextEditVisible(true);
                        }}
                        style={[styles.textboxActionAnchor, { top: -10, right: -10, backgroundColor: '#10B981' }]}
                      >
                        <Ionicons name="pencil" size={10} color="#FFFFFF" />
                      </Pressable>

                      {/* Resize Handle (Bottom-Right) */}
                      <View
                        style={[styles.textboxActionAnchor, { bottom: -10, right: -10, backgroundColor: '#3B82F6' }]}
                      >
                        <Ionicons name="expand" size={10} color="#FFFFFF" />
                      </View>
                    </>
                  )}
                </View>
              );
            })}

            {/* Absolute Tables Layer overlay */}
            {tables.map((tab) => {
              const isSelected = selectedTableId === tab.id && tool === 'select';
              const templateId = tab.template || 'gray';
              const template = TABLE_TEMPLATES.find(t => t.id === templateId) || TABLE_TEMPLATES[0];
              const borderDark = tab.borderDark !== false;
              
              const headerBg = isPageDark ? '#1E293B' : template.headerBg;
              const headerText = template.headerText;
              const borderColor = borderDark 
                ? (isPageDark ? '#475569' : '#334155') 
                : (isPageDark ? '#1E293B' : '#E2E8F0');

              return (
                <View
                  key={tab.id}
                  pointerEvents="box-none"
                  style={[
                    styles.tableOverlay,
                    {
                      left: tab.x * scaleFactorX,
                      top: tab.y * scaleFactorY,
                      width: tab.width * scaleFactorX,
                      height: tab.height * scaleFactorY,
                    },
                    isSelected && styles.tableSelected,
                  ]}
                >
                  <View pointerEvents="none" style={{ flexDirection: 'column', width: '100%', height: '100%' }}>
                    {Array.from({ length: tab.rows }).map((_, rIdx) => {
                      const rowHeight = tab.cellHeights[rIdx] * scaleFactorY;
                      return (
                        <View key={rIdx} style={{ flexDirection: 'row', height: rowHeight, width: '100%' }}>
                          {Array.from({ length: tab.cols }).map((_, cIdx) => {
                            const colWidth = tab.cellWidths[cIdx] * scaleFactorX;
                            const cellText = tab.data[rIdx]?.[cIdx] || '';
                            const isHeader = rIdx === 0;
                            
                            let cellBg = isPageDark ? '#121212' : '#FFFFFF';
                            if (isHeader) {
                              cellBg = headerBg;
                            } else if (rIdx % 2 === 1) {
                              cellBg = isPageDark ? '#1E1E1E' : template.cellBg;
                            } else {
                              cellBg = isPageDark ? '#181818' : template.altCellBg;
                            }

                            const cellTextColor = isHeader 
                              ? headerText 
                              : resolveColor(isPageDark ? '#FFFFFF' : '#000000');

                            return (
                              <View
                                key={cIdx}
                                style={{
                                  width: colWidth,
                                  height: '100%',
                                  borderWidth: borderDark ? 1.2 : 0.6,
                                  borderColor: borderColor,
                                  backgroundColor: cellBg,
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  padding: 2,
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: (isHeader ? 11 : 10) * scaleFactorX,
                                    fontWeight: isHeader ? 'bold' : 'normal',
                                    color: cellTextColor,
                                    textAlign: 'center',
                                  }}
                                  numberOfLines={2}
                                >
                                  {cellText}
                                </Text>
                              </View>
                            );
                          })}
                        </View>
                      );
                    })}
                  </View>

                  {/* Drag handles for selected table */}
                  {isSelected && (
                    <>
                      {/* Delete Handle (Top-Left) */}
                      <Pressable
                        onPress={() => {
                          saveToHistory();
                          setTables((prev) => prev.filter(t => t.id !== tab.id));
                          setSelectedTableId(null);
                        }}
                        style={[styles.textboxActionAnchor, { top: -10, left: -10, backgroundColor: '#FF4444' }]}
                      >
                        <Ionicons name="close" size={12} color="#FFFFFF" />
                      </Pressable>

                      {/* Info indicator (Bottom-Left) */}
                      <View
                        style={[styles.textboxActionAnchor, { bottom: -10, left: -10, backgroundColor: '#10B981', width: 45, borderRadius: 6 }]}
                      >
                        <Text style={{ fontSize: 7, color: '#FFFFFF', fontWeight: 'bold' }}>DBL TAP</Text>
                      </View>
                    </>
                  )}
                </View>
              );
            })}
            </Pressable>
          </ScrollView>
        </View>

        {/* Zoombox Precision Drawer Panel */}
        {zoombox.visible && (
          <View style={[styles.zoomPanelContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.zoomPanelHeader}>
              <Text style={[styles.zoomPanelTitle, { color: theme.text }]}>Zoombox Precision Writer</Text>
              <Pressable onPress={() => setZoombox(prev => ({ ...prev, visible: false }))} style={styles.zoomPanelCloseBtn}>
                <Ionicons name="close-circle" size={20} color={theme.text} />
              </Pressable>
            </View>
            <View style={styles.zoomPanelContent}>
              <Pressable
                style={[styles.zoomPanelCanvas, { width: zoombox.width * 2, height: zoombox.height * 2, backgroundColor: isPageDark ? '#121212' : '#FFFFFF' }]}
                onTouchStart={handleZoomPanelTouchStart}
                onTouchMove={handleZoomPanelTouchMove}
                onTouchEnd={handleZoomPanelTouchEnd}
              >
                <Svg
                  pointerEvents="none"
                  style={StyleSheet.absoluteFill}
                  viewBox={`${zoombox.x} ${zoombox.y} ${zoombox.width} ${zoombox.height}`}
                >
                  {renderPageGuidelines()}
                  {renderPageBorderDesign()}
                  
                  {lines.map((line, idx) => (
                    <Path
                      key={idx}
                      d={getPathData(line)}
                      stroke={resolveColor(line[0]?.color)}
                      strokeWidth={line[0]?.width || 4}
                      strokeOpacity={line[0]?.opacity !== undefined ? line[0].opacity : 1}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}
                  
                  {tapes.map((t) => (
                    <Rect
                      key={t.id}
                      x={t.x}
                      y={t.y}
                      width={t.width}
                      height={t.height}
                      rx={4}
                      fill={t.color}
                      opacity={t.hidden ? 0.15 : 0.95}
                    />
                  ))}

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
                </Svg>
              </Pressable>
            </View>
          </View>
        )}

        {/* Bottom Rich Controls Bar */}
        <View style={[styles.controlPanel, { backgroundColor: theme.surface }, !isToolbarExpanded && styles.controlPanelCollapsed]}>
          <View style={[styles.toolbarHeader, !isToolbarExpanded && { marginBottom: 0 }]}>
            <Text style={[styles.toolbarTitle, { color: theme.mutedText }]}>
              Notebook Canvas Tools
            </Text>
            <Pressable 
              onPress={() => setIsToolbarExpanded(!isToolbarExpanded)} 
              style={[styles.collapseBtn, { backgroundColor: theme.border }]}
            >
              <Ionicons 
                name={isToolbarExpanded ? "chevron-down" : "chevron-up"} 
                size={16} 
                color={theme.text} 
              />
            </Pressable>
          </View>

          {isToolbarExpanded && (
            <>
              {/* Section 1: Toolbar mode toggles */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.toolbarModeScroll}
                style={styles.toolbarModeRow}
              >
                <Pressable
                  onPress={() => { setTool('pen'); setSelectedLineIndex(null); setSelectedTextBoxId(null); setSelectedImageId(null); }}
                  style={[styles.modeBtn, tool === 'pen' && [styles.modeBtnActive, { backgroundColor: theme.primary }]]}
                >
                  <Ionicons name="pencil" size={18} color={tool === 'pen' ? '#FFFFFF' : theme.text} />
                  <Text style={[styles.modeBtnTxt, { color: tool === 'pen' ? '#FFFFFF' : theme.text }]}>Pen</Text>
                </Pressable>

                <Pressable
                  onPress={() => { setTool('marker'); setSelectedLineIndex(null); setSelectedTextBoxId(null); setSelectedImageId(null); }}
                  style={[styles.modeBtn, tool === 'marker' && [styles.modeBtnActive, { backgroundColor: theme.primary }]]}
                >
                  <Ionicons name="create-outline" size={18} color={tool === 'marker' ? '#FFFFFF' : theme.text} />
                  <Text style={[styles.modeBtnTxt, { color: tool === 'marker' ? '#FFFFFF' : theme.text }]}>Marker</Text>
                </Pressable>

                <Pressable
                  onPress={() => { setTool('highlighter'); setSelectedLineIndex(null); setSelectedTextBoxId(null); setSelectedImageId(null); }}
                  style={[styles.modeBtn, tool === 'highlighter' && [styles.modeBtnActive, { backgroundColor: theme.primary }]]}
                >
                  <Ionicons name="brush-outline" size={18} color={tool === 'highlighter' ? '#FFFFFF' : theme.text} />
                  <Text style={[styles.modeBtnTxt, { color: tool === 'highlighter' ? '#FFFFFF' : theme.text }]}>Highlight</Text>
                </Pressable>

                <Pressable
                  onPress={() => { setTool('tape'); setSelectedLineIndex(null); setSelectedTextBoxId(null); setSelectedImageId(null); }}
                  style={[styles.modeBtn, tool === 'tape' && [styles.modeBtnActive, { backgroundColor: theme.primary }]]}
                >
                  <Ionicons name="bookmark-outline" size={18} color={tool === 'tape' ? '#FFFFFF' : theme.text} />
                  <Text style={[styles.modeBtnTxt, { color: tool === 'tape' ? '#FFFFFF' : theme.text }]}>Tape</Text>
                </Pressable>

                <Pressable
                  onPress={() => { setTool('eraser'); setSelectedLineIndex(null); setSelectedTextBoxId(null); setSelectedImageId(null); }}
                  style={[styles.modeBtn, tool === 'eraser' && [styles.modeBtnActive, { backgroundColor: theme.primary }]]}
                >
                  <Ionicons name="cut-outline" size={18} color={tool === 'eraser' ? '#FFFFFF' : theme.text} />
                  <Text style={[styles.modeBtnTxt, { color: tool === 'eraser' ? '#FFFFFF' : theme.text }]}>Erase</Text>
                </Pressable>

                <Pressable
                  onPress={() => { setTool('shape'); setSelectedLineIndex(null); setSelectedTextBoxId(null); setSelectedImageId(null); }}
                  style={[styles.modeBtn, tool === 'shape' && [styles.modeBtnActive, { backgroundColor: theme.primary }]]}
                >
                  <Ionicons name="shapes-outline" size={18} color={tool === 'shape' ? '#FFFFFF' : theme.text} />
                  <Text style={[styles.modeBtnTxt, { color: tool === 'shape' ? '#FFFFFF' : theme.text }]}>Shape</Text>
                </Pressable>

                <Pressable
                  onPress={() => { setRuler(prev => ({ ...prev, visible: !prev.visible })); }}
                  style={[styles.modeBtn, ruler.visible && [styles.modeBtnActive, { backgroundColor: theme.primary }]]}
                >
                  <Ionicons name="scale-outline" size={18} color={ruler.visible ? '#FFFFFF' : theme.text} />
                  <Text style={[styles.modeBtnTxt, { color: ruler.visible ? '#FFFFFF' : theme.text }]}>Ruler</Text>
                </Pressable>

                <Pressable
                  onPress={() => { setTool('table'); setSelectedLineIndex(null); setSelectedTextBoxId(null); setSelectedImageId(null); }}
                  style={[styles.modeBtn, tool === 'table' && [styles.modeBtnActive, { backgroundColor: theme.primary }]]}
                >
                  <Ionicons name="grid-outline" size={18} color={tool === 'table' ? '#FFFFFF' : theme.text} />
                  <Text style={[styles.modeBtnTxt, { color: tool === 'table' ? '#FFFFFF' : theme.text }]}>Table</Text>
                </Pressable>

                <Pressable
                  onPress={triggerImagePickerOptions}
                  style={styles.modeBtn}
                >
                  <Ionicons name="image-outline" size={18} color={theme.text} />
                  <Text style={[styles.modeBtnTxt, { color: theme.text }]}>Image</Text>
                </Pressable>

                <Pressable
                  onPress={() => { setTool('lasso'); setSelectedLineIndex(null); setSelectedTextBoxId(null); setSelectedImageId(null); }}
                  style={[styles.modeBtn, tool === 'lasso' && [styles.modeBtnActive, { backgroundColor: theme.primary }]]}
                >
                  <Ionicons name="color-filter-outline" size={18} color={tool === 'lasso' ? '#FFFFFF' : theme.text} />
                  <Text style={[styles.modeBtnTxt, { color: tool === 'lasso' ? '#FFFFFF' : theme.text }]}>Lasso</Text>
                </Pressable>

                <Pressable
                  onPress={() => { setTool('text'); setSelectedLineIndex(null); setSelectedTextBoxId(null); setSelectedImageId(null); }}
                  style={[styles.modeBtn, tool === 'text' && [styles.modeBtnActive, { backgroundColor: theme.primary }]]}
                >
                  <Ionicons name="document-text-outline" size={18} color={tool === 'text' ? '#FFFFFF' : theme.text} />
                  <Text style={[styles.modeBtnTxt, { color: tool === 'text' ? '#FFFFFF' : theme.text }]}>Text</Text>
                </Pressable>

                <Pressable
                  onPress={() => { setZoombox(prev => ({ ...prev, visible: !prev.visible })); }}
                  style={[styles.modeBtn, zoombox.visible && [styles.modeBtnActive, { backgroundColor: theme.primary }]]}
                >
                  <Ionicons name="search-outline" size={18} color={zoombox.visible ? '#FFFFFF' : theme.text} />
                  <Text style={[styles.modeBtnTxt, { color: zoombox.visible ? '#FFFFFF' : theme.text }]}>Zoombox</Text>
                </Pressable>

                <Pressable
                  onPress={() => { setIsLibraryVisible(true); }}
                  style={[styles.modeBtn, isLibraryVisible && [styles.modeBtnActive, { backgroundColor: theme.primary }]]}
                >
                  <Ionicons name="albums-outline" size={18} color={isLibraryVisible ? '#FFFFFF' : theme.text} />
                  <Text style={[styles.modeBtnTxt, { color: isLibraryVisible ? '#FFFFFF' : theme.text }]}>Library</Text>
                </Pressable>

                <Pressable
                  onPress={() => { setTool('pointer'); setSelectedLineIndex(null); setSelectedTextBoxId(null); setSelectedImageId(null); }}
                  style={[styles.modeBtn, tool === 'pointer' && [styles.modeBtnActive, { backgroundColor: theme.primary }]]}
                >
                  <Ionicons name="color-wand-outline" size={18} color={tool === 'pointer' ? '#FFFFFF' : theme.text} />
                  <Text style={[styles.modeBtnTxt, { color: tool === 'pointer' ? '#FFFFFF' : theme.text }]}>Pointer</Text>
                </Pressable>

                <Pressable
                  onPress={() => { setTool('select'); }}
                  style={[styles.modeBtn, tool === 'select' && [styles.modeBtnActive, { backgroundColor: theme.primary }]]}
                >
                  <Ionicons name="move-outline" size={18} color={tool === 'select' ? '#FFFFFF' : theme.text} />
                  <Text style={[styles.modeBtnTxt, { color: tool === 'select' ? '#FFFFFF' : theme.text }]}>Select</Text>
                </Pressable>

                <Pressable
                  onPress={() => { setTool('pan'); setSelectedLineIndex(null); setSelectedTextBoxId(null); setSelectedImageId(null); }}
                  style={[styles.modeBtn, tool === 'pan' && [styles.modeBtnActive, { backgroundColor: theme.primary }]]}
                >
                  <Ionicons name="hand-right-outline" size={18} color={tool === 'pan' ? '#FFFFFF' : theme.text} />
                  <Text style={[styles.modeBtnTxt, { color: tool === 'pan' ? '#FFFFFF' : theme.text }]}>Scroll</Text>
                </Pressable>
              </ScrollView>

          {/* Section 2: Shapes List (Visible only when shape tool selected) */}
          {tool === 'shape' && (
            <View style={styles.subToolbarContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subToolbarScroll}>
                {[
                  { id: 'line', name: 'Line', icon: 'remove-outline' },
                  { id: 'rectangle', name: 'Rectangle', icon: 'square-outline' },
                  { id: 'circle', name: 'Circle', icon: 'ellipse-outline' },
                  { id: 'triangle', name: 'Triangle', icon: 'triangle-outline' },
                  { id: 'star', name: 'Star', icon: 'star-outline' },
                  { id: 'arrow', name: 'Arrow', icon: 'arrow-forward-outline' }
                ].map(s => (
                  <Pressable
                    key={s.id}
                    onPress={() => setSelectedShape(s.id)}
                    style={[styles.shapeIconBtn, selectedShape === s.id && { borderColor: theme.primary, backgroundColor: 'rgba(0,0,0,0.05)' }]}
                  >
                    <Ionicons name={s.icon} size={16} color={selectedShape === s.id ? theme.primary : theme.text} />
                    <Text style={[styles.shapeIconBtnTxt, { color: selectedShape === s.id ? theme.primary : theme.text }]}>{s.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Section 3: Formatting & Text Controls (Active when select mode has a text box selected OR when text tool active) */}
          {(tool === 'text' || (tool === 'select' && selectedTextBoxId !== null)) && (
            <View style={styles.textControlsContainer}>
              <View style={styles.formatActionsRow}>
                {/* Bold */}
                <Pressable
                  onPress={handleToggleBold}
                  style={[styles.formatBtn, isBold && { backgroundColor: theme.border }]}
                >
                  <Text style={{ fontWeight: 'bold', fontSize: 15, color: theme.text }}>B</Text>
                </Pressable>

                {/* Italic */}
                <Pressable
                  onPress={handleToggleItalic}
                  style={[styles.formatBtn, isItalic && { backgroundColor: theme.border }]}
                >
                  <Text style={{ fontStyle: 'italic', fontSize: 15, color: theme.text }}>I</Text>
                </Pressable>

                {/* Alignments */}
                {['left', 'center', 'right', 'justify'].map(align => {
                  let iconName = 'format-align-left';
                  if (align === 'center') iconName = 'format-align-center';
                  if (align === 'right') iconName = 'format-align-right';
                  if (align === 'justify') iconName = 'format-align-justify';
                  
                  return (
                    <Pressable
                      key={align}
                      onPress={() => handleAlignmentChange(align)}
                      style={[styles.formatBtn, activeAlignment === align && { backgroundColor: theme.border }]}
                    >
                      <MaterialCommunityIcons name={iconName} size={16} color={theme.text} />
                    </Pressable>
                  );
                })}

                {/* Font Sizes selector */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingLeft: 8 }}>
                  {FONT_SIZES.map(sz => (
                    <Pressable
                      key={sz}
                      onPress={() => handleFontSizeChange(sz)}
                      style={[styles.fontSizeBtn, activeFontSize === sz && { backgroundColor: theme.primary }]}
                    >
                      <Text style={[styles.fontSizeBtnText, { color: activeFontSize === sz ? '#FFFFFF' : theme.text }]}>{sz}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>
          )}

          {/* Section 3.5: Table Modification Controls (Active when select mode has a table selected) */}
          {tool === 'select' && selectedTableId !== null && (() => {
            const selectedTable = tables.find(t => t.id === selectedTableId);
            if (!selectedTable) return null;
            return (
              <View style={styles.textControlsContainer}>
                <Text style={styles.toolbarLabel}>Table Controls</Text>
                
                {/* Row/Col Adjustments & Border Toggle */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={{ fontSize: 10, color: theme.text, fontWeight: 'bold' }}>ROWS:</Text>
                    <Pressable 
                      onPress={() => handleRemoveTableRow(selectedTableId)}
                      style={[styles.formatBtn, { width: 22, height: 22, marginRight: 2 }]}
                    >
                      <Ionicons name="remove" size={12} color={theme.text} />
                    </Pressable>
                    <Text style={{ fontSize: 11, color: theme.text, fontWeight: 'bold', marginRight: 4 }}>{selectedTable.rows}</Text>
                    <Pressable 
                      onPress={() => handleAddTableRow(selectedTableId)}
                      style={[styles.formatBtn, { width: 22, height: 22, marginRight: 2 }]}
                    >
                      <Ionicons name="add" size={12} color={theme.text} />
                    </Pressable>

                    <View style={{ width: 8 }} />

                    <Text style={{ fontSize: 10, color: theme.text, fontWeight: 'bold' }}>COLS:</Text>
                    <Pressable 
                      onPress={() => handleRemoveTableColumn(selectedTableId)}
                      style={[styles.formatBtn, { width: 22, height: 22, marginRight: 2 }]}
                    >
                      <Ionicons name="remove" size={12} color={theme.text} />
                    </Pressable>
                    <Text style={{ fontSize: 11, color: theme.text, fontWeight: 'bold', marginRight: 4 }}>{selectedTable.cols}</Text>
                    <Pressable 
                      onPress={() => handleAddTableColumn(selectedTableId)}
                      style={[styles.formatBtn, { width: 22, height: 22, marginRight: 2 }]}
                    >
                      <Ionicons name="add" size={12} color={theme.text} />
                    </Pressable>
                  </View>

                  {/* Border Dark / Light toggle */}
                  <Pressable
                    onPress={() => handleToggleTableBorderDark(selectedTableId)}
                    style={[styles.pageStyleBtn, { paddingHorizontal: 8, paddingVertical: 4, marginHorizontal: 2 }]}
                  >
                    <Text style={{ fontSize: 9, color: theme.text, fontWeight: 'bold' }}>
                      BORDER: {selectedTable.borderDark !== false ? "DARK" : "LIGHT"}
                    </Text>
                  </Pressable>
                </View>

                {/* Templates Selector */}
                <Text style={styles.toolbarLabel}>Table Color Style</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingBottom: 4 }}>
                  {TABLE_TEMPLATES.map(temp => {
                    const isCurrent = (selectedTable.template || 'gray') === temp.id;
                    return (
                      <Pressable
                        key={temp.id}
                        onPress={() => handleChangeTableTemplate(selectedTableId, temp.id)}
                        style={[
                          styles.pageStyleBtn, 
                          { backgroundColor: temp.headerBg, borderColor: isCurrent ? theme.primary : 'transparent', borderWidth: isCurrent ? 2 : 1 }
                        ]}
                      >
                        <Text style={{ fontSize: 9, color: '#FFFFFF', fontWeight: 'bold' }}>
                          {temp.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            );
          })()}

          {/* Section 4: Colors Palette (Hidden for eraser and select mode without active elements) */}
          {tool !== 'eraser' && (tool !== 'select' || selectedTextBoxId !== null || selectedLineIndex !== null) && (
            <View style={styles.colorPaletteWrapper}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorPaletteScroll}>
                {COLORS.map((color) => {
                  const isActive = (tool === 'select' && selectedTextBoxId !== null)
                    ? activeTextColor === color
                    : strokeColor === color;
                  
                  return (
                    <Pressable
                      key={color}
                      onPress={() => {
                        if (tool === 'select' && selectedTextBoxId !== null) {
                          handleTextColorChange(color);
                        } else {
                          setStrokeColor(color);
                        }
                      }}
                      style={[
                        styles.colorCircle,
                        { backgroundColor: color },
                        isActive && {
                          borderColor: theme.text,
                          borderWidth: 2,
                          transform: [{ scale: 1.15 }],
                        },
                      ]}
                    >
                      {isActive && (
                        <Ionicons 
                          name="checkmark" 
                          size={14} 
                          color={isColorLight(color) ? '#000000' : '#FFFFFF'} 
                          style={{ alignSelf: 'center', marginTop: 7 }}
                        />
                      )}
                    </Pressable>
                  );
                })}
                <Pressable
                  onPress={() => setIsColorPickerVisible(true)}
                  style={[styles.colorCircle, styles.customColorTrigger, { borderColor: theme.border }]}
                >
                  <Ionicons name="color-palette-outline" size={16} color={theme.text} />
                </Pressable>
              </ScrollView>

              {/* Stroke Width / Brush Sizes */}
              {selectedTextBoxId === null && (
                <View style={styles.brushWidthRow}>
                  {BRUSH_SIZES.map((size) => (
                    <Pressable
                      key={size}
                      onPress={() => setStrokeWidth(size)}
                      style={[styles.widthCircle, strokeWidth === size && { backgroundColor: theme.primary }]}
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
              )}
            </View>
          )}

          {/* Section 5: Page Style Guides & Borders select */}
          <View style={styles.pageSettingsRow}>
            {/* Background templates */}
            <View style={{ marginBottom: 4 }}>
              <Text style={[styles.toolbarLabel, { color: theme.mutedText }]}>Paper Guideline</Text>
              <View style={styles.settingOptionsGroup}>
                {[
                  { id: 'ruled', name: 'Ruled' },
                  { id: 'grid', name: 'Grid' },
                  { id: 'dotted', name: 'Dotted' },
                  { id: 'plain', name: 'Plain' }
                ].map(item => (
                  <Pressable
                    key={item.id}
                    onPress={() => updateCurrentPageData({ pageStyle: item.id })}
                    style={[styles.pageStyleBtn, currentPage.pageStyle === item.id && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                  >
                    <Text style={[styles.pageStyleBtnTxt, { color: currentPage.pageStyle === item.id ? '#FFFFFF' : theme.text }]}>
                      {item.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Borders selection */}
            <View>
              <Text style={[styles.toolbarLabel, { color: theme.mutedText }]}>Decorative Borders</Text>
              <View style={styles.settingOptionsGroup}>
                {[
                  { id: 'none', name: 'None' },
                  { id: 'minimal', name: 'Minimal' },
                  { id: 'classic', name: 'Classic' },
                  { id: 'cute', name: 'Cute' },
                  { id: 'elegant', name: 'Elegant' },
                  { id: 'floral', name: 'Floral' }
                ].map(item => (
                  <Pressable
                    key={item.id}
                    onPress={() => updateCurrentPageData({ borderDesign: item.id })}
                    style={[styles.pageStyleBtn, currentPage.borderDesign === item.id && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                  >
                    <Text style={[styles.pageStyleBtnTxt, { color: currentPage.borderDesign === item.id ? '#FFFFFF' : theme.text }]}>
                      {item.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
          
              <Text style={styles.tipText}>
                Select active element to duplicate, delete, add labels or format. Add pages using top bar page controls!
              </Text>
            </>
          )}
        </View>

        {/* Custom Color Modal */}
        <Modal
          visible={isColorPickerVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsColorPickerVisible(false)}
        >
          <Pressable style={styles.pickerOverlay} onPress={() => setIsColorPickerVisible(false)}>
            <View style={[styles.pickerContainer, { backgroundColor: theme.surface }]}>
              <Text style={[styles.pickerTitle, { color: theme.text }]}>Choose Custom Color</Text>
              <View style={styles.pickerGrid}>
                {EXTRA_COLORS.map((color) => (
                  <Pressable
                    key={color}
                    onPress={() => {
                      if (tool === 'select' && selectedTextBoxId !== null) {
                        handleTextColorChange(color);
                      } else {
                        setStrokeColor(color);
                      }
                      setIsColorPickerVisible(false);
                    }}
                    style={[styles.pickerColorCircle, { backgroundColor: color }]}
                  />
                ))}
              </View>
              <Pressable onPress={() => setIsColorPickerVisible(false)} style={[styles.pickerCloseBtn, { backgroundColor: theme.primary }]}>
                <Text style={styles.pickerCloseBtnText}>Close</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

        {/* Library / Stickers / Templates Modal */}
        <Modal
          visible={isLibraryVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsLibraryVisible(false)}
        >
          <Pressable style={styles.pickerOverlay} onPress={() => setIsLibraryVisible(false)}>
            <View style={[styles.pickerContainer, { backgroundColor: theme.surface, width: '90%', maxHeight: '75%' }]}>
              <Text style={[styles.pickerTitle, { color: theme.text }]}>Sticker & Template Library</Text>
              
              <ScrollView style={{ width: '100%', maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                {/* Category 1: Sticky Notes */}
                <Text style={[styles.librarySectionTitle, { color: theme.mutedText }]}>Sticky Notes</Text>
                <View style={styles.libraryRow}>
                  {[
                    { color: '#FEFF9C', name: 'Yellow' },
                    { color: '#FF7EB9', name: 'Pink' },
                    { color: '#7AF9FF', name: 'Cyan' },
                    { color: '#97FF7A', name: 'Green' },
                    { color: '#FFB7B2', name: 'Pastel Red' }
                  ].map((note, idx) => (
                    <Pressable
                      key={idx}
                      onPress={() => {
                        saveToHistory();
                        const currentScrollY = Math.min((currentPage.pageHeight || 1500) - 200, scrollOffsetRef.current || 0);
                        const boxId = `txt_${Date.now()}`;
                        const newBox = {
                          id: boxId,
                          text: 'Sticky Note\nDouble tap to write',
                          x: 100,
                          y: currentScrollY + 150,
                          width: 140,
                          height: 100,
                          color: '#000000',
                          bgColor: note.color,
                          fontSize: 14,
                          alignment: 'center',
                          fontStyle: 'normal'
                        };
                        setTextBoxes(prev => [...prev, newBox]);
                        setSelectedTextBoxId(boxId);
                        setIsLibraryVisible(false);
                        setTool('select');
                      }}
                      style={[styles.libraryItem, { backgroundColor: note.color, borderWidth: 1, borderColor: '#DDD', width: 60, height: 60, borderRadius: 8, justifyContent: 'center', alignItems: 'center' }]}
                    >
                      <Text style={{ fontSize: 9, color: '#333', fontWeight: 'bold' }}>{note.name}</Text>
                    </Pressable>
                  ))}
                </View>

                {/* Category 2: Emojis / Stickers Keyboard */}
                <Text style={[styles.librarySectionTitle, { color: theme.mutedText }]}>Stickers & Emojis Keyboard</Text>
                
                {/* Tab Bar */}
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  style={{ marginBottom: 12 }}
                  contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
                >
                  {EMOJI_CATEGORIES.map((cat) => {
                    const isActive = activeEmojiCategory === cat.id;
                    return (
                      <Pressable
                        key={cat.id}
                        onPress={() => setActiveEmojiCategory(cat.id)}
                        style={{
                          backgroundColor: isActive ? theme.primary : (isDark ? '#2C3E50' : '#E2E8F0'),
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 20,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <Ionicons 
                          name={cat.icon} 
                          size={14} 
                          color={isActive ? '#FFFFFF' : (isDark ? '#B0BEC5' : '#555555')} 
                        />
                        <Text style={{ 
                          fontSize: 11, 
                          fontWeight: 'bold', 
                          color: isActive ? '#FFFFFF' : (isDark ? '#B0BEC5' : '#555555') 
                        }}>
                          {cat.title}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                {/* Emojis Grid */}
                <View style={[styles.libraryRow, { justifyContent: 'flex-start', gap: 8 }]}>
                  {(EMOJI_CATEGORIES.find(c => c.id === activeEmojiCategory)?.emojis || []).map((emoji, idx) => {
                    const badgeInfo = getBadgeStyles(emoji);
                    if (badgeInfo) {
                      return (
                        <Pressable
                          key={idx}
                          onPress={() => {
                            saveToHistory();
                            const currentScrollY = Math.min((currentPage.pageHeight || 1500) - 150, scrollOffsetRef.current || 0);
                            const boxId = `txt_${Date.now()}`;
                            const newBox = {
                              id: boxId,
                              text: emoji,
                              x: 120,
                              y: currentScrollY + 180,
                              width: badgeInfo.width,
                              height: 38,
                              color: badgeInfo.color,
                              bgColor: badgeInfo.bgColor,
                              fontSize: badgeInfo.fontSize,
                              alignment: 'center',
                              fontStyle: 'bold'
                            };
                            setTextBoxes(prev => [...prev, newBox]);
                            setSelectedTextBoxId(boxId);
                            setIsLibraryVisible(false);
                            setTool('select');
                          }}
                          style={[
                            styles.libraryItem, 
                            { 
                              backgroundColor: badgeInfo.bgColor, 
                              paddingHorizontal: 12, 
                              paddingVertical: 8, 
                              borderRadius: 8, 
                              justifyContent: 'center', 
                              alignItems: 'center',
                              margin: 2
                            }
                          ]}
                        >
                          <Text style={{ fontSize: 11, color: badgeInfo.color, fontWeight: 'bold' }}>{emoji}</Text>
                        </Pressable>
                      );
                    }
                    
                    return (
                      <Pressable
                        key={idx}
                        onPress={() => {
                          saveToHistory();
                          const currentScrollY = Math.min((currentPage.pageHeight || 1500) - 150, scrollOffsetRef.current || 0);
                          const boxId = `txt_${Date.now()}`;
                          const newBox = {
                            id: boxId,
                            text: emoji,
                            x: 140,
                            y: currentScrollY + 180,
                            width: 60,
                            height: 50,
                            color: '#000000',
                            fontSize: 36,
                            alignment: 'center',
                            fontStyle: 'normal'
                          };
                          setTextBoxes(prev => [...prev, newBox]);
                          setSelectedTextBoxId(boxId);
                          setIsLibraryVisible(false);
                          setTool('select');
                        }}
                        style={[
                          styles.libraryItem, 
                          { 
                            backgroundColor: isPageDark ? '#333' : '#F0F0F0', 
                            width: 44, 
                            height: 44, 
                            borderRadius: 22, 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            margin: 2
                          }
                        ]}
                      >
                        <Text style={{ fontSize: 24 }}>{emoji}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Category 3: Templates */}
                <Text style={[styles.librarySectionTitle, { color: theme.mutedText }]}>Page Templates</Text>
                <View style={[styles.libraryRow, { flexDirection: 'column', gap: 8 }]}>
                  {[
                    { id: 'todo', name: 'Checklist / Todo List', description: 'Inserts a vertical todo checklist template' },
                    { id: 'planner', name: 'Daily Goal Planner', description: 'Inserts grid boxes with goals and notes' }
                  ].map((temp, idx) => (
                    <Pressable
                      key={idx}
                      onPress={() => {
                        saveToHistory();
                        const currentScrollY = Math.min((currentPage.pageHeight || 1500) - 300, scrollOffsetRef.current || 0);
                        if (temp.id === 'todo') {
                          const now = Date.now();
                          const newBoxes = [
                            {
                              id: `txt_todo_title_${now}`,
                              text: '📝 DAILY CHECKLIST',
                              x: 40, y: currentScrollY + 80, width: 280, height: 35,
                              color: '#FF8C00', fontSize: 18, alignment: 'left', fontStyle: 'bold'
                            },
                            {
                              id: `txt_todo_1_${now}`,
                              text: '⬜  Task 1: ',
                              x: 40, y: currentScrollY + 130, width: 280, height: 30,
                              color: '#000000', fontSize: 14, alignment: 'left', fontStyle: 'normal'
                            },
                            {
                              id: `txt_todo_2_${now}`,
                              text: '⬜  Task 2: ',
                              x: 40, y: currentScrollY + 170, width: 280, height: 30,
                              color: '#000000', fontSize: 14, alignment: 'left', fontStyle: 'normal'
                            },
                            {
                              id: `txt_todo_3_${now}`,
                              text: '⬜  Task 3: ',
                              x: 40, y: currentScrollY + 210, width: 280, height: 30,
                              color: '#000000', fontSize: 14, alignment: 'left', fontStyle: 'normal'
                            }
                          ];
                          setTextBoxes(prev => [...prev, ...newBoxes]);
                        } else if (temp.id === 'planner') {
                          const now = Date.now();
                          const newBoxes = [
                            {
                              id: `txt_plan_title_${now}`,
                              text: '🎯 MY DAILY PLANNER',
                              x: 45, y: currentScrollY + 60, width: 270, height: 35,
                              color: '#FF8C00', fontSize: 18, alignment: 'center', fontStyle: 'bold'
                            },
                            {
                              id: `txt_plan_g_${now}`,
                              text: 'Today\'s Main Goal:\n• ',
                              x: 45, y: currentScrollY + 110, width: 270, height: 60,
                              color: '#000000', bgColor: '#FEFF9C', fontSize: 13, alignment: 'left', fontStyle: 'normal'
                            },
                            {
                              id: `txt_plan_n_${now}`,
                              text: 'Notes & Ideas:\n• ',
                              x: 45, y: currentScrollY + 185, width: 270, height: 80,
                              color: '#000000', bgColor: '#7AF9FF', fontSize: 13, alignment: 'left', fontStyle: 'normal'
                            }
                          ];
                          setTextBoxes(prev => [...prev, ...newBoxes]);
                        }
                        setIsLibraryVisible(false);
                        setTool('select');
                      }}
                      style={[styles.templateItem, { backgroundColor: isDark ? '#2C3E50' : '#E2E8F0', padding: 12, borderRadius: 8, width: '100%' }]}
                    >
                      <Text style={{ fontWeight: 'bold', color: isDark ? '#FFFFFF' : '#1A1A1A', fontSize: 12 }}>{temp.name}</Text>
                      <Text style={{ color: isDark ? '#B0BEC5' : '#555555', fontSize: 10, marginTop: 2 }}>{temp.description}</Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
              
              <Pressable onPress={() => setIsLibraryVisible(false)} style={[styles.pickerCloseBtn, { backgroundColor: theme.primary, marginTop: 15 }]}>
                <Text style={styles.pickerCloseBtnText}>Close</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

        {/* Text Box / Label Editor Popup */}
        <Modal
          visible={isTextEditVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => {
            setIsTextEditVisible(false);
            setEditingTableCell(null);
          }}
        >
          <Pressable style={styles.pickerOverlay} onPress={() => {
            setIsTextEditVisible(false);
            setEditingTableCell(null);
          }}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={[styles.pickerContainer, { backgroundColor: theme.surface, width: '85%', padding: 20 }]}
            >
              <Text style={[styles.pickerTitle, { color: theme.text }]}>
                {editingTableCell !== null 
                  ? "Edit Table Cell" 
                  : (selectedTextBoxId !== null ? "Edit Typed Text Box" : "Add Text Label to Shape")}
              </Text>
              <TextInput
                value={editingTextValue}
                onChangeText={setEditingTextValue}
                placeholder="Type here..."
                placeholderTextColor={theme.placeholder}
                multiline
                numberOfLines={3}
                style={[
                  styles.shapeTextInput,
                  {
                    color: theme.text,
                    borderColor: theme.border,
                    backgroundColor: theme.background,
                    textAlignVertical: 'top',
                    height: 80,
                  }
                ]}
                autoFocus
              />
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <Pressable
                  onPress={() => {
                    setIsTextEditVisible(false);
                    setEditingTableCell(null);
                  }}
                  style={[styles.pickerCloseBtn, { backgroundColor: theme.border, flex: 1, alignItems: 'center' }]}
                >
                  <Text style={[styles.pickerCloseBtnText, { color: theme.text }]}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    saveToHistory();
                    if (editingTableCell !== null) {
                      const { tableId, rIdx, cIdx } = editingTableCell;
                      setTables(prev => prev.map(t => {
                        if (t.id === tableId) {
                          const newData = t.data.map((row, r) => 
                            row.map((cell, c) => (r === rIdx && c === cIdx) ? editingTextValue : cell)
                          );
                          return { ...t, data: newData };
                        }
                        return t;
                      }));
                      setEditingTableCell(null);
                    } else if (selectedTextBoxId !== null) {
                      if (editingTextValue.trim() === '') {
                        // Delete empty text box to prevent clutter
                        setTextBoxes((prev) => prev.filter((box) => box.id !== selectedTextBoxId));
                        setSelectedTextBoxId(null);
                      } else {
                        // Update active text box text
                        setTextBoxes((prev) =>
                          prev.map((box) =>
                            box.id === selectedTextBoxId
                              ? { ...box, text: editingTextValue }
                              : box
                          )
                        );
                      }
                    } else if (selectedLineIndex !== null) {
                      // Add text label to shape/path points list
                      setLines((prevLines) =>
                        prevLines.map((line, idx) => {
                          if (idx === selectedLineIndex) {
                            return line.map((point, pIdx) => {
                              if (pIdx === 0) {
                                return { ...point, text: editingTextValue };
                              }
                              return point;
                            });
                          }
                          return line;
                        })
                      );
                    }
                    setIsTextEditVisible(false);
                    setEditingTextValue('');
                  }}
                  style={[styles.pickerCloseBtn, { backgroundColor: theme.primary, flex: 1, alignItems: 'center' }]}
                >
                  <Text style={styles.pickerCloseBtnText}>Apply</Text>
                </Pressable>
              </View>
            </KeyboardAvoidingView>
          </Pressable>
        </Modal>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  pageNavBtn: {
    padding: 2,
  },
  pageIndicator: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  canvasWrapper: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvasContainer: {
    width: '100%',
    aspectRatio: 360 / 500,
    maxWidth: '100%',
    maxHeight: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  textBoxOverlay: {
    position: 'absolute',
    padding: 6,
    borderWidth: 1,
    borderColor: 'transparent',
    justifyContent: 'center',
  },
  textBoxSelected: {
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  imageOverlay: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  imageSelected: {
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
  },
  textboxActionAnchor: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  controlPanel: {
    padding: 14,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  controlPanelCollapsed: {
    paddingVertical: 8,
    paddingBottom: 8,
  },
  toolbarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  toolbarTitle: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  collapseBtn: {
    padding: 4,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarModeRow: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  toolbarModeScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingBottom: 8,
    paddingHorizontal: 2,
  },
  modeBtn: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
    minWidth: 70,
  },
  modeBtnActive: {
    elevation: 2,
  },
  modeBtnTxt: {
    fontSize: 9,
    fontWeight: '800',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  subToolbarContainer: {
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  subToolbarScroll: {
    gap: 8,
    paddingHorizontal: 2,
  },
  shapeIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    borderRadius: 6,
  },
  shapeIconBtnTxt: {
    fontSize: 10,
    fontWeight: '700',
  },
  textControlsContainer: {
    paddingBottom: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  formatActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formatBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  fontSizeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    justifyContent: 'center',
  },
  fontSizeBtnText: {
    fontSize: 10,
    fontWeight: '800',
  },
  colorPaletteWrapper: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  colorPaletteScroll: {
    gap: 8,
    paddingHorizontal: 2,
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  customColorTrigger: {
    backgroundColor: '#ECEFF1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  brushWidthRow: {
    flexDirection: 'row',
    gap: 8,
    paddingLeft: 10,
  },
  widthCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  widthDot: {
    alignSelf: 'center',
  },
  pageSettingsRow: {
    flexDirection: 'column',
    gap: 12,
    marginTop: 4,
    marginBottom: 6,
  },
  toolbarLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#90A4AE',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  settingOptionsGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  pageStyleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  pageStyleBtnTxt: {
    fontSize: 10,
    fontWeight: '800',
  },
  tipText: {
    textAlign: 'center',
    fontSize: 9,
    color: '#90A4AE',
    fontStyle: 'italic',
    marginTop: 4,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerContainer: {
    width: '85%',
    borderRadius: 16,
    padding: 20,
    elevation: 8,
    alignItems: 'center',
  },
  pickerTitle: {
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  pickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  pickerColorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  pickerCloseBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  pickerCloseBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  shapeTextInput: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 12,
  },
  tableOverlay: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tableSelected: {
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(59, 130, 246, 0.02)',
  },
  zoomPanelContainer: {
    padding: 10,
    borderTopWidth: 1,
    alignItems: 'center',
    width: '100%',
  },
  zoomPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    marginBottom: 6,
    alignItems: 'center',
  },
  zoomPanelTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  zoomPanelCloseBtn: {
    padding: 2,
  },
  zoomPanelContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  zoomPanelCanvas: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  librarySectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    marginTop: 15,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  libraryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 6,
  },
  libraryItem: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  templateItem: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
});
