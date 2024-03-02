package storage

import (
	"time"
)

type SearchQuery struct {
	ID        uint      `gorm:"primarykey" json:"id"`
	Query     string    `json:"query"`
	UserAgent string    `json:"userAgent"`
	Platform  string    `json:"platform"`
	RequestIP string    `json:"requestIP"`
	Country   string    `json:"country"`
	Region    string    `json:"region"`
	City      string    `json:"city"`
	District  string    `json:"district"`
	Latitude  float64   `json:"latitude"`
	Longitude float64   `json:"longitude"`
	Timezone  string    `json:"timezone"`
	ISP       string    `json:"isp"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
}

func (s *SearchQuery) Save() error {
	err := DBConn.Create(s).Error
	return err
}
