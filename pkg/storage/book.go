package storage

import (
	"time"

	"gorm.io/gorm/clause"
)

type BookModel interface {
	GetAllBooks(userId string) ([]Book, error)
	GetBookById(id string, userId string) error
	Create(book *Book) error
	Update(book *Book) error
	Delete(id string, userId string) error
	GetRead(userId string) ([]Book, error)
	GetUnread(userId string) ([]Book, error)
	GetWishlist(userId string) ([]Book, error)
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

func (b *Book) GetAllBooks(userId string) ([]Book, error) {
	var books []Book
	err := DBConn.Where("user_id = ?", userId).Find(&books).Error
	return books, err
}

func (b *Book) GetBookById(id string, userId string) error {
	err := DBConn.Where("id = ? AND user_id = ?", id, userId).First(b).Error
	return err
}

func (b *Book) Create(book *Book) error {
	err := DBConn.Create(&book).Error
	return err
}

func (b *Book) Update(book *Book) error {
	tx := DBConn.Select("name", "isbn", "author", "genre", "rating", "image", "read", "wishlist").Where("id = ? AND account_id = ?", book.ID, book.UserId).Updates(&book)
	if tx.Error != nil {
		return tx.Error
	}
	return nil
}

func (b *Book) Delete(id string, userId string) error {
	tx := DBConn.Clauses(clause.Returning{}).Where("id = ? AND user_id = ?", id, userId).Delete(b)
	if tx.Error != nil {
		return tx.Error
	}
	return nil
}

func (b *Book) GetRead(userId string) ([]Book, error) {
	var books []Book
	err := DBConn.Where("user_id = ? AND read = ?", userId, true).Find(&books).Error
	return books, err
}

func (b *Book) GetUnread(userId string) ([]Book, error) {
	var books []Book
	err := DBConn.Where("user_id = ? AND read = ?", userId, false).Find(&books).Error
	return books, err
}

func (b *Book) GetWishlist(userId string) ([]Book, error) {
	var books []Book
	err := DBConn.Where("user_id = ? AND wishlist = ?", userId, true).Find(&books).Error
	return books, err
}
