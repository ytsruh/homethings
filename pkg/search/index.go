package search

import (
	"fmt"

	"homethings.ytsruh.com/pkg/storage"
)

// Index is an in-memory inverted index. It maps tokens to url IDs.
type Index map[string][]string

// Adds documents to the Index.
func (idx Index) Add(docs []storage.CrawledUrl) {
	for _, doc := range docs {
		for _, token := range analyze(doc.Url + " " + doc.PageTitle + " " + doc.PageDescription + " " + doc.Headings) {
			ids := idx[token]
			if ids != nil && ids[len(ids)-1] == doc.ID {
				// Don't add same ID twice.
				continue
			}
			idx[token] = append(ids, doc.ID)
		}
	}
}

// Pretty print the Index.
func (idx Index) Print() {
	for token, ids := range idx {
		fmt.Printf("Token: %s\n", token)
		for _, id := range ids {
			fmt.Printf("\tID: %s\n", id)
		}
	}
}
