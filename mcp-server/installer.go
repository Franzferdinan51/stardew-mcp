package main

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"

	"github.com/charmbracelet/bubbles/progress"
	"github.com/charmbracelet/bubbles/spinner"
	"github.com/charmbracelet/bubbles/textinput"
	"github.com/charmbracelet/bubbles/viewport"
	"github.com/charmbracelet/lipgloss"
	tea "github.com/charmbracelet/charm"
	"github.com/muesli/termenv"
)

func main() {
	tea.InitializeTTY()
	p := tea.NewProgram(initialModel(), tea.WithAltScreen())
	if err := p.Start(); err != nil {
		fmt.Println("Error:", err)
		os.Exit(1)
	}
}

// ============================================================================
// Styles - Charm/Lip Gloss styling
// ============================================================================

var (
	// Color palette
	primaryColor = lipgloss.Color("86")
	successColor = lipgloss.Color("82")
	errorColor   = lipgloss.Color("203")
	warningColor = lipgloss.Color("226")
	lobsterColor = lipgloss.Color("196")

	// Styles
	titleStyle = lipgloss.NewStyle().
			Foreground(lobsterColor).
			Bold(true).
			Padding(0, 1)

	headerStyle = lipgloss.NewStyle().
			Foreground(primaryColor).
			Bold(true).
			Padding(0, 1)

	normalText = lipgloss.NewStyle().
			Foreground(lipgloss.Color("252"))

	successText = lipgloss.NewStyle().
			Foreground(successColor)

	errorText = lipgloss.NewStyle().
			Foreground(errorColor)

	infoText = lipgloss.NewStyle().
			Foreground(warningColor)

	borderStyle = lipgloss.NewStyle().
			BorderStyle(lipgloss.RoundedBorder).
			BorderForeground(primaryColor).
			Padding(1, 2)

	boxStyle = lipgloss.NewStyle().
			BorderStyle(lipgloss.DoubleBorder).
			BorderForeground(primaryColor).
			Padding(1, 2)

	buttonStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("15")).
			Background(primaryColor).
			Padding(0, 2).
			Margin(0, 1)

	buttonFocusedStyle = lipgloss.NewStyle().
				Foreground(lipgloss.Color("15")).
				Background(lobsterColor).
				Bold(true).
				Padding(0, 2).
				Margin(0, 1)

	progressBar = progress.New(
		progress.WithGradient("#ff6b6b", "#4ecdc4"),
		progress.WithoutPercentage(),
	)
)

// ============================================================================
// Model - Bubble Tea Model
// ============================================================================

type model struct {
	step           int
	stardewPath   string
	openclaw      bool
	remote        bool
	autoStart     bool

	// Welcome step
	choiceSelected int

	// Path step
	pathInput    textinput.Model
	pathDetected string

	// Install step
	spinner       spinner.Model
	progress      progress.Model
	logs          viewport.Model
	logLines      []string
	installing    bool
	installError  string
	installDone   bool

	// Final
	width  int
	height int
}

func initialModel() model {
	// Setup terminal colors
	termenv.ColorProfile()

	ti := textinput.New()
	ti.Placeholder = "/path/to/StardewValley"
	ti.Focus()

	sp := spinner.New()
	sp.Spinner = spinner.Meter
	sp.Style = spinnerStyle()

	logs := viewport.New(60, 10)

	return model{
		step:         0,
		stardewPath: detectStardewValley(),
		choiceSelected: 0,
		pathInput:    ti,
		pathDetected: detectStardewValley(),
		spinner:      sp,
		progress:     *progressBar,
		logs:         logs,
		logLines:     []string{},
	}
}

func spinnerStyle() lipgloss.Style {
	return lipgloss.NewStyle().Foreground(primaryColor)
}

// ============================================================================
// Update - Bubble Tea Update Loop
// ============================================================================

