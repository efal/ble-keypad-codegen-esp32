import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Trash2, Cpu, Keyboard, Download, Copy, Check, Terminal, Zap, Command, Type, Clock, MousePointerClick, Smartphone } from 'lucide-react';
import { DeviceConfig, ButtonMapping, ButtonModifiers, ActionConfig, KeypadConfig, KeypadKeyConfig } from './types';
import { HID_KEYS, RECOMMENDED_PINS, KEYPAD_LABELS, DEFAULT_KEYPAD1_ROW_PINS, DEFAULT_KEYPAD1_COL_PINS, DEFAULT_KEYPAD2_ROW_PINS, DEFAULT_KEYPAD2_COL_PINS } from './constants';
import { generateCppCode } from './utils/cppGenerator';
import KeypadEditor from './KeypadEditor';

function App() {
  const [activeTab, setActiveTab] = useState<'config' | 'code'>('config');
  const [copied, setCopied] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  const [config, setConfig] = useState<DeviceConfig>({
    name: "ESP32-Keyboard",
    manufacturer: "DIY-Labs",
    debounceTime: 30,
    deepSleepEnabled: false,
    sleepTimeout: 30000,
    longPressDuration: 500,
  });

  const defaultAction: ActionConfig = {
    mode: 'key',
    keyConfig: HID_KEYS.find(k => k.name === 'KEY_A') || HID_KEYS[0],
    modifiers: { ctrl: false, shift: false, alt: false, gui: false },
    text: "Hello World"
  };

  const [buttons, setButtons] = useState<ButtonMapping[]>([
    {
      id: '1',
      pin: 4,
      longPressEnabled: false,
      shortPress: {
        mode: 'key',
        keyConfig: HID_KEYS.find(k => k.name === 'KEY_RETURN') || HID_KEYS[0],
        modifiers: { ctrl: false, shift: false, alt: false, gui: false },
        text: ""
      },
      longPress: { ...defaultAction, text: "Long Press Action" }
    },
    {
      id: '2',
      pin: 16,
      longPressEnabled: true,
      shortPress: {
        mode: 'key',
        keyConfig: HID_KEYS.find(k => k.name === 'KEY_HOME') || HID_KEYS[0],
        modifiers: { ctrl: false, shift: false, alt: false, gui: false },
        text: ""
      },
      longPress: {
        mode: 'key',
        keyConfig: HID_KEYS.find(k => k.name === 'KEY_END') || HID_KEYS[0],
        modifiers: { ctrl: false, shift: false, alt: false, gui: false },
        text: ""
      }
    }
  ]);

  // Helper to create default keypad keys
  const createDefaultKeypadKeys = (): KeypadKeyConfig[] => {
    const defaultAction: ActionConfig = {
      mode: 'key',
      keyConfig: HID_KEYS.find(k => k.name === 'KEY_A') || HID_KEYS[0],
      modifiers: { ctrl: false, shift: false, alt: false, gui: false },
      text: ''
    };

    return KEYPAD_LABELS.flatMap((row, rowIdx) =>
      row.map((label, colIdx) => ({
        row: rowIdx,
        col: colIdx,
        label,
        longPressEnabled: false,
        shortPress: { ...defaultAction },
        longPress: { ...defaultAction }
      }))
    );
  };

  const [keypads, setKeypads] = useState<KeypadConfig[]>([
    {
      id: 'keypad1',
      enabled: false,
      name: 'Keypad 1',
      rowPins: [...DEFAULT_KEYPAD1_ROW_PINS],
      colPins: [...DEFAULT_KEYPAD1_COL_PINS],
      keys: createDefaultKeypadKeys()
    },
    {
      id: 'keypad2',
      enabled: false,
      name: 'Keypad 2',
      rowPins: [...DEFAULT_KEYPAD2_ROW_PINS],
      colPins: [...DEFAULT_KEYPAD2_COL_PINS],
      keys: createDefaultKeypadKeys()
    }
  ]);

  const generatedCode = useMemo(() => generateCppCode(config, buttons, keypads), [config, buttons, keypads]);

  // PWA Install Prompt Handler
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA installed');
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleAddButton = () => {
    const usedPins = buttons.map(b => b.pin);
    const nextPin = RECOMMENDED_PINS.find(p => !usedPins.includes(p)) || 4;

    setButtons([
      ...buttons,
      {
        id: crypto.randomUUID(),
        pin: nextPin,
        longPressEnabled: false,
        shortPress: { ...defaultAction, keyConfig: HID_KEYS.find(k => k.name === 'KEY_A')! },
        longPress: { ...defaultAction, keyConfig: HID_KEYS.find(k => k.name === 'KEY_B')! }
      }
    ]);
  };

  const handleRemoveButton = (id: string) => {
    setButtons(buttons.filter(b => b.id !== id));
  };

  const updateButton = (id: string, updates: Partial<ButtonMapping>) => {
    setButtons(buttons.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const updateAction = (btnId: string, type: 'shortPress' | 'longPress', field: keyof ActionConfig, value: any) => {
    setButtons(buttons.map(b => {
      if (b.id !== btnId) return b;
      return {
        ...b,
        [type]: {
          ...b[type],
          [field]: value
        }
      };
    }));
  };

  const toggleModifier = (btnId: string, type: 'shortPress' | 'longPress', mod: keyof ButtonModifiers) => {
    setButtons(buttons.map(b => {
      if (b.id !== btnId) return b;
      const current = b[type];
      return {
        ...b,
        [type]: {
          ...current,
          modifiers: { ...current.modifiers, [mod]: !current.modifiers[mod] }
        }
      };
    }));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/x-c++src' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.name.replace(/\s+/g, '_')}.ino`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderActionConfig = (btn: ButtonMapping, type: 'shortPress' | 'longPress') => {
    const action = btn[type];
    const isLong = type === 'longPress';

    return (
      <div className={`p-4 rounded-lg border ${isLong ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-slate-900 border-slate-800'}`}>
        <div className="flex items-center gap-2 mb-3">
          {isLong ? <Clock className="w-4 h-4 text-indigo-400" /> : <MousePointerClick className="w-4 h-4 text-emerald-400" />}
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {isLong ? 'Long Press Action' : 'Short Press Action'}
          </span>
        </div>

        <div className="space-y-3">
          {/* Mode Selection */}
          <div className="flex gap-2 bg-slate-950 p-1 rounded-md border border-slate-800 w-fit">
            <button
              onClick={() => updateAction(btn.id, type, 'mode', 'key')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${action.mode === 'key' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Keyboard className="w-3 h-3" />
              Key Combo
            </button>
            <button
              onClick={() => updateAction(btn.id, type, 'mode', 'text')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${action.mode === 'text' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Type className="w-3 h-3" />
              Text Macro
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {action.mode === 'key' ? (
              <div className="flex-1 min-w-0">
                <select
                  value={action.keyConfig.name}
                  onChange={(e) => {
                    const key = HID_KEYS.find(k => k.name === e.target.value);
                    if (key) updateAction(btn.id, type, 'keyConfig', key);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-md px-2 py-2 focus:border-emerald-500 outline-none"
                >
                  {HID_KEYS.map(k => (
                    <option key={k.name} value={k.name}>{k.name.replace('KEY_', '')} ({k.code})</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={action.text}
                  onChange={(e) => updateAction(btn.id, type, 'text', e.target.value)}
                  placeholder="e.g. MyPassword123"
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-md px-2 py-2 focus:border-emerald-500 outline-none placeholder-slate-600"
                />
              </div>
            )}
          </div>

          {action.mode === 'key' && (
            <div className="flex flex-wrap gap-2">
              {(['ctrl', 'shift', 'alt', 'gui'] as const).map(mod => (
                <button
                  key={mod}
                  onClick={() => toggleModifier(btn.id, type, mod)}
                  className={`px-2 py-1 text-[10px] font-bold uppercase rounded border transition-colors ${action.modifiers[mod]
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                    : 'bg-slate-950 border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-400'
                    }`}
                >
                  {mod}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30">

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
              <Cpu className="w-6 h-6 text-emerald-400" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              ESP32 BLE Keygen
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span className="hidden md:inline">Universal Bluetooth Keyboard Firmware Generator</span>

            {/* PWA Install Button */}
            {deferredPrompt && (
              <button
                onClick={() => setShowInstallPrompt(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors"
                title="Install App"
              >
                <Smartphone className="w-4 h-4" />
                <span className="hidden sm:inline">Install App</span>
              </button>
            )}

            <a
              href="https://github.com/h2zero/NimBLE-Arduino"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
            >
              Library Reference &rarr;
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Mobile Tabs */}
        <div className="md:hidden flex gap-2 mb-6 bg-slate-900/50 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('config')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${activeTab === 'config' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Configuration
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${activeTab === 'code' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Code Preview
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Configuration Column */}
          <div className={`space-y-6 ${activeTab === 'code' ? 'hidden lg:block' : ''}`}>

            {/* Global Settings */}
            <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl shadow-black/20">
              <div className="flex items-center gap-2 mb-6 text-emerald-400">
                <Terminal className="w-5 h-5" />
                <h2 className="text-lg font-semibold text-white">Device Settings</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Device Name</label>
                  <input
                    type="text"
                    value={config.name}
                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all placeholder-slate-600"
                    placeholder="My Keyboard"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Manufacturer</label>
                  <input
                    type="text"
                    value={config.manufacturer}
                    onChange={(e) => setConfig({ ...config, manufacturer: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all placeholder-slate-600"
                    placeholder="DIY Inc."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Debounce (ms)</label>
                  <input
                    type="number"
                    value={config.debounceTime}
                    onChange={(e) => setConfig({ ...config, debounceTime: parseInt(e.target.value) || 30 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Long Press Time (ms)</label>
                  <input
                    type="number"
                    value={config.longPressDuration}
                    onChange={(e) => setConfig({ ...config, longPressDuration: parseInt(e.target.value) || 500 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                {/* Power Saving */}
                <div className="col-span-1 md:col-span-2 pt-4 border-t border-slate-800/50 mt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">Deep Sleep</span>
                      <span className="text-xs text-slate-500">Disconnects BLE after idle timeout</span>
                    </div>
                    <button
                      onClick={() => setConfig({ ...config, deepSleepEnabled: !config.deepSleepEnabled })}
                      className={`relative w-11 h-6 rounded-full transition-colors ${config.deepSleepEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
                    >
                      <span className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${config.deepSleepEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {config.deepSleepEnabled && (
                    <div className="mt-4 animate-in fade-in slide-in-from-top-1">
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Idle Timeout (ms)</label>
                      <input
                        type="number"
                        value={config.sleepTimeout}
                        onChange={(e) => setConfig({ ...config, sleepTimeout: parseInt(e.target.value) || 30000 })}
                        className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none"
                      />
                    </div>
                  )}
                </div>

              </div>
            </section>

            {/* Button Mapping */}
            <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl shadow-black/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Keyboard className="w-5 h-5" />
                  <h2 className="text-lg font-semibold text-white">Button Map</h2>
                </div>
                <button
                  onClick={handleAddButton}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  ADD BUTTON
                </button>
              </div>

              <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                {buttons.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-lg">
                    <p className="text-slate-500 mb-2">No buttons configured.</p>
                    <button onClick={handleAddButton} className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">Add your first button</button>
                  </div>
                )}
                {buttons.map((btn, idx) => (
                  <div key={btn.id} className="group bg-slate-950 border border-slate-800 p-4 rounded-lg hover:border-emerald-500/30 transition-all animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex flex-col gap-4">

                      {/* Top Row: Pin & Remove */}
                      <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">GPIO</label>
                            <select
                              value={btn.pin}
                              onChange={(e) => updateButton(btn.id, { pin: parseInt(e.target.value) })}
                              className="bg-slate-900 border border-slate-700 text-emerald-400 font-mono text-sm rounded px-2 py-1 focus:border-emerald-500 outline-none"
                            >
                              {RECOMMENDED_PINS.map(p => (
                                <option key={p} value={p}>{p}</option>
                              ))}
                              <option value={btn.pin} disabled={RECOMMENDED_PINS.includes(btn.pin)}>Other ({btn.pin})</option>
                            </select>
                          </div>

                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={btn.longPressEnabled}
                              onChange={(e) => updateButton(btn.id, { longPressEnabled: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-8 h-4 bg-slate-700 rounded-full peer peer-checked:bg-indigo-500 peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all relative"></div>
                            <span className={`text-xs font-medium ${btn.longPressEnabled ? 'text-indigo-400' : 'text-slate-500'}`}>Long Press</span>
                          </label>
                        </div>

                        <button
                          onClick={() => handleRemoveButton(btn.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          title="Remove Button"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Action Configs */}
                      <div className="grid grid-cols-1 gap-4">
                        {renderActionConfig(btn, 'shortPress')}

                        {btn.longPressEnabled && (
                          <div className="animate-in fade-in slide-in-from-top-2">
                            {renderActionConfig(btn, 'longPress')}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Keypad Configuration */}
            {keypads.map((keypad, index) => {
              // Calculate all used pins to prevent conflicts
              const allUsedPins = [
                ...buttons.map(b => b.pin),
                ...keypads.filter(kp => kp.enabled && kp.id !== keypad.id).flatMap(kp => [...kp.rowPins, ...kp.colPins])
              ];

              return (
                <KeypadEditor
                  key={keypad.id}
                  keypad={keypad}
                  onUpdate={(updates) => {
                    setKeypads(keypads.map(kp => kp.id === keypad.id ? { ...kp, ...updates } : kp));
                  }}
                  allUsedPins={allUsedPins}
                />
              );
            })}
          </div>

          {/* Code Column */}
          <div className={`flex flex-col h-full ${activeTab === 'config' ? 'hidden lg:flex' : ''}`}>
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[calc(100vh-8rem)] lg:h-auto lg:min-h-[600px] sticky top-24">

              {/* Toolbar */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
                  </div>
                  <span className="ml-3 text-xs font-mono text-slate-500">firmware.ino</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors border border-slate-700"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={downloadCode}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shadow-lg shadow-emerald-900/20"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                </div>
              </div>

              {/* Code Area */}
              <div className="flex-1 relative bg-[#0d1117] overflow-auto custom-scrollbar">
                <pre className="p-4 text-xs sm:text-sm font-mono leading-relaxed text-slate-300 tab-4">
                  <code>{generatedCode}</code>
                </pre>
              </div>

              <div className="bg-slate-950 border-t border-slate-800 px-4 py-2 flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                <Zap className="w-3 h-3 text-amber-500" />
                <span>Ready to Flash</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* PWA Install Modal */}
      {showInstallPrompt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-emerald-500/10 p-3 rounded-lg">
                <Smartphone className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Install App</h3>
            </div>

            <p className="text-slate-300 mb-6">
              Install ESP32 BLE Keygen as a standalone app for quick access and offline use.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleInstallClick}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
              >
                Install Now
              </button>
              <button
                onClick={() => setShowInstallPrompt(false)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
