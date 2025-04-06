package cheat

import "github.com/charmbracelet/bubbles/table"

var nvimColumns = []table.Column{
	{Title: "Mode", Width: 10},
	{Title: "Description", Width: 30},
	{Title: "Command", Width: 30},
}

var nvimRows = []table.Row{
	{"None", "Start a new session", "nvim"},
	{"None", "Command mode", "shift :"},
	{"None", "Delete character under cursor", "x"},
	{"None", "Enter insert mode", "i"},
	{"None", "Enter visual mode", "v"},
	{"None", "Exit any mode", "esc"},
	{"None", "Append after the end of the line", "A"},
	{"None", "Delete a word", "dw"},
	{"None", "Delete to end of line", "d$"},
	{"Command", "Quit", ":q"},
	{"Command", "Quit without saving", ":q!"},
	{"Command", "Save and quit", ":wq"},
	{"Command", "Save", ":w"},
	{"Command", "Save as", ":w [filename]"},
	{"Command", "LSP Help", ":help lsp"},
	{"Visual", "Select text", "<move cursor>"},
	{"Visual", "Copy/yank", "y"},
	{"Visual", "Copy/yank one word", "yw"},
	{"Visual", "Paste", "p"},
}

func RunNvim() {
	run(nvimColumns, nvimRows)
}
