package db

import (
	"time"
)

type Account struct {
	ID        string `gorm:"type:uuid;default:uuid_generate_v4()"`
	Name      string
	CreatedAt *time.Time
	UpdatedAt time.Time
	Documents []Document `gorm:"foreignKey:AccountId"`
}

type User struct {
	ID            string     `gorm:"type:uuid;default:uuid_generate_v4()" json:"id"`
	Name          string     `gorm:"default:'User Name'" json:"name"`
	Email         string     `gorm:"unique" json:"email"`
	Password      string     `json:"-"`
	ProfileImage  *string    `json:"profileImage"`
	ShowBooks     bool       `gorm:"default:true" json:"showBooks"`
	ShowDocuments bool       `gorm:"default:true" json:"showDocuments"`
	AccountId     string     `json:"accountId"`
	Account       Account    `gorm:"foreignKey:AccountId;references:ID" json:"account"`
	CreatedAt     *time.Time `json:"createdAt"`
	UpdatedAt     time.Time  `json:"updatedAt"`
	Books         []Book     `gorm:"foreignKey:UserId" json:"books"`
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

type Book struct {
	ID        string     `gorm:"type:uuid;default:uuid_generate_v4()" json:"id"`
	Name      string     `json:"name"`
	Isbn      string     `json:"isbn"`
	Author    *string    `json:"author"`
	Genre     *string    `json:"genre"`
	Rating    *int       `json:"rating"`
	Image     *string    `json:"image"`
	Read      bool       `gorm:"default:false" json:"read"`
	Wishlist  bool       `gorm:"default:false" json:"wishlist"`
	UserId    string     `json:"userId"`
	User      User       `gorm:"foreignKey:UserId;references:ID" json:"user"`
	CreatedAt *time.Time `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`
}
