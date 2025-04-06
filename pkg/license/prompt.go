package license

import (
	"embed"
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"github.com/manifoldco/promptui"
)

type License struct {
	Key       string `json:"key"`
	Name      string `json:"name"`
	ShortName string `json:"shortName"`
	Url       string `json:"url"`
}

type Result struct {
	Name    string
	Year    string
	License string
	Summary string
}

var list = GetLicenseList()

func RunPrompt() (Result, error) {
	// Create input prompts for name, year & license
	namePrompt := promptui.Prompt{
		Label: "Name",
	}
	yearPrompt := promptui.Prompt{
		Label:   "Year",
		Default: strconv.Itoa(time.Now().Year()),
	}
	licensePrompt := promptui.Select{
		Label: "Select the license you want",
		Items: list,
		Size:  10,
	}

	// Run prompts
	name, err := namePrompt.Run()
	if err != nil {
		return Result{}, err
	}
	year, err := yearPrompt.Run()
	if err != nil {
		return Result{}, err
	}
	_, license, err := licensePrompt.Run()
	if err != nil {
		return Result{}, err
	}

	// Create the result from input and return it
	return Result{
		Name:    name,
		Year:    year,
		License: license,
		Summary: fmt.Sprintf("Hi %s, its the year %s and you chose the %s license \n", name, year, license),
	}, nil
}

//go:embed "licenses.json"
var f embed.FS

func GetLicenseList() []string {
	// Open the JSON file from embed
	file, err := f.Open("licenses.json")
	if err != nil {
		fmt.Println("Error opening file:", err)
		return nil
	}
	defer file.Close()

	// Decode the JSON data
	decoder := json.NewDecoder(file)
	var licenses []License
	err = decoder.Decode(&licenses)
	if err != nil {
		fmt.Println("Error decoding JSON:", err)
		return nil
	}

	// Create a string slice to store the names
	var names []string

	// Loop over the Person array and append names to the slice
	for _, l := range licenses {
		names = append(names, l.ShortName)
	}
	return names
}