func (m model) Init() tea.Cmd {
	return nil
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	var cmds []tea.Cmd

	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.String() {
		case "ctrl+c", "q":
			return m, tea.Quit

		case "up", "w":
			if m.step == 0 && m.choiceSelected > 0 {
				m.choiceSelected--
			}

		case "down", "s":
			if m.step == 0 && m.choiceSelected < 2 {
				m.choiceSelected++
			}

		case "enter":
			switch m.step {
			case 0: // Welcome - install or exit
				if m.choiceSelected == 0 {
					m.step = 1
					m.pathInput.SetValue(m.stardewPath)
				} else {
					return m, tea.Quit
				}
			case 1: // Path - proceed or detect
				// Already handled by separate key handlers
			case 2: // Options - start install
				m.step = 3
				m.installing = true
				go runInstall(&m)
			case 3: // Install complete
				if m.installDone {
					return m, tea.Quit
				}
			}

		case "tab":
			if m.step == 1 {
				m.stardewPath = m.pathDetected
				m.pathInput.SetValue(m.stardewPath)
			}
		}

	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height

	case spinner.TickMsg:
		if m.step == 3 && m.installing && !m.installDone && m.installError == "" {
			m.spinner, _ = m.spinner.Update(msg)
		}

	case progress.Msg:
		if m.step == 3 {
			m.progress, _ = m.progress.Update(msg)
		}
	}

	// Handle text input for path
	if m.step == 1 {
		m.pathInput, _ = m.pathInput.Update(msg)
	}

	return m, tea.Batch(cmds...)
}

// ============================================================================
// View - Bubble Tea View
// ============================================================================

func (m model) View() string {
	switch m.step {
	case 0:
		return m.viewWelcome()
	case 1:
		return m.viewPath()
	case 2:
		return m.viewOptions()
	case 3:
		return m.viewInstall()
	}
	return ""
}

func (m model) viewWelcome() string {
	title := titleStyle.Render("🦞 Stardew MCP Installer 🦞")
	subtitle := normalText.Render("Lobster Edition")

	installBtn := "  [Install Everything]  "
	exitBtn := "      [Exit]      "

	if m.choiceSelected == 0 {
		installBtn = buttonFocusedStyle.Render("[ Install Everything ]")
	} else {
		installBtn = buttonStyle.Render(installBtn)
	}

	if m.choiceSelected == 1 {
		exitBtn = buttonFocusedStyle.Render("[ Exit ]")
	} else {
		exitBtn = buttonStyle.Render(exitBtn)
	}

	features := normalText.Render(`
This installer will set up everything you need:

  🏗️  Build Go MCP Server
  🔧  Build C# Stardew Valley Mod
  📦  Install mod to your game folder
  🔗  Configure OpenClaw & Remote options

Use ↑↓ to select, Enter to confirm
`)

	content := fmt.Sprintf(`
%s

%s

%s


%s  %s
`, title, subtitle, boxStyle.Width(50).Render(features), installBtn, exitBtn)

	return centerContent(content, m.width, m.height)
}

func (m model) viewPath() string {
	title := headerStyle.Render("Stardew Valley Location")

	detected := infoText.Render(fmt.Sprintf("Auto-detected: %s", m.pathDetected))
	currentPath := normalText.Render(fmt.Sprintf("Current path: %s", m.stardewPath))

	instructions := normalText.Render(`
Enter the path where Stardew Valley is installed
Press TAB to use auto-detected path
`)

	nav := normalText.Render(`
[< Back]                      [Next >]
`)

	content := fmt.Sprintf(`
%s

%s
%s

Path: %s

%s

%s
`, title, detected, currentPath, m.pathInput.View(), instructions, nav)

	return centerContent(boxStyle.Width(60).Render(content), m.width, m.height)
}

func (m model) viewOptions() string {
	title := headerStyle.Render("Additional Options")

	openclawMark := " "
	remoteMark := " "
	autoMark := "✓"

	if m.openclaw {
		openclawMark = "✓"
	}
	if m.remote {
		remoteMark = "✓"
	}
	if m.autoStart {
		autoMark = "✓"
	}

	openclaw := normalText.Render(fmt.Sprintf("[%s] Enable OpenClaw Gateway", openclawMark))
	remote := normalText.Render(fmt.Sprintf("[%s] Enable Remote Server Mode", remoteMark))
	auto := normalText.Render(fmt.Sprintf("[%s] Auto-start agent on connect", autoMark))

	nav := normalText.Render(`
[< Back]                    [Install Now]
`)

	content := fmt.Sprintf(`
%s

%s
%s
%s

%s
`, title, openclaw, remote, auto, nav)

	return centerContent(boxStyle.Width(60).Render(content), m.width, m.height)
}

