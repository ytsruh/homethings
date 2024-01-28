package db

import (
	"errors"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type UserInterface interface {
	LoginUser(email string, password string) (*User, error)
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

func (u *User) LoginUser(email string, password string) (*User, error) {
	// Find User
	if err := DBConn.Where("email = ?", email).First(&u).Error; err != nil {
		return nil, errors.New("user not found")
	}
	// Compare Passwords
	if err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password)); err != nil {
		return nil, errors.New("invalid password")
	}
	return u, nil
}
