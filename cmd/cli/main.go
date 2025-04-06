package main

import (
	"fmt"
	"os"

	"github.com/homethings/pkg/cheat"
	"github.com/homethings/pkg/license"
	"github.com/homethings/pkg/password"
	"github.com/homethings/pkg/pomo"
	"github.com/homethings/pkg/view"
	"github.com/spf13/cobra"
)

// rootCmd represents the base command when called without any subcommands
var rootCmd = &cobra.Command{
	Use:   "my",
	Short: "A collection of CLI utilities packaged together to make your life easier & customise your computer.",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Printf("\n" + "Please choose a sub command to run\n" + "\n")
	},
}

var licenseCmd = &cobra.Command{
	Use:   "license",
	Short: "Create a license file",
	Long:  `All software has licenses. Generate a license file for your project by following a simple prompt.`,
	Run: func(cmd *cobra.Command, args []string) {
		result, err := license.RunPrompt()
		if err != nil {
			fmt.Printf("Generator failed %v\n", err)
			os.Exit(1)
		}
		err = license.GenTemplate(result)
		if err != nil {
			fmt.Printf("Template failed to generate %v\n", err)
			os.Exit(1)
		}
		fmt.Printf("Template has been generated & saved to your path. \n")
	},
}

var tmuxCmd = &cobra.Command{
	Use:   "tmux",
	Short: "A tmux cheat sheet",
	Long:  `A list of commands for Tmux in a cheat sheet format.`,
	Run: func(cmd *cobra.Command, args []string) {
		cheat.RunTmux()
	},
}

var pomoCmd = &cobra.Command{
	Use:     "pomo",
	Aliases: []string{"pomodoro", "timer"},
	Short:   "A pomodoro timer",
	Long:    `A pomodoro timer to help you stay focused on your work.`,
	Run: func(cmd *cobra.Command, args []string) {
		// Can ignore error as default value of 25 minutes is set
		timeout, _ := cmd.Flags().GetDuration("time")
		pomo.Run(timeout)
	},
}

var pwdCmd = &cobra.Command{
	Use:     "password",
	Aliases: []string{"pass", "pwd"},
	Short:   "Generate a random password",
	Long:    `Generate a random password.`,
	Run: func(cmd *cobra.Command, args []string) {
		// Can ignore errors as default values of 16 characters and false are set
		enc, _ := cmd.Flags().GetBool("encoded")
		length, _ := cmd.Flags().GetInt("length")
		// Run the password generator
		pwd := password.Run(length, enc)
		fmt.Println("\n" + pwd + "\n")
	},
}

var nvimCmd = &cobra.Command{
	Use:     "nvim",
	Aliases: []string{"vim", "neovim"},
	Short:   "A neovim cheat sheet",
	Long:    `A list of commands for Neovim in a cheat sheet format.`,
	Run: func(cmd *cobra.Command, args []string) {
		cheat.RunNvim()
	},
}

var terminalCmd = &cobra.Command{
	Use:     "terminal",
	Aliases: []string{"term", "bash"},
	Short:   "A terminal cheat sheet",
	Long:    `A list of commands for the terminal in a cheat sheet format.`,
	Run: func(cmd *cobra.Command, args []string) {
		cheat.RunTerminal()
	},
}

var gitCmd = &cobra.Command{
	Use:     "git",
	Aliases: []string{"github", "gh"},
	Short:   "A git cheat sheet",
	Long:    `A list of commands for git in a cheat sheet format.`,
	Run: func(cmd *cobra.Command, args []string) {
		cheat.RunGit()
	},
}

var viewCmd = &cobra.Command{
	Use:     "view",
	Aliases: []string{"open", "show"},
	Short:   "View or open a file",
	Long:    `A quick view of opening a file in the terminal.`,
	Run: func(cmd *cobra.Command, args []string) {
		fileName, err := cmd.Flags().GetString("file")
		if err != nil {
			fmt.Printf("Error: %v\n", err)
			return
		}
		if fileName == "" {
			fmt.Println("Please provide a file to view")
			fmt.Println("-- eg. my view -f <file>")
			return
		}
		view.Run(fileName)
	},
}

var ghosttyCmd = &cobra.Command{
	Use:     "ghostty",
	Aliases: []string{"ghost"},
	Short:   "A cheat sheet for ghostty, the terminal emulator",
	Long:    `A list of commands for the ghostty terminal.`,
	Run: func(cmd *cobra.Command, args []string) {
		cheat.RunGhostty()
	},
}

func init() {
	// Add subcommands
	rootCmd.AddCommand(licenseCmd)
	rootCmd.AddCommand(tmuxCmd)
	rootCmd.AddCommand(pomoCmd)
	rootCmd.AddCommand(pwdCmd)
	rootCmd.AddCommand(nvimCmd)
	rootCmd.AddCommand(terminalCmd)
	rootCmd.AddCommand(gitCmd)
	rootCmd.AddCommand(viewCmd)
	rootCmd.AddCommand(ghosttyCmd)
}

func main() {
	err := rootCmd.Execute()
	if err != nil {
		os.Exit(1)
	}
}
