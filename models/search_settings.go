package models

import (
	"time"
)

type SearchSettings struct {
	ID        uint      `gorm:"primarykey" json:"id"`
	SearchOn  bool      `json:"searchOn"`
	AddNew    bool      `json:"addNew"`
	Amount    uint      `json:"amount"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func (s *SearchSettings) Get() error {
	err := DBConn.Where("id = ?", s.ID).First(s).Error
	return err
}

func (s *SearchSettings) Update() error {
	tx := DBConn.Select("search_on", "add_new", "amount", "updated_at").Where("id = ?", s.ID).Updates(&s)
	if tx.Error != nil {
		return tx.Error
	}
	return nil
}