func (m model) viewInstall() string {
	title := headerStyle.Render("Installing...")

	if m.installError != "" {
		errorBox := errorText.Render(fmt.Sprintf("Error: %s", m.installError))
		return centerContent(boxStyle.Width(60).Render(fmt.Sprintf("%s\n\n%s", title, errorBox)), m.width, m.height)
	}

	if m.installDone {
		options := ""
		if m.openclaw {
			options += "\n  • OpenClaw Gateway Enabled"
		}
		if m.remote {
			options += "\n  • Remote Server Enabled"
		}
		if options == "" {
			options = "\n  • Default Configuration"
		}

		success := successText.Render("🎉 Installation Complete! 🎉")
		nextSteps := normalText.Render(fmt.Sprintf(`
Next Steps:
  1. Start Stardew Valley through SMAPI
  2. Load your save file
  3. Run: cd setup && run.bat

Enabled Options:%s

[Exit]
`, options))

		return centerContent(successText.Width(50).Render(successText.Width(50).Render("")), m.width, m.height) + "\n\n" +
			boxStyle.Width(50).Render(nextSteps), m.width, m.height)
	}

	// Show logs
	logContent := normalText.Render(joinLines(m.logLines))
	m.logs.SetContent(logContent)

	view := fmt.Sprintf(`
%s

%s

%s
`, title, m.logs.View(), m.progress.View())

	return centerContent(boxStyle.Width(70).Height(20).Render(view), m.width, m.height)
}

func centerContent(content string, width, height int) string {
	lines := lipgloss.SplitLines(content)
	contentHeight := len(lines)

	if contentHeight >= height {
		return content
	}

	emptyLines := (height - contentHeight) / 2
	top := "\n"
	for i := 0; i < emptyLines-2; i++ {
		top += "\n"
	}

	// Calculate padding
	maxWidth := 0
	for _, line := range lines {
		w := lipgloss.Width(line)
		if w > maxWidth {
			maxWidth = w
		}
	}

	leftPad := (width - maxWidth) / 2
	if leftPad < 0 {
		leftPad = 0
	}

	padded := ""
	for _, line := range lines {
		padded += "\n" + line
	}

	return top + padded
}

func joinLines(lines []string) string {
	result := ""
	for i, line := range lines {
		if i > 0 {
			result += "\n"
		}
		result += line
	}
	return result
}

// ============================================================================
// Installation Logic
// ============================================================================

func runInstall(m *model) {
	addLog(m, infoText.Render("Starting installation..."))

	// Step 1: Check Go
	addLog(m, infoText.Render("Checking Go installation..."))
	if !commandExists("go") {
		m.installError = "Go not found! Please install Go 1.23+ from https://go.dev/dl/"
		addLog(m, errorText.Render("Go not found!"))
		return
	}
	addLog(m, successText.Render("✓ Go found!"))
	updateProgress(m, 0.15)

	// Step 2: Check .NET
	addLog(m, infoText.Render("Checking .NET SDK..."))
	if !commandExists("dotnet") {
		m.installError = ".NET SDK not found! Please install .NET 6.0+ from https://dotnet.microsoft.com/download"
		addLog(m, errorText.Render(".NET SDK not found!"))
		return
	}
	addLog(m, successText.Render("✓ .NET found!"))
	updateProgress(m, 0.30)

	// Step 3: Build Go server
	addLog(m, infoText.Render("Building Go MCP Server..."))
	if err := buildGoServer(); err != nil {
		m.installError = fmt.Sprintf("Failed to build Go server: %v", err)
		addLog(m, errorText.Render(fmt.Sprintf("Failed: %v", err)))
		return
	}
	addLog(m, successText.Render("✓ Go MCP Server built!"))
	updateProgress(m, 0.50)

	// Step 4: Build C# Mod
	addLog(m, infoText.Render("Building C# Stardew Mod..."))
	if err := buildCSharpMod(); err != nil {
		m.installError = fmt.Sprintf("Failed to build C# mod: %v", err)
		addLog(m, errorText.Render(fmt.Sprintf("Failed: %v", err)))
		return
	}
	addLog(m, successText.Render("✓ C# Mod built!"))
	updateProgress(m, 0.70)

	// Step 5: Install Mod
	addLog(m, infoText.Render("Installing mod to Stardew Valley..."))
	if err := installMod(m.stardewPath); err != nil {
		m.installError = fmt.Sprintf("Failed to install mod: %v", err)
		addLog(m, errorText.Render(fmt.Sprintf("Failed: %v", err)))
		return
	}
	addLog(m, successText.Render("✓ Mod installed!"))
	updateProgress(m, 0.85)

	// Step 6: Create config
	addLog(m, infoText.Render("Creating configuration..."))
	if err := createConfig(m.autoStart); err != nil {
		addLog(m, errorText.Render(fmt.Sprintf("Failed: %v", err)))
	} else {
		addLog(m, successText.Render("✓ Configuration created!"))
	}
	updateProgress(m, 1.0)

	addLog(m, successText.Render("🎉 Installation Complete! 🎉"))

	m.installDone = true
	m.installing = false
}

