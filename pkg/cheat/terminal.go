package cheat

import "github.com/charmbracelet/bubbles/table"

var terminalColumns = []table.Column{
	{Title: "Description", Width: 30},
	{Title: "Command", Width: 30},
}

var terminalRows = []table.Row{
	{"Copy", "cp [source] [destination]"},
	{"Copy", "cp -r [source] [destination]"},
	{"Move", "mv [source] [destination]"},
	{"Move", "mv -r [source] [destination]"},
	{"Show current location", "pwd"},
	{"Change Permissions", "chmod [permissions] [file]"},
	{"Change Owner", "chown [user] [file]"},
	{"Delete", "rm [file]"},
	{"Delete directory", "rm -r [directory]"},
	{"Create file", "touch [file]"},
	{"Create directory", "mkdir [directory]"},
	{"Check Processes", "top"},
	{"Check Processes", "ps"},
	{"Kill Process", "kill [PID]"},
	{"Kill Process", "pkill [process name]"},
	{"List homebrew", "brew ls"},
	{"Update homebrew", "brew update"},
	{"Upgrade homebrew packages", "brew upgrade"},
	{"Upgrade homebrew package", "brew upgrade [package]"},
}

func RunTerminal() {
	run(terminalColumns, terminalRows)
}
