import React, { useState } from 'react';
import { Grid, Settings, Keyboard, Clock, MousePointerClick, Type, ChevronDown, ChevronUp } from 'lucide-react';
import { KeypadConfig, KeypadKeyConfig, ActionConfig } from './types';
import { HID_KEYS, RECOMMENDED_PINS, KEYPAD_LABELS } from './constants';

interface KeypadEditorProps {
    keypad: KeypadConfig;
    onUpdate: (updates: Partial<KeypadConfig>) => void;
    allUsedPins: number[];
}

const KeypadEditor: React.FC<KeypadEditorProps> = ({ keypad, onUpdate, allUsedPins }) => {
    const [selectedKey, setSelectedKey] = useState<{ row: number; col: number } | null>(null);
    const [showPinConfig, setShowPinConfig] = useState(false);

    const getKeyConfig = (row: number, col: number): KeypadKeyConfig | undefined => {
        return keypad.keys.find(k => k.row === row && k.col === col);
    };

    const updateKeyAction = (
        row: number,
        col: number,
        type: 'shortPress' | 'longPress',
        field: keyof ActionConfig,
        value: any
    ) => {
        const updatedKeys = keypad.keys.map(k => {
            if (k.row !== row || k.col !== col) return k;
            return {
                ...k,
                [type]: {
                    ...k[type],
                    [field]: value
                }
            };
        });
        onUpdate({ keys: updatedKeys });
    };

    const toggleKeyLongPress = (row: number, col: number) => {
        const updatedKeys = keypad.keys.map(k => {
            if (k.row !== row || k.col !== col) return k;
            return { ...k, longPressEnabled: !k.longPressEnabled };
        });
        onUpdate({ keys: updatedKeys });
    };

    const toggleModifier = (
        row: number,
        col: number,
        type: 'shortPress' | 'longPress',
        mod: 'ctrl' | 'shift' | 'alt' | 'gui'
    ) => {
        const key = getKeyConfig(row, col);
        if (!key) return;

        const action = key[type];
        const updatedKeys = keypad.keys.map(k => {
            if (k.row !== row || k.col !== col) return k;
            return {
                ...k,
                [type]: {
                    ...k[type],
                    modifiers: { ...action.modifiers, [mod]: !action.modifiers[mod] }
                }
            };
        });
        onUpdate({ keys: updatedKeys });
    };

    const updatePin = (type: 'row' | 'col', index: number, pin: number) => {
        if (type === 'row') {
            const newPins = [...keypad.rowPins];
            newPins[index] = pin;
            onUpdate({ rowPins: newPins });
        } else {
            const newPins = [...keypad.colPins];
            newPins[index] = pin;
            onUpdate({ colPins: newPins });
        }
    };

    const availablePins = RECOMMENDED_PINS.filter(
        p => !allUsedPins.includes(p) || keypad.rowPins.includes(p) || keypad.colPins.includes(p)
    );

    const renderActionEditor = (keyConfig: KeypadKeyConfig, type: 'shortPress' | 'longPress') => {
        const action = keyConfig[type];
        const isLong = type === 'longPress';

        return (
            <div className={`p-3 rounded-lg border ${isLong ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-slate-900 border-slate-800'}`}>
                <div className="flex items-center gap-2 mb-2">
                    {isLong ? <Clock className="w-3 h-3 text-indigo-400" /> : <MousePointerClick className="w-3 h-3 text-emerald-400" />}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {isLong ? 'Long Press' : 'Short Press'}
                    </span>
                </div>

                {/* Mode Selection */}
                <div className="flex gap-1 bg-slate-950 p-0.5 rounded mb-2 w-fit">
                    <button
                        onClick={() => updateKeyAction(keyConfig.row, keyConfig.col, type, 'mode', 'key')}
                        className={`px-2 py-1 text-[10px] font-medium rounded transition-colors flex items-center gap-1 ${action.mode === 'key' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Keyboard className="w-2.5 h-2.5" />
                        Key
                    </button>
                    <button
                        onClick={() => updateKeyAction(keyConfig.row, keyConfig.col, type, 'mode', 'text')}
                        className={`px-2 py-1 text-[10px] font-medium rounded transition-colors flex items-center gap-1 ${action.mode === 'text' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Type className="w-2.5 h-2.5" />
                        Text
                    </button>
                </div>

                {action.mode === 'key' ? (
                    <>
                        <select
                            value={action.keyConfig.name}
                            onChange={(e) => {
                                const key = HID_KEYS.find(k => k.name === e.target.value);
                                if (key) updateKeyAction(keyConfig.row, keyConfig.col, type, 'keyConfig', key);
                            }}
                            className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1.5 focus:border-emerald-500 outline-none mb-2"
                        >
                            {HID_KEYS.map(k => (
                                <option key={k.name} value={k.name}>{k.name.replace('KEY_', '')}</option>
                            ))}
                        </select>

                        <div className="flex flex-wrap gap-1">
                            {(['ctrl', 'shift', 'alt', 'gui'] as const).map(mod => (
                                <button
                                    key={mod}
                                    onClick={() => toggleModifier(keyConfig.row, keyConfig.col, type, mod)}
                                    className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded border transition-colors ${action.modifiers[mod]
                                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                                        : 'bg-slate-950 border-slate-700 text-slate-500 hover:border-slate-600'
                                        }`}
                                >
                                    {mod}
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    <input
                        type="text"
                        value={action.text}
                        onChange={(e) => updateKeyAction(keyConfig.row, keyConfig.col, type, 'text', e.target.value)}
                        placeholder="Text to type..."
                        className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1.5 focus:border-emerald-500 outline-none placeholder-slate-600"
                    />
                )}
            </div>
        );
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Grid className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-lg font-semibold text-white">{keypad.name}</h3>
                </div>
                <button
                    onClick={() => onUpdate({ enabled: !keypad.enabled })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${keypad.enabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
                >
                    <span className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${keypad.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
            </div>

            {keypad.enabled && (
                <div className="space-y-4">
                    {/* Pin Configuration Toggle */}
                    <button
                        onClick={() => setShowPinConfig(!showPinConfig)}
                        className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-300 transition-colors"
                    >
                        <Settings className="w-3.5 h-3.5" />
                        <span>GPIO Pin Configuration</span>
                        {showPinConfig ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {/* Pin Configuration */}
                    {showPinConfig && (
                        <div className="grid grid-cols-2 gap-4 p-3 bg-slate-950 rounded-lg border border-slate-800">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Row Pins (R0-R3)</label>
                                <div className="flex gap-1">
                                    {keypad.rowPins.map((pin, i) => (
                                        <select
                                            key={`row-${i}`}
                                            value={pin}
                                            onChange={(e) => updatePin('row', i, parseInt(e.target.value))}
                                            className="flex-1 bg-slate-900 border border-slate-700 text-emerald-400 font-mono text-xs rounded px-1 py-1 focus:border-emerald-500 outline-none"
                                        >
                                            {availablePins.map(p => (
                                                <option key={p} value={p}>{p}</option>
                                            ))}
                                        </select>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Col Pins (C0-C3)</label>
                                <div className="flex gap-1">
                                    {keypad.colPins.map((pin, i) => (
                                        <select
                                            key={`col-${i}`}
                                            value={pin}
                                            onChange={(e) => updatePin('col', i, parseInt(e.target.value))}
                                            className="flex-1 bg-slate-900 border border-slate-700 text-cyan-400 font-mono text-xs rounded px-1 py-1 focus:border-emerald-500 outline-none"
                                        >
                                            {availablePins.map(p => (
                                                <option key={p} value={p}>{p}</option>
                                            ))}
                                        </select>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 4x4 Keypad Grid */}
                    <div className="grid grid-cols-4 gap-2">
                        {KEYPAD_LABELS.flatMap((row, rowIdx) =>
                            row.map((label, colIdx) => {
                                const keyConfig = getKeyConfig(rowIdx, colIdx);
                                const isSelected = selectedKey?.row === rowIdx && selectedKey?.col === colIdx;
                                const hasAction = keyConfig && (
                                    keyConfig.shortPress.mode === 'text' ||
                                    keyConfig.shortPress.keyConfig.name !== 'KEY_A' ||
                                    Object.values(keyConfig.shortPress.modifiers).some(v => v)
                                );

                                return (
                                    <button
                                        key={`${rowIdx}-${colIdx}`}
                                        onClick={() => setSelectedKey(isSelected ? null : { row: rowIdx, col: colIdx })}
                                        className={`
                      aspect-square rounded-lg border-2 font-bold text-lg transition-all
                      flex flex-col items-center justify-center gap-0.5
                      ${isSelected
                                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 scale-105'
                                                : hasAction
                                                    ? 'bg-slate-800 border-cyan-500/50 text-cyan-400 hover:border-cyan-500'
                                                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                                            }
                    `}
                                    >
                                        <span>{label}</span>
                                        {keyConfig?.longPressEnabled && (
                                            <Clock className="w-3 h-3 text-indigo-400" />
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Selected Key Editor */}
                    {selectedKey && (
                        <div className="mt-4 p-4 bg-slate-950 rounded-lg border border-slate-800">
                            {(() => {
                                const keyConfig = getKeyConfig(selectedKey.row, selectedKey.col);
                                if (!keyConfig) return null;

                                return (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-semibold text-white">
                                                Key: <span className="text-emerald-400">{keyConfig.label}</span>
                                            </h4>
                                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                                <span className={`text-xs font-medium ${keyConfig.longPressEnabled ? 'text-indigo-400' : 'text-slate-500'}`}>
                                                    Long Press
                                                </span>
                                                <div
                                                    onClick={() => toggleKeyLongPress(keyConfig.row, keyConfig.col)}
                                                    className={`w-8 h-4 rounded-full cursor-pointer transition-colors relative ${keyConfig.longPressEnabled ? 'bg-indigo-500' : 'bg-slate-700'}`}
                                                >
                                                    <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${keyConfig.longPressEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                                                </div>
                                            </label>
                                        </div>

                                        {renderActionEditor(keyConfig, 'shortPress')}

                                        {keyConfig.longPressEnabled && renderActionEditor(keyConfig, 'longPress')}
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default KeypadEditor;
