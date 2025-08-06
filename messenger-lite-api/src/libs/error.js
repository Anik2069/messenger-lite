const { StatusCodes } = require("http-status-codes");
const errorLogStream = require(".");
const { Prisma } = require("@prisma/client");
const { ZodError } = require("zod");
const { handlePrismaError } = require("./QueryError");
const { deleteFile } = require("./utility");

class ApiError extends Error {
   constructor(statusCode, message) {
      super(message);
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
      this.isOperational = true;

      Error.captureStackTrace(this, this.constructor);
   }
}

const allFileDelete = (req) => {
   const files = req?.files;
   if (!files) return;

   if (Array.isArray(files)) {
      files.forEach((file) => {
         if (file && file.path) {
            deleteFile(file.path);
         }
      });
   } else if (typeof files === "object") {
      for (const key in files) {
         if (Array.isArray(files[key])) {
            for (const file of files[key]) {
               if (file && file.path) {
                  deleteFile(file.path);
               }
            }
         } else if (typeof files[key] === "object" && files[key].path) {
            deleteFile(files[key].path);
         }
      }
   }
};

const globalErrorHandler = (err, req, res, next) => {
   // Set default values for statusCode and message
   err.statusCode = err.statusCode || 500;
   err.status = err.status || "error";

   console.log("status___ ", err.statusCode);

   // Create a unique error ID
   const errorId = new Date().getTime();

   const errorLogDetails = {
      errorId: errorId,
      status: err.status,
      statusCode: err.statusCode,
      url: req.originalUrl,
      message: err.message,
      timestamp: new Date().toISOString(),
   };

   const errorLogString = JSON.stringify(errorLogDetails, null, 2);

   errorLogStream.write(errorLogString);

   let status = StatusCodes.INTERNAL_SERVER_ERROR;
   let message = "Internal server error";

   if (err?.isOperational) {
      console.log("1111111111111111111111___", err);
      status = err.statusCode;
      message = err.message;
   } else if (err instanceof ZodError) {
      status = StatusCodes.BAD_REQUEST;
      message = err.errors.map((issue) => `${issue.path.join(".")} is ${issue.message}`).join(", ");
   } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
      console.log("33333333333333333_________________________", err);
      const formattedError = handlePrismaError(err.code);
      status = formattedError.httpStatus;
      message = formattedError.message;
   } else if (err instanceof Prisma.PrismaClientValidationError) {
      console.log("4444444444444444444 error_________________________", err?.message);
      status = StatusCodes.UNPROCESSABLE_ENTITY;
      message = err?.message;
   } else if (err instanceof Prisma.PrismaClientInitializationError) {
      console.log("55555555555555555 error_________________________", err?.message);
      const formattedError = handlePrismaError(err.errorCode);
      status = formattedError.httpStatus;
      message = formattedError.message;
   } else if (err instanceof Prisma.PrismaClientRustPanicError) {
      console.log("666666666666666666666 error_________________________", err?.message);
      status = StatusCodes.INTERNAL_SERVER_ERROR;
      message = err?.message;
   } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
      console.log("7777777777777777777777 error_________________________", err?.message);
      status = StatusCodes.INTERNAL_SERVER_ERROR;
      message = err?.message;
   } else if (err instanceof Error) {
      console.log("222222222222222_", err);
      message = err.message;
   } else if (err.code === "P2025") {
      // throw new ApiError(404, "Data not found by id");
      console.log("Item not found ", err);
      status = StatusCodes.NOT_FOUND;
      message = "Data not found by id";
   } else if (err.code === "P2002") {
      console.log("Item is in used with another table ", err);
      status = StatusCodes.BAD_REQUEST;
      message = "Employee certificate is in used with another table";
   }
   console.log("err__", err);
   // Delete files if they exist in the request
   allFileDelete(req);

   return res.status(err.statusCode).json({
      status: err.status,
      statusCode: status,
      url: req.originalUrl,
      message: message,
      timestamp: new Date().toISOString(),
      errorId: errorId,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined, // Include stack trace only in development
   });
};

module.exports = {
   globalErrorHandler,
   ApiError,
};
