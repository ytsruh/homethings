package models

import (
	"time"

	"gorm.io/gorm/clause"
)

type DocumentModel interface {
	GetAllDocuments(accountId string) ([]Document, error)
	GetDocumentById(accountId string, id string) error
	Create(doc *Document) error
	Update(doc *Document) error
	Delete(accountId string, id string) (*Document, error)
}

type Document struct {
	ID          string     `gorm:"type:uuid;default:uuid_generate_v4()" json:"id"`
	Title       string     `json:"title"`
	Description *string    `json:"description"`
	FileName    string     `json:"fileName"`
	AccountId   string     `gorm:"type:uuid" json:"accountId"`
	Account     Account    `gorm:"foreignKey:AccountId;references:ID" json:"account"`
	CreatedAt   *time.Time `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
}

func (d *Document) GetAllDocuments(accountId string) ([]Document, error) {
	var docs []Document
	err := DBConn.Where("account_id = ?", accountId).Find(&docs).Error
	return docs, err
}

func (d *Document) GetDocumentById(accountId string, id string) error {
	err := DBConn.Where("id = ? AND account_id = ?", id, accountId).First(d).Error
	return err
}

func (d *Document) Create(doc *Document) error {
	err := DBConn.Create(&doc).Error
	return err
}

func (d *Document) Update(doc *Document) error {
	tx := DBConn.Select("title", "description").Where("id = ? AND account_id = ?", doc.ID, doc.AccountId).Updates(&doc)
	if tx.Error != nil {
		return tx.Error
	}
	return nil
}

func (d *Document) Delete(accountId string, id string) (*Document, error) {
	tx := DBConn.Clauses(clause.Returning{}).Where("id = ?", id).Delete(d)
	if tx.Error != nil {
		return nil, tx.Error
	}
	return d, nil
}
