package storage

import (
	"context"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	v4 "github.com/aws/aws-sdk-go-v2/aws/signer/v4"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

func getS3Client() (*s3.Client, error) {
	creds := credentials.NewStaticCredentialsProvider(os.Getenv("STORAGE_KEY"), os.Getenv("STORAGE_SECRET"), "")
	customResolver := aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
		return aws.Endpoint{
			URL: os.Getenv("STORAGE_ENDPOINT"),
		}, nil
	})

	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(os.Getenv("STORAGE_REGION")),
		config.WithCredentialsProvider(creds),
		config.WithEndpointResolverWithOptions(customResolver))
	if err != nil {
		return nil, err
	}

	return s3.NewFromConfig(cfg), nil
}

func DeleteObject(fileName string) error {
	client, err := getS3Client()
	if err != nil {
		return err
	}
	bucket := os.Getenv("STORAGE_BUCKET")
	client.DeleteObject(context.TODO(), &s3.DeleteObjectInput{
		Bucket: &bucket,
		Key:    aws.String("docs/" + fileName),
	})
	return nil
}

func CreatePresignedGetURL(fileName string) (*v4.PresignedHTTPRequest, error) {
	client, err := getS3Client()
	if err != nil {
		return nil, err
	}
	presignClient := s3.NewPresignClient(client)
	bucket := os.Getenv("STORAGE_BUCKET")
	params := &s3.GetObjectInput{
		Bucket: &bucket,
		Key:    aws.String("docs/" + fileName),
	}
	presignedURL, err := presignClient.PresignGetObject(context.TODO(), params, func(o *s3.PresignOptions) {
		o.Expires = 15 * time.Minute
	})
	if err != nil {
		return nil, err
	}
	return presignedURL, nil
}

func CreatePresignedPutURL(fileName string) (*v4.PresignedHTTPRequest, error) {
	client, err := getS3Client()
	if err != nil {
		return nil, err
	}
	presignClient := s3.NewPresignClient(client)
	bucket := os.Getenv("STORAGE_BUCKET")
	if bucket == "" {
		return nil, err
	}
	params := &s3.PutObjectInput{
		Bucket: &bucket,
		Key:    aws.String("docs/" + fileName),
	}
	presignedURL, err := presignClient.PresignPutObject(context.TODO(), params, func(o *s3.PresignOptions) {
		o.Expires = 15 * time.Minute
	})
	if err != nil {
		return nil, err
	}
	return presignedURL, nil
}
