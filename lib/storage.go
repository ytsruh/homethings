package lib

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

var storageSecret = os.Getenv("STORAGE_SECRET")
var storageKey = os.Getenv("STORAGE_KEY")
var storageRegion = os.Getenv("STORAGE_REGION")
var storageBucket = os.Getenv("STORAGE_BUCKET")
var storageEndpoint = os.Getenv("STORAGE_ENDPOINT")

func getS3Client() (*s3.Client, error) {
	creds := credentials.NewStaticCredentialsProvider(storageKey, storageSecret, "")
	customResolver := aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
		return aws.Endpoint{
			URL: storageEndpoint,
		}, nil
	})

	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(storageRegion),
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
	client.DeleteObject(context.TODO(), &s3.DeleteObjectInput{
		Bucket: &storageBucket,
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
	params := &s3.GetObjectInput{
		Bucket: &storageBucket,
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
	params := &s3.PutObjectInput{
		Bucket: &storageBucket,
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
