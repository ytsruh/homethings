package cheat

import "github.com/charmbracelet/bubbles/table"

var ghosttyColumns = []table.Column{
	{Title: "Description", Width: 30},
	{Title: "Command", Width: 30},
}

var ghosttyRows = []table.Row{
	{"List Themes", "ghostty +list-themes"},
	{"Show Config", "ghostty +show-config"},
	{"Reload Config", "shift + cmd + ,"},
	{"Split pane right", "cmd + d"},
	{"Split pane down", "shift + cmd + d"},
	{"Change pane left/right", "opt + command + [arrow key]"},
	{"Close pane", "cmd + w"},
}

func RunGhostty() {
	run(ghosttyColumns, ghosttyRows)
}
