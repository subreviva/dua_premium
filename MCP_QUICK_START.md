# 🎵 AI Music API - Quick Start Guide

## 📋 Prerequisites

**Required:** Node.js version >= 18

Check your version:
```bash
node --version
```

If needed, install/update Node.js from [nodejs.org](https://nodejs.org/)

---

## 🚀 Setup in 3 Steps (2 minutes)

### **Step 1: Copy the JSON Configuration**

You have this JSON configuration:
```json
{
  "mcpServers": {
    "AI Music API": {
      "command": "npx",
      "args": [
        "-y",
        "apidog-mcp-server@latest",
        "--site-id=754564"
      ]
    }
  }
}
```

### **Step 2: Choose Your Setup Method**

#### **Option A: VS Code with GitHub Copilot (Recommended)**

1. **Create/edit** `.vscode/settings.json` in your project root
2. **Add or update** with:
```json
{
  "github.copilot.chat.mcp.servers": {
    "AI Music API": {
      "command": "npx",
      "args": [
        "-y",
        "apidog-mcp-server@latest",
        "--site-id=754564"
      ]
    }
  }
}
```

3. **Reload VS Code:**
   - Press `Cmd/Ctrl + Shift + P`
   - Type "Developer: Reload Window"
   - Press Enter

#### **Option B: Claude Desktop**

1. **Open configuration file:**

   **macOS:**
   ```bash
   open ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

   **Windows:**
   ```
   %APPDATA%\Claude\claude_desktop_config.json
   ```

   **Linux:**
   ```bash
   ~/.config/Claude/claude_desktop_config.json
   ```

2. **Paste the JSON** (the configuration at the top of this guide)

3. **Restart Claude Desktop**

#### **Option C: Global VS Code Settings**

1. **Open VS Code settings:**
   - Press `Cmd/Ctrl + Shift + P`
   - Type "Preferences: Open User Settings (JSON)"
   - Press Enter

2. **Add the configuration:**
```json
{
  "github.copilot.chat.mcp.servers": {
    "AI Music API": {
      "command": "npx",
      "args": [
        "-y",
        "apidog-mcp-server@latest",
        "--site-id=754564"
      ]
    }
  }
}
```

3. **Reload VS Code** (same as Option A)

### **Step 3: Test It Works**

**In GitHub Copilot Chat:**
```
@AI Music API help
```

**Expected result:**
- ✅ List of AI Music API endpoints
- ✅ Documentation available
- ✅ Ready to use!

---

## 📖 How to Use MCP

Once configured, you can query the AI Music API documentation directly in your chat:

**Basic syntax:**
```
@AI Music API [your question]
```

**Examples:**
- `@AI Music API list all endpoints`
- `@AI Music API show /generate parameters`
- `@AI Music API example curl for v5 generation`
- `@AI Music API response schema for /status`

---

## 🎯 Use Cases

### **During Development**
```
@AI Music API what parameters does /generate accept?
@AI Music API show me the request body schema
@AI Music API example response from /status endpoint
```

### **During Debugging**
```
@AI Music API what error codes can /generate return?
@AI Music API required vs optional fields for /generate
@AI Music API validate this request payload: {...}
```

### **Exploring the API**
```
@AI Music API list all available endpoints
@AI Music API authentication requirements
@AI Music API rate limits and quotas
```

---

## 🐛 Troubleshooting

### MCP Not Showing Up?

1. **Check Node.js version:**
   ```bash
   node --version
   ```
   Must be >= 18

2. **Verify configuration:**
   - Open `.vscode/settings.json`
   - Ensure JSON is valid (no trailing commas)
   - Check indentation

3. **Reload VS Code:**
   - `Cmd/Ctrl + Shift + P`
   - "Developer: Reload Window"

4. **Check Developer Tools:**
   - `Cmd/Ctrl + Shift + P`
   - "Developer: Toggle Developer Tools"
   - Look for MCP initialization messages

### Server Not Responding?

**Test the server manually:**
```bash
npx -y apidog-mcp-server@latest --site-id=754564
```

Should show:
```
Apidog MCP Server is running, communicating via stdio
```

### Still Not Working?

1. **Completely restart VS Code** (close and reopen)
2. **Check Copilot is active** (sign in if needed)
3. **Try typing `@` in chat** - should see "AI Music API" option
4. **See detailed troubleshooting:** [MCP_AI_MUSIC_API.md](./MCP_AI_MUSIC_API.md#-troubleshooting)

---

## 📚 Additional Resources

- **Detailed Setup Guide:** [MCP_AI_MUSIC_API.md](./MCP_AI_MUSIC_API.md)
- **Gooey.AI Integration:** [GOOEY_INTEGRATION.md](./GOOEY_INTEGRATION.md)
- **Model Context Protocol:** [modelcontextprotocol.io](https://modelcontextprotocol.io/)
- **Apidog MCP Server:** [npmjs.com/package/apidog-mcp-server](https://www.npmjs.com/package/apidog-mcp-server)

---

## ✅ Success Checklist

- [ ] Node.js >= 18 installed
- [ ] JSON configuration added to `.vscode/settings.json`
- [ ] VS Code reloaded (Developer: Reload Window)
- [ ] Copilot chat opened
- [ ] Typed `@AI Music API help`
- [ ] Received response with endpoints

**All checked?** 🎉 **You're ready to use MCP!**
