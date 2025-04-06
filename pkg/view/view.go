package view

import (
	"fmt"
	"os"

	tea "github.com/charmbracelet/bubbletea"
)

func Run(file string) {
	if file == "" {
		fmt.Println("Please provide a file to open")
		return
	}
	// Get current working directory
	cwd, err := os.Getwd()
	if err != nil {
		fmt.Println("Error getting current working directory:", err)
		return
	}

	// Read file content into a byte slice
	content, err := os.ReadFile(cwd + "/" + file)
	if err != nil {
		fmt.Println("Error opening file:", err)
		return
	}

	p := tea.NewProgram(
		model{content: string(content), header: file},
		tea.WithAltScreen(),       // use the full size of the terminal in its "alternate screen buffer"
		tea.WithMouseCellMotion(), // turn on mouse support so we can track the mouse wheel
	)

	if _, err := p.Run(); err != nil {
		fmt.Println("could not run program:", err)
		os.Exit(1)
	}
}
