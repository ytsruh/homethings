package license

import (
	"embed"
	"fmt"
	"os"
	"text/template"
)

//go:embed templates/*
var embeddedTemplates embed.FS

func GenTemplate(input Result) error {
	tmplFile := fmt.Sprintf("templates/%s.txt", input.License)

	// Get current working directory & create a new file for writing
	dir, err := os.Getwd()
	if err != nil {
		return err
	}

	file, err := os.Create(dir + "/LICENSE.txt")
	if err != nil {
		return err
	}
	defer file.Close()

	tmpl, err := template.ParseFS(embeddedTemplates, tmplFile)
	if err != nil {
		return err
	}
	err = tmpl.Execute(file, input)
	if err != nil {
		return err
	}

	return nil
}
