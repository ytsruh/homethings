package db

import "log"

var client *PrismaClient

func InitDB() *PrismaClient {
	// Create client and assign to global variable
	client = NewClient()
	if err := client.Prisma.Connect(); err != nil {
		panic("Unable to connect to database")
	}
	log.Println("Database successfully connected!")
	return client
}

// GetDB returns the global client
func GetDB() *PrismaClient {
	return client
}
