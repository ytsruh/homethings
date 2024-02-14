package storage

import (
	"time"
)

type FeedbackModel interface {
	Create(feedback *Feedback) error
}

type Feedback struct {
	ID        string `gorm:"type:uuid;default:uuid_generate_v4()"`
	Title     string
	Body      *string
	UserId    string `gorm:"type:uuid"`
	User      User   `gorm:"foreignKey:UserId;references:ID"`
	CreatedAt *time.Time
	UpdatedAt time.Time
}

func (f *Feedback) TableName() string {
	return "feedback"
}

func (f *Feedback) Create(feedback *Feedback) error {
	tx := DBConn.Create(&feedback)
	if tx.Error != nil {
		return tx.Error
	}
	return nil
}