func addLog(m *model, line string) {
	m.logLines = append(m.logLines, line)
	if len(m.logLines) > 100 {
		m.logLines = m.logLines[len(m.logLines)-100:]
	}
}

func updateProgress(m *model, pct float64) {
	m.progress.SetPercent(pct)
}

// ============================================================================
// Helper Functions
// ============================================================================

func detectStardewValley() string {
	paths := []string{}

	switch runtime.GOOS {
	case "windows":
		paths = []string{
			`C:\Program Files\Stardew Valley`,
			`C:\Program Files (x86)\Stardew Valley`,
			filepath.Join(os.Getenv("LocalAppData"), "StardewValley"),
			`D:\Games\Stardew Valley`,
		}
	case "darwin":
		paths = []string{
			"/Applications/Stardew Valley.app/Contents/MacOS",
			filepath.Join(os.Getenv("HOME"), "Applications/Stardew Valley.app/Contents/MacOS"),
		}
	case "linux":
		paths = []string{
			filepath.Join(os.Getenv("HOME"), ".local/share/Steam/steamapps/common/Stardew Valley"),
			filepath.Join(os.Getenv("HOME"), ".steam/steamapps/common/Stardew Valley"),
			"/opt/stardew-valley",
		}
	}

	for _, p := range paths {
		if pathExists(p) {
			return p
		}
	}

	return ""
}

func pathExists(path string) bool {
	if path == "" {
		return false
	}
	_, err := os.Stat(path)
	return err == nil
}

func commandExists(cmd string) bool {
	_, err := exec.LookPath(cmd)
	return err == nil
}

func buildGoServer() error {
	dir := getCurrentDir()
	cmd := exec.Command("go", "build", "-o", "stardew-mcp")
	cmd.Dir = filepath.Join(dir, "..", "mcp-server")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}

func buildCSharpMod() error {
	dir := getCurrentDir()
	cmd := exec.Command("dotnet", "build", "-c", "Release")
	cmd.Dir = filepath.Join(dir, "..", "mod", "StardewMCP")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}

func installMod(stardewPath string) error {
	modsDir := filepath.Join(stardewPath, "Mods", "StardewMCP")
	if err := os.MkdirAll(modsDir, 0755); err != nil {
		return err
	}

	srcDir := filepath.Join(getCurrentDir(), "..", "mod", "StardewMCP", "bin", "Release", "net6.0")
	return copyDir(srcDir, modsDir)
}

func createConfig(autoStart bool) error {
	config := fmt.Sprintf(`server:
  game_url: "ws://localhost:8765/game"
  auto_start: %v
  log_level: "info"

remote:
  host: "0.0.0.0"
  port: 8765

openclaw:
  gateway_url: "ws://127.0.0.1:18789"
  token: ""
  agent_name: "stardew-farmer"
`, autoStart)

	configPath := filepath.Join(getCurrentDir(), "..", "mcp-server", "config.yaml")
	return os.WriteFile(configPath, []byte(config), 0644)
}

func copyDir(src, dst string) error {
	return filepath.Walk(src, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		rel, _ := filepath.Rel(src, path)
		dstPath := filepath.Join(dst, rel)

		if info.IsDir() {
			return os.MkdirAll(dstPath, 0755)
		}
		return copyFile(path, dstPath)
	})
}

func copyFile(src, dst string) error {
	data, err := os.ReadFile(src)
	if err != nil {
		return err
	}
	return os.WriteFile(dst, data, 0644)
}

func getCurrentDir() string {
	_, filename, _, _ := runtime.Caller(0)
	return filepath.Dir(filename)
}
