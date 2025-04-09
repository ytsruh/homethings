package cheat

import "github.com/charmbracelet/bubbles/table"

var gitColumns = []table.Column{
	{Title: "Description", Width: 30},
	{Title: "Command", Width: 30},
}

var gitRows = []table.Row{
	{"Get repo status", "git status"},
	{"Add file", "git add [file]"},
	{"Add all changes", "git add ."},
	{"Commit", "git commit -m [message]"},
	{"Push", "git push"},
	{"Pull", "git pull"},
	{"Show log", "git log"},
	{"Show log with graph", "git log --graph"},
	{"Show log only commit messages", "git log --oneline"},
	{"Diff", "git diff"},
	{"Diff", "git diff [file]"},
	{"List branches", "git branch"},
	{"Change branch", "git checkout [branch]"},
	{"Create branch", "git branch [branch]"},
	{"Delete branch", "git branch -d [branch]"},
	{"Merge branch", "git merge [branch]"},
	{"Reset branch", "git reset [branch]"},
}

func RunGit() {
	run(gitColumns, gitRows)
}
