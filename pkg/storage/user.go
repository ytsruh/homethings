package storage

import (
	"errors"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID            string     `gorm:"type:uuid;default:uuid_generate_v4()" json:"id"`
	Name          string     `gorm:"default:'User Name'" json:"name"`
	Email         string     `gorm:"unique" json:"email"`
	Password      string     `json:"-"`
	ProfileImage  *string    `json:"profileImage"`
	ShowBooks     bool       `gorm:"default:true" json:"showBooks"`
	ShowDocuments bool       `gorm:"default:true" json:"showDocuments"`
	AccountId     string     `gorm:"type:uuid" json:"accountId"`
	IsAdmin       bool       `gorm:"default:false" json:"isAdmin"`
	CreatedAt     *time.Time `json:"createdAt"`
	UpdatedAt     time.Time  `json:"updatedAt"`
}

func (u *User) Login(email string, password string) (*User, error) {
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

func (u *User) LoginAsAdmin(email string, password string) (*User, error) {
	// Find User
	if err := DBConn.Where("email = ? AND is_admin = ?", email, true).First(&u).Error; err != nil {
		return nil, errors.New("user not found")
	}
	// Compare Passwords
	if err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password)); err != nil {
		return nil, errors.New("invalid password")
	}
	return u, nil
}

func (u *User) GetUserById(id string) (*User, error) {
	if err := DBConn.Where("id = ?", id).First(&u).Error; err != nil {
		return nil, err
	}
	return u, nil
}

func (u *User) Update(user User) error {
	tx := DBConn.Model(u).Where("id = ?", user.ID)
	// Explicitly set the columns to update boolean values.  If you're trying to update the ShowBooks field to false, GORM's Updates method will not consider it because it treats false as a zero value and ignores it.
	tx.UpdateColumn("show_books", user.ShowBooks)
	tx.UpdateColumn("show_documents", user.ShowDocuments)
	tx.Updates(user)
	if tx.Error != nil {
		return tx.Error
	}
	return nil
}