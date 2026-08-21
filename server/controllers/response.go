package controllers

import (
	"github.com/gin-gonic/gin"
)

type APIErrorResponse struct {
	Success bool       `json:"success"`
	Error   ErrorDetail `json:"error"`
}

type ErrorDetail struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

type APISuccessResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data"`
}

func RespondSuccess(c *gin.Context, statusCode int, data interface{}) {
	c.JSON(statusCode, APISuccessResponse{
		Success: true,
		Data:    data,
	})
}

func RespondError(c *gin.Context, statusCode int, code string, message string) {
	c.JSON(statusCode, APIErrorResponse{
		Success: false,
		Error: ErrorDetail{
			Code:    code,
			Message: message,
		},
	})
}
