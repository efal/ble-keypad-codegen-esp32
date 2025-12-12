import { HidKey } from './types';

export const HID_KEYS: HidKey[] = [
  // Letters
  { name: 'KEY_A', code: '0x04' },
  { name: 'KEY_B', code: '0x05' },
  { name: 'KEY_C', code: '0x06' },
  { name: 'KEY_D', code: '0x07' },
  { name: 'KEY_E', code: '0x08' },
  { name: 'KEY_F', code: '0x09' },
  { name: 'KEY_G', code: '0x0A' },
  { name: 'KEY_H', code: '0x0B' },
  { name: 'KEY_I', code: '0x0C' },
  { name: 'KEY_J', code: '0x0D' },
  { name: 'KEY_K', code: '0x0E' },
  { name: 'KEY_L', code: '0x0F' },
  { name: 'KEY_M', code: '0x10' },
  { name: 'KEY_N', code: '0x11' },
  { name: 'KEY_O', code: '0x12' },
  { name: 'KEY_P', code: '0x13' },
  { name: 'KEY_Q', code: '0x14' },
  { name: 'KEY_R', code: '0x15' },
  { name: 'KEY_S', code: '0x16' },
  { name: 'KEY_T', code: '0x17' },
  { name: 'KEY_U', code: '0x18' },
  { name: 'KEY_V', code: '0x19' },
  { name: 'KEY_W', code: '0x1A' },
  { name: 'KEY_X', code: '0x1B' },
  { name: 'KEY_Y', code: '0x1C' },
  { name: 'KEY_Z', code: '0x1D' },

  // Numbers
  { name: 'KEY_1', code: '0x1E' },
  { name: 'KEY_2', code: '0x1F' },
  { name: 'KEY_3', code: '0x20' },
  { name: 'KEY_4', code: '0x21' },
  { name: 'KEY_5', code: '0x22' },
  { name: 'KEY_6', code: '0x23' },
  { name: 'KEY_7', code: '0x24' },
  { name: 'KEY_8', code: '0x25' },
  { name: 'KEY_9', code: '0x26' },
  { name: 'KEY_0', code: '0x27' },

  // Control / Nav
  { name: 'KEY_RETURN', code: '0x28' },
  { name: 'KEY_ESC', code: '0x29' },
  { name: 'KEY_BACKSPACE', code: '0x2A' },
  { name: 'KEY_TAB', code: '0x2B' },
  { name: 'KEY_SPACE', code: '0x2C' },
  { name: 'KEY_MINUS', code: '0x2D' },
  { name: 'KEY_EQUAL', code: '0x2E' },
  { name: 'KEY_BRACKET_LEFT', code: '0x2F' },
  { name: 'KEY_BRACKET_RIGHT', code: '0x30' },
  { name: 'KEY_BACKSLASH', code: '0x31' },
  { name: 'KEY_SEMICOLON', code: '0x33' },
  { name: 'KEY_APOSTROPHE', code: '0x34' },
  { name: 'KEY_GRAVE', code: '0x35' },
  { name: 'KEY_COMMA', code: '0x36' },
  { name: 'KEY_DOT', code: '0x37' },
  { name: 'KEY_SLASH', code: '0x38' },
  { name: 'KEY_CAPS_LOCK', code: '0x39' },

  // Function Keys
  { name: 'KEY_F1', code: '0x3A' },
  { name: 'KEY_F2', code: '0x3B' },
  { name: 'KEY_F3', code: '0x3C' },
  { name: 'KEY_F4', code: '0x3D' },
  { name: 'KEY_F5', code: '0x3E' },
  { name: 'KEY_F6', code: '0x3F' },
  { name: 'KEY_F7', code: '0x40' },
  { name: 'KEY_F8', code: '0x41' },
  { name: 'KEY_F9', code: '0x42' },
  { name: 'KEY_F10', code: '0x43' },
  { name: 'KEY_F11', code: '0x44' },
  { name: 'KEY_F12', code: '0x45' },

  // Navigation
  { name: 'KEY_PRINT_SCREEN', code: '0x46' },
  { name: 'KEY_SCROLL_LOCK', code: '0x47' },
  { name: 'KEY_PAUSE', code: '0x48' },
  { name: 'KEY_INSERT', code: '0x49' },
  { name: 'KEY_HOME', code: '0x4A' },
  { name: 'KEY_PAGE_UP', code: '0x4B' },
  { name: 'KEY_DELETE', code: '0x4C' },
  { name: 'KEY_END', code: '0x4D' },
  { name: 'KEY_PAGE_DOWN', code: '0x4E' },
  { name: 'KEY_RIGHT_ARROW', code: '0x4F' },
  { name: 'KEY_LEFT_ARROW', code: '0x50' },
  { name: 'KEY_DOWN_ARROW', code: '0x51' },
  { name: 'KEY_UP_ARROW', code: '0x52' },

  // Media (Standard HID often supports these, but sometimes requires Consumer Page. keeping to Keyboard Page for safety with this specific C++ implementation)
  { name: 'KEY_MUTE', code: '0x7F' },
  { name: 'KEY_VOLUME_UP', code: '0x80' },
  { name: 'KEY_VOLUME_DOWN', code: '0x81' },
];

// Valid ESP32 RTC GPIOs that can wake from deep sleep (ext0/ext1)
export const RTC_GPIO_PINS = [0, 2, 4, 12, 13, 14, 15, 25, 26, 27, 32, 33, 34, 35, 36, 37, 38, 39];

// Recommended ESP32 GPIOs that are generally safe for input (pull-up)
export const RECOMMENDED_PINS = [
  4, 5, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33
];

// Standard 4x4 Keypad Layout (phone-style)
export const KEYPAD_LABELS: string[][] = [
  ['1', '2', '3', 'A'],
  ['4', '5', '6', 'B'],
  ['7', '8', '9', 'C'],
  ['*', '0', '#', 'D']
];

// Default GPIO pins for Keypad 1
export const DEFAULT_KEYPAD1_ROW_PINS = [13, 12, 14, 27];
export const DEFAULT_KEYPAD1_COL_PINS = [26, 25, 33, 32];

// Default GPIO pins for Keypad 2
export const DEFAULT_KEYPAD2_ROW_PINS = [15, 2, 4, 16];
export const DEFAULT_KEYPAD2_COL_PINS = [17, 5, 18, 19];