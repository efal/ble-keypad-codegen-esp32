export interface HidKey {
  name: string;
  code: string; // Hex string e.g., "0x28"
  description?: string;
}

export interface ButtonModifiers {
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  gui: boolean;
}

export type ButtonMode = 'key' | 'text';

export interface ActionConfig {
  mode: ButtonMode;
  keyConfig: HidKey;
  modifiers: ButtonModifiers;
  text: string;
}

export interface ButtonMapping {
  id: string;
  pin: number;
  longPressEnabled: boolean;
  shortPress: ActionConfig;
  longPress: ActionConfig;
}

export interface DeviceConfig {
  name: string;
  manufacturer: string;
  debounceTime: number;
  deepSleepEnabled: boolean;
  sleepTimeout: number; // in microseconds
  longPressDuration: number; // in milliseconds
}

// Keypad Types
export interface KeypadKeyConfig {
  row: number;           // 0-3
  col: number;           // 0-3
  label: string;         // Display label (1,2,3,A etc.)
  longPressEnabled: boolean;
  shortPress: ActionConfig;
  longPress: ActionConfig;
}

export interface KeypadConfig {
  id: string;
  enabled: boolean;
  name: string;          // "Keypad 1" or "Keypad 2"
  rowPins: number[];     // 4 GPIO pins for rows
  colPins: number[];     // 4 GPIO pins for columns
  keys: KeypadKeyConfig[]; // 16 keys (4x4)
}
