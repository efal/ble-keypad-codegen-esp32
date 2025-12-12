# ESP32 BLE Keygen 🔌⌨️

Universal Bluetooth Keyboard Firmware Generator for ESP32

Generate custom BLE HID keyboard firmware for your ESP32 projects with an intuitive web interface. Configure buttons, assign key combinations or text macros, and download production-ready Arduino code.

## ✨ Features

- 📱 **Interactive Configuration** - Visual button mapping with GPIO pin selection
- ⌨️ **Dual Action Modes** - Key combinations or text macros per button
- ⏱️ **Long Press Support** - Different actions for short and long presses
- 🔋 **Power Management** - Deep sleep with RTC wake-up support
- 📦 **Ready-to-Flash** - Download complete `.ino` files for Arduino IDE
- 🎨 **Modern UI** - Responsive design for desktop and mobile

## 🚀 Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy)

### Manual Deployment

1. **Build the project:**
   ```bash
   npm install
   npm run build
   ```

2. **Deploy to Netlify:**
   - Drag and drop the `dist` folder to [Netlify Drop](https://app.netlify.com/drop)
   - Or connect your Git repository for automatic deployments

### Automatic Deployment (Recommended)

The project includes `netlify.toml` for automatic deployment:

- **Build Command:** `npm run build`
- **Publish Directory:** `dist`
- **Node Version:** 18+

## 💻 Run Locally

**Prerequisites:** Node.js 18+

1. **Clone and install:**
   ```bash
   git clone <your-repo>
   cd esp32-ble-keygen
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   ```
   http://localhost:5173
   ```

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Lucide React** - Icons
- **Tailwind CSS** - Styling (utility-first)

## 📚 Required Arduino Library

The generated code requires:
- [NimBLE-Arduino](https://github.com/h2zero/NimBLE-Arduino) by h2zero

Install via Arduino Library Manager or PlatformIO.

## 📝 License

MIT License - Feel free to use in your projects!
