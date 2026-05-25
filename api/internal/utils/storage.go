package utils

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type StorageConfig struct {
	Key      string
	Secret   string
	Endpoint string
	Bucket   string
}

var storageConfig *StorageConfig

func LoadStorageConfig() (*StorageConfig, error) {
	sc := &StorageConfig{
		Key:      os.Getenv("STORAGE_KEY"),
		Secret:   os.Getenv("STORAGE_SECRET"),
		Endpoint: os.Getenv("STORAGE_ENDPOINT"),
		Bucket:   os.Getenv("STORAGE_BUCKET"),
	}

	if sc.Key == "" || sc.Secret == "" || sc.Endpoint == "" || sc.Bucket == "" {
		return nil, fmt.Errorf("missing required storage environment variables")
	}

	storageConfig = sc
	return sc, nil
}

var s3Client *s3.Client

func GetS3Client() (*s3.Client, error) {
	if s3Client != nil {
		return s3Client, nil
	}

	sc := storageConfig
	if sc == nil {
		return nil, fmt.Errorf("storage config not loaded")
	}

	cfg, err := awsconfig.LoadDefaultConfig(context.Background(),
		awsconfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			sc.Key, sc.Secret, "",
		)),
		awsconfig.WithRegion("auto"),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to load AWS config: %w", err)
	}

	s3Client = s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(sc.Endpoint)
		o.UsePathStyle = true
	})

	return s3Client, nil
}

func CreatePresignedPutURL(key, contentType string) (string, error) {
	client, err := GetS3Client()
	if err != nil {
		return "", err
	}

	sc := storageConfig
	presignClient := s3.NewPresignClient(client)

	presignedReq, err := presignClient.PresignPutObject(context.Background(), &s3.PutObjectInput{
		Bucket:      aws.String(sc.Bucket),
		Key:         aws.String(key),
		ContentType: aws.String(contentType),
	}, func(po *s3.PresignOptions) {
		po.Expires = time.Hour
	})
	if err != nil {
		return "", fmt.Errorf("failed to generate presigned URL: %w", err)
	}

	return presignedReq.URL, nil
}

func CreatePresignedGetURL(key string) (string, error) {
	client, err := GetS3Client()
	if err != nil {
		return "", err
	}

	sc := storageConfig
	presignClient := s3.NewPresignClient(client)

	presignedReq, err := presignClient.PresignGetObject(context.Background(), &s3.GetObjectInput{
		Bucket: aws.String(sc.Bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return "", fmt.Errorf("failed to generate presigned URL: %w", err)
	}

	return presignedReq.URL, nil
}

func DeleteObject(key string) error {
	client, err := GetS3Client()
	if err != nil {
		return err
	}

	sc := storageConfig
	_, err = client.DeleteObject(context.Background(), &s3.DeleteObjectInput{
		Bucket: aws.String(sc.Bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return fmt.Errorf("failed to delete object: %w", err)
	}

	return nil
}